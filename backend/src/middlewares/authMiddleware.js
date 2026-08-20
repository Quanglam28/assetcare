const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { COOKIE_NAME } = require('../config/cookieConfig');
const { UnauthorizedError, ForbiddenError } = require('../utils/appError');
const userRepository = require('../repositories/userRepository');

/**
 * Middleware xác thực danh tính qua HttpOnly Cookie hoặc JWT Bearer Token (Authentication)
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Ưu tiên đọc Token từ HttpOnly Secure Cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }
    // 2. Fallback đọc từ Header Authorization: Bearer <token> (Dành cho Mobile Native, Postman & Automated Test Suites)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Vui lòng đăng nhập để tiếp tục (Không tìm thấy phiên xác thực hợp lệ)');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret, {
        algorithms: ['HS256'],
      });
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new UnauthorizedError('Token xác thực không hợp lệ hoặc đã bị giả mạo.');
    }

    // Lấy thông tin user mới nhất từ CSDL MySQL
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('Tài khoản người dùng không tồn tại hoặc đã bị xóa khỏi hệ thống.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Tài khoản của bạn đang bị khóa hoặc ngừng hoạt động.');
    }

    // Đính kèm thông tin user vào request object
    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role_code,
      roleName: user.role_name,
      departmentId: user.department_id,
      departmentCode: user.department_code,
      departmentName: user.department_name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware phân quyền dựa trên vai trò Role (Authorization - RBAC)
 * @param  {...string} allowedRoles Danh sách các Role được phép truy cập (VD: authorize("ADMIN"), authorize("ADMIN", "MANAGER"))
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Chưa xác thực danh tính người dùng. Vui lòng đăng nhập.'));
    }

    // Nếu người dùng không nằm trong danh sách Role được phép
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Bạn không có quyền thực hiện hành động này. Yêu cầu một trong các quyền: [${allowedRoles.join(', ')}]. Vai trò hiện tại của bạn: [${req.user.role}].`
        )
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
