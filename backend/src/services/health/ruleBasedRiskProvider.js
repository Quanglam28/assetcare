const RiskAssessmentProvider = require('./riskAssessmentProvider');
const config = require('../../config/healthScoreConfig');

/**
 * RuleBasedRiskProvider
 * Hiện thực hóa thuật toán đánh giá rủi ro hỏng hóc định lượng bằng quy tắc chuyên gia (Expert Rule-Based Engine)
 */
class RuleBasedRiskProvider extends RiskAssessmentProvider {
  getProviderName() {
    return 'Rule-Based Predictive Risk Engine';
  }

  getVersion() {
    return config.VERSION;
  }

  /**
   * Tính toán rủi ro từ số sự cố gần đây (90 ngày)
   */
  _calcRecentFailureRisk(failures90d) {
    if (failures90d === 0) return 0;
    if (failures90d === 1) return 25;
    if (failures90d === 2) return 50;
    if (failures90d === 3) return 75;
    return 100; // >= 4 sự cố trong 90 ngày
  }

  /**
   * Tính toán rủi ro từ xu hướng gia tăng sự cố (Trend 90d vs 90d-180d)
   */
  _calcFailureTrendRisk(currentCount, previousCount) {
    if (previousCount === 0 && currentCount === 0) return { score: 0, percent: 0, trend: 'STABLE' };
    if (previousCount === 0 && currentCount > 0) return { score: 85, percent: 100, trend: 'NEW_INCIDENTS' };
    
    const diff = currentCount - previousCount;
    const percent = Math.round((diff / previousCount) * 100);

    if (percent <= -30) return { score: 10, percent, trend: 'SHARPLY_DECREASING' };
    if (percent < 0) return { score: 25, percent, trend: 'DECREASING' };
    if (percent === 0) return { score: 40, percent, trend: 'STABLE' };
    if (percent <= 50) return { score: 70, percent, trend: 'INCREASING' };
    return { score: 95, percent, trend: 'SHARPLY_INCREASING' }; // Tăng > 50%
  }

  /**
   * Tính toán rủi ro từ xu hướng gia tăng chi phí sửa chữa
   */
  _calcCostTrendRisk(currentCost, previousCost) {
    if (previousCost === 0 && currentCost === 0) return { score: 0, percent: 0, trend: 'STABLE' };
    if (previousCost === 0 && currentCost > 0) return { score: 80, percent: 100, trend: 'NEW_COST' };

    const diff = currentCost - previousCost;
    const percent = Math.round((diff / previousCost) * 100);

    if (percent <= -20) return { score: 10, percent, trend: 'DECREASING' };
    if (percent === 0) return { score: 35, percent, trend: 'STABLE' };
    if (percent <= 50) return { score: 65, percent, trend: 'INCREASING' };
    return { score: 90, percent, trend: 'SHARPLY_INCREASING' };
  }

  /**
   * Tính toán rủi ro từ tuổi thọ thiết bị
   */
  _calcAgeRisk(ageYears) {
    if (ageYears < 1.0) return 10;
    if (ageYears < 2.5) return 25;
    if (ageYears < 4.0) return 50;
    if (ageYears < 5.5) return 75;
    return 95; // > 5.5 năm
  }

  /**
   * Tính toán rủi ro từ thời gian ngừng máy (Downtime)
   */
  _calcDowntimeRisk(downtimeHours) {
    if (downtimeHours === 0) return 0;
    if (downtimeHours <= 8) return 20;
    if (downtimeHours <= 24) return 50;
    if (downtimeHours <= 72) return 75;
    return 95;
  }

  /**
   * Tính toán rủi ro từ bảo dưỡng định kỳ quá hạn
   */
  _calcMaintenanceOverdueRisk(overdueDays, overdueCount) {
    if (overdueCount === 0 || overdueDays <= 0) return 0;
    if (overdueDays <= 7) return 30;
    if (overdueDays <= 30) return 60;
    if (overdueDays <= 60) return 85;
    return 100;
  }

  /**
   * Tính toán rủi ro từ các sự cố nghiêm trọng (URGENT / HIGH)
   */
  _calcCriticalIncidentRisk(urgentCount, highCount) {
    const totalCritical = (urgentCount * 2) + highCount;
    if (totalCritical === 0) return 0;
    if (totalCritical === 1) return 40;
    if (totalCritical === 2) return 70;
    return 100;
  }

