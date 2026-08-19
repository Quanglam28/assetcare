const priorityRepository = require('../repositories/priorityRepository');
const deviceRepository = require('../repositories/deviceRepository');
const healthRepository = require('../repositories/healthRepository');
const failureRiskService = require('./failureRiskService');
const config = require('../config/priorityConfig');
const { NotFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * PriorityService
 * Động cơ tính toán định lượng Mức Độ Ưu Tiên Xử Lý Thiết Bị (Priority Score: 0 - 100)
 * Rule-Based Priority Engine (Phase 3 - Version 1.0)
 */
class PriorityService {
  /**
   * Tính toán điểm theo độ quan trọng nghiệp vụ (Business Criticality Score)
   */
  _calcBusinessCriticalityScore(criticality) {
    const key = (criticality || 'MEDIUM').toUpperCase();
    const score = config.BUSINESS_CRITICALITY_SCORES[key] || config.BUSINESS_CRITICALITY_SCORES.MEDIUM;
    return { score, level: key, isAvailable: true };
  }

  /**
   * Tính toán điểm theo nguyên giá mua tài sản (Asset Value Score)
   */
  _calcAssetValueScore(purchasePrice) {
    const price = Math.max(0, Number(purchasePrice) || 0);
    let score = 20;
    let label = '< 5 triệu VNĐ';

    for (const tier of config.ASSET_VALUE_THRESHOLDS) {
      if (price <= tier.maxPrice) {
        score = tier.score;
        label = tier.label;
        break;
      }
    }

    return { score, price, label, isAvailable: price > 0 };
  }

  /**
   * Tính toán điểm theo mức độ ảnh hưởng của thời gian ngừng máy (Downtime Impact Score)
   */
  _calcDowntimeImpactScore(downtimeHours) {
    const hours = Math.max(0, Number(downtimeHours) || 0);
    let score = 10;
    let label = '0 giờ';

    for (const tier of config.DOWNTIME_IMPACT_THRESHOLDS) {
      if (hours <= tier.maxHours) {
        score = tier.score;
        label = tier.label;
        break;
      }
    }

    return { score, hours, label, isAvailable: true };
  }

  /**
   * Phân loại mức độ ưu tiên theo điểm số (0 - 100)
   */
  getPriorityLevel(score) {
    const num = Math.round(Number(score) || 0);
    if (num >= 80) return 'CRITICAL';
    if (num >= 60) return 'HIGH';
    if (num >= 40) return 'MEDIUM';
    if (num >= 20) return 'LOW';
    return 'VERY_LOW';
  }

  /**
   * Tính toán và cập nhật điểm ưu tiên (Priority Score) cho 1 thiết bị
   * @param {number} deviceId
   */
  async calculatePriorityScore(deviceId) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    // 1. Lấy hoặc tính điểm Failure Risk từ Phase 2 (50% trọng số)
    const riskResult = await failureRiskService.calculateFailureRisk(deviceId);
    const riskScore = Number(riskResult.riskScore) || 0;

    // 2. Tính điểm Business Criticality (20% trọng số)
    const critRes = this._calcBusinessCriticalityScore(device.business_criticality);

    // 3. Tính điểm Asset Value (15% trọng số)
    const valRes = this._calcAssetValueScore(device.purchase_price);

    // 4. Lấy metrics thực tế từ MySQL để tính Downtime Impact (15% trọng số)
    const metrics = await healthRepository.getRawAssetMetrics(deviceId);
    const downtimeHours = Number(metrics?.requests?.downtime_last_30d || metrics?.requests?.downtime_hours || 0);
    const downRes = this._calcDowntimeImpactScore(downtimeHours);

    // 5. Tính độ hoàn thiện dữ liệu
    const evaluatedFactors = [true, critRes.isAvailable, valRes.isAvailable, downRes.isAvailable];
    const evaluatedCount = evaluatedFactors.filter(Boolean).length;
    const totalFactors = evaluatedFactors.length;
    const dataCompleteness = Math.round((evaluatedCount / totalFactors) * 100);

    // 6. Áp dụng công thức trọng số chuẩn Phase 3
    const weights = config.PRIORITY_WEIGHTS;
    let rawPriority = (
      (riskScore * weights.FAILURE_RISK) +
      (critRes.score * weights.BUSINESS_CRITICALITY) +
      (valRes.score * weights.ASSET_VALUE) +
      (downRes.score * weights.DOWNTIME_IMPACT)
    );

    if (!Number.isFinite(rawPriority)) {
      rawPriority = 20;
    }
    const priorityScore = Math.max(0, Math.min(100, Math.round(rawPriority * 10) / 10));
    const priorityStatus = this.getPriorityLevel(priorityScore);
    const statusInfo = config.PRIORITY_LEVELS[priorityStatus] || config.PRIORITY_LEVELS.LOW;

    const calculatedAt = new Date().toISOString();

    const record = {
      deviceId,
      priorityScore,
      priorityStatus,
      riskScore,
      businessCriticalityScore: critRes.score,
      assetValueScore: valRes.score,
      downtimeImpactScore: downRes.score,
      dataCompleteness,
      evaluatedFactorsCount: evaluatedCount,
      totalFactorsCount: totalFactors,
      calculationVersion: config.VERSION,
      calculatedAt,
    };

    // 7. Lưu vào MySQL (bảng priority_scores)
    await priorityRepository.upsertPriorityScore(record);

    return {
      deviceId,
      deviceCode: device.code,
      deviceName: device.name,
      priorityScore,
      status: priorityStatus,
      priorityStatus,
      statusInfo,
      dataCompleteness: `${evaluatedCount}/${totalFactors} factors`,
      completenessPercentage: dataCompleteness,
      breakdown: {
        riskScore,
        businessCriticalityScore: critRes.score,
        assetValueScore: valRes.score,
        downtimeImpactScore: downRes.score,
      },
      detailedBreakdown: {
        risk: { score: riskScore, weight: weights.FAILURE_RISK * 100, detail: `Nguy cơ sự cố (${riskResult.status})` },
        businessCriticality: { score: critRes.score, weight: weights.BUSINESS_CRITICALITY * 100, detail: `Mức độ ${critRes.level}` },
        assetValue: { score: valRes.score, weight: weights.ASSET_VALUE * 100, detail: valRes.label, purchasePrice: valRes.price },
        downtimeImpact: { score: downRes.score, weight: weights.DOWNTIME_IMPACT * 100, detail: downRes.label, downtimeHours: downRes.hours },
      },
      calculationVersion: config.VERSION,
      calculatedAt,
    };
  }

  /**
   * Lấy chi tiết Priority Breakdown của thiết bị
   * @param {number} deviceId
   */
  async getPriorityBreakdown(deviceId) {
    const res = await this.calculatePriorityScore(deviceId);
    return {
      deviceId: res.deviceId,
      priorityScore: res.priorityScore,
      status: res.status,
      priorityStatus: res.priorityStatus,
      statusInfo: res.statusInfo,
      dataCompleteness: res.dataCompleteness,
      breakdown: res.breakdown,
      detailedBreakdown: res.detailedBreakdown,
      calculationVersion: res.calculationVersion,
      calculatedAt: res.calculatedAt,
    };
  }

  /**
   * Lấy Top N thiết bị có mức độ ưu tiên xử lý cao nhất
   */
  async getTopPriorityDevices(limit = 5) {
    return priorityRepository.findTopPriorityDevices(limit);
  }

  /**
   * Lấy dữ liệu ma trận rủi ro (Risk Matrix)
   */
  async getRiskMatrixData(filters = {}) {
    return priorityRepository.getRiskMatrixData(filters);
  }

  /**
   * Tính toán lại toàn bộ Priority Score cho tất cả thiết bị trong hệ thống
   */
  async recalculateAllPriorityScores() {
    const devices = await deviceRepository.findAll({ limit: 1000 });
    const items = devices.devices || [];

    logger.info(`[Priority Engine] Bắt đầu tính toán lại toàn bộ ${items.length} thiết bị...`);
    const results = [];

    for (const dev of items) {
      try {
        const r = await this.calculatePriorityScore(dev.id);
        results.push(r);
      } catch (err) {
        logger.error(`[Priority Engine] Lỗi tính toán thiết bị ID ${dev.id}: ${err.message}`);
      }
    }

    logger.info(`[Priority Engine] Hoàn tất tính toán ưu tiên cho ${results.length}/${items.length} thiết bị.`);
    return {
      totalProcessed: results.length,
      totalAssets: items.length,
      version: config.VERSION,
    };
  }
}

module.exports = new PriorityService();
