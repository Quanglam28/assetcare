import api from './api';

export const notificationService = {
  /**
   * Lấy danh sách thông báo của người dùng
   */
  async getMyNotifications(params = {}) {
    return api.get('/notifications', { params });
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount() {
    return api.get('/notifications/unread-count');
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id) {
    return api.patch(`/notifications/${id}/read`);
  },

  /**
   * Đánh dấu toàn bộ thông báo là đã đọc
   */
  async markAllAsRead() {
    return api.patch('/notifications/read-all');
  },

  /**
   * Xóa một thông báo
   */
  async deleteNotification(id) {
    return api.delete(`/notifications/${id}`);
  },

  /**
   * Quét cảnh báo hệ thống (Quá hạn, Đến hạn bảo dưỡng, Sắp hết bảo hành)
   */
  async scanSystemAlerts() {
    return api.post('/notifications/scan-system-alerts');
  },
};
