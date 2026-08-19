import api from './api';

export const dashboardService = {
  /**
   * Lấy 8 thẻ KPI thống kê tổng quan
   */
  async getOverviewStats(params = {}) {
    return api.get('/dashboard/stats', { params });
  },

  /**
   * Lấy dữ liệu cho 8 biểu đồ phân tích
   */
  async getAllCharts(params = {}) {
    return api.get('/dashboard/charts', { params });
  },

  /**
   * Lấy số liệu phân tích cam kết tuân thủ SLA
   */
  async getSlaStats(params = {}) {
    return api.get('/dashboard/sla', { params });
  },

  /**
   * Lấy danh mục phục vụ bộ lọc đa chiều
   */
  async getFilterOptions() {
    return api.get('/dashboard/meta/filters');
  },

  /**
   * Lấy phân bổ sức khỏe thiết bị
   */
  async getHealthDistribution() {
    return api.get('/analytics/assets/health-distribution');
  },

  /**
   * Lấy danh sách Top 10 thiết bị có nguy cơ cao nhất
   */
  async getTopAtRiskAssets(limit = 10) {
    return api.get('/analytics/assets/at-risk', { params: { limit } });
  },

  /**
   * Lấy tổng hợp rủi ro bảo trì
   */
  async getMaintenanceRiskSummary() {
    return api.get('/analytics/maintenance-risk');
  },

  /**
   * Tính toán lại toàn bộ dữ liệu sức khỏe thiết bị
   */
  async recalculateAllAssets() {
    return api.post('/admin/asset-health/recalculate');
  },

  /**
   * Lấy tổng hợp cảnh báo dự báo bảo trì Phase 4
   */
  async getPredictiveAlerts(days = 30) {
    return api.get('/analytics/predictive/alerts', { params: { days } });
  },

  /**
   * Lấy Top 10 thiết bị có nguy cơ suy giảm nhanh nhất Phase 4
   */
  async getTopDegrading(days = 30, limit = 10) {
    return api.get('/analytics/predictive/top-degrading', { params: { days, limit } });
  },
};

