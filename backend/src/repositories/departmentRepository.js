const { pool } = require('../config/db');

class DepartmentRepository {
  async findAll({ search = '' } = {}) {
    let sql = `
      SELECT d.*, 
             (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id) AS total_users,
             (SELECT COUNT(*) FROM devices dev WHERE dev.department_id = d.id) AS total_devices
      FROM departments d
    `;
    const params = [];

    if (search && search.trim() !== '') {
      sql += ` WHERE (d.name LIKE ? OR d.code LIKE ? OR d.phone LIKE ? OR d.email LIKE ?)`;
      const p = `%${search.trim()}%`;
      params.push(p, p, p, p);
    }

    sql += ` ORDER BY d.code ASC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT d.*, 
             (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id) AS total_users,
             (SELECT COUNT(*) FROM devices dev WHERE dev.department_id = d.id) AS total_devices
      FROM departments d
      WHERE d.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  async findByCode(code) {
    const sql = `SELECT * FROM departments WHERE code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  async create({ code, name, phone, email, description }) {
    const sql = `
      INSERT INTO departments (code, name, phone, email, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      code.trim().toUpperCase(),
      name.trim(),
      phone?.trim() || null,
      email?.trim() || null,
      description?.trim() || null,
    ]);
    return result.insertId;
  }

  async update(id, { name, phone, email, description }) {
    const sql = `
      UPDATE departments
      SET name = COALESCE(?, name),
          phone = ?,
          email = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      name ? name.trim() : null,
      phone !== undefined ? (phone?.trim() || null) : null,
      email !== undefined ? (email?.trim() || null) : null,
      description !== undefined ? (description?.trim() || null) : null,
      id,
    ]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = `DELETE FROM departments WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  async countDependencies(departmentId) {
    const [users] = await pool.execute(`SELECT COUNT(*) AS total FROM users WHERE department_id = ?`, [departmentId]);
    const [devices] = await pool.execute(`SELECT COUNT(*) AS total FROM devices WHERE department_id = ?`, [departmentId]);
    return {
      users: users[0]?.total || 0,
      devices: devices[0]?.total || 0,
    };
  }
}

module.exports = new DepartmentRepository();
