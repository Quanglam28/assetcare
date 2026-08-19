const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller xử lý các request xác thực & quản lý tài khoản
 */
class AuthController {
  /**
   * Đăng nhập hệ thống
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login({ username, password });
      return ApiResponse.success(res, {
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đăng ký tài khoản người dùng mới
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { fullName, email, username, password } = req.body;
      const result = await authService.register({ fullName, email, username, password });
      return ApiResponse.created(res, {
        message: 'Đăng ký tài khoản thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin tài khoản hiện tại
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const userProfile = await authService.getCurrentUser(userId);
      return ApiResponse.success(res, {
        message: 'Lấy thông tin tài khoản thành công',
        data: userProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đổi mật khẩu
   * PUT /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(userId, { oldPassword, newPassword });
      return ApiResponse.success(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đăng xuất
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const result = await authService.logout(userId);
      return ApiResponse.success(res, {
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
