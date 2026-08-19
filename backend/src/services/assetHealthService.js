const healthRepository = require('../repositories/healthRepository');
const deviceRepository = require('../repositories/deviceRepository');
const config = require('../config/healthScoreConfig');
const { NotFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * AssetHealthService
 * Động cơ tính toán định lượng điểm sức khỏe thiết bị (Asset Health Score: 0 - 100)
 * Tuân thủ nghiêm ngặt nguyên tắc: Rule-Based, Trọng số chuẩn, Chống NaN/Infinity, Xử lý Insufficient Data
 */
class AssetHealthService {
  /**
   * 1. Tính toán điểm tuổi thọ & khấu hao (Age Score - Weight: 20%)
   */
  _calcAgeScore(purchaseDate) {
    if (!purchaseDate) {
      return { score: 100, isAvailable: false, ageYears: 0, ageText: 'Chưa cập nhật ngày mua' };
    }

    const pDate = new Date(purchaseDate);
    if (isNaN(pDate.getTime())) {
      return { score: 100, isAvailable: false, ageYears: 0, ageText: 'Ngày mua không hợp lệ' };
    }

    const now = new Date();
    const diffMs = now - pDate;
    if (diffMs <= 0) {
      return { score: 100, isAvailable: true, ageYears: 0, ageText: 'Mới đưa vào sử dụng' };
    }

    const ageDays = diffMs / (1000 * 60 * 60 * 24);
    const ageYears = ageDays / 365.25;
    const ageMonths = Math.round(ageDays / 30.44);

    let score = 25;
    for (const tier of config.AGE_THRESHOLDS) {
      if (ageYears <= tier.maxYears) {
        score = tier.score;
        break;
      }
    }

    const ageText = ageYears >= 1 
      ? `${ageYears.toFixed(1)} năm (${ageMonths} tháng)`
      : `${ageMonths} tháng`;

    return { score, isAvailable: true, ageYears, ageMonths, ageText };
  }

  /**
   * 2. Tính toán điểm tần suất sự cố hỏng (Failure Frequency Score - Weight: 25%)
   */
  _calcFailureScore(incidentCount) {
    const count = Number(incidentCount) || 0;
    let score = 20;
    for (const tier of config.FAILURE_COUNT_THRESHOLDS) {
      if (count <= tier.maxFailures) {
        score = tier.score;
        break;
      }
    }
    return score;
  }

  /**
   * 3. Tính toán điểm tuân thủ bảo trì định kỳ (Maintenance Score - Weight: 15%)
   */
  _calcMaintenanceScore(overdueDays, overdueCount, totalSchedules) {
    const total = Number(totalSchedules) || 0;
    const overdue = Number(overdueCount) || 0;
    const days = Number(overdueDays) || 0;

    if (total === 0) {
      return { score: 90, isAvailable: false, note: 'Chưa thiết lập lịch bảo trì định kỳ' };
    }

    if (overdue === 0 || days <= 0) {
      return { score: 100, isAvailable: true, note: 'Bảo trì đúng lịch 100%' };
    }

    let score = 20;
    for (const tier of config.MAINTENANCE_OVERDUE_DAYS_THRESHOLDS) {
      if (days <= tier.maxDays) {
        score = tier.score;
        break;
      }
    }

    return { score, isAvailable: true, note: `Quá hạn bảo dưỡng ${days} ngày` };
  }

  /**
   * 4. Tính toán điểm chi phí sửa chữa / Nguyên giá mua (Repair Cost Score - Weight: 20%)
   */
  _calcRepairCostScore(totalRepairCost, purchasePrice) {
    const pPrice = Number(purchasePrice) || 0;
    const rCost = Number(totalRepairCost) || 0;

    if (pPrice <= 0) {
      // Khi không có nguyên giá mua ban đầu -> Đánh giá dựa trên mức chi phí tuyệt đối
      let score = 100;
      if (rCost > 5000000) score = 40;
      else if (rCost > 2000000) score = 65;
      else if (rCost > 500000) score = 85;
      return { score, isAvailable: false, ratio: 0 };
    }

    const ratio = rCost / pPrice;
    let score = 20;
    for (const tier of config.REPAIR_COST_RATIO_THRESHOLDS) {
      if (ratio <= tier.maxRatio) {
        score = tier.score;
        break;
      }
    }

    return { score, isAvailable: true, ratio };
  }

  /**
   * 5. Tính toán điểm thời gian ngừng máy gián đoạn (Downtime Score - Weight: 10%)
   */
  _calcDowntimeScore(downtimeHours) {
    const hours = Number(downtimeHours) || 0;
    let score = 20;
    for (const tier of config.DOWNTIME_HOURS_THRESHOLDS) {
      if (hours <= tier.maxHours) {
        score = tier.score;
        break;
      }
    }
    return score;
  }

  /**
   * 6. Tính toán điểm thời hạn bảo hành (Warranty Score - Weight: 10%)
   */
  _calcWarrantyScore(warrantyEnd) {
    if (!warrantyEnd) {
      return { score: 60, isAvailable: false, status: 'UNKNOWN' };
    }

    const wDate = new Date(warrantyEnd);
    if (isNaN(wDate.getTime())) {
      return { score: 60, isAvailable: false, status: 'UNKNOWN' };
    }

    const now = new Date();
    const diffDays = Math.ceil((wDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      return { score: 100, isAvailable: true, status: 'VALID', daysLeft: diffDays };
    } else if (diffDays >= 0) {
      return { score: 70, isAvailable: true, status: 'EXPIRING_SOON', daysLeft: diffDays };
    } else {
      return { score: 40, isAvailable: true, status: 'EXPIRED', daysOver: Math.abs(diffDays) };
    }
  }

  /**
   * Lấy mức độ hoàn thiện dữ liệu của thiết bị (Data Completeness)
   * @param {number} assetId
   */
  async getDataCompleteness(assetId) {
    const device = await deviceRepository.findById(assetId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${assetId}]`);
    }

    const metrics = await healthRepository.getRawAssetMetrics(assetId);
    const hasPurchaseDate = !!device.purchase_date;
    const hasPrice = Number(device.purchase_price) > 0;
    const hasWarranty = !!device.warranty_end;
    const hasSchedules = Number(metrics?.schedules?.total_schedules || 0) > 0;
    const hasIncidents = true;
    const hasDowntime = true;

    const factors = [hasPurchaseDate, hasPrice, hasWarranty, hasSchedules, hasIncidents, hasDowntime];
    const evaluatedCount = factors.filter(Boolean).length;
    const totalCount = factors.length;

    return {
      assetId,
      evaluatedCount,
      totalCount,
      completenessText: `${evaluatedCount}/${totalCount} factors`,
      completenessPercentage: Math.round((evaluatedCount / totalCount) * 100),
      isSufficient: evaluatedCount >= 3,
    };
  }

  /**
   * Tính toán và cập nhật điểm sức khỏe cho một thiết bị
   * @param {number} assetId
   */
  async calculateHealthScore(assetId) {
    const device = await deviceRepository.findById(assetId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${assetId}]`);
    }

    // 1. Lấy dữ liệu nghiệp vụ thực tế từ MySQL
    const metrics = await healthRepository.getRawAssetMetrics(assetId);
    const reqs = metrics?.requests || {};
    const scheds = metrics?.schedules || {};

    const totalIncidents = Number(reqs.total_requests || 0);
    const totalRepairCost = Number(reqs.total_repair_cost || 0);
    const downtimeHours = Number(reqs.downtime_hours || 0);
    const overdueSchedules = Number(scheds.overdue_schedules || 0);
    const maxOverdueDays = Number(scheds.max_overdue_days || 0);
    const totalSchedules = Number(scheds.total_schedules || 0);

    // 2. Tính toán 6 Sub-Scores
    const ageResult = this._calcAgeScore(device.purchase_date);
    const failureScore = this._calcFailureScore(totalIncidents);
    const maintResult = this._calcMaintenanceScore(maxOverdueDays, overdueSchedules, totalSchedules);
    const costResult = this._calcRepairCostScore(totalRepairCost, device.purchase_price);
    const downtimeScore = this._calcDowntimeScore(downtimeHours);
    const warrantyResult = this._calcWarrantyScore(device.warranty_end);

    // 3. Đánh giá tính đầy đủ dữ liệu (Data Completeness)
    const evaluatedFactors = [
      ageResult.isAvailable,
      true, // Failure history luôn có sẵn (0 hoặc > 0)
      maintResult.isAvailable,
      costResult.isAvailable,
      true, // Downtime luôn có sẵn
      warrantyResult.isAvailable,
    ];

    const evaluatedCount = evaluatedFactors.filter(Boolean).length;
    const totalFactors = evaluatedFactors.length;
    const dataCompleteness = Math.round((evaluatedCount / totalFactors) * 100);

    // 4. Trường hợp INSUFFICIENT_DATA: Khi số yếu tố khả dụng quá thấp (< 3) và không có bất kỳ lịch sử sự cố nào
    if (evaluatedCount < 3 && totalIncidents === 0 && !device.purchase_date && !device.warranty_end) {
      const insufficientData = {
        deviceId: assetId,
        assetId,
        healthScore: null,
        healthStatus: 'INSUFFICIENT_DATA',
        ageScore: ageResult.score,
        failureScore,
        maintenanceScore: maintResult.score,
        repairCostScore: costResult.score,
        downtimeScore,
        warrantyScore: warrantyResult.score,
        dataCompleteness,
        evaluatedFactorsCount: evaluatedCount,
        totalFactorsCount: totalFactors,
        calculationVersion: config.VERSION,
        calculatedAt: new Date().toISOString(),
      };

      await healthRepository.upsertHealthScore(insufficientData);

      return {
        assetId,
        deviceId: assetId,
        deviceCode: device.code,
        deviceName: device.name,
        healthScore: null,
        status: 'INSUFFICIENT_DATA',
        healthStatus: 'INSUFFICIENT_DATA',
        dataCompleteness: `${evaluatedCount}/${totalFactors} factors`,
        completenessPercentage: dataCompleteness,
        breakdown: {
          ageScore: ageResult.score,
          failureScore,
          maintenanceScore: maintResult.score,
          repairCostScore: costResult.score,
          downtimeScore,
          warrantyScore: warrantyResult.score,
        },
        calculatedAt: insufficientData.calculatedAt,
        calculationVersion: config.VERSION,
      };
    }

    // 5. Áp dụng công thức trọng số chuẩn (Weights)
    const weights = config.HEALTH_WEIGHTS;
    let rawScore = (
      (ageResult.score * weights.AGE) +
      (failureScore * weights.FAILURE_FREQUENCY) +
      (maintResult.score * weights.MAINTENANCE) +
      (costResult.score * weights.REPAIR_COST) +
      (downtimeScore * weights.DOWNTIME) +
      (warrantyResult.score * weights.WARRANTY)
    );

    // Chống NaN, Infinity, Negative, > 100
    if (!Number.isFinite(rawScore)) {
      rawScore = 50;
    }
    const healthScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

    // 6. Phân loại Health Status (GOOD / FAIR / WARNING / CRITICAL)
    const healthStatus = this.getHealthStatus(healthScore);

    const healthRecord = {
      deviceId: assetId,
      assetId,
      healthScore,
      healthStatus,
      ageScore: ageResult.score,
      failureScore,
      maintenanceScore: maintResult.score,
      repairCostScore: costResult.score,
      downtimeScore,
      warrantyScore: warrantyResult.score,
      dataCompleteness,
      evaluatedFactorsCount: evaluatedCount,
      totalFactorsCount: totalFactors,
      calculationVersion: config.VERSION,
      calculatedAt: new Date().toISOString(),
    };

    // 7. Lưu vào MySQL (bảng asset_health_scores)
    await healthRepository.upsertHealthScore(healthRecord);

    return {
      assetId,
      deviceId: assetId,
      deviceCode: device.code,
      deviceName: device.name,
      healthScore,
      status: healthStatus,
      healthStatus,
      dataCompleteness: `${evaluatedCount}/${totalFactors} factors`,
      completenessPercentage: dataCompleteness,
      breakdown: {
        ageScore: ageResult.score,
        failureScore,
        maintenanceScore: maintResult.score,
        repairCostScore: costResult.score,
        downtimeScore,
        warrantyScore: warrantyResult.score,
      },
      detailedBreakdown: {
        age: { score: ageResult.score, weight: weights.AGE * 100, detail: ageResult.ageText },
        failureFrequency: { score: failureScore, weight: weights.FAILURE_FREQUENCY * 100, detail: `${totalIncidents} sự cố tích lũy` },
        maintenance: { score: maintResult.score, weight: weights.MAINTENANCE * 100, detail: maintResult.note },
        repairCost: { score: costResult.score, weight: weights.REPAIR_COST * 100, detail: `${totalRepairCost.toLocaleString('vi-VN')} đ` },
        downtime: { score: downtimeScore, weight: weights.DOWNTIME * 100, detail: `${downtimeHours} giờ ngừng máy` },
        warranty: { score: warrantyResult.score, weight: weights.WARRANTY * 100, detail: warrantyResult.status },
      },
      calculatedAt: healthRecord.calculatedAt,
      calculationVersion: config.VERSION,
    };
  }

  /**
   * Lấy chi tiết Breakdown của thiết bị
   * @param {number} assetId
   */
  async getHealthBreakdown(assetId) {
    const result = await this.calculateHealthScore(assetId);
    return {
      assetId,
      healthScore: result.healthScore,
      status: result.status,
      dataCompleteness: result.dataCompleteness,
      breakdown: result.breakdown,
      detailedBreakdown: result.detailedBreakdown,
      calculatedAt: result.calculatedAt,
      calculationVersion: result.calculationVersion,
    };
  }

  /**
   * Tính toán lại toàn bộ thiết bị trong hệ thống (Batch Recalculation)
   */
  async recalculateAllAssets() {
    const devices = await deviceRepository.findAll({ limit: 1000 });
    const items = devices.devices || [];

    logger.info(`[Asset Health Engine] Bắt đầu tính toán lại toàn bộ ${items.length} thiết bị...`);
    const results = [];

    for (const dev of items) {
      try {
        const h = await this.calculateHealthScore(dev.id);
        results.push(h);
      } catch (err) {
        logger.error(`[Asset Health Engine] Lỗi tính toán thiết bị ID ${dev.id}: ${err.message}`);
      }
    }

    logger.info(`[Asset Health Engine] Hoàn tất tính toán ${results.length}/${items.length} thiết bị.`);
    return {
      totalProcessed: results.length,
      totalAssets: items.length,
      version: config.VERSION,
    };
  }

  /**
   * Phân loại trạng thái sức khỏe từ điểm số (0 - 100)
   */
  getHealthStatus(score) {
    if (score === null || score === undefined) return 'INSUFFICIENT_DATA';
    const num = Number(score);
    if (num >= 80) return 'GOOD';
    if (num >= 60) return 'FAIR';
    if (num >= 40) return 'WARNING';
    return 'CRITICAL';
  }
}

module.exports = new AssetHealthService();
