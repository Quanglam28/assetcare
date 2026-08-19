const { pool } = require('../config/db');

class SupplierRepository {
  async findAll({ search = '' } = {}) {
    let sql = `
      SELECT s.*, 
             (SELECT COUNT(*) FROM devices d WHERE d.supplier_id = s.id) AS total_devices
      FROM suppliers s
    `;
    const params = [];

    if (search && search.trim() !== '') {
      sql += ` WHERE (s.name LIKE ? OR s.code LIKE ? OR s.phone LIKE ? OR s.email LIKE ? OR s.contact_person LIKE ?)`;
      const p = `%${search.trim()}%`;
      params.push(p, p, p, p, p);
    }

    sql += ` ORDER BY s.name ASC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const sql = `
      SELECT s.*, 
             (SELECT COUNT(*) FROM devices d WHERE d.supplier_id = s.id) AS total_devices
      FROM suppliers s
      WHERE s.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  async findByCode(code) {
    const sql = `SELECT * FROM suppliers WHERE code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  async create({ code, name, contactPerson, phone, email, address, taxCode, description }) {
    const sql = `
      INSERT INTO suppliers (code, name, contact_person, phone, email, address, tax_code, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      code.trim().toUpperCase(),
      name.trim(),
      contactPerson?.trim() || null,
      phone?.trim() || null,
      email?.trim() || null,
      address?.trim() || null,
      taxCode?.trim() || null,
      description?.trim() || null,
    ]);
    return result.insertId;
  }

  async update(id, { name, contactPerson, phone, email, address, taxCode, description }) {
    const sql = `
      UPDATE suppliers
      SET name = COALESCE(?, name),
          contact_person = ?,
          phone = ?,
          email = ?,
          address = ?,
          tax_code = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      name ? name.trim() : null,
      contactPerson !== undefined ? (contactPerson?.trim() || null) : null,
      phone !== undefined ? (phone?.trim() || null) : null,
      email !== undefined ? (email?.trim() || null) : null,
      address !== undefined ? (address?.trim() || null) : null,
      taxCode !== undefined ? (taxCode?.trim() || null) : null,
      description !== undefined ? (description?.trim() || null) : null,
      id,
    ]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = `DELETE FROM suppliers WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  async countDevices(supplierId) {
    const sql = `SELECT COUNT(*) AS total FROM devices WHERE supplier_id = ?`;
    const [rows] = await pool.execute(sql, [supplierId]);
    return rows[0]?.total || 0;
  }
}

module.exports = new SupplierRepository();
