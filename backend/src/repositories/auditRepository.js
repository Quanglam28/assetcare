const { pool } = require('../config/db');

const SENSITIVE_AUDIT_KEYS = new Set([
  'password',
  'oldpassword',
  'newpassword',
  'confirmpassword',
  'password_hash',
  'passwordhash',
  'token',
  'secret',
  'authorization',
  'accesstoken',
  'refreshtoken',
]);

function sanitizeAuditData(data) {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeAuditData);
  const clean = {};
  for (const [k, v] of Object.entries(data)) {
    if (SENSITIVE_AUDIT_KEYS.has(k.toLowerCase())) {
      clean[k] = '[MASKED_CREDENTIAL]';
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = sanitizeAuditData(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

class AuditRepository {
  /**
   * Tạo bản ghi nhật ký kiểm toán (Audit Log)
   */
  async createLog({ userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null }) {
    const cleanOld = sanitizeAuditData(oldValues);
    const cleanNew = sanitizeAuditData(newValues);

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
      cleanOld ? JSON.stringify(cleanOld) : null,
      cleanNew ? JSON.stringify(cleanNew) : null,
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
