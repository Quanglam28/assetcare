const { pool } = require('../config/db');

/**
 * Repository thao tác dữ liệu người dùng (Users) với CSDL MySQL (asset_maintenance_system)
 */
class UserRepository {
  /**
   * Lấy danh sách người dùng kèm phân trang, tìm kiếm và lọc
   */
  async findAll({ page = 1, limit = 10, search = '', role = '', status = '', departmentId = null }) {
    const numLimit = Math.max(1, parseInt(limit, 10) || 10);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const numOffset = (numPage - 1) * numLimit;

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(u.full_name LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (role && role.trim() !== '') {
      conditions.push('r.code = ?');
      params.push(role.trim().toUpperCase());
    }

    if (status && status.trim() !== '') {
      conditions.push('u.status = ?');
      params.push(status.trim().toUpperCase());
    }

    if (departmentId) {
      conditions.push('u.department_id = ?');
      params.push(Number(departmentId));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Đếm tổng số bản ghi
    const countSql = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      ${whereClause}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Lấy danh sách bản ghi (LIMIT và OFFSET đưa trực tiếp số nguyên an toàn vào câu lệnh)
    const dataSql = `
      SELECT u.id, u.role_id, u.department_id, u.username, 
             u.full_name, u.email, u.phone, u.avatar_url, u.status, 
             u.created_at, u.updated_at,
             r.code AS role_code, r.name AS role_name,
             d.code AS department_code, d.name AS department_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      ${whereClause}
      ORDER BY u.created_at DESC, u.id DESC
      LIMIT ${numLimit} OFFSET ${numOffset}
    `;
    
    const [rows] = await pool.execute(dataSql, params);

    return {
      users: rows,
      total: Number(total),
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit) || 1,
    };
  }

  /**
   * Tìm người dùng theo username hoặc email
   */
  async findByUsernameOrEmail(identifier) {
    const sql = `
      SELECT u.id, u.role_id, u.department_id, u.username, u.password_hash, 
             u.full_name, u.email, u.phone, u.avatar_url, u.status, 
             u.created_at, u.updated_at,
             r.code AS role_code, r.name AS role_name,
             d.code AS department_code, d.name AS department_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE LOWER(u.username) = LOWER(?) OR LOWER(u.email) = LOWER(?)
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [identifier, identifier]);
    return rows[0] || null;
  }

  /**
   * Tìm người dùng theo ID kèm vai trò và phòng ban
   */
  async findById(id) {
    const sql = `
      SELECT u.id, u.role_id, u.department_id, u.username, 
             u.full_name, u.email, u.phone, u.avatar_url, u.status, 
             u.created_at, u.updated_at,
             r.code AS role_code, r.name AS role_name,
             d.code AS department_code, d.name AS department_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Lấy chi tiết user kèm số liệu thống kê liên quan (phiếu yêu cầu đã gửi, đã xử lý)
   */
  async findDetailWithStats(id) {
    const user = await this.findById(id);
    if (!user) return null;

    // Thống kê số lượng ticket tạo và ticket được phân công
    const statsSql = `
      SELECT 
        (SELECT COUNT(*) FROM maintenance_requests WHERE reporter_id = ?) AS total_reported_requests,
        (SELECT COUNT(*) FROM maintenance_requests WHERE technician_id = ?) AS total_assigned_requests,
        (SELECT COUNT(*) FROM maintenance_requests WHERE technician_id = ? AND status = 'COMPLETED') AS total_completed_requests,
        (SELECT COUNT(*) FROM maintenance_requests WHERE technician_id = ? AND status IN ('ASSIGNED', 'IN_PROGRESS', 'WAITING_PART')) AS active_assigned_requests
    `;
    const [statsRows] = await pool.execute(statsSql, [id, id, id, id]);
    const stats = statsRows[0] || {
      total_reported_requests: 0,
      total_assigned_requests: 0,
      total_completed_requests: 0,
      active_assigned_requests: 0,
    };

    return {
      ...user,
      stats: {
        totalReportedRequests: Number(stats.total_reported_requests),
        totalAssignedRequests: Number(stats.total_assigned_requests),
        totalCompletedRequests: Number(stats.total_completed_requests),
        activeAssignedRequests: Number(stats.active_assigned_requests),
      },
    };
  }

  /**
   * Lấy user kèm password_hash để kiểm tra
   */
  async findByIdWithPassword(id) {
    const sql = `
      SELECT u.*, r.code AS role_code, r.name AS role_name, d.name AS department_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Tạo người dùng mới
   */
  async create({ roleId, departmentId, username, passwordHash, fullName, email, phone, avatarUrl, status = 'ACTIVE' }) {
    const sql = `
      INSERT INTO users (role_id, department_id, username, password_hash, full_name, email, phone, avatar_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      roleId,
      departmentId || null,
      username,
      passwordHash,
      fullName,
      email,
      phone || null,
      avatarUrl || null,
      status,
    ]);
    return result.insertId;
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async update(id, { roleId, departmentId, fullName, email, phone, avatarUrl, status }) {
    const sql = `
      UPDATE users 
      SET role_id = COALESCE(?, role_id),
          department_id = ?,
          full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          phone = ?,
          avatar_url = ?,
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      roleId || null,
      departmentId !== undefined ? departmentId : null,
      fullName || null,
      email || null,
      phone !== undefined ? phone : null,
      avatarUrl !== undefined ? avatarUrl : null,
      status || null,
      id,
    ]);
    return result.affectedRows > 0;
  }

  /**
   * Cập nhật trạng thái người dùng (ACTIVE, INACTIVE, SUSPENDED)
   */
  async updateStatus(id, status) {
    const sql = `UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await pool.execute(sql, [status, id]);
    return result.affectedRows > 0;
  }

  /**
   * Cập nhật mật khẩu mới
   */
  async updatePassword(id, passwordHash) {
    const sql = `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await pool.execute(sql, [passwordHash, id]);
    return result.affectedRows > 0;
  }

  /**
   * Đếm số lượng ADMIN đang ACTIVE trong hệ thống
   */
  async countActiveAdmins() {
    const sql = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.code = 'ADMIN' AND u.status = 'ACTIVE'
    `;
    const [rows] = await pool.execute(sql);
    return rows[0]?.total || 0;
  }

  /**
   * Lấy danh sách tất cả Roles
   */
  async getAllRoles() {
    const sql = `SELECT id, code, name, description FROM roles ORDER BY id ASC`;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  /**
   * Lấy danh sách tất cả Departments
   */
  async getAllDepartments() {
    const sql = `SELECT id, code, name, phone, email, description FROM departments ORDER BY id ASC`;
    const [rows] = await pool.execute(sql);
    return rows;
  }
}

module.exports = new UserRepository();
