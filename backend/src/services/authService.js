const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/userRepository');
const PasswordUtil = require('../utils/password');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Service xử lý nghiệp vụ Xác thực & Quản lý Tài khoản (Authentication)
 */
class AuthService {
  /**
   * Đăng nhập người dùng bằng username hoặc email
   */
  async login({ username, password }) {
    const identifier = (username || '').trim();
    if (!identifier || !password) {
      throw new BadRequestError('Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu');
    }

    // 1. Tìm user trong CSDL MySQL
    const user = await userRepository.findByUsernameOrEmail(identifier);
    if (!user) {
      throw new UnauthorizedError('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    // 2. Kiểm tra trạng thái hoạt động của tài khoản
    if (user.status !== 'ACTIVE') {
      if (user.status === 'SUSPENDED') {
        throw new UnauthorizedError('Tài khoản của bạn đang bị đình chỉ hoạt động. Vui lòng liên hệ quản trị viên.');
      }
      throw new UnauthorizedError('Tài khoản của bạn đã bị khóa hoặc ngừng kích hoạt');
    }

    // 3. So khớp mật khẩu đã băm bcrypt
    const isPasswordValid = await PasswordUtil.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Tên đăng nhập hoặc mật khẩu không chính xác');
    }

    // 4. Tạo JWT Access Token
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role_code,
      fullName: user.full_name,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm || 'HS256',
    });

    // 5. Chuẩn bị thông tin người dùng trả về (loại bỏ password_hash)
    const userInfo = {
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
      avatarUrl: user.avatar_url,
      status: user.status,
    };

    logger.info(`[Auth] Người dùng [${user.username}] (Role: ${user.role_code}) đăng nhập thành công.`);

    return {
      token,
      tokenType: 'Bearer',
      expiresIn: jwtConfig.expiresIn,
      user: userInfo,
    };
  }

  /**
   * Đăng ký tài khoản người dùng mới (Dành cho Mobile QR Flow & Web Register)
   */
  async register({ fullName, email, username, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    let cleanUsername = (username || '').trim().toLowerCase();

    if (!cleanUsername) {
      cleanUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/gi, '') + Math.floor(100 + Math.random() * 900);
    }

    // Kiểm tra trùng lặp
    const existingEmail = await userRepository.findByUsernameOrEmail(cleanEmail);
    if (existingEmail) {
      throw new BadRequestError('Email này đã được sử dụng bởi một tài khoản khác');
    }
    const existingUsername = await userRepository.findByUsernameOrEmail(cleanUsername);
    if (existingUsername) {
      throw new BadRequestError('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác');
    }

    const passwordHash = await PasswordUtil.hash(password);

    // Mặc định role_id: 4 (USER - Giảng viên / Sinh viên / Cán bộ)
    const newUserId = await userRepository.create({
      roleId: 4,
      departmentId: null,
      username: cleanUsername,
      passwordHash,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: null,
      avatarUrl: null,
      status: 'ACTIVE',
    });

    const user = await userRepository.findById(newUserId);

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role_code,
      fullName: user.full_name,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm || 'HS256',
    });

    const userInfo = {
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
      avatarUrl: user.avatar_url,
      status: user.status,
    };

    logger.info(`[Auth] Người dùng mới đăng ký thành công: [${user.username}] (${user.email})`);

    return {
      token,
      tokenType: 'Bearer',
      expiresIn: jwtConfig.expiresIn,
      user: userInfo,
    };
  }

  /**
   * Lấy thông tin chi tiết người dùng hiện tại theo ID từ Token
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Tài khoản người dùng không tồn tại hoặc đã bị xóa');
    }

    return {
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
      avatarUrl: user.avatar_url,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(userId, { oldPassword, newPassword }) {
    if (!oldPassword || !newPassword) {
      throw new BadRequestError('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }

    // 1. Lấy thông tin user có password_hash từ DB
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng');
    }

    // 2. Xác thực mật khẩu cũ
    const isOldPasswordMatch = await PasswordUtil.compare(oldPassword, user.password_hash);
    if (!isOldPasswordMatch) {
      throw new BadRequestError('Mật khẩu hiện tại không chính xác');
    }

    // 3. Băm mật khẩu mới bằng bcrypt 10 rounds
    const newPasswordHash = await PasswordUtil.hash(newPassword);

    // 4. Cập nhật vào MySQL
    await userRepository.updatePassword(userId, newPasswordHash);

    logger.info(`[Auth] Người dùng [${user.username}] đã đổi mật khẩu thành công.`);

    return {
      success: true,
      message: 'Đổi mật khẩu thành công. Vui lòng sử dụng mật khẩu mới cho các lần đăng nhập sau.',
    };
  }

  /**
   * Đăng xuất
   */
  async logout(userId) {
    logger.info(`[Auth] Người dùng ID [${userId}] đã đăng xuất.`);
    return {
      success: true,
      message: 'Đăng xuất thành công',
    };
  }
}

module.exports = new AuthService();
