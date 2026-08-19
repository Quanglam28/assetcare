const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Quản lý Hệ thống Thông Báo Nội Bộ
 */
class NotificationController {
  /**
   * Lấy danh sách thông báo của người dùng
   * GET /api/notifications
   */
  async getMyNotifications(req, res, next) {
    try {
      const data = await notificationService.getMyNotifications(req.user.id, req.query);
      return ApiResponse.paginate(
        res,
        data.notifications,
        {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
          unreadCount: data.unreadCount,
        },
        'Lấy danh sách thông báo thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy nhanh số lượng thông báo chưa đọc
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const unreadCount = await notificationService.getUnreadCount(req.user.id);
      return ApiResponse.success(res, {
        message: 'Lấy số lượng thông báo chưa đọc thành công',
        data: { unreadCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id, req.user.id);
      return ApiResponse.success(res, {
        message: 'Đã đánh dấu thông báo là đã đọc',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * PATCH /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, {
        message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa một thông báo
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(id, req.user.id);
      return ApiResponse.success(res, {
        message: 'Đã xóa thông báo thành công',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Quét và tạo cảnh báo hệ thống (Quá hạn, Đến hạn bảo dưỡng, Sắp hết bảo hành)
   * POST /api/notifications/scan-system-alerts
   */
  async scanSystemAlerts(req, res, next) {
    try {
      const result = await notificationService.scanSystemAlerts();
      return ApiResponse.success(res, {
        message: 'Quét và đồng bộ cảnh báo hệ thống thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
