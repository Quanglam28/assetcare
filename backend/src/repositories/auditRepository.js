const { pool } = require('../config/db');

/**
 * AuditRepository
 * Lưu vết hoạt động và sự kiện trọng yếu của hệ thống
 */
class AuditRepository {
  /**
   * Tạo bản ghi nhật ký kiểm toán (Audit Log)
   */
  async createLog({ userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null }) {
    const sql = `
      INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      userId || null,
      action,
      entityType,
      entityId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress || null,
    ];

    const [result] = await pool.execute(sql, params);
    return result.insertId;
  }

  /**
   * Lấy lịch sử audit theo thực thể
   */
  async findByEntity(entityType, entityId) {
    const sql = `
      SELECT a.*, u.full_name AS user_full_name, u.username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = ? AND a.entity_id = ?
      ORDER BY a.created_at DESC
    `;
    const [rows] = await pool.execute(sql, [entityType, entityId]);
    return rows;
  }

  /**
   * Lấy danh sách audit gần đây
   */
  async findRecent(limit = 20) {
    const sql = `
      SELECT a.*, u.full_name AS user_full_name, u.username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  }
}

module.exports = new AuditRepository();
