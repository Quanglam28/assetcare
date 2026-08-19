const predictiveSimulationService = require('../services/predictiveSimulationService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Quản lý Mô phỏng Dự báo Bảo trì (Predictive Simulation Controller)
 * Phase 4 — Rule-Based Decision Support System
 */
class SimulationController {
  /**
   * GET /api/devices/:id/simulation?days=30
   */
  async getSimulation(req, res, next) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      const days = parseInt(req.query.days, 10) || 30;

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
      const deviceId = parseInt(req.params.id, 10);
      const { days = 30, scenario = 'NO_MAINTENANCE' } = req.body;

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
      const days = parseInt(req.query.days, 10) || 30;
      const limit = parseInt(req.query.limit, 10) || 10;

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
      const days = parseInt(req.query.days, 10) || 30;

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
