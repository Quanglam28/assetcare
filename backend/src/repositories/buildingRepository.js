const { pool } = require('../config/db');

class BuildingRepository {
  async findAll({ search = '' } = {}) {
    let sql = `
      SELECT b.*, 
             COUNT(l.id) AS total_locations,
             (SELECT COUNT(*) FROM devices d JOIN locations loc ON d.location_id = loc.id WHERE loc.building_id = b.id) AS total_devices
      FROM buildings b
      LEFT JOIN locations l ON b.id = l.building_id
    `;
    const params = [];

    if (search && search.trim() !== '') {
      sql += ` WHERE (b.name LIKE ? OR b.code LIKE ? OR b.address LIKE ?)`;
      const p = `%${search.trim()}%`;
      params.push(p, p, p);
    }

    sql += ` GROUP BY b.id ORDER BY b.code ASC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT b.*, 
             COUNT(l.id) AS total_locations,
             (SELECT COUNT(*) FROM devices d JOIN locations loc ON d.location_id = loc.id WHERE loc.building_id = b.id) AS total_devices
      FROM buildings b
      LEFT JOIN locations l ON b.id = l.building_id
      WHERE b.id = ?
      GROUP BY b.id
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  async findByCode(code) {
    const sql = `SELECT * FROM buildings WHERE code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  async create({ code, name, address, totalFloors, description }) {
    const sql = `
      INSERT INTO buildings (code, name, address, total_floors, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      code.trim().toUpperCase(),
      name.trim(),
      address?.trim() || null,
      totalFloors || 1,
      description?.trim() || null,
    ]);
    return result.insertId;
  }

  async update(id, { name, address, totalFloors, description }) {
    const sql = `
      UPDATE buildings
      SET name = COALESCE(?, name),
          address = ?,
          total_floors = COALESCE(?, total_floors),
          description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      name ? name.trim() : null,
      address !== undefined ? (address?.trim() || null) : null,
      totalFloors || null,
      description !== undefined ? (description?.trim() || null) : null,
      id,
    ]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = `DELETE FROM buildings WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  async countLocations(buildingId) {
    const sql = `SELECT COUNT(*) AS total FROM locations WHERE building_id = ?`;
    const [rows] = await pool.execute(sql, [buildingId]);
    return rows[0]?.total || 0;
  }
}

module.exports = new BuildingRepository();
