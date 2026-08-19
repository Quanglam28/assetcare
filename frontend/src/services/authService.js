import api from './api';

export const authService = {
  /**
   * Đăng nhập (hỗ trợ username hoặc email)
   */
  async login(username, password) {
    return api.post('/auth/login', { username, password });
  },

  /**
   * Đăng ký tài khoản người dùng mới
   */
  async register({ fullName, email, username, password, confirmPassword }) {
    return api.post('/auth/register', {
      fullName,
      email,
      username,
      password,
      confirmPassword,
    });
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ Token
   */
  async getMe() {
    return api.get('/auth/me');
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    return api.put('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    });
  },

  /**
   * Đăng xuất
   */
  async logout() {
    try {
      return await api.post('/auth/logout');
    } catch {
      // Vẫn tiếp tục logout client ngay cả khi network lỗi
      return { success: true };
    }
  },

  /**
   * Kiểm tra API test phân quyền
   */
  async testAdminOnly() {
    return api.get('/test/admin-only');
  },

  async testManagerOrAdmin() {
    return api.get('/test/manager-or-admin');
  },

  async testTechnicianOnly() {
    return api.get('/test/technician-only');
  },
};
