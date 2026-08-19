import api from './api';

/**
 * Service giao tiếp API Động cơ Sức Khỏe & Dự Đoán Rủi Ro Thiết Bị
 */
export const healthService = {
  /**
   * Lấy chi tiết điểm sức khỏe thiết bị
   */
  async getDeviceHealth(deviceId) {
    const res = await api.get(`/devices/${deviceId}/health`);
    return res.data;
  },

  /**
   * Lấy chi tiết đánh giá rủi ro sự cố & xu hướng
   */
  async getDeviceRisk(deviceId) {
    const res = await api.get(`/devices/${deviceId}/risk`);
    return res.data;
  },

  /**
   * Lấy khuyến nghị kỹ thuật & chỉ số thay thế
   */
  async getDeviceRecommendations(deviceId) {
    const res = await api.get(`/devices/${deviceId}/recommendations`);
    return res.data;
  },

  /**
   * Lấy lịch sử biến động theo thời gian
   */
  async getDeviceHealthHistory(deviceId, days = 90) {
    const res = await api.get(`/devices/${deviceId}/health-history`, { params: { days } });
    return res.data;
  },

  /**
   * Lấy danh sách Top thiết bị nguy cơ cao nhất
   */
  async getTopAtRiskAssets(limit = 10) {
    const res = await api.get('/analytics/assets/at-risk', { params: { limit } });
    return res.data;
  },

  /**
   * Lấy phân bổ điểm sức khỏe toàn hệ thống
   */
  async getHealthDistribution() {
    const res = await api.get('/analytics/assets/health-distribution');
    return res.data;
  },

  /**
   * Lấy tổng hợp rủi ro bảo trì
   */
  async getMaintenanceRiskSummary() {
    const res = await api.get('/analytics/maintenance-risk');
    return res.data;
  },

  /**
   * Kích hoạt tính toán lại toàn bộ thiết bị (Admin/Manager)
   */
  async recalculateAllAssets() {
    const res = await api.post('/admin/asset-health/recalculate');
    return res.data;
  },
};
