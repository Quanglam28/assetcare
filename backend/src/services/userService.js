const userRepository = require('../repositories/userRepository');
const PasswordUtil = require('../utils/password');
const { BadRequestError, NotFoundError, ConflictError, ForbiddenError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Service xử lý nghiệp vụ Quản lý Người dùng (User Management)
 */
class UserService {
  /**
   * Lấy danh sách người dùng kèm phân trang, tìm kiếm, lọc
   */
  async getUsers(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const search = query.search || '';
    const role = query.role || '';
    const status = query.status || '';
    const departmentId = query.departmentId || null;

    const result = await userRepository.findAll({
      page,
      limit,
      search,
      role,
      status,
      departmentId,
    });

    return result;
  }

  /**
   * Lấy chi tiết một người dùng theo ID kèm thống kê hoạt động
   */
  async getUserById(id) {
    const user = await userRepository.findDetailWithStats(id);
    if (!user) {
      throw new NotFoundError(`Không tìm thấy người dùng với ID [${id}]`);
    }
    return user;
  }

  /**
   * Tạo tài khoản người dùng mới
   */
  async createUser(data) {
    const { username, email, password, fullName, phone, roleId, departmentId, status, avatarUrl } = data;

    // 1. Kiểm tra username đã tồn tại chưa
    const existingByUsername = await userRepository.findByUsernameOrEmail(username.trim());
    if (existingByUsername) {
      throw new ConflictError(`Tên đăng nhập "${username}" đã được sử dụng`);
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const existingByEmail = await userRepository.findByUsernameOrEmail(email.trim());
    if (existingByEmail) {
      throw new ConflictError(`Địa chỉ email "${email}" đã được đăng ký cho tài khoản khác`);
    }

    // 3. Băm mật khẩu bằng bcrypt 10 rounds
    const passwordHash = await PasswordUtil.hash(password);

    // 4. Lưu vào CSDL MySQL
    const newUserId = await userRepository.create({
      roleId,
      departmentId,
      username: username.trim(),
      passwordHash,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
      status: status || 'ACTIVE',
    });

    logger.info(`[User Management] Đã tạo người dùng mới ID [${newUserId}], username [${username}]`);

    return this.getUserById(newUserId);
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(targetUserId, currentUserId, data) {
    const { fullName, email, phone, roleId, departmentId, status, avatarUrl } = data;

    // 1. Kiểm tra người dùng mục tiêu có tồn tại không
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError(`Không tìm thấy người dùng với ID [${targetUserId}]`);
    }

    // 2. Ràng buộc: "Không cho user tự thay đổi role của mình"
    if (Number(targetUserId) === Number(currentUserId) && Number(roleId) !== Number(targetUser.role_id)) {
      throw new BadRequestError('Bạn không thể tự thay đổi vai trò (Role) của chính mình');
    }

    // 3. Ràng buộc: "Không cho xóa/khóa/giáng chức Admin cuối cùng"
    if (targetUser.role_code === 'ADMIN') {
      const activeAdmins = await userRepository.countActiveAdmins();
      // Nếu là admin duy nhất mà bị đổi vai trò khác hoặc bị đổi status sang INACTIVE/SUSPENDED
      const isChangingRole = Number(roleId) !== Number(targetUser.role_id);
      const isDeactivating = status && status !== 'ACTIVE';
      
      if (activeAdmins <= 1 && (isChangingRole || isDeactivating)) {
        throw new BadRequestError('Không thể thay đổi vai trò hoặc vô hiệu hóa Quản trị viên (ADMIN) duy nhất còn hoạt động trong hệ thống');
      }
    }

    // 4. Kiểm tra trùng lặp email với người dùng khác
    if (email && email.trim().toLowerCase() !== targetUser.email.toLowerCase()) {
      const existingEmailUser = await userRepository.findByUsernameOrEmail(email.trim());
      if (existingEmailUser && existingEmailUser.id !== Number(targetUserId)) {
        throw new ConflictError(`Địa chỉ email "${email}" đã được sử dụng bởi người dùng khác`);
      }
    }

    // 5. Cập nhật vào MySQL
    await userRepository.update(targetUserId, {
      roleId,
      departmentId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
      status,
    });

    logger.info(`[User Management] Admin [${currentUserId}] đã cập nhật thông tin user ID [${targetUserId}]`);

    return this.getUserById(targetUserId);
  }

  /**
   * Khóa / Mở khóa trạng thái người dùng (ACTIVE, INACTIVE, SUSPENDED)
   */
  async updateUserStatus(targetUserId, currentUserId, newStatus) {
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError(`Không tìm thấy người dùng với ID [${targetUserId}]`);
    }

    // Ràng buộc: Không tự khóa chính mình
    if (Number(targetUserId) === Number(currentUserId) && newStatus !== 'ACTIVE') {
      throw new BadRequestError('Bạn không thể tự khóa tài khoản của chính mình');
    }

    // Ràng buộc: Không khóa Admin cuối cùng
    if (targetUser.role_code === 'ADMIN' && newStatus !== 'ACTIVE') {
      const activeAdmins = await userRepository.countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new BadRequestError('Không thể khóa Quản trị viên (ADMIN) duy nhất còn hoạt động trong hệ thống');
      }
    }

    await userRepository.updateStatus(targetUserId, newStatus);

    logger.info(`[User Management] Đã cập nhật trạng thái user ID [${targetUserId}] thành [${newStatus}]`);

    return {
      id: targetUser.id,
      username: targetUser.username,
      status: newStatus,
      message: `Đã cập nhật trạng thái tài khoản thành ${newStatus}`,
    };
  }

  /**
   * Đặt lại mật khẩu (Reset Password) bởi Quản trị viên
   */
  async resetPassword(targetUserId, newPassword) {
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError(`Không tìm thấy người dùng với ID [${targetUserId}]`);
    }

    const passwordToSet = newPassword && newPassword.trim().length >= 6 ? newPassword.trim() : 'password123';
    const passwordHash = await PasswordUtil.hash(passwordToSet);

    await userRepository.updatePassword(targetUserId, passwordHash);

    logger.info(`[User Management] Đã reset mật khẩu cho user ID [${targetUserId}] (${targetUser.username})`);

    return {
      id: targetUser.id,
      username: targetUser.username,
      resetPassword: passwordToSet,
      message: `Đã đặt lại mật khẩu thành công cho người dùng ${targetUser.full_name} (${targetUser.username})`,
    };
  }

  /**
   * Lấy danh mục vai trò và phòng ban phục vụ tạo/sửa user
   */
  async getMasterData() {
    const [roles, departments] = await Promise.all([
      userRepository.getAllRoles(),
      userRepository.getAllDepartments(),
    ]);

    return { roles, departments };
  }
}

module.exports = new UserService();
