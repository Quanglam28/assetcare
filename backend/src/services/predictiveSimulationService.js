const deviceRepository = require('../repositories/deviceRepository');
const healthRepository = require('../repositories/healthRepository');
const assetHealthService = require('./assetHealthService');
const failureRiskService = require('./failureRiskService');
const priorityService = require('./priorityService');
const simConfig = require('../config/simulationConfig');
const priorityConfig = require('../config/priorityConfig');
const failureRiskConfig = require('../config/failureRiskConfig');
const { NotFoundError, BadRequestError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * PredictiveSimulationService
 * Động cơ Mô phỏng Dự báo Bảo trì Thiết bị (Rule-Based Predictive Simulation)
 * Phase 4 — Version 1.0
 * Hoan toan tat dinh (Deterministic 100%)
 */
class PredictiveSimulationService {
  /**
   * Tính toán hệ số suy giảm theo ngày quá hạn
   */
  _getOverdueMultiplier(overdueDays) {
    const days = Math.max(0, Number(overdueDays) || 0);
    for (const tier of simConfig.HEALTH_DEGRADATION.OVERDUE_MULTIPLIERS) {
      if (days <= tier.maxDays) {
        return tier.multiplier;
      }
    }
    return 2.8;
  }

  /**
   * Tính toán hệ số suy giảm theo tuổi thiết bị
   */
  _getAgeMultiplier(ageYears) {
    const age = Math.max(0, Number(ageYears) || 0);
    for (const tier of simConfig.HEALTH_DEGRADATION.AGE_MULTIPLIERS) {
      if (age <= tier.maxYears) {
        return tier.multiplier;
      }
    }
    return 1.8;
  }

  /**
   * Tính toán hệ số rủi ro theo số sự cố 30 ngày gần đây
   */
  _getRecentFailuresMultiplier(failures30d) {
    const count = Math.max(0, Number(failures30d) || 0);
    for (const tier of simConfig.RISK_GROWTH.RECENT_FAILURES_MULTIPLIERS) {
      if (count <= tier.maxFailures) {
        return tier.multiplier;
      }
    }
    return 2.6;
  }

  /**
   * 1. Mô phỏng Sức Khỏe Dự Kiến (Projected Health Score)
   */
  simulateHealthScore(currentHealthScore, metrics = {}, days = 30, scenario = simConfig.SCENARIOS.NO_MAINTENANCE) {
    const h0 = Math.max(0, Math.min(100, Number(currentHealthScore) || 100));
    const simDays = Math.max(1, Number(days) || 30);

    if (scenario === simConfig.SCENARIOS.MAINTAIN_NOW) {
      // Kịch bản Bảo trì ngay: Phục hồi sức khỏe
      const recovered = Math.min(
        simConfig.MAINTENANCE_RECOVERY.HEALTH_RECOVERY_MAX_CEILING,
        h0 + simConfig.MAINTENANCE_RECOVERY.HEALTH_RECOVERY_BASE
      );
      const score = Math.round(recovered);
      return {
        score,
        status: assetHealthService.getHealthStatus(score),
        delta: Math.round(score - h0),
      };
    }

    // Kịch bản Không bảo trì (NO_MAINTENANCE)
    const projectedOverdue = (Number(metrics.overdueDays) || 0) + simDays;
    const overdueMult = this._getOverdueMultiplier(projectedOverdue);
    const ageMult = this._getAgeMultiplier(metrics.ageYears || 1);
    const trendMult = simConfig.HEALTH_DEGRADATION.FAILURE_TREND_MULTIPLIERS[metrics.trendType] || 1.0;

    // Tổng điểm suy giảm (Degradation)
    const baseDegradation = simConfig.HEALTH_DEGRADATION.BASE_DAILY_RATE * simDays;
    const totalDegradation = baseDegradation * overdueMult * ageMult * trendMult;

    const projectedScore = Math.max(5, Math.min(100, Math.round(h0 - totalDegradation)));

    return {
      score: projectedScore,
      status: assetHealthService.getHealthStatus(projectedScore),
      delta: Math.round(projectedScore - h0),
      degradationPoints: Math.round(totalDegradation * 10) / 10,
    };
  }

  /**
   * 2. Mô phỏng Nguy Cơ Sự Cố Dự Kiến (Projected Failure Risk)
   */
  simulateFailureRisk(currentRiskScore, metrics = {}, days = 30, scenario = simConfig.SCENARIOS.NO_MAINTENANCE) {
    const r0 = Math.max(0, Math.min(100, Number(currentRiskScore) || 10));
    const simDays = Math.max(1, Number(days) || 30);

    if (scenario === simConfig.SCENARIOS.MAINTAIN_NOW) {
      // Kịch bản Bảo trì ngay: Giảm nguy cơ sự cố
      const reduced = Math.max(
        simConfig.MAINTENANCE_RECOVERY.MIN_RISK_FLOOR,
        Math.round(r0 * (1 - simConfig.MAINTENANCE_RECOVERY.RISK_REDUCTION_PERCENTAGE))
      );
      return {
        score: reduced,
        status: failureRiskService.getRiskStatus(reduced),
        delta: Math.round(reduced - r0),
      };
    }

    // Kịch bản Không bảo trì (NO_MAINTENANCE)
    const recentMult = this._getRecentFailuresMultiplier(metrics.failures30d || 0);
    const baseGrowth = simConfig.RISK_GROWTH.BASE_DAILY_GROWTH * simDays * recentMult;
    const overdueBoost = (metrics.overdueDays > 0 ? simConfig.RISK_GROWTH.MAINTENANCE_OVERDUE_RISK_BOOST.DAILY_ADDITIONAL_POINTS * simDays : 0);

    const totalGrowth = baseGrowth + overdueBoost;
    const projectedScore = Math.max(5, Math.min(100, Math.round(r0 + totalGrowth)));

    return {
      score: projectedScore,
      status: failureRiskService.getRiskStatus(projectedScore),
      delta: Math.round(projectedScore - r0),
      growthPoints: Math.round(totalGrowth * 10) / 10,
    };
  }

  /**
   * 3. Mô phỏng Điểm Ưu Tiên Dự Kiến (Projected Priority Score)
   */
  simulatePriorityScore(projectedRiskScore, device = {}, metrics = {}, days = 30, scenario = simConfig.SCENARIOS.NO_MAINTENANCE) {
    const rProj = Math.max(0, Math.min(100, Number(projectedRiskScore) || 10));
    const w = priorityConfig.PRIORITY_WEIGHTS;

    const critResult = priorityService._calcBusinessCriticalityScore(device.business_criticality || 'MEDIUM');
    const valResult = priorityService._calcAssetValueScore(device.purchase_price);

    // Thời gian ngừng máy dự kiến
    let projectedDowntime = Number(metrics.downtimeHours30d) || 0;
    if (scenario === simConfig.SCENARIOS.NO_MAINTENANCE && rProj > 60) {
      projectedDowntime += Math.round((days / 30) * 8); // Tích lũy thêm downtime dự kiến
    } else if (scenario === simConfig.SCENARIOS.MAINTAIN_NOW) {
      projectedDowntime = Math.max(0, projectedDowntime * 0.5);
    }
    const downResult = priorityService._calcDowntimeImpactScore(projectedDowntime);

    const rawPriority = (rProj * w.FAILURE_RISK) +
      (critResult.score * w.BUSINESS_CRITICALITY) +
      (valResult.score * w.ASSET_VALUE) +
      (downResult.score * w.DOWNTIME_IMPACT);

    const score = Math.max(0, Math.min(100, Math.round(rawPriority * 10) / 10));

    return {
      score: Math.round(score),
      rawScore: score,
      status: priorityService.getPriorityLevel(score),
    };
  }

  /**
   * 4. Sinh lời giải thích định lượng cho kịch bản mô phỏng
   */
  generateSimulationExplanation(current, projected, delta, days, scenario, metrics = {}) {
    const reasons = [];

    if (scenario === simConfig.SCENARIOS.MAINTAIN_NOW) {
      reasons.push(`✅ Bảo trì ngay giúp giảm nguy cơ sự cố từ ${current.failureRisk} xuống ${projected.failureRisk} điểm (-${Math.abs(delta.risk)} điểm).`);
      reasons.push(`✅ Điểm sức khỏe phục hồi từ ${current.healthScore} lên ${projected.healthScore} điểm (+${delta.health} điểm).`);
      reasons.push(`✅ Thứ tự ưu tiên giảm từ ${current.priorityScore} xuống ${projected.priorityScore} điểm (${current.priorityStatus} ➔ ${projected.priorityStatus}).`);
      return reasons;
    }

    // Kịch bản NO_MAINTENANCE
    if (metrics.failures30d > 0) {
      reasons.push(`⚠️ Thiết bị đang phát sinh ${metrics.failures30d} sự cố trong 30 ngày gần đây.`);
    }
    if (metrics.overdueDays > 0) {
      reasons.push(`⚠️ Lịch bảo dưỡng định kỳ hiện tại đã quá hạn ${metrics.overdueDays} ngày (sau ${days} ngày sẽ quá hạn ${metrics.overdueDays + days} ngày).`);
    }
    if (metrics.trendType && metrics.trendType.includes('INCREASING')) {
      reasons.push(`📈 Xu hướng sự cố đang có chiều hướng gia tăng so với chu kỳ trước.`);
    }
    if (delta.priority >= 10) {
      reasons.push(`🔴 Nếu trì hoãn thêm ${days} ngày không bảo trì, Priority Score dự kiến tăng vọt từ ${current.priorityScore} lên ${projected.priorityScore} (${current.priorityStatus} ➔ ${projected.priorityStatus}).`);
    } else {
      reasons.push(`ℹ️ Sau ${days} ngày không can thiệp, Priority Score dự kiến thay đổi từ ${current.priorityScore} lên ${projected.priorityScore} điểm.`);
    }

    return reasons;
  }

  /**
   * 5. So sánh chi tiết Hiện tại vs Không bảo trì vs Bảo trì ngay (Current vs Projected)
   */
  async compareCurrentVsProjected(deviceId, days = 30) {
    const simDays = Number(days) || simConfig.DEFAULT_PERIOD;
    if (!simConfig.PERIODS.includes(simDays)) {
      throw new BadRequestError(`Khung thời gian mô phỏng không hợp lệ. Hỗ trợ: ${simConfig.PERIODS.join(', ')} ngày`);
    }

    const device = await deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundError(`Không tìm thấy thiết bị ID: ${deviceId}`);

    // Lấy dữ liệu nền tảng từ Phase 1, Phase 2, Phase 3
    const [health, risk, priority] = await Promise.all([
      assetHealthService.calculateHealthScore(deviceId),
      failureRiskService.calculateFailureRisk(deviceId),
      priorityService.calculatePriorityScore(deviceId),
    ]);

    // Trích xuất các số đo thực tế làm input cho Simulation
    let ageYears = 1.0;
    if (device.purchase_date || device.created_at) {
      const pDate = new Date(device.purchase_date || device.created_at);
      if (!isNaN(pDate.getTime())) {
        ageYears = Math.max(0.1, (Date.now() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      }
    }

    const metrics = {
      overdueDays: health.breakdown?.maintenanceSchedule?.overdueDays || 0,
      failures30d: risk.breakdown?.recentFailureFrequency?.count || 0,
      trendType: risk.breakdown?.failureTrend?.trendType || 'STABLE',
      downtimeHours30d: risk.breakdown?.downtimeImpact?.hours || 0,
      ageYears,
    };

    const current = {
      healthScore: health.healthScore,
      healthStatus: health.status,
      failureRisk: risk.riskScore,
      riskStatus: risk.status,
      priorityScore: priority.priorityScore,
      priorityStatus: priority.priorityStatus,
    };

    // 1. Mô phỏng Kịch bản A: NO_MAINTENANCE
    const noMaintHealth = this.simulateHealthScore(current.healthScore, metrics, simDays, simConfig.SCENARIOS.NO_MAINTENANCE);
    const noMaintRisk = this.simulateFailureRisk(current.failureRisk, metrics, simDays, simConfig.SCENARIOS.NO_MAINTENANCE);
    const noMaintPriority = this.simulatePriorityScore(noMaintRisk.score, device, metrics, simDays, simConfig.SCENARIOS.NO_MAINTENANCE);

    const projNoMaint = {
      healthScore: noMaintHealth.score,
      healthStatus: noMaintHealth.status,
      failureRisk: noMaintRisk.score,
      riskStatus: noMaintRisk.status,
      priorityScore: noMaintPriority.score,
      priorityStatus: noMaintPriority.status,
    };

    const deltaNoMaint = {
      health: noMaintHealth.score - current.healthScore,
      risk: noMaintRisk.score - current.failureRisk,
      priority: noMaintPriority.score - current.priorityScore,
    };

    const statusChangeNoMaint = {
      health: `${current.healthStatus} ➔ ${noMaintHealth.status}`,
      risk: `${current.riskStatus} ➔ ${noMaintRisk.status}`,
      priority: `${current.priorityStatus} ➔ ${noMaintPriority.status}`,
    };

    const explanationNoMaint = this.generateSimulationExplanation(
      current, projNoMaint, deltaNoMaint, simDays, simConfig.SCENARIOS.NO_MAINTENANCE, metrics
    );

    // 2. Mô phỏng Kịch bản B: MAINTAIN_NOW
    const maintainHealth = this.simulateHealthScore(current.healthScore, metrics, simDays, simConfig.SCENARIOS.MAINTAIN_NOW);
    const maintainRisk = this.simulateFailureRisk(current.failureRisk, metrics, simDays, simConfig.SCENARIOS.MAINTAIN_NOW);
    const maintainPriority = this.simulatePriorityScore(maintainRisk.score, device, metrics, simDays, simConfig.SCENARIOS.MAINTAIN_NOW);

    const projMaintain = {
      healthScore: maintainHealth.score,
      healthStatus: maintainHealth.status,
      failureRisk: maintainRisk.score,
      riskStatus: maintainRisk.status,
      priorityScore: maintainPriority.score,
      priorityStatus: maintainPriority.status,
    };

    const deltaMaintain = {
      health: maintainHealth.score - current.healthScore,
      risk: maintainRisk.score - current.failureRisk,
      priority: maintainPriority.score - current.priorityScore,
    };

    const statusChangeMaintain = {
      health: `${current.healthStatus} ➔ ${maintainHealth.status}`,
      risk: `${current.riskStatus} ➔ ${maintainRisk.status}`,
      priority: `${current.priorityStatus} ➔ ${maintainPriority.status}`,
    };

    const explanationMaintain = this.generateSimulationExplanation(
      current, projMaintain, deltaMaintain, simDays, simConfig.SCENARIOS.MAINTAIN_NOW, metrics
    );

    return {
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.code,
      simulationPeriodDays: simDays,
      engineVersion: simConfig.VERSION,
      isDeterministic: true,
      current,
      scenarios: {
        NO_MAINTENANCE: {
          scenarioName: 'Không bảo trì (Trì hoãn)',
          projected: projNoMaint,
          delta: deltaNoMaint,
          statusChange: statusChangeNoMaint,
          explanations: explanationNoMaint,
        },
        MAINTAIN_NOW: {
          scenarioName: 'Bảo trì ngay lập tức',
          projected: projMaintain,
          delta: deltaMaintain,
          statusChange: statusChangeMaintain,
          explanations: explanationMaintain,
        },
      },
      // Shorthand root fields for simple clients
      projected: projNoMaint,
      delta: deltaNoMaint,
      statusChange: statusChangeNoMaint,
      explanations: explanationNoMaint,
    };
  }

  /**
   * 6. Top 10 thiết bị có nguy cơ xấu đi nhanh nhất (Top Degrading Assets)
   */
  async getPredictiveTopDegradingDevices(limit = 10, days = 30) {
    const devices = await deviceRepository.findAll({ limit: 100 });
    const list = devices.devices || devices || [];

    const simulatedList = [];

    for (const dev of list) {
      try {
        const sim = await this.compareCurrentVsProjected(dev.id, days);
        const prioDelta = sim.delta?.priority || 0;
        const riskDelta = sim.delta?.risk || 0;

        simulatedList.push({
          deviceId: dev.id,
          deviceName: dev.name,
          deviceCode: dev.code,
          roomName: dev.room_name || 'Phòng ban',
          buildingName: dev.building_name || 'Tòa nhà',
          currentHealth: sim.current.healthScore,
          projectedHealth: sim.projected.healthScore,
          currentRisk: sim.current.failureRisk,
          projectedRisk: sim.projected.failureRisk,
          currentPriority: sim.current.priorityScore,
          projectedPriority: sim.projected.priorityScore,
          priorityDelta: prioDelta,
          riskDelta: riskDelta,
          statusChange: sim.statusChange.priority,
          recommendation: prioDelta >= 15 ? 'Bảo trì khẩn cấp trong 24h' : (prioDelta >= 8 ? 'Lập lịch trong tuần' : 'Theo dõi định kỳ'),
        });
      } catch (err) {
        // Skip invalid devices
      }
    }

    // Sắp xếp theo mức độ gia tăng điểm ưu tiên giảm dần (projectedPriority - currentPriority DESC)
    simulatedList.sort((a, b) => b.priorityDelta - a.priorityDelta);

    return simulatedList.slice(0, limit);
  }

  /**
   * 7. Tổng hợp cảnh báo dự báo toàn trường (Predictive Maintenance Alerts)
   */
  async getPredictiveAlertsSummary(days = 30) {
    const topDegrading = await this.getPredictiveTopDegradingDevices(100, days);

    let criticalTransitionCount = 0;
    let highRiskSurgeCount = 0;
    let healthDropCount = 0;

    for (const item of topDegrading) {
      if (item.currentPriority < 80 && item.projectedPriority >= 80) {
        criticalTransitionCount++;
      }
      if (item.riskDelta >= 20) {
        highRiskSurgeCount++;
      }
      if (item.currentHealth - item.projectedHealth >= 10) {
        healthDropCount++;
      }
    }

    return {
      simulationDays: days,
      criticalTransitionCount, // Thiết bị có nguy cơ chuyển sang CRITICAL
      highRiskSurgeCount,      // Thiết bị có Risk tăng > 20 điểm
      healthDropCount,         // Thiết bị có Health giảm > 10 điểm
      totalEvaluated: topDegrading.length,
    };
  }
}

module.exports = new PredictiveSimulationService();
