const { pool } = require('../config/db');

class LocationRepository {
  async findAll({ page = 1, limit = 50, search = '', buildingId = null, type = '' } = {}) {
    const numLimit = Math.max(1, parseInt(limit, 10) || 50);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const numOffset = (numPage - 1) * numLimit;

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(l.room_name LIKE ? OR l.code LIKE ? OR b.name LIKE ?)');
      const p = `%${search.trim()}%`;
      params.push(p, p, p);
    }

    if (buildingId) {
      conditions.push('l.building_id = ?');
      params.push(Number(buildingId));
    }

    if (type && type.trim() !== '') {
      conditions.push('l.type = ?');
      params.push(type.trim().toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM locations l
      JOIN buildings b ON l.building_id = b.id
      ${whereClause}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT l.*, 
             b.code AS building_code, 
             b.name AS building_name,
             (SELECT COUNT(*) FROM devices d WHERE d.location_id = l.id) AS total_devices
      FROM locations l
      JOIN buildings b ON l.building_id = b.id
      ${whereClause}
      ORDER BY b.code ASC, l.floor ASC, l.code ASC
      LIMIT ${numLimit} OFFSET ${numOffset}
    `;
    const [rows] = await pool.execute(dataSql, params);

    return {
      locations: rows,
      total: Number(total),
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit) || 1,
    };
  }

  async findById(id) {
    const sql = `
      SELECT l.*, 
             b.code AS building_code, 
             b.name AS building_name,
             (SELECT COUNT(*) FROM devices d WHERE d.location_id = l.id) AS total_devices
      FROM locations l
      JOIN buildings b ON l.building_id = b.id
      WHERE l.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  async findByCode(code) {
    const sql = `SELECT * FROM locations WHERE code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  async create({ buildingId, code, roomName, floor, type, description }) {
    const sql = `
      INSERT INTO locations (building_id, code, room_name, floor, type, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      buildingId,
      code.trim().toUpperCase(),
      roomName.trim(),
      floor || 1,
      type || 'CLASSROOM',
      description?.trim() || null,
    ]);
    return result.insertId;
  }

  async update(id, { buildingId, roomName, floor, type, description }) {
    const sql = `
      UPDATE locations
      SET building_id = COALESCE(?, building_id),
          room_name = COALESCE(?, room_name),
          floor = COALESCE(?, floor),
          type = COALESCE(?, type),
          description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      buildingId || null,
      roomName ? roomName.trim() : null,
      floor || null,
      type || null,
      description !== undefined ? (description?.trim() || null) : null,
      id,
    ]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = `DELETE FROM locations WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  async countDevices(locationId) {
    const sql = `SELECT COUNT(*) AS total FROM devices WHERE location_id = ?`;
    const [rows] = await pool.execute(sql, [locationId]);
    return rows[0]?.total || 0;
  }
}

module.exports = new LocationRepository();
