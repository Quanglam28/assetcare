const dashboardService = require('../services/dashboardService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Quản lý Dashboard Tổng Hợp Ban Giám Hiệu & Quản Trị
 */
class DashboardController {
  /**
   * Lấy 8 thẻ KPI thống kê tổng quan
   * GET /api/dashboard/stats
   */
  async getOverviewStats(req, res, next) {
    try {
      const data = await dashboardService.getOverviewStats(req.query);
      return ApiResponse.success(res, {
        message: 'Lấy số liệu thống kê tổng quan thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy dữ liệu cho 8 biểu đồ phân tích
   * GET /api/dashboard/charts
   */
  async getAllCharts(req, res, next) {
    try {
      const data = await dashboardService.getAllChartsData(req.query);
      return ApiResponse.success(res, {
        message: 'Lấy dữ liệu biểu đồ phân tích thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy số liệu phân tích tuân thủ SLA
   * GET /api/dashboard/sla
   */
  async getSlaStats(req, res, next) {
    try {
      const data = await dashboardService.getSlaComplianceStats(req.query);
      return ApiResponse.success(res, {
        message: 'Lấy số liệu tuân thủ SLA thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh mục phục vụ bộ lọc đa chiều
   * GET /api/dashboard/meta/filters
   */
  async getFilterOptions(req, res, next) {
    try {
      const data = await dashboardService.getFilterOptions();
      return ApiResponse.success(res, {
        message: 'Lấy danh mục bộ lọc thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
