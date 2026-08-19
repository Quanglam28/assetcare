const deviceRepository = require('../repositories/deviceRepository');
const healthRepository = require('../repositories/healthRepository');
const assetHealthService = require('./assetHealthService');
const failureRiskService = require('./failureRiskService');
const config = require('../config/recommendationConfig');
const { pool } = require('../config/db');
const { NotFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * RecommendationService
 * Động cơ sinh khuyến nghị hành động bảo trì định lượng theo 8 quy tắc chuyên gia
 * Phase 3 - Version 1.0
 */
class RecommendationService {
  /**
   * Lấy danh mục 8 quy tắc hệ thống
   */
  getRecommendationRules() {
    return Object.values(config.RULES).map(r => ({
      id: r.id,
      title: r.title,
      severity: r.severity,
      action: r.action,
      daysToDeadline: r.daysToDeadline,
    }));
  }

  /**
   * Sinh danh sách khuyến nghị hành động chi tiết cho 1 thiết bị
   * @param {number} deviceId
   */
  async generateRecommendations(deviceId) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    // 1. Lấy metrics và điểm Health + Risk
    const [healthRes, riskRes, metrics] = await Promise.all([
      assetHealthService.calculateHealthScore(deviceId),
      failureRiskService.calculateFailureRisk(deviceId),
      healthRepository.getRawAssetMetrics(deviceId),
    ]);

    const reqs = metrics?.requests || {};
    const scheds = metrics?.schedules || {};

    const purchasePrice = Number(device.purchase_price) || 0;
    const totalRepairCost = Number(reqs.total_repair_cost) || 0;
    const repairCostRatio = purchasePrice > 0 ? (totalRepairCost / purchasePrice) : 0;

    const purchaseDate = device.purchase_date || device.created_at;
    let ageYears = 0;
    if (purchaseDate) {
      const pDate = new Date(purchaseDate);
      if (!isNaN(pDate.getTime())) {
        ageYears = Math.max(0, (Date.now() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      }
    }

    const contextMetrics = {
      deviceId,
      deviceCode: device.code,
      deviceName: device.name,
      deviceStatus: device.status,
      healthScore: Number(healthRes.healthScore) || 100,
      riskScore: Number(riskRes.riskScore) || 10,
      failures30d: Number(reqs.failures_last_30d) || 0,
      failureTrendPercent: Number(riskRes.trends?.failures?.changePercent) || 0,
      overdueDays: Number(scheds.max_overdue_days) || 0,
      repairCostRatio,
      totalRepairCost,
      purchasePrice,
      downtime30d: Number(reqs.downtime_last_30d) || 0,
      ageYears,
    };

    const recommendations = [];
    const rules = config.RULES;

    // Duyệt qua 8 Rules để tìm các khuyến nghị phù hợp
    for (const rule of Object.values(rules)) {
      if (rule.match(contextMetrics)) {
        const gen = rule.generate(contextMetrics);
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + rule.daysToDeadline);

        recommendations.push({
          deviceId,
          type: rule.id,
          severity: rule.severity,
          title: rule.title,
          action: rule.action,
          reason: gen.reason,
          sourceFactors: gen.sourceFactors,
          suggestedDeadline: deadline.toISOString().split('T')[0],
          status: 'OPEN',
        });
      }
    }

    // Nếu không khớp rule nào, gán RULE_8 (Theo dõi bình thường)
    if (recommendations.length === 0) {
      const normalGen = rules.RULE_8_NORMAL_MONITORING.generate(contextMetrics);
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 90);
      recommendations.push({
        deviceId,
        type: rules.RULE_8_NORMAL_MONITORING.id,
        severity: rules.RULE_8_NORMAL_MONITORING.severity,
        title: rules.RULE_8_NORMAL_MONITORING.title,
        action: rules.RULE_8_NORMAL_MONITORING.action,
        reason: normalGen.reason,
        sourceFactors: normalGen.sourceFactors,
        suggestedDeadline: deadline.toISOString().split('T')[0],
        status: 'OPEN',
      });
    }

    // Sắp xếp khuyến nghị theo mức độ nghiêm trọng: CRITICAL -> HIGH -> MEDIUM -> LOW
    const severityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
    recommendations.sort((a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5));

    // Lưu / Cập nhật khuyến nghị vào bảng recommendations
    for (const rec of recommendations) {
      try {
        await pool.query(`
          INSERT INTO recommendations (
            device_id, type, severity, title, description, action, reason,
            source_factors, suggested_deadline, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            severity = VALUES(severity),
            title = VALUES(title),
            action = VALUES(action),
            reason = VALUES(reason),
            source_factors = VALUES(source_factors),
            suggested_deadline = VALUES(suggested_deadline),
            updated_at = NOW()
        `, [
          rec.deviceId,
          rec.type,
          rec.severity,
          rec.title,
          rec.description || null,
          rec.action,
          rec.reason,
          JSON.stringify(rec.sourceFactors),
          rec.suggestedDeadline,
          rec.status,
        ]);
      } catch (err) {
        logger.error(`[Recommendation Engine] Lỗi lưu recommendation: ${err.message}`);
      }
    }

    return recommendations;
  }

  /**
   * Lấy khuyến nghị ưu tiên cao nhất của thiết bị
   * @param {number} deviceId
   */
  async getRecommendation(deviceId) {
    const list = await this.generateRecommendations(deviceId);
    return list[0] || null;
  }
}

module.exports = new RecommendationService();
