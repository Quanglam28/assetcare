import api from './api';

/**
 * Service giao tiếp API Động cơ Sức Khỏe & Dự Đoán Rủi Ro Thiết Bị
 */
export const healthService = {
  /**
   * Lấy chi tiết điểm sức khỏe thiết bị
   */
  async getDeviceHealth(deviceId) {
    return api.get(`/devices/${deviceId}/health`);
  },

  /**
   * Lấy chi tiết đánh giá rủi ro sự cố & xu hướng
   */
  async getDeviceRisk(deviceId) {
    return api.get(`/devices/${deviceId}/risk`);
  },

  /**
   * Lấy khuyến nghị kỹ thuật & chỉ số thay thế
   */
  async getDeviceRecommendations(deviceId) {
    return api.get(`/devices/${deviceId}/recommendations`);
  },

  /**
   * Lấy lịch sử biến động theo thời gian
   */
  async getDeviceHealthHistory(deviceId, days = 90) {
    return api.get(`/devices/${deviceId}/health-history`, { params: { days } });
  },

  /**
   * Lấy danh sách Top thiết bị nguy cơ cao nhất
   */
  async getTopAtRiskAssets(limit = 10) {
    return api.get('/analytics/assets/at-risk', { params: { limit } });
  },

  /**
   * Lấy phân bổ điểm sức khỏe toàn hệ thống
   */
  async getHealthDistribution() {
    return api.get('/analytics/assets/health-distribution');
  },

  /**
   * Lấy tổng hợp rủi ro bảo trì
   */
  async getMaintenanceRiskSummary() {
    return api.get('/analytics/maintenance-risk');
  },

  /**
   * Kích hoạt tính toán lại toàn bộ thiết bị (Admin/Manager)
   */
  async recalculateAllAssets() {
    return api.post('/admin/asset-health/recalculate');
  },
};
