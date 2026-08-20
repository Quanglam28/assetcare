const predictiveSimulationService = require('../services/predictiveSimulationService');
const ApiResponse = require('../utils/apiResponse');
const { BadRequestError } = require('../utils/appError');

/**
 * Controller Quản lý Mô phỏng Dự báo Bảo trì (Predictive Simulation Controller)
 * Phase 4 — Rule-Based Decision Support System
 */
class SimulationController {
  /**
   * Helper làm sạch và kiểm tra số ngày mô phỏng hợp lệ (1-365 ngày)
   */
  _validateDays(rawDays) {
    if (rawDays === undefined || rawDays === null || rawDays === '') {
      return 30;
    }
    const days = parseInt(rawDays, 10);
    if (isNaN(days) || !isFinite(days) || days < 1 || days > 365) {
      throw new BadRequestError('Số ngày mô phỏng (days) phải là số nguyên hợp lệ trong khoảng từ 1 đến 365 ngày');
    }
    return days;
  }

  /**
   * Helper làm sạch deviceId
   */
  _validateDeviceId(rawId) {
    const id = parseInt(rawId, 10);
    if (isNaN(id) || !isFinite(id) || id <= 0) {
      throw new BadRequestError('Mã ID thiết bị không hợp lệ');
    }
    return id;
  }

  /**
   * GET /api/devices/:id/simulation?days=30
   */
  async getSimulation(req, res, next) {
    try {
      const deviceId = this._validateDeviceId(req.params.id);
      const days = this._validateDays(req.query.days);

      const result = await predictiveSimulationService.compareCurrentVsProjected(deviceId, days);
      return ApiResponse.success(res, {
        message: 'Mô phỏng dự báo bảo trì thành công',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/devices/:id/simulation
   * Body: { days: 30, scenario: "NO_MAINTENANCE" | "MAINTAIN_NOW" }
   */
  async runSimulation(req, res, next) {
    try {
      const deviceId = this._validateDeviceId(req.params.id);
      const days = this._validateDays(req.body.days);
      const scenario = req.body.scenario === 'MAINTAIN_NOW' ? 'MAINTAIN_NOW' : 'NO_MAINTENANCE';

      const result = await predictiveSimulationService.compareCurrentVsProjected(deviceId, days);
      const scenarioData = result.scenarios[scenario] || result.scenarios.NO_MAINTENANCE;

      const responsePayload = {
        deviceId: result.deviceId,
        deviceName: result.deviceName,
        deviceCode: result.deviceCode,
        simulationPeriodDays: result.simulationPeriodDays,
        selectedScenario: scenario,
        current: result.current,
        projected: scenarioData.projected,
        delta: scenarioData.delta,
        statusChange: scenarioData.statusChange,
        explanations: scenarioData.explanations,
        allScenarios: result.scenarios,
      };

      return ApiResponse.success(res, {
        message: `Mô phỏng kịch bản [${scenario}] thành công`,
        data: responsePayload,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analytics/predictive/top-degrading?days=30&limit=10
   */
  async getTopDegrading(req, res, next) {
    try {
      const days = this._validateDays(req.query.days);
      const rawLimit = parseInt(req.query.limit, 10);
      const limit = (!isNaN(rawLimit) && isFinite(rawLimit) && rawLimit >= 1 && rawLimit <= 100) ? rawLimit : 10;

      const result = await predictiveSimulationService.getPredictiveTopDegradingDevices(limit, days);
      return ApiResponse.success(res, {
        message: 'Lấy danh sách thiết bị có nguy cơ suy giảm nhanh nhất thành công',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analytics/predictive/alerts?days=30
   */
  async getPredictiveAlerts(req, res, next) {
    try {
      const days = this._validateDays(req.query.days);

      const result = await predictiveSimulationService.getPredictiveAlertsSummary(days);
      return ApiResponse.success(res, {
        message: 'Lấy tổng hợp cảnh báo dự báo thành công',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SimulationController();
