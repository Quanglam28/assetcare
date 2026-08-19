const healthRepository = require('../repositories/healthRepository');
const deviceRepository = require('../repositories/deviceRepository');
const assetHealthService = require('./assetHealthService');
const ruleBasedRiskProvider = require('./health/ruleBasedRiskProvider');
const recommendationService = require('./recommendationService');
const config = require('../config/healthScoreConfig');
const { NotFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * AssetRiskService
 * Động cơ dự đoán nguy cơ sự cố (Predictive Failure Risk Engine)
 */
class AssetRiskService {
  /**
   * Tính toán và đánh giá rủi ro cho một thiết bị
   * @param {number} deviceId
   */
  async assessDeviceRisk(deviceId) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    // 1. Tính toán hoặc lấy điểm sức khỏe Health Score
    const healthResult = await assetHealthService.calculateHealthScore(deviceId);

    // 2. Lấy dữ liệu nghiệp vụ thời gian thực từ MySQL
    const metrics = await healthRepository.getRawAssetMetrics(deviceId);
    const reqs = metrics.requests;
    const scheds = metrics.schedules;

    const failuresLast90d = Number(reqs.failures_last_90d || 0);
    const failuresPrev90d = Number(reqs.failures_prev_90d || 0);
    const costLast90d = Number(reqs.cost_last_90d || 0);
    const costPrev90d = Number(reqs.cost_prev_90d || 0);
    const downtimeHours = Number(reqs.downtime_hours || 0);
    const urgentIncidentsCount = Number(reqs.urgent_requests || 0);
    const highIncidentsCount = Number(reqs.high_requests || 0);
    const maintenanceOverdueDays = Number(scheds.max_overdue_days || 0);
    const maintenanceOverdueCount = Number(scheds.overdue_schedules || 0);
    const totalFailuresAllTime = Number(reqs.total_requests || 0);
    const totalRepairCost = Number(reqs.total_repair_cost || 0);
    const purchasePrice = Number(device.purchase_price) || 0;
    const repairRatio = purchasePrice > 0 ? totalRepairCost / purchasePrice : 0;

    // Tính tuổi thiết bị theo năm
    let ageYears = 0;
    if (device.purchase_date) {
      const diffMs = new Date() - new Date(device.purchase_date);
      if (diffMs > 0) ageYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    }

    // 3. Đánh giá rủi ro qua Provider Architecture (Rule-based)
    const context = {
      device,
      failuresLast90d,
      failuresPrev90d,
      costLast90d,
      costPrev90d,
      ageYears,
      downtimeHours,
      maintenanceOverdueDays,
      maintenanceOverdueCount,
      urgentIncidentsCount,
      highIncidentsCount,
      totalFailuresAllTime,
    };

    const riskAssessment = await ruleBasedRiskProvider.assessRisk(context);

    // 4. Sinh khuyến nghị hành động thông minh & chỉ số thay thế
    const recommendation = recommendationService.generateRecommendation({
      device,
      healthScore: healthResult.healthScore,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskFactors: riskAssessment.factors,
      repairRatio,
      maintenanceOverdueDays,
      ageYears,
    });

    // 5. Lưu vào MySQL (bảng asset_risk_assessments)
    const riskData = {
      deviceId,
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      recentFailureScore: riskAssessment.factors.recentFailureScore,
      failureTrendScore: riskAssessment.factors.failureTrendScore,
      repairCostTrendScore: riskAssessment.factors.repairCostTrendScore,
      ageRiskScore: riskAssessment.factors.ageRiskScore,
      downtimeRiskScore: riskAssessment.factors.downtimeRiskScore,
      maintenanceOverdueScore: riskAssessment.factors.maintenanceOverdueScore,
      criticalIncidentScore: riskAssessment.factors.criticalIncidentScore,
      failureTrendPercent: riskAssessment.trends.failureTrendPercent,
      repairCostTrendPercent: riskAssessment.trends.costTrendPercent,
      recommendationAction: recommendation.action,
      recommendationText: recommendation.text,
      recommendationReasons: recommendation.reasons,
      replacementIndicator: recommendation.replacementIndicator,
      dataCompleteness: healthResult.dataCompleteness,
      calculationVersion: config.VERSION,
    };

    await healthRepository.upsertRiskAssessment(riskData);

    // 6. Lưu snapshot lịch sử vào bảng asset_health_history
    await healthRepository.insertHistorySnapshot({
      deviceId,
      healthScore: healthResult.healthScore,
      riskScore: riskAssessment.riskScore,
      healthStatus: healthResult.healthStatus,
      riskLevel: riskAssessment.riskLevel,
      totalRepairCost,
      incidentCount: totalFailuresAllTime,
      downtimeHours,
      snapshotDate: new Date().toISOString().split('T')[0],
    });

    return {
      deviceId,
      deviceCode: device.code,
      deviceName: device.name,
      deviceStatus: device.status,
      // Health Score
      healthScore: healthResult.healthScore,
      healthStatus: healthResult.healthStatus,
      healthStatusInfo: healthResult.statusInfo,
      dataCompleteness: healthResult.dataCompleteness,
      healthBreakdown: healthResult.breakdown,
      // Risk Assessment
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskLevelInfo: riskAssessment.riskLevelInfo,
      riskFactors: riskAssessment.factors,
      trends: riskAssessment.trends,
      explainableReasons: riskAssessment.explainableReasons,
      // Recommendations & Replacement
      recommendation,
      replacementIndicator: recommendation.replacementIndicator,
      metrics: {
        failuresLast90d,
        failuresPrev90d,
        costLast90d,
        costPrev90d,
        totalRepairCost,
        downtimeHours,
        ageYears,
        maintenanceOverdueDays,
        urgentIncidentsCount,
        highIncidentsCount,
      },
      provider: riskAssessment.provider,
      version: config.VERSION,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Lấy lịch sử biến động sức khỏe & rủi ro theo thời gian
   */
  async getHealthHistory(deviceId, days = 90) {
    const history = await healthRepository.findHistoryByDeviceId(deviceId, days);
    return history;
  }

  /**
   * Lấy danh sách Top thiết bị rủi ro cao nhất
   */
  async getTopAtRiskAssets(limit = 10) {
    const topAssets = await healthRepository.findTopAtRiskDevices(limit);
    return topAssets;
  }

  /**
   * Lấy phân bổ sức khỏe toàn hệ thống
   */
  async getHealthDistribution() {
    return healthRepository.findHealthDistribution();
  }

  /**
   * Lấy tổng hợp rủi ro bảo trì
   */
  async getMaintenanceRiskSummary() {
    return healthRepository.findMaintenanceRiskSummary();
  }
}

module.exports = new AssetRiskService();
