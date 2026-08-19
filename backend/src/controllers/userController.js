const userService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Quản lý Người dùng
 */
class UserController {
  /**
   * Lấy danh sách người dùng kèm phân trang
   * GET /api/users
   */
  async getUsers(req, res, next) {
    try {
      const result = await userService.getUsers(req.query);
      return ApiResponse.paginate(
        res,
        result.users,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'Lấy danh sách người dùng thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết người dùng
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return ApiResponse.success(res, {
        message: 'Lấy thông tin chi tiết người dùng thành công',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo người dùng mới
   * POST /api/users
   */
  async createUser(req, res, next) {
    try {
      const newUser = await userService.createUser(req.body);
      return ApiResponse.created(res, {
        message: 'Tạo tài khoản người dùng thành công',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin người dùng
   * PUT /api/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;
      const updatedUser = await userService.updateUser(id, currentUserId, req.body);
      return ApiResponse.success(res, {
        message: 'Cập nhật thông tin người dùng thành công',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật trạng thái người dùng (Khóa / Mở khóa)
   * PATCH /api/users/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;
      const { status } = req.body;
      const result = await userService.updateUserStatus(id, currentUserId, status);
      return ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset mật khẩu người dùng
   * PATCH /api/users/:id/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const result = await userService.resetPassword(id, newPassword);
      return ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh mục Roles và Departments cho Form Select
   * GET /api/users/meta/master-data
   */
  async getMasterData(req, res, next) {
    try {
      const data = await userService.getMasterData();
      return ApiResponse.success(res, {
        message: 'Lấy dữ liệu danh mục thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
