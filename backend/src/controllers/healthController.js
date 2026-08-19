const assetHealthService = require('../services/assetHealthService');
const failureRiskService = require('../services/failureRiskService');
const assetRiskService = require('../services/assetRiskService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * HealthController
 * Điều phối các endpoint liên quan đến Sức Khỏe & Nguy Cơ Sự Cố Thiết Bị (Phase 1 & Phase 2)
 */
class HealthController {
  /**
   * GET /api/v1/health hoặc GET /api/health
   */
  check(req, res) {
    return ApiResponse.success(res, {
      message: 'Hệ thống Quản lý Tài sản & Động cơ Sức khỏe hoạt động bình thường',
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }

  /**
   * GET /api/assets/:id/health hoặc GET /api/devices/:id/health
   */
  async getDeviceHealth(req, res, next) {
    try {
      const assetId = parseInt(req.params.id, 10);
      const data = await assetHealthService.calculateHealthScore(assetId);
      return ApiResponse.success(res, {
        message: 'Lấy dữ liệu sức khỏe thiết bị thành công',
        data: {
          assetId: data.assetId,
          healthScore: data.healthScore,
          status: data.status,
          dataCompleteness: data.dataCompleteness,
          breakdown: data.breakdown,
          detailedBreakdown: data.detailedBreakdown,
          calculatedAt: data.calculatedAt,
          calculationVersion: data.calculationVersion,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assets/:id/breakdown hoặc GET /api/devices/:id/breakdown
   */
  async getDeviceHealthBreakdown(req, res, next) {
    try {
      const assetId = parseInt(req.params.id, 10);
      const data = await assetHealthService.getHealthBreakdown(assetId);
      return ApiResponse.success(res, {
        message: 'Lấy chi tiết giải thích điểm sức khỏe thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/devices/:id/risk hoặc GET /api/assets/:id/risk
   * Lấy chi tiết điểm nguy cơ sự cố (Phase 2 Failure Risk Score)
   */
  async getDeviceRisk(req, res, next) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      const data = await failureRiskService.calculateFailureRisk(deviceId);
      return ApiResponse.success(res, {
        message: 'Đánh giá nguy cơ sự cố thiết bị thành công',
        data: {
          deviceId: data.deviceId,
          riskScore: data.riskScore,
          status: data.status,
          dataCompleteness: data.dataCompleteness,
          breakdown: data.breakdown,
          detailedBreakdown: data.detailedBreakdown,
          trends: data.trends,
          explainableReasons: data.explainableReasons,
          calculationVersion: data.calculationVersion,
          calculatedAt: data.calculatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/devices/:id/risk/breakdown hoặc GET /api/assets/:id/risk/breakdown
   */
  async getDeviceRiskBreakdown(req, res, next) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      const data = await failureRiskService.getFailureRiskBreakdown(deviceId);
      return ApiResponse.success(res, {
        message: 'Lấy chi tiết giải thích nguy cơ sự cố thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/devices/:id/recommendations
   */
  async getDeviceRecommendations(req, res, next) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      const riskData = await assetRiskService.assessDeviceRisk(deviceId);
      return ApiResponse.success(res, {
        message: 'Lấy khuyến nghị bảo trì thiết bị thành công',
        data: {
          deviceId,
          deviceCode: riskData.deviceCode,
          deviceName: riskData.deviceName,
          recommendation: riskData.recommendation,
          replacementIndicator: riskData.replacementIndicator,
          explainableReasons: riskData.explainableReasons,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/devices/:id/health-history
   */
  async getDeviceHealthHistory(req, res, next) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      const days = parseInt(req.query.days, 10) || 90;
      const history = await assetRiskService.getHealthHistory(deviceId, days);
      return ApiResponse.success(res, {
        message: 'Lấy lịch sử sức khỏe thiết bị thành công',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/assets/at-risk
   */
  async getTopAtRiskAssets(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const assets = await assetRiskService.getTopAtRiskAssets(limit);
      return ApiResponse.success(res, {
        message: 'Lấy danh sách thiết bị có nguy cơ sự cố cao thành công',
        data: assets,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/assets/health-distribution
   */
  async getHealthDistribution(req, res, next) {
    try {
      const distribution = await assetRiskService.getHealthDistribution();
      return ApiResponse.success(res, {
        message: 'Lấy phân bổ sức khỏe thiết bị toàn hệ thống thành công',
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/maintenance-risk
   */
  async getMaintenanceRiskSummary(req, res, next) {
    try {
      const summary = await assetRiskService.getMaintenanceRiskSummary();
      return ApiResponse.success(res, {
        message: 'Lấy tổng hợp rủi ro bảo trì thành công',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/asset-health/recalculate
   */
  async recalculateAllAssets(req, res, next) {
    try {
      const [hResult, rResult] = await Promise.all([
        assetHealthService.recalculateAllAssets(),
        failureRiskService.recalculateAllRiskScores(),
      ]);
      logger.info(`[Audit Log] Quản trị viên [${req.user.username}] đã kích hoạt tính toán lại toàn bộ Asset Health & Failure Risk.`);
      return ApiResponse.success(res, {
        message: 'Tính toán lại toàn bộ dữ liệu sức khỏe và nguy cơ sự cố thành công',
        data: { health: hResult, risk: rResult },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
