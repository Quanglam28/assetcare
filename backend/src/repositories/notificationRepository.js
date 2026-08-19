const { pool } = require('../config/db');

/**
 * Repository thao tác toàn diện với bảng notifications
 */
class NotificationRepository {
  /**
   * Tạo thông báo mới cho một người dùng
   */
  async create({
    userId,
    title,
    message,
    type = 'INFO',
    referenceType = null,
    referenceId = null,
    entityType = null,
    entityId = null,
  }) {
    const finalType = entityType || referenceType || 'SYSTEM';
    const finalId = entityId || referenceId || null;

    const sql = `
      INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, is_read)
      VALUES (?, ?, ?, ?, ?, ?, FALSE)
    `;
    const [result] = await pool.execute(sql, [
      userId,
      title.trim(),
      message.trim(),
      type || 'INFO',
      finalType,
      finalId,
    ]);
    return result.insertId;
  }

  /**
   * Tạo thông báo hàng loạt cho danh sách người dùng (ví dụ: gửi cho tất cả Managers)
   */
  async createBulk(userIds, { title, message, type = 'INFO', entityType = 'SYSTEM', entityId = null }) {
    if (!userIds || userIds.length === 0) return;
    for (const uId of userIds) {
      await this.create({
        userId: uId,
        title,
        message,
        type,
        entityType,
        entityId,
      });
    }
  }

  /**
   * Lấy danh sách thông báo phân trang, tìm kiếm và lọc theo trạng thái / loại
   */
  async findByUserId(userId, {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type = '',
    search = '',
  } = {}) {
    const numLimit = Math.max(1, parseInt(limit, 10) || 20);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const numOffset = (numPage - 1) * numLimit;

    const conditions = ['user_id = ?'];
    const params = [userId];

    if (unreadOnly) {
      conditions.push('is_read = FALSE');
    }

    if (type && type.trim() !== '') {
      conditions.push('type = ?');
      params.push(type.trim().toUpperCase());
    }

    if (search && search.trim() !== '') {
      conditions.push('(title LIKE ? OR message LIKE ?)');
      const p = `%${search.trim()}%`;
      params.push(p, p);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Đếm tổng số bản ghi
    const countSql = `SELECT COUNT(*) AS total FROM notifications ${whereClause}`;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Đếm riêng số thông báo chưa đọc
    const [unreadRows] = await pool.execute(`
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = ? AND is_read = FALSE
    `, [userId]);
    const unreadCount = unreadRows[0]?.unread_count || 0;

    // Lấy dữ liệu
    const sql = `
      SELECT id, user_id, title, message, type,
             entity_type AS reference_type, entity_id AS reference_id,
             entity_type, entity_id,
             is_read, created_at
      FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${numLimit} OFFSET ${numOffset}
    `;
    const [rows] = await pool.execute(sql, params);

    return {
      notifications: rows,
      unreadCount: Number(unreadCount),
      total: Number(total),
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit) || 1,
    };
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(userId) {
    const [rows] = await pool.execute(`
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = ? AND is_read = FALSE
    `, [userId]);
    return Number(rows[0]?.unread_count || 0);
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id, userId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ? AND user_id = ?
    `;
    await pool.execute(sql, [id, userId]);
  }

  /**
   * Đánh dấu tất cả thông báo của người dùng là đã đọc
   */
  async markAllAsRead(userId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
    `;
    await pool.execute(sql, [userId]);
  }

  /**
   * Xóa một thông báo
   */
  async delete(id, userId) {
    const sql = `DELETE FROM notifications WHERE id = ? AND user_id = ?`;
    const [result] = await pool.execute(sql, [id, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new NotificationRepository();
