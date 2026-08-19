import api from './api';

export const maintenanceService = {
  /**
   * Tạo phiếu báo sự cố mới
   */
  async createRequest(data) {
    return api.post('/maintenance', data);
  },

  /**
   * Lấy danh sách phiếu sự cố do người dùng hiện tại báo
   */
  async getMyRequests(params = {}) {
    return api.get('/maintenance/my', { params });
  },

  /**
   * Lấy chi tiết một phiếu yêu cầu bảo trì
   */
  async getRequestById(id) {
    return api.get(`/maintenance/${id}`);
  },

  /**
   * Lấy danh sách toàn bộ phiếu bảo trì (Admin, Manager, Technician)
   */
  async getRequests(params = {}) {
    return api.get('/maintenance', { params });
  },

  /**
   * Phân công Kỹ thuật viên (Manager, Admin)
   */
  async assignTechnician(id, data) {
    return api.post(`/maintenance/${id}/assign`, data);
  },

  /**
   * KTV bắt đầu xử lý phiếu
   */
  async startWork(id, data = {}) {
    return api.post(`/maintenance/${id}/start`, data);
  },

  /**
   * KTV đánh dấu chờ linh kiện
   */
  async markWaitingPart(id, data) {
    return api.post(`/maintenance/${id}/waiting-part`, data);
  },

  /**
   * KTV tiếp tục xử lý
   */
  async resumeWork(id, data = {}) {
    return api.post(`/maintenance/${id}/resume`, data);
  },

  /**
   * KTV hoàn thành sửa chữa (Root cause, Resolution, Parts, Actual Cost)
   */
  async completeRequest(id, data) {
    return api.post(`/maintenance/${id}/complete`, data);
  },

  /**
   * Đóng phiếu và nghiệm thu
   */
  async closeRequest(id, data = {}) {
    return api.post(`/maintenance/${id}/close`, data);
  },

  /**
   * MODULE 8: Người dùng nghiệm thu "ĐÃ KHẮC PHỤC" & Đóng phiếu
   */
  async acceptAndClose(id, data = {}) {
    return api.post(`/maintenance/${id}/accept`, data);
  },

  /**
   * MODULE 8: Người dùng nghiệm thu "CHƯA KHẮC PHỤC" & Yêu cầu xử lý lại
   */
  async rejectAndReopen(id, data) {
    return api.post(`/maintenance/${id}/reopen`, data);
  },

  /**
   * Thống kê KPI Dashboard Kỹ thuật viên
   */
  async getTechnicianStats() {
    return api.get('/maintenance/technician/stats');
  },

  /**
   * Danh sách Kỹ thuật viên khả dụng
   */
  async getActiveTechnicians() {
    return api.get('/maintenance/meta/technicians');
  },
};
