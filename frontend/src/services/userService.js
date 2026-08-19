import api from './api';

export const userService = {
  /**
   * Lấy danh sách người dùng kèm phân trang, tìm kiếm, lọc
   */
  async getUsers(params = {}) {
    return api.get('/users', { params });
  },

  /**
   * Lấy chi tiết một người dùng
   */
  async getUserById(id) {
    return api.get(`/users/${id}`);
  },

  /**
   * Tạo người dùng mới
   */
  async createUser(data) {
    return api.post('/users', data);
  },

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(id, data) {
    return api.put(`/users/${id}`, data);
  },

  /**
   * Khóa / Mở khóa trạng thái người dùng
   */
  async updateStatus(id, status) {
    return api.patch(`/users/${id}/status`, { status });
  },

  /**
   * Đặt lại mật khẩu người dùng
   */
  async resetPassword(id, newPassword) {
    return api.patch(`/users/${id}/reset-password`, { newPassword });
  },

  /**
   * Lấy danh mục Roles và Departments
   */
  async getMasterData() {
    return api.get('/users/meta/master-data');
  },
};
