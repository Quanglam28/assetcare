const reportService = require('../services/reportService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Xuất Báo Cáo & Xem Trước
 */
class ReportController {
  /**
   * Xem trước dữ liệu báo cáo
   * GET /api/reports/:type/preview
   */
  async previewReport(req, res, next) {
    try {
      const { type } = req.params;
      const data = await reportService.getReportData(type, req.query, req.user);
      return ApiResponse.success(res, {
        message: 'Lấy dữ liệu báo cáo thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tải file báo cáo định dạng Excel (.xlsx) hoặc CSV
   * GET /api/reports/:type/export
   */
  async exportReport(req, res, next) {
    try {
      const { type } = req.params;
      const format = (req.query.format || 'xlsx').toLowerCase();

      if (format === 'csv') {
        return await reportService.exportCsv(type, req.query, req.user, res);
      } else {
        return await reportService.exportExcel(type, req.query, req.user, res);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
