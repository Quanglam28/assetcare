const { pool } = require('../config/db');

/**
 * Repository thao tác danh mục vai trò (Roles)
 */
class RoleRepository {
  /**
   * Lấy danh sách tất cả các role
   */
  async findAll() {
    const sql = `SELECT * FROM roles ORDER BY id ASC`;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  /**
   * Tìm role theo mã code
   */
  async findByCode(code) {
    const sql = `SELECT * FROM roles WHERE code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  /**
   * Tìm role theo ID
   */
  async findById(id) {
    const sql = `SELECT * FROM roles WHERE id = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = new RoleRepository();
