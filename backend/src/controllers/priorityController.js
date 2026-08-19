const priorityService = require('../services/priorityService');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * PriorityController
 * Điều phối các API liên quan đến Điểm Ưu Tiên Xử Lý & Ma Trận Rủi Ro (Phase 3)
 */
class PriorityController {
  /**
   * GET /api/devices/:id/priority hoặc GET /api/assets/:id/priority
   */
  async getDevicePriority(req, res, next) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      const data = await priorityService.calculatePriorityScore(deviceId);
      return ApiResponse.success(res, {
        message: 'Tính toán điểm ưu tiên xử lý thiết bị thành công',
        data: {
          deviceId: data.deviceId,
          priorityScore: data.priorityScore,
          status: data.status,
          priorityStatus: data.priorityStatus,
          statusInfo: data.statusInfo,
          dataCompleteness: data.dataCompleteness,
          breakdown: data.breakdown,
          detailedBreakdown: data.detailedBreakdown,
          calculationVersion: data.calculationVersion,
          calculatedAt: data.calculatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/devices/:id/priority/breakdown hoặc GET /api/assets/:id/priority/breakdown
   */
  async getDevicePriorityBreakdown(req, res, next) {
    try {
      const deviceId = parseInt(req.params.id, 10);
      const data = await priorityService.getPriorityBreakdown(deviceId);
      return ApiResponse.success(res, {
        message: 'Lấy chi tiết giải thích điểm ưu tiên xử lý thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/assets/top-priority
   */
  async getTopPriorityDevices(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 5;
      const list = await priorityService.getTopPriorityDevices(limit);
      return ApiResponse.success(res, {
        message: 'Lấy danh sách thiết bị ưu tiên xử lý hàng đầu thành công',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/risk-matrix
   */
  async getRiskMatrix(req, res, next) {
    try {
      const filters = {
        departmentId: req.query.departmentId,
        locationId: req.query.locationId,
        status: req.query.status,
        riskStatus: req.query.riskStatus,
        priorityStatus: req.query.priorityStatus,
        businessCriticality: req.query.businessCriticality,
      };
      const matrix = await priorityService.getRiskMatrixData(filters);
      return ApiResponse.success(res, {
        message: 'Lấy dữ liệu ma trận rủi ro toàn hệ thống thành công',
        data: matrix,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/priority/recalculate
   */
  async recalculateAll(req, res, next) {
    try {
      const result = await priorityService.recalculateAllPriorityScores();
      return ApiResponse.success(res, {
        message: 'Tính toán lại toàn bộ điểm ưu tiên thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PriorityController();
