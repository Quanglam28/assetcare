const healthRepository = require('../repositories/healthRepository');
const deviceRepository = require('../repositories/deviceRepository');
const config = require('../config/failureRiskConfig');
const { NotFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * FailureRiskService
 * Động cơ tính toán định lượng Nguy Cơ Sự Cố Thiết Bị (Failure Risk Score: 0 - 100)
 * Rule-Based Engine: Đánh giá theo cửa sổ thời gian 30 ngày, 90 ngày và phân tích xu hướng biến động
 */
class FailureRiskService {
  /**
   * 1. Tính toán điểm tần suất sự cố trong 30 ngày gần nhất (Recent Failure Frequency)
   */
  _calcRecentFailureScore(failures30d) {
    const count = Number(failures30d) || 0;
    let score = 10;
    let label = 'Không có sự cố';

    for (const tier of config.RECENT_FAILURE_THRESHOLDS_30D) {
      if (count <= tier.maxCount) {
        score = tier.score;
        label = tier.label;
        break;
      }
    }

    return { score, count, label, isAvailable: true };
  }

  /**
   * 2. Tính toán điểm xu hướng sự cố (Failure Trend: 30d hiện tại vs 30d trước)
   */
  _calcFailureTrendScore(current30d, previous30d) {
    const curr = Number(current30d) || 0;
    const prev = Number(previous30d) || 0;

    let deltaPercent = 0;
    let score = 40;
    let trendType = 'STABLE';
    let label = 'Ổn định (0 sự cố)';

    if (prev === 0 && curr === 0) {
      score = 40;
      deltaPercent = 0;
      trendType = 'STABLE';
      label = 'Không phát sinh sự cố cả 2 chu kỳ';
    } else if (prev === 0 && curr > 0) {
      score = 90;
      deltaPercent = 100 * curr;
      trendType = 'INCREASING_STRONG';
      label = `Tăng mới ${curr} sự cố so với chu kỳ trước (0 sự cố)`;
    } else if (prev > 0) {
      deltaPercent = Math.round(((curr - prev) / prev) * 100);
      if (deltaPercent <= -50) {
        score = 10;
        trendType = 'DECREASING_STRONG';
        label = `Giảm mạnh ${Math.abs(deltaPercent)}% so với chu kỳ trước`;
      } else if (deltaPercent <= -10) {
        score = 25;
        trendType = 'DECREASING_MILD';
        label = `Giảm nhẹ ${Math.abs(deltaPercent)}%`;
      } else if (deltaPercent <= 10) {
        score = 40;
        trendType = 'STABLE';
        label = `Duy trì ổn định (Biến động ${deltaPercent > 0 ? '+' : ''}${deltaPercent}%)`;
      } else if (deltaPercent <= 50) {
        score = 60;
        trendType = 'INCREASING_MILD';
        label = `Gia tăng nhẹ +${deltaPercent}%`;
      } else if (deltaPercent <= 150) {
        score = 75;
        trendType = 'INCREASING_MODERATE';
        label = `Gia tăng đáng kể +${deltaPercent}%`;
      } else {
        score = 90;
        trendType = 'INCREASING_STRONG';
        label = `Gia tăng đột biến +${deltaPercent}%`;
      }
    }

    return {
      score,
      current30d: curr,
      previous30d: prev,
      deltaPercent,
      trendType,
      label,
      isAvailable: true,
    };
  }

  /**
   * 3. Tính toán nguy cơ do bảo dưỡng định kỳ quá hạn (Maintenance Overdue Risk)
   */
  _calcMaintenanceOverdueScore(maxOverdueDays, overdueCount, totalSchedules) {
    const total = Number(totalSchedules) || 0;
    const overdue = Number(overdueCount) || 0;
    const days = Number(maxOverdueDays) || 0;

    if (total === 0) {
      return { score: 20, isAvailable: false, days: 0, label: 'Chưa thiết lập lịch bảo trì định kỳ' };
    }

    if (overdue === 0 || days <= 0) {
      return { score: 10, isAvailable: true, days: 0, label: 'Bảo trì đúng lịch 100%' };
    }

    let score = 95;
    let label = `Quá hạn bảo dưỡng ${days} ngày`;
    for (const tier of config.MAINTENANCE_OVERDUE_THRESHOLDS) {
      if (days <= tier.maxDays) {
        score = tier.score;
        label = `${tier.label} (${days} ngày)`;
        break;
      }
    }

    return { score, isAvailable: true, days, overdueCount: overdue, label };
  }

  /**
   * 4. Tính toán điểm xu hướng chi phí sửa chữa (Repair Cost Trend: 90d)
   */
  _calcRepairCostTrendScore(current90d, previous90d) {
    const curr = Number(current90d) || 0;
    const prev = Number(previous90d) || 0;

    let deltaPercent = 0;
    let score = 35;
    let label = 'Chi phí ổn định';

    if (prev === 0 && curr === 0) {
      score = 35;
      deltaPercent = 0;
      label = 'Không phát sinh chi phí sửa chữa gần đây';
    } else if (prev === 0 && curr > 0) {
      score = curr > 5000000 ? 95 : 80;
      deltaPercent = 100;
      label = `Phát sinh chi phí mới (${curr.toLocaleString('vi-VN')} đ)`;
    } else if (prev > 0) {
      deltaPercent = Math.round(((curr - prev) / prev) * 100);
      if (deltaPercent <= -10) {
        score = 20;
        label = `Chi phí giảm ${Math.abs(deltaPercent)}% so với chu kỳ trước`;
      } else if (deltaPercent <= 15) {
        score = 35;
        label = `Chi phí ổn định (${deltaPercent > 0 ? '+' : ''}${deltaPercent}%)`;
      } else if (deltaPercent <= 50) {
        score = 65;
        label = `Chi phí tăng nhẹ +${deltaPercent}%`;
      } else if (deltaPercent <= 150) {
        score = 80;
        label = `Chi phí tăng đáng kể +${deltaPercent}%`;
      } else {
        score = 95;
        label = `Chi phí tăng đột biến +${deltaPercent}%`;
      }
    }

    return {
      score,
      current90d: curr,
      previous90d: prev,
      deltaPercent,
      label,
      isAvailable: curr > 0 || prev > 0,
    };
  }

  /**
   * 5. Tính toán điểm xu hướng thời gian ngừng máy (Downtime Trend: 30d)
   */
  _calcDowntimeTrendScore(current30d, previous30d) {
    const curr = Number(current30d) || 0;
    const prev = Number(previous30d) || 0;

    let deltaPercent = 0;
    let score = 35;
    let label = 'Thời gian ngừng máy ổn định';

    if (prev === 0 && curr === 0) {
      score = 35;
      deltaPercent = 0;
      label = 'Không phát sinh downtime 30 ngày qua';
    } else if (prev === 0 && curr > 0) {
      score = curr > 24 ? 85 : 60;
      deltaPercent = 100;
      label = `Phát sinh downtime mới (${curr} giờ)`;
    } else if (prev > 0) {
      deltaPercent = Math.round(((curr - prev) / prev) * 100);
      if (deltaPercent <= -10) {
        score = 15;
        label = `Downtime giảm ${Math.abs(deltaPercent)}%`;
      } else if (deltaPercent <= 15) {
        score = 35;
        label = `Downtime ổn định (${deltaPercent > 0 ? '+' : ''}${deltaPercent}%)`;
      } else if (deltaPercent <= 50) {
        score = 60;
        label = `Downtime tăng nhẹ +${deltaPercent}%`;
      } else {
        score = 85;
        label = `Downtime tăng mạnh +${deltaPercent}%`;
      }
    }

    return {
      score,
      current30d: curr,
      previous30d: prev,
      deltaPercent,
      label,
      isAvailable: curr > 0 || prev > 0,
    };
  }

  /**
   * 6. Tính toán rủi ro theo tuổi đời thiết bị (Asset Age Risk)
   */
  _calcAgeRiskScore(purchaseDate, createdAt) {
    const rawDate = purchaseDate || createdAt;
    if (!rawDate) {
      return { score: 30, isAvailable: false, ageYears: 0, label: 'Chưa xác định ngày bắt đầu' };
    }

    const pDate = new Date(rawDate);
    if (isNaN(pDate.getTime())) {
      return { score: 30, isAvailable: false, ageYears: 0, label: 'Ngày tháng không hợp lệ' };
    }

    const now = new Date();
    const diffMs = now - pDate;
    if (diffMs <= 0) {
      return { score: 10, isAvailable: true, ageYears: 0, label: 'Thiết bị mới' };
    }

    const ageYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    let score = 90;
    let label = '> 5 năm';

    for (const tier of config.AGE_RISK_THRESHOLDS) {
      if (ageYears <= tier.maxYears) {
        score = tier.score;
        label = tier.label;
        break;
      }
    }

    return { score, isAvailable: true, ageYears, label };
  }

  /**
   * Lấy mức độ hoàn thiện dữ liệu rủi ro
   * @param {number} deviceId
   */
  async getRiskDataCompleteness(deviceId) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    const metrics = await healthRepository.getRawAssetMetrics(deviceId);
    const hasAge = !!(device.purchase_date || device.created_at);
    const hasFailures = true;
    const hasTrend = true;
    const hasSchedules = Number(metrics?.schedules?.total_schedules || 0) > 0;
    const hasCostTrend = Number(metrics?.requests?.total_repair_cost || 0) > 0;
    const hasDowntimeTrend = true;

    const factors = [hasFailures, hasTrend, hasSchedules, hasCostTrend, hasDowntimeTrend, hasAge];
    const evaluatedCount = factors.filter(Boolean).length;
    const totalCount = factors.length;

    return {
      deviceId,
      evaluatedCount,
      totalCount,
      completenessText: `${evaluatedCount}/${totalCount} factors`,
      completenessPercentage: Math.round((evaluatedCount / totalCount) * 100),
      isSufficient: evaluatedCount >= 3,
    };
  }

  /**
   * Tính toán Failure Trend độc lập
   */
  async calculateFailureTrend(deviceId) {
    const metrics = await healthRepository.getRawAssetMetrics(deviceId);
    const reqs = metrics?.requests || {};
    return this._calcFailureTrendScore(reqs.failures_last_30d, reqs.failures_prev_30d);
  }

  /**
   * Tính toán Repair Cost Trend độc lập
   */
  async calculateRepairCostTrend(deviceId) {
    const metrics = await healthRepository.getRawAssetMetrics(deviceId);
    const reqs = metrics?.requests || {};
    return this._calcRepairCostTrendScore(reqs.cost_last_90d, reqs.cost_prev_90d);
  }

  /**
   * Tính toán Downtime Trend độc lập
   */
  async calculateDowntimeTrend(deviceId) {
    const metrics = await healthRepository.getRawAssetMetrics(deviceId);
    const reqs = metrics?.requests || {};
    return this._calcDowntimeTrendScore(reqs.downtime_last_30d, reqs.downtime_prev_30d);
  }

  /**
   * Tính toán và cập nhật điểm nguy cơ sự cố (Failure Risk Score) cho 1 thiết bị
   * @param {number} deviceId
   */
  async calculateFailureRisk(deviceId) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    // 1. Lấy metrics thực tế từ MySQL
    const metrics = await healthRepository.getRawAssetMetrics(deviceId);
    const reqs = metrics?.requests || {};
    const scheds = metrics?.schedules || {};

    const failures30d = Number(reqs.failures_last_30d || 0);
    const failuresPrev30d = Number(reqs.failures_prev_30d || 0);
    const cost90d = Number(reqs.cost_last_90d || 0);
    const costPrev90d = Number(reqs.cost_prev_90d || 0);
    const downtime30d = Number(reqs.downtime_last_30d || 0);
    const downtimePrev30d = Number(reqs.downtime_prev_30d || 0);
    const overdueDays = Number(scheds.max_overdue_days || 0);
    const overdueCount = Number(scheds.overdue_schedules || 0);
    const totalSchedules = Number(scheds.total_schedules || 0);

    // 2. Tính 6 Sub-Scores thành phần
    const freqRes = this._calcRecentFailureScore(failures30d);
    const trendRes = this._calcFailureTrendScore(failures30d, failuresPrev30d);
    const maintRes = this._calcMaintenanceOverdueScore(overdueDays, overdueCount, totalSchedules);
    const costTrendRes = this._calcRepairCostTrendScore(cost90d, costPrev90d);
    const downtimeTrendRes = this._calcDowntimeTrendScore(downtime30d, downtimePrev30d);
    const ageRiskRes = this._calcAgeRiskScore(device.purchase_date, device.created_at);

    // 3. Đánh giá độ hoàn thiện dữ liệu
    const evaluatedFactors = [
      freqRes.isAvailable,
      trendRes.isAvailable,
      maintRes.isAvailable,
      costTrendRes.isAvailable,
      downtimeTrendRes.isAvailable,
      ageRiskRes.isAvailable,
    ];
    const evaluatedCount = evaluatedFactors.filter(Boolean).length;
    const totalFactors = evaluatedFactors.length;
    const dataCompleteness = Math.round((evaluatedCount / totalFactors) * 100);

    // 4. Áp dụng công thức trọng số chuẩn
    const weights = config.RISK_WEIGHTS;
    let rawRisk = (
      (freqRes.score * weights.RECENT_FAILURE_FREQUENCY) +
      (trendRes.score * weights.FAILURE_TREND) +
      (maintRes.score * weights.MAINTENANCE_OVERDUE) +
      (costTrendRes.score * weights.REPAIR_COST_TREND) +
      (downtimeTrendRes.score * weights.DOWNTIME_TREND) +
      (ageRiskRes.score * weights.AGE_RISK)
    );

    if (!Number.isFinite(rawRisk)) {
      rawRisk = 20;
    }
    const riskScore = Math.max(0, Math.min(100, Math.round(rawRisk * 10) / 10));

    // 5. Phân loại Risk Status
    let riskStatus = 'LOW';
    if (riskScore >= 80) {
      riskStatus = 'CRITICAL';
    } else if (riskScore >= 60) {
      riskStatus = 'HIGH';
    } else if (riskScore >= 40) {
      riskStatus = 'MEDIUM';
    } else if (riskScore >= 20) {
      riskStatus = 'LOW';
    } else {
      riskStatus = 'VERY_LOW';
    }

    // 6. Sinh giải thích nguyên nhân định lượng từ dữ liệu thật (Explainable Reasons)
    const explainableReasons = [];
    if (failures30d >= 4) {
      explainableReasons.push(`⚠️ Tần suất rất cao: ${failures30d} sự cố trong 30 ngày gần đây`);
    } else if (failures30d >= 2) {
      explainableReasons.push(`⚠️ Tần suất đáng lưu ý: ${failures30d} sự cố trong 30 ngày gần đây`);
    } else if (failures30d === 1) {
      explainableReasons.push(`ℹ️ Phát sinh 1 sự cố trong 30 ngày qua`);
    } else {
      explainableReasons.push(`✅ Không phát sinh sự cố trong 30 ngày gần nhất`);
    }

    if (trendRes.deltaPercent > 50) {
      explainableReasons.push(`⚠️ Xu hướng sự cố tăng mạnh +${trendRes.deltaPercent}% so với 30 ngày trước`);
    } else if (trendRes.deltaPercent > 0) {
      explainableReasons.push(`ℹ️ Sự cố tăng nhẹ +${trendRes.deltaPercent}% so với chu kỳ trước`);
    } else if (trendRes.deltaPercent < 0) {
      explainableReasons.push(`✅ Tần suất sự cố giảm ${Math.abs(trendRes.deltaPercent)}% so với chu kỳ trước`);
    }

    if (overdueDays > 0) {
      explainableReasons.push(`⚠️ Bảo dưỡng định kỳ quá hạn ${overdueDays} ngày`);
    } else {
      explainableReasons.push(`✅ Lịch bảo dưỡng định kỳ tuân thủ đúng hạn`);
    }

    if (costTrendRes.deltaPercent > 50) {
      explainableReasons.push(`⚠️ Chi phí sửa chữa tăng +${costTrendRes.deltaPercent}% trong 90 ngày gần đây`);
    }

    if (ageRiskRes.ageYears > 5) {
      explainableReasons.push(`ℹ️ Thiết bị đã sử dụng trên 5 năm (${ageRiskRes.ageYears.toFixed(1)} năm tuổi)`);
    }

    const calculatedAt = new Date().toISOString();

    const riskRecord = {
      deviceId,
      riskScore,
      riskStatus,
      failureFrequencyScore: freqRes.score,
      failureTrendScore: trendRes.score,
      maintenanceRiskScore: maintRes.score,
      repairCostTrendScore: costTrendRes.score,
      downtimeTrendScore: downtimeTrendRes.score,
      ageRiskScore: ageRiskRes.score,
      dataCompleteness,
      evaluatedFactorsCount: evaluatedCount,
      totalFactorsCount: totalFactors,
      calculationVersion: config.VERSION,
      calculatedAt,
    };

    // 7. Lưu vào MySQL (bảng failure_risk_scores)
    await healthRepository.upsertFailureRiskScore(riskRecord);

    return {
      deviceId,
      deviceCode: device.code,
      deviceName: device.name,
      riskScore,
      status: riskStatus,
      riskStatus,
      statusInfo: config.RISK_LEVELS[riskStatus],
      dataCompleteness: `${evaluatedCount}/${totalFactors} factors`,
      completenessPercentage: dataCompleteness,
      breakdown: {
        failureFrequencyScore: freqRes.score,
        failureTrendScore: trendRes.score,
        maintenanceRiskScore: maintRes.score,
        repairCostTrendScore: costTrendRes.score,
        downtimeTrendScore: downtimeTrendRes.score,
        ageRiskScore: ageRiskRes.score,
      },
      detailedBreakdown: {
        recentFailure: { score: freqRes.score, weight: weights.RECENT_FAILURE_FREQUENCY * 100, detail: freqRes.label, count: failures30d },
        failureTrend: { score: trendRes.score, weight: weights.FAILURE_TREND * 100, detail: trendRes.label, deltaPercent: trendRes.deltaPercent },
        maintenanceOverdue: { score: maintRes.score, weight: weights.MAINTENANCE_OVERDUE * 100, detail: maintRes.label, overdueDays },
        repairCostTrend: { score: costTrendRes.score, weight: weights.REPAIR_COST_TREND * 100, detail: costTrendRes.label, deltaPercent: costTrendRes.deltaPercent },
        downtimeTrend: { score: downtimeTrendRes.score, weight: weights.DOWNTIME_TREND * 100, detail: downtimeTrendRes.label, deltaPercent: downtimeTrendRes.deltaPercent },
        ageRisk: { score: ageRiskRes.score, weight: weights.AGE_RISK * 100, detail: ageRiskRes.label, ageYears: ageRiskRes.ageYears },
      },
      trends: {
        failures: { current30d: failures30d, previous30d: failuresPrev30d, changePercent: trendRes.deltaPercent },
        repairCost: { current90d: cost90d, previous90d: costPrev90d, changePercent: costTrendRes.deltaPercent },
        downtime: { current30d: downtime30d, previous30d: downtimePrev30d, changePercent: downtimeTrendRes.deltaPercent },
      },
      explainableReasons,
      calculationVersion: config.VERSION,
      calculatedAt,
    };
  }

  /**
   * Lấy chi tiết Failure Risk Breakdown của thiết bị
   * @param {number} deviceId
   */
  async getFailureRiskBreakdown(deviceId) {
    const result = await this.calculateFailureRisk(deviceId);
    return {
      deviceId,
      riskScore: result.riskScore,
      status: result.status,
      riskStatus: result.riskStatus,
      statusInfo: result.statusInfo,
      dataCompleteness: result.dataCompleteness,
      breakdown: result.breakdown,
      detailedBreakdown: result.detailedBreakdown,
      trends: result.trends,
      explainableReasons: result.explainableReasons,
      calculationVersion: result.calculationVersion,
      calculatedAt: result.calculatedAt,
    };
  }

  /**
   * Tính toán lại toàn bộ nguy cơ sự cố thiết bị trong hệ thống
   */
  async recalculateAllRiskScores() {
    const devices = await deviceRepository.findAll({ limit: 1000 });
    const items = devices.devices || [];

    logger.info(`[Failure Risk Engine] Bắt đầu tính toán lại toàn bộ ${items.length} thiết bị...`);
    const results = [];

    for (const dev of items) {
      try {
        const r = await this.calculateFailureRisk(dev.id);
        results.push(r);
      } catch (err) {
        logger.error(`[Failure Risk Engine] Lỗi tính toán thiết bị ID ${dev.id}: ${err.message}`);
      }
    }

    logger.info(`[Failure Risk Engine] Hoàn tất tính toán nguy cơ cho ${results.length}/${items.length} thiết bị.`);
    return {
      totalProcessed: results.length,
      totalAssets: items.length,
      version: config.VERSION,
    };
  }

  /**
   * Phân loại cấp độ nguy cơ sự cố từ điểm số (0 - 100)
   */
  getRiskStatus(score) {
    const num = Number(score) || 0;
    if (num >= 80) return 'CRITICAL';
    if (num >= 60) return 'HIGH';
    if (num >= 40) return 'MEDIUM';
    if (num >= 20) return 'LOW';
    return 'VERY_LOW';
  }
}

module.exports = new FailureRiskService();
