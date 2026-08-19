const scheduleService = require('../services/scheduleService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Quản lý Lịch bảo dưỡng định kỳ
 */
class ScheduleController {
  /**
   * Lấy danh sách lịch bảo dưỡng
   * GET /api/schedules
   */
  async getSchedules(req, res, next) {
    try {
      const result = await scheduleService.getSchedules(req.query);
      return ApiResponse.paginate(
        res,
        result.schedules,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'Lấy danh sách lịch bảo dưỡng thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thống kê cảnh báo Dashboard (Upcoming, Due, Overdue, Completed)
   * GET /api/schedules/stats
   */
  async getAlertStats(req, res, next) {
    try {
      const data = await scheduleService.getAlertStats();
      return ApiResponse.success(res, {
        message: 'Lấy thống kê cảnh báo lịch bảo dưỡng thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết lịch bảo dưỡng
   * GET /api/schedules/:id
   */
  async getScheduleById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await scheduleService.getScheduleById(id);
      return ApiResponse.success(res, {
        message: 'Lấy chi tiết lịch bảo dưỡng thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo lịch bảo trì định kỳ mới
   * POST /api/schedules
   */
  async createSchedule(req, res, next) {
    try {
      const data = await scheduleService.createSchedule(req.body, req.user);
      return ApiResponse.created(res, {
        message: 'Tạo kế hoạch bảo trì định kỳ thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật lịch bảo dưỡng
   * PUT /api/schedules/:id
   */
  async updateSchedule(req, res, next) {
    try {
      const { id } = req.params;
      const data = await scheduleService.updateSchedule(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Cập nhật kế hoạch bảo dưỡng thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thực hiện bảo dưỡng định kỳ
   * POST /api/schedules/:id/execute
   */
  async executeSchedule(req, res, next) {
    try {
      const { id } = req.params;
      const data = await scheduleService.executeSchedule(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Ghi nhận thực hiện bảo dưỡng định kỳ thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa lịch bảo dưỡng
   * DELETE /api/schedules/:id
   */
  async deleteSchedule(req, res, next) {
    try {
      const { id } = req.params;
      await scheduleService.deleteSchedule(id);
      return ApiResponse.success(res, {
        message: 'Xóa kế hoạch bảo dưỡng thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();
