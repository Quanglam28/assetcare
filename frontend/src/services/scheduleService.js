import api from './api';

export const scheduleService = {
  /**
   * Lấy danh sách lịch bảo dưỡng
   */
  async getSchedules(params = {}) {
    return api.get('/schedules', { params });
  },

  /**
   * Lấy số liệu thống kê cảnh báo Dashboard (Upcoming, Due, Overdue, Completed)
   */
  async getAlertStats() {
    return api.get('/schedules/stats');
  },

  /**
   * Lấy chi tiết lịch bảo dưỡng
   */
  async getScheduleById(id) {
    return api.get(`/schedules/${id}`);
  },

  /**
   * Tạo kế hoạch bảo trì định kỳ mới
   */
  async createSchedule(data) {
    return api.post('/schedules', data);
  },

  /**
   * Cập nhật kế hoạch bảo dưỡng
   */
  async updateSchedule(id, data) {
    return api.put(`/schedules/${id}`, data);
  },

  /**
   * Thực hiện bảo dưỡng định kỳ
   */
  async executeSchedule(id, data = {}) {
    return api.post(`/schedules/${id}/execute`, data);
  },

  /**
   * Xóa kế hoạch bảo dưỡng
   */
  async deleteSchedule(id) {
    return api.delete(`/schedules/${id}`);
  },
};
