const { pool } = require('../config/db');

/**
 * Repository thao tác với bảng maintenance_schedules (Kế hoạch bảo trì định kỳ)
 */
class ScheduleRepository {
  /**
   * Tính ngày bảo trì tiếp theo động từ dữ liệu và chu kỳ (không hard-code)
   * @param {Date|string} baseDate Ngày mốc tính toán
   * @param {string} frequency Chu kỳ: MONTHLY, QUARTERLY, SEMIANNUAL, YEARLY, CUSTOM
   * @param {number} customDays Số ngày nếu chu kỳ là CUSTOM
   * @returns {string} YYYY-MM-DD
   */
  calculateNextRunDate(baseDate, frequency, customDays = 30) {
    const d = new Date(baseDate);
    if (isNaN(d.getTime())) {
      d.setTime(Date.now());
    }

    const freq = (frequency || 'QUARTERLY').toUpperCase();

    switch (freq) {
      case 'MONTHLY':
        d.setMonth(d.getMonth() + 1);
        break;
      case 'QUARTERLY':
        d.setMonth(d.getMonth() + 3);
        break;
      case 'SEMIANNUAL':
      case 'SEMI_ANNUALLY':
        d.setMonth(d.getMonth() + 6);
        break;
      case 'YEARLY':
      case 'ANNUALLY':
        d.setFullYear(d.getFullYear() + 1);
        break;
      case 'CUSTOM':
        d.setDate(d.getDate() + (parseInt(customDays, 10) || 30));
        break;
      default:
        d.setMonth(d.getMonth() + 3);
        break;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Lấy danh sách lịch bảo dưỡng kèm phân trang, tìm kiếm, lọc và gắn nhãn cảnh báo thời gian thực
   */
  async findAll({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    alertType = '', // 'OVERDUE', 'DUE', 'UPCOMING', 'COMPLETED'
    frequency = '',
    deviceId = null,
    buildingId = null,
    technicianId = null,
    sortBy = 'scheduled_date',
    sortOrder = 'ASC',
  } = {}) {
    const numLimit = Math.max(1, parseInt(limit, 10) || 10);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const numOffset = (numPage - 1) * numLimit;

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(ms.title LIKE ? OR d.name LIKE ? OR d.code LIKE ? OR u.full_name LIKE ?)');
      const p = `%${search.trim()}%`;
      params.push(p, p, p, p);
    }

    if (status && status.trim() !== '') {
      conditions.push('ms.status = ?');
      params.push(status.trim().toUpperCase());
    }

    // Lọc theo cảnh báo thời gian thực (Dynamic Alert Filters)
    if (alertType && alertType.trim() !== '') {
      const type = alertType.trim().toUpperCase();
      if (type === 'OVERDUE') {
        conditions.push("ms.status != 'COMPLETED' AND ms.scheduled_date < CURDATE()");
      } else if (type === 'DUE') {
        conditions.push("ms.status != 'COMPLETED' AND ms.scheduled_date = CURDATE()");
      } else if (type === 'UPCOMING') {
        conditions.push("ms.status != 'COMPLETED' AND ms.scheduled_date > CURDATE()");
      } else if (type === 'COMPLETED') {
        conditions.push("ms.status = 'COMPLETED'");
      }
    }

    if (frequency && frequency.trim() !== '') {
      conditions.push('ms.frequency = ?');
      params.push(frequency.trim().toUpperCase());
    }

    if (deviceId) {
      conditions.push('ms.device_id = ?');
      params.push(Number(deviceId));
    }

    if (buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(buildingId));
    }

    if (technicianId) {
      conditions.push('ms.assigned_technician_id = ?');
      params.push(Number(technicianId));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = {
      id: 'ms.id',
      title: 'ms.title',
      scheduled_date: 'ms.scheduled_date',
      status: 'ms.status',
      created_at: 'ms.created_at',
    };
    const orderCol = allowedSort[sortBy] || 'ms.scheduled_date';
    const orderDir = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM maintenance_schedules ms
      JOIN devices d ON ms.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      LEFT JOIN users u ON ms.assigned_technician_id = u.id
      ${whereClause}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT ms.*,
             d.code AS device_code, d.name AS device_name, d.model AS device_model, d.qr_token, d.status AS device_status,
             dt.name AS device_type_name,
             loc.code AS location_code, loc.room_name, loc.floor,
             b.id AS building_id, b.code AS building_code, b.name AS building_name,
             u.username AS technician_username, u.full_name AS technician_name, u.phone AS technician_phone,
             CASE
               WHEN ms.status = 'COMPLETED' THEN 'COMPLETED'
               WHEN ms.scheduled_date < CURDATE() THEN 'OVERDUE'
               WHEN ms.scheduled_date = CURDATE() THEN 'DUE'
               ELSE 'UPCOMING'
             END AS alert_status,
             DATEDIFF(ms.scheduled_date, CURDATE()) AS days_remaining
      FROM maintenance_schedules ms
      JOIN devices d ON ms.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN users u ON ms.assigned_technician_id = u.id
      ${whereClause}
      ORDER BY ${orderCol} ${orderDir}
      LIMIT ${numLimit} OFFSET ${numOffset}
    `;
    const [rows] = await pool.execute(dataSql, params);

    return {
      schedules: rows,
      total: Number(total),
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit) || 1,
    };
  }

  /**
   * Thống kê các chỉ số cảnh báo lịch bảo trì (Upcoming, Due, Overdue, Completed)
   */
  async getAlertStats() {
    const sql = `
      SELECT
        COUNT(*) AS total_schedules,
        COUNT(CASE WHEN status != 'COMPLETED' AND scheduled_date > CURDATE() THEN 1 END) AS upcoming_count,
        COUNT(CASE WHEN status != 'COMPLETED' AND scheduled_date = CURDATE() THEN 1 END) AS due_count,
        COUNT(CASE WHEN status != 'COMPLETED' AND scheduled_date < CURDATE() THEN 1 END) AS overdue_count,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_count
      FROM maintenance_schedules
    `;
    const [rows] = await pool.execute(sql);
    const r = rows[0] || {};
    return {
      total: Number(r.total_schedules || 0),
      upcoming: Number(r.upcoming_count || 0),
      due: Number(r.due_count || 0),
      overdue: Number(r.overdue_count || 0),
      completed: Number(r.completed_count || 0),
    };
  }

  /**
   * Lấy chi tiết một lịch bảo trì
   */
  async findById(id) {
    const sql = `
      SELECT ms.*,
             d.code AS device_code, d.name AS device_name, d.model AS device_model, d.serial_number AS device_serial, d.qr_token, d.status AS device_status,
             dt.name AS device_type_name, dt.code AS device_type_code,
             loc.code AS location_code, loc.room_name, loc.floor,
             b.id AS building_id, b.code AS building_code, b.name AS building_name,
             u.username AS technician_username, u.full_name AS technician_name, u.phone AS technician_phone, u.email AS technician_email,
             CASE
               WHEN ms.status = 'COMPLETED' THEN 'COMPLETED'
               WHEN ms.scheduled_date < CURDATE() THEN 'OVERDUE'
               WHEN ms.scheduled_date = CURDATE() THEN 'DUE'
               ELSE 'UPCOMING'
             END AS alert_status,
             DATEDIFF(ms.scheduled_date, CURDATE()) AS days_remaining
      FROM maintenance_schedules ms
      JOIN devices d ON ms.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN users u ON ms.assigned_technician_id = u.id
      WHERE ms.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Tạo lịch bảo trì định kỳ mới
   */
  async create({
    deviceId,
    title,
    frequency = 'QUARTERLY',
    scheduledDate,
    nextRunDate = null,
    assignedTechnicianId = null,
    notes = null,
    status = 'SCHEDULED',
  }) {
    const sql = `
      INSERT INTO maintenance_schedules (
        device_id, title, frequency, scheduled_date, next_run_date, assigned_technician_id, status, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      deviceId,
      title.trim(),
      frequency,
      scheduledDate,
      nextRunDate,
      assignedTechnicianId || null,
      status || 'SCHEDULED',
      notes || null,
    ]);
    return result.insertId;
  }

  /**
   * Cập nhật lịch bảo trì
   */
  async update(id, {
    title,
    frequency,
    scheduledDate,
    nextRunDate,
    assignedTechnicianId,
    status,
    notes,
  }) {
    const setClauses = [];
    const params = [];

    if (title !== undefined) {
      setClauses.push('title = ?');
      params.push(title.trim());
    }
    if (frequency !== undefined) {
      setClauses.push('frequency = ?');
      params.push(frequency);
    }
    if (scheduledDate !== undefined) {
      setClauses.push('scheduled_date = ?');
      params.push(scheduledDate);
    }
    if (nextRunDate !== undefined) {
      setClauses.push('next_run_date = ?');
      params.push(nextRunDate);
    }
    if (assignedTechnicianId !== undefined) {
      setClauses.push('assigned_technician_id = ?');
      params.push(assignedTechnicianId || null);
    }
    if (status !== undefined) {
      setClauses.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      setClauses.push('notes = ?');
      params.push(notes || null);
    }

    if (setClauses.length === 0) return;

    params.push(id);
    const sql = `UPDATE maintenance_schedules SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.execute(sql, params);
  }

  /**
   * Thực hiện bảo dưỡng định kỳ và tự động tính chu kỳ kế tiếp
   */
  async executeMaintenance(id, { lastPerformedAt, nextRunDate, notes }) {
    const sql = `
      UPDATE maintenance_schedules
      SET status = 'COMPLETED',
          last_performed_at = ?,
          next_run_date = ?,
          notes = CONCAT(COALESCE(notes, ''), '\n[Bảo dưỡng hoàn tất ngày: ', DATE_FORMAT(?, '%d/%m/%Y'), ' - ', COALESCE(?, ''), ']')
      WHERE id = ?
    `;
    await pool.execute(sql, [lastPerformedAt, nextRunDate, lastPerformedAt, notes || 'Đã kiểm tra bảo dưỡng', id]);
  }

  /**
   * Xóa lịch bảo trì
   */
  async delete(id) {
    const sql = `DELETE FROM maintenance_schedules WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ScheduleRepository();
