const { pool } = require('../config/db');

class DeviceTypeRepository {
  async findAll({ search = '', category = '' } = {}) {
    let sql = `
      SELECT dt.*, 
             (SELECT COUNT(*) FROM devices d WHERE d.device_type_id = dt.id) AS total_devices
      FROM device_types dt
    `;
    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(dt.name LIKE ? OR dt.code LIKE ? OR dt.description LIKE ?)');
      const p = `%${search.trim()}%`;
      params.push(p, p, p);
    }

    if (category && category.trim() !== '') {
      conditions.push('dt.category = ?');
      params.push(category.trim().toUpperCase());
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY dt.name ASC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT dt.*, 
             (SELECT COUNT(*) FROM devices d WHERE d.device_type_id = dt.id) AS total_devices
      FROM device_types dt
      WHERE dt.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  async findByCode(code) {
    const sql = `SELECT * FROM device_types WHERE code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  async create({ code, name, category, maintenanceIntervalDays, description }) {
    const sql = `
      INSERT INTO device_types (code, name, category, maintenance_interval_days, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      code.trim().toUpperCase(),
      name.trim(),
      category || 'OTHER',
      maintenanceIntervalDays || 90,
      description?.trim() || null,
    ]);
    return result.insertId;
  }

  async update(id, { name, category, maintenanceIntervalDays, description }) {
    const sql = `
      UPDATE device_types
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          maintenance_interval_days = COALESCE(?, maintenance_interval_days),
          description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      name ? name.trim() : null,
      category || null,
      maintenanceIntervalDays || null,
      description !== undefined ? (description?.trim() || null) : null,
      id,
    ]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = `DELETE FROM device_types WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  async countDevices(typeId) {
    const sql = `SELECT COUNT(*) AS total FROM devices WHERE device_type_id = ?`;
    const [rows] = await pool.execute(sql, [typeId]);
    return rows[0]?.total || 0;
  }
}

module.exports = new DeviceTypeRepository();
