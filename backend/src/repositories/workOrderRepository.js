const { pool } = require('../config/db');

/**
 * WorkOrderRepository
 * Quản lý phiếu lệnh công tác bảo trì (maintenance_work_orders)
 */
class WorkOrderRepository {
  /**
   * Tạo phiếu lệnh công tác mới
   */
  async create(data) {
    const sql = `
      INSERT INTO maintenance_work_orders (
        device_id, recommendation_id, work_order_code, title, description,
        type, priority, status, assigned_to, reported_by, scheduled_at,
        estimated_cost, actual_cost, resolution, technician_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.deviceId,
      data.recommendationId || null,
      data.workOrderCode,
      data.title,
      data.description || '',
      data.type || 'CORRECTIVE',
      data.priority || 'MEDIUM',
      data.status || 'OPEN',
      data.assignedTo || null,
      data.reportedBy,
      data.scheduledAt || null,
      data.estimatedCost || 0,
      data.actualCost || 0,
      data.resolution || null,
      data.technicianNote || null,
    ];

    const [result] = await pool.execute(sql, params);
    return result.insertId;
  }

  /**
   * Tìm lệnh công tác theo ID kèm thông tin liên quan
   */
  async findById(id) {
    const sql = `
      SELECT wo.*,
             d.code AS device_code, d.name AS device_name, d.status AS device_status,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name,
             u_assign.full_name AS assigned_technician_name, u_assign.email AS assigned_technician_email,
             u_report.full_name AS reporter_name, u_report.email AS reporter_email
      FROM maintenance_work_orders wo
      JOIN devices d ON wo.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN users u_assign ON wo.assigned_to = u_assign.id
      JOIN users u_report ON wo.reported_by = u_report.id
      WHERE wo.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Tìm lệnh công tác theo mã code
   */
  async findByCode(code) {
    const sql = `SELECT * FROM maintenance_work_orders WHERE work_order_code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  /**
   * Lấy danh sách lệnh công tác kèm phân trang & lọc
   */
  async findAll(filter = {}) {
    let sql = `
      SELECT wo.*,
             d.code AS device_code, d.name AS device_name,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name,
             u_assign.full_name AS assigned_technician_name,
             u_report.full_name AS reporter_name
      FROM maintenance_work_orders wo
      JOIN devices d ON wo.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN users u_assign ON wo.assigned_to = u_assign.id
      JOIN users u_report ON wo.reported_by = u_report.id
      WHERE 1=1
    `;

    const params = [];

    if (filter.deviceId) {
      sql += ` AND wo.device_id = ?`;
      params.push(filter.deviceId);
    }
    if (filter.status) {
      sql += ` AND wo.status = ?`;
      params.push(filter.status);
    }
    if (filter.type) {
      sql += ` AND wo.type = ?`;
      params.push(filter.type);
    }
    if (filter.priority) {
      sql += ` AND wo.priority = ?`;
      params.push(filter.priority);
    }
    if (filter.assignedTo) {
      sql += ` AND wo.assigned_to = ?`;
      params.push(filter.assignedTo);
    }
    if (filter.search) {
      sql += ` AND (wo.work_order_code LIKE ? OR wo.title LIKE ? OR d.name LIKE ? OR d.code LIKE ?)`;
      const term = `%${filter.search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY wo.created_at DESC`;

    const page = parseInt(filter.page, 10) || 1;
    const limit = parseInt(filter.limit, 10) || 20;
    const offset = (page - 1) * limit;

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Cập nhật thông tin phiếu lệnh
   */
  async update(id, data) {
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      params.push(value);
    }

    if (fields.length === 0) return;

    params.push(id);
    const sql = `UPDATE maintenance_work_orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await pool.execute(sql, params);
  }

  /**
   * Đếm số lượng work orders theo trạng thái
   */
  async countByStatus() {
    const sql = `
      SELECT 
        COUNT(*) AS totalCount,
        COUNT(CASE WHEN status = 'OPEN' THEN 1 END) AS openCount,
        COUNT(CASE WHEN status = 'ASSIGNED' THEN 1 END) AS assignedCount,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS inProgressCount,
        COUNT(CASE WHEN status = 'WAITING_PARTS' THEN 1 END) AS waitingPartsCount,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completedCount,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) AS cancelledCount,
        COALESCE(SUM(estimated_cost), 0) AS totalEstimatedCost,
        COALESCE(SUM(actual_cost), 0) AS totalActualCost
      FROM maintenance_work_orders
    `;
    const [rows] = await pool.execute(sql);
    return rows[0] || {};
  }
}

module.exports = new WorkOrderRepository();