  /**
   * Đánh giá rủi ro đầy đủ
   */
  async assessRisk(context) {
    const {
      device,
      failuresLast90d = 0,
      failuresPrev90d = 0,
      costLast90d = 0,
      costPrev90d = 0,
      ageYears = 0,
      downtimeHours = 0,
      maintenanceOverdueDays = 0,
      maintenanceOverdueCount = 0,
      urgentIncidentsCount = 0,
      highIncidentsCount = 0,
      totalFailuresAllTime = 0,
    } = context;

    // 1. Tính toán 7 sub-scores rủi ro (thang điểm 0 - 100%)
    const recentFailureScore = this._calcRecentFailureRisk(failuresLast90d);
    const failureTrendResult = this._calcFailureTrendRisk(failuresLast90d, failuresPrev90d);
    const costTrendResult = this._calcCostTrendRisk(costLast90d, costPrev90d);
    const ageRiskScore = this._calcAgeRisk(ageYears);
    const downtimeRiskScore = this._calcDowntimeRisk(downtimeHours);
    const maintenanceOverdueScore = this._calcMaintenanceOverdueRisk(maintenanceOverdueDays, maintenanceOverdueCount);
    const criticalIncidentScore = this._calcCriticalIncidentRisk(urgentIncidentsCount, highIncidentsCount);

    // 2. Tính tổng điểm Risk Score có trọng số
    const weights = config.RISK_WEIGHTS;
    const rawRiskScore = (
      (recentFailureScore * weights.RECENT_FAILURES) +
      (failureTrendResult.score * weights.FAILURE_TREND) +
      (costTrendResult.score * weights.REPAIR_COST_TREND) +
      (ageRiskScore * weights.AGE_RISK) +
      (downtimeRiskScore * weights.DOWNTIME_RISK) +
      (maintenanceOverdueScore * weights.MAINTENANCE_OVERDUE) +
      (criticalIncidentScore * weights.CRITICAL_INCIDENTS)
    );

    const riskScore = Math.max(0, Math.min(100, Math.round(rawRiskScore * 10) / 10));

    // 3. Phân loại mức độ rủi ro (Risk Level)
    let riskLevel = 'VERY_LOW';
    if (riskScore > 80) riskLevel = 'CRITICAL';
    else if (riskScore > 60) riskLevel = 'HIGH';
    else if (riskScore > 40) riskLevel = 'MEDIUM';
    else if (riskScore > 20) riskLevel = 'LOW';
    else riskLevel = 'VERY_LOW';

    // 4. Giải thích nguyên nhân định lượng (Explainability Factors)
    const explainableReasons = [];

    if (failuresLast90d > 0) {
      explainableReasons.push({
        severity: failuresLast90d >= 3 ? 'CRITICAL' : failuresLast90d >= 2 ? 'HIGH' : 'MEDIUM',
        text: `${failuresLast90d} sự cố phát sinh trong 90 ngày gần nhất`,
      });
    }

    if (failureTrendResult.percent > 0) {
      explainableReasons.push({
        severity: failureTrendResult.percent >= 50 ? 'CRITICAL' : 'HIGH',
        text: `Tần suất sự cố tăng +${failureTrendResult.percent}% so với 3 tháng trước`,
      });
    }

    if (costTrendResult.percent > 0) {
      explainableReasons.push({
        severity: costTrendResult.percent >= 50 ? 'HIGH' : 'MEDIUM',
        text: `Chi phí sửa chữa tăng +${costTrendResult.percent}% so với 3 tháng trước`,
      });
    }

    if (maintenanceOverdueCount > 0) {
      explainableReasons.push({
        severity: maintenanceOverdueDays > 30 ? 'CRITICAL' : 'HIGH',
        text: `Lịch bảo dưỡng định kỳ đã quá hạn ${maintenanceOverdueDays} ngày`,
      });
    }

    if (ageYears >= 4.0) {
      explainableReasons.push({
        severity: ageYears >= 5.0 ? 'HIGH' : 'MEDIUM',
        text: `Thời gian sử dụng thiết bị đã ${ageYears.toFixed(1)} năm (khấu hao cao)`,
      });
    }

    if (urgentIncidentsCount > 0) {
      explainableReasons.push({
        severity: 'CRITICAL',
        text: `Từng phát sinh ${urgentIncidentsCount} sự cố khẩn cấp (URGENT)`,
      });
    }

    if (downtimeHours >= 24) {
      explainableReasons.push({
        severity: downtimeHours >= 72 ? 'HIGH' : 'MEDIUM',
        text: `Tổng thời gian ngừng máy tích lũy ${downtimeHours} giờ`,
      });
    }

    if (explainableReasons.length === 0) {
      explainableReasons.push({
        severity: 'LOW',
        text: 'Thiết bị hoạt động ổn định, không có tiền sử sự cố bất thường',
      });
    }

    return {
      riskScore,
      riskLevel,
      riskLevelInfo: config.RISK_LEVELS[riskLevel],
      factors: {
        recentFailureScore,
        failureTrendScore: failureTrendResult.score,
        repairCostTrendScore: costTrendResult.score,
        ageRiskScore,
        downtimeRiskScore,
        maintenanceOverdueScore,
        criticalIncidentScore,
      },
      trends: {
        failureTrendPercent: failureTrendResult.percent,
        failureTrendType: failureTrendResult.trend,
        costTrendPercent: costTrendResult.percent,
        costTrendType: costTrendResult.trend,
      },
      explainableReasons,
      provider: this.getProviderName(),
      version: this.getVersion(),
    };
  }
}

module.exports = new RuleBasedRiskProvider();
