const { pool } = require('../config/db');

/**
 * Repository thao tác với bảng maintenance_requests, maintenance_histories, maintenance_parts, attachments
 */
class MaintenanceRepository {
  /**
   * Tạo mã yêu cầu tiếp theo định dạng: REQ00001, REQ00002...
   */
  async generateNextCode() {
    const [rows] = await pool.execute(`
      SELECT id FROM maintenance_requests ORDER BY id DESC LIMIT 1
    `);
    const nextId = (rows[0]?.id || 0) + 1;
    return `REQ${String(nextId).padStart(5, '0')}`;
  }

  /**
   * Lấy danh sách phiếu yêu cầu bảo trì kèm phân trang, tìm kiếm và lọc
   */
  async findAll({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    priority = '',
    reporterId = null,
    technicianId = null,
    deviceId = null,
    buildingId = null,
    isOverdue = null,
    isDueSoon = null,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = {}) {
    const numLimit = Math.max(1, parseInt(limit, 10) || 10);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const numOffset = (numPage - 1) * numLimit;

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(mr.code LIKE ? OR mr.title LIKE ? OR d.name LIKE ? OR d.code LIKE ? OR rep.full_name LIKE ?)');
      const p = `%${search.trim()}%`;
      params.push(p, p, p, p, p);
    }

    if (status && status.trim() !== '') {
      conditions.push('mr.status = ?');
      params.push(status.trim().toUpperCase());
    }

    if (priority && priority.trim() !== '') {
      conditions.push('mr.priority = ?');
      params.push(priority.trim().toUpperCase());
    }

    if (reporterId) {
      conditions.push('mr.reporter_id = ?');
      params.push(Number(reporterId));
    }

    if (technicianId) {
      conditions.push('mr.technician_id = ?');
      params.push(Number(technicianId));
    }

    if (deviceId) {
      conditions.push('mr.device_id = ?');
      params.push(Number(deviceId));
    }

    if (buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(buildingId));
    }

    if (isOverdue === 'true' || isOverdue === true) {
      conditions.push("mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() > mr.due_at");
    }

    if (isDueSoon === 'true' || isDueSoon === true) {
      conditions.push("mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() <= mr.due_at AND TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) <= 120");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = {
      id: 'mr.id',
      code: 'mr.code',
      priority: 'mr.priority',
      status: 'mr.status',
      created_at: 'mr.created_at',
      due_at: 'mr.due_at',
    };
    const orderCol = allowedSort[sortBy] || 'mr.created_at';
    const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN users rep ON mr.reporter_id = rep.id
      LEFT JOIN users tech ON mr.technician_id = tech.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereClause}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT mr.*,
             CASE
               WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() > mr.due_at THEN 1
               WHEN mr.completed_at IS NOT NULL AND mr.completed_at > mr.due_at THEN 1
               ELSE 0
             END AS is_overdue,
             CASE
               WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() <= mr.due_at AND TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) <= 120 THEN 1
               ELSE 0
             END AS is_due_soon,
             TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) AS minutes_remaining,
             d.code AS device_code, d.name AS device_name, d.model AS device_model, d.qr_token,
             dt.name AS device_type_name,
             loc.code AS location_code, loc.room_name, loc.floor,
             b.id AS building_id, b.code AS building_code, b.name AS building_name,
             rep.username AS reporter_username, rep.full_name AS reporter_name, rep.email AS reporter_email, rep.phone AS reporter_phone,
             tech.username AS technician_username, tech.full_name AS technician_name, tech.phone AS technician_phone
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      JOIN users rep ON mr.reporter_id = rep.id
      LEFT JOIN users tech ON mr.technician_id = tech.id
      ${whereClause}
      ORDER BY ${orderCol} ${orderDir}
      LIMIT ${numLimit} OFFSET ${numOffset}
    `;
    const [rows] = await pool.execute(dataSql, params);

    return {
      requests: rows,
      total: Number(total),
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit) || 1,
    };
  }

  /**
   * Lấy chi tiết phiếu yêu cầu kèm toàn bộ lịch sử trạng thái, linh kiện thay thế và hình ảnh
   */
  async findById(id) {
    const sql = `
      SELECT mr.*,
             CASE
               WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() > mr.due_at THEN 1
               WHEN mr.completed_at IS NOT NULL AND mr.completed_at > mr.due_at THEN 1
               ELSE 0
             END AS is_overdue,
             CASE
               WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() <= mr.due_at AND TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) <= 120 THEN 1
               ELSE 0
             END AS is_due_soon,
             TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) AS minutes_remaining,
             d.code AS device_code, d.name AS device_name, d.model AS device_model, d.serial_number AS device_serial, d.qr_token, d.status AS device_status,
             dt.name AS device_type_name, dt.code AS device_type_code,
             loc.code AS location_code, loc.room_name, loc.floor,
             b.id AS building_id, b.code AS building_code, b.name AS building_name,
             dept.name AS department_name,
             rep.username AS reporter_username, rep.full_name AS reporter_name, rep.email AS reporter_email, rep.phone AS reporter_phone,
             tech.username AS technician_username, tech.full_name AS technician_name, tech.phone AS technician_phone, tech.email AS technician_email
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      JOIN users rep ON mr.reporter_id = rep.id
      LEFT JOIN users tech ON mr.technician_id = tech.id
      WHERE mr.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    if (!rows[0]) return null;

    const request = rows[0];

    // Lấy lịch sử chuyển đổi trạng thái (Timeline)
    const [histories] = await pool.execute(`
      SELECT mh.*, u.full_name AS actor_name, u.username AS actor_username, r.name AS actor_role_name
      FROM maintenance_histories mh
      JOIN users u ON mh.actor_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE mh.request_id = ?
      ORDER BY mh.created_at ASC
    `, [id]);

    // Lấy danh sách linh kiện thay thế
    const [parts] = await pool.execute(`
      SELECT * FROM maintenance_parts WHERE request_id = ? ORDER BY id ASC
    `, [id]);

    // Lấy danh sách ảnh đính kèm
    const [attachments] = await pool.execute(`
      SELECT * FROM attachments WHERE entity_type = 'MAINTENANCE_REQUEST' AND entity_id = ? ORDER BY id ASC
    `, [id]);

    return {
      ...request,
      histories,
      parts,
      attachments,
    };
  }

  /**
   * Tạo phiếu yêu cầu bảo trì mới và tự động tính toán hạn chót SLA (due_at)
   */
  async create({
    code,
    deviceId,
    reporterId,
    title,
    description,
    priority = 'MEDIUM',
    status = 'PENDING',
  }) {
    const slaMap = {
      LOW: 72,
      MEDIUM: 24,
      HIGH: 8,
      URGENT: 4,
    };
    const cleanPriority = (priority || 'MEDIUM').toUpperCase();
    const slaHours = slaMap[cleanPriority] || 24;

    const sql = `
      INSERT INTO maintenance_requests (
        code, device_id, reporter_id, title, description, priority, sla_hours, due_at, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR), ?)
    `;
    const [result] = await pool.execute(sql, [
      code,
      deviceId,
      reporterId,
      title.trim(),
      description.trim(),
      cleanPriority,
      slaHours,
      slaHours,
      status || 'PENDING',
    ]);
    return result.insertId;
  }

  /**
   * Phân công Kỹ thuật viên (Manager/Admin assign technician)
   */
  async assignTechnician(requestId, technicianId) {
    const sql = `
      UPDATE maintenance_requests
      SET technician_id = ?,
          status = 'ASSIGNED',
          assigned_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await pool.execute(sql, [technicianId, requestId]);
  }

  /**
   * Cập nhật trạng thái phiếu và các trường mốc thời gian tương ứng
   */
  async updateWorkflowStatus(requestId, {
    status,
    startedAt = undefined,
    completedAt = undefined,
    closedAt = undefined,
    resolution = undefined,
    rootCause = undefined,
    actualCost = undefined,
  }) {
    const setClauses = ['status = ?'];
    const params = [status];

    if (startedAt !== undefined) {
      setClauses.push('started_at = ?');
      params.push(startedAt);
    }
    if (completedAt !== undefined) {
      setClauses.push('completed_at = ?');
      params.push(completedAt);
    }
    if (closedAt !== undefined) {
      setClauses.push('closed_at = ?');
      params.push(closedAt);
    }
    if (resolution !== undefined) {
      setClauses.push('resolution = ?');
      params.push(resolution);
    }
    if (rootCause !== undefined) {
      setClauses.push('root_cause = ?');
      params.push(rootCause);
    }
    if (actualCost !== undefined) {
      setClauses.push('actual_cost = ?');
      params.push(actualCost);
    }

    params.push(requestId);
    const sql = `UPDATE maintenance_requests SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.execute(sql, params);
  }

  /**
   * Thêm danh sách linh kiện thay thế vào bảng maintenance_parts
   */
  async addParts(requestId, parts = []) {
    if (!parts || parts.length === 0) return;

    for (const part of parts) {
      const sql = `
        INSERT INTO maintenance_parts (request_id, part_name, part_code, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
      `;
      await pool.execute(sql, [
        requestId,
        part.partName.trim(),
        part.partCode ? part.partCode.trim() : null,
        Math.max(1, parseInt(part.quantity, 10) || 1),
        Math.max(0, parseFloat(part.unitPrice) || 0),
      ]);
    }
  }

  /**
   * Ghi log lịch sử trạng thái
   */
  async addHistory({
    requestId,
    actorId,
    fromStatus,
    toStatus,
    action,
    notes = null,
    cost = 0,
  }) {
    const sql = `
      INSERT INTO maintenance_histories (
        request_id, actor_id, from_status, to_status, action, notes, cost
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      requestId,
      actorId,
      fromStatus || null,
      toStatus,
      action,
      notes || null,
      cost || 0,
    ]);
    return result.insertId;
  }

  /**
   * Lưu tệp/ảnh đính kèm
   */
  async addAttachment({
    entityType = 'MAINTENANCE_REQUEST',
    entityId,
    fileName,
    filePath,
    fileType,
    fileSize,
    uploadedBy,
  }) {
    const sql = `
      INSERT INTO attachments (
        entity_type, entity_id, file_name, file_path, file_type, file_size, uploaded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      entityType,
      entityId,
      fileName,
      filePath,
      fileType || 'image/jpeg',
      fileSize || 0,
      uploadedBy,
    ]);
    return result.insertId;
  }

  /**
   * Lấy số liệu thống kê Dashboard cho Kỹ thuật viên (Technician KPI & SLA Metrics)
   */
  async getTechnicianStats(technicianId = null) {
    const techFilter = technicianId ? 'AND mr.technician_id = ?' : '';
    const techParams = technicianId ? [technicianId] : [];

    // 1. Ticket mới cần tiếp nhận (PENDING toàn trường)
    const [newRows] = await pool.execute(`
      SELECT COUNT(*) AS count FROM maintenance_requests WHERE status = 'PENDING'
    `);
    const newTickets = newRows[0]?.count || 0;

    // 2. Ticket được giao cho KTV (ASSIGNED)
    const [assignedRows] = await pool.execute(`
      SELECT COUNT(*) AS count FROM maintenance_requests mr
      WHERE mr.status = 'ASSIGNED' ${techFilter}
    `, techParams);
    const assignedTickets = assignedRows[0]?.count || 0;

    // 3. Ticket đang xử lý / chờ linh kiện (IN_PROGRESS, WAITING_PART, REOPENED)
    const [inProgressRows] = await pool.execute(`
      SELECT COUNT(*) AS count FROM maintenance_requests mr
      WHERE mr.status IN ('IN_PROGRESS', 'WAITING_PART', 'REOPENED') ${techFilter}
    `, techParams);
    const inProgressTickets = inProgressRows[0]?.count || 0;

    // 4. Ticket SẮP QUÁ HẠN SLA (Còn dưới 2 tiếng hoặc 120 phút)
    const [dueSoonRows] = await pool.execute(`
      SELECT COUNT(*) AS count FROM maintenance_requests mr
      WHERE mr.status NOT IN ('COMPLETED', 'CLOSED')
        AND NOW() <= mr.due_at
        AND TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) <= 120
        ${techFilter}
    `, techParams);
    const dueSoonTickets = dueSoonRows[0]?.count || 0;

    // 5. Ticket ĐÃ QUÁ HẠN SLA (NOW() > due_at và chưa xong)
    const [overdueRows] = await pool.execute(`
      SELECT COUNT(*) AS count FROM maintenance_requests mr
      WHERE mr.status NOT IN ('COMPLETED', 'CLOSED')
        AND NOW() > mr.due_at
        ${techFilter}
    `, techParams);
    const overdueTickets = overdueRows[0]?.count || 0;

    // 6. Ticket đã hoàn thành (COMPLETED, CLOSED)
    const [completedRows] = await pool.execute(`
      SELECT COUNT(*) AS count FROM maintenance_requests mr
      WHERE mr.status IN ('COMPLETED', 'CLOSED') ${techFilter}
    `, techParams);
    const completedTickets = completedRows[0]?.count || 0;

    // 7. Tỷ lệ tuân thủ SLA (%) & Thời gian xử lý trung bình
    const [slaRows] = await pool.execute(`
      SELECT
        COUNT(CASE WHEN (mr.completed_at IS NOT NULL AND mr.completed_at <= mr.due_at) OR (mr.closed_at IS NOT NULL AND mr.closed_at <= mr.due_at) THEN 1 END) AS on_time_count,
        ROUND(AVG(CASE WHEN mr.started_at IS NOT NULL AND mr.completed_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, mr.started_at, mr.completed_at) / 60.0 END), 1) AS avg_hours
      FROM maintenance_requests mr
      WHERE mr.status IN ('COMPLETED', 'CLOSED') ${techFilter}
    `, techParams);

    const onTimeCount = slaRows[0]?.on_time_count || 0;
    const avgResolutionHours = Number(slaRows[0]?.avg_hours || 0);
    const slaComplianceRate = completedTickets > 0
      ? Number(((onTimeCount / completedTickets) * 100).toFixed(1))
      : 100.0;

    return {
      newTickets: Number(newTickets),
      assignedTickets: Number(assignedTickets),
      inProgressTickets: Number(inProgressTickets),
      dueSoonTickets: Number(dueSoonTickets),
      overdueTickets: Number(overdueTickets),
      completedTickets: Number(completedTickets),
      slaComplianceRate,
      avgResolutionHours,
    };
  }

  /**
   * Lấy danh sách kỹ thuật viên khả dụng kèm số lượng ticket đang xử lý
   */
  async getActiveTechnicians() {
    const sql = `
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.status,
             COUNT(CASE WHEN mr.status IN ('ASSIGNED', 'IN_PROGRESS', 'WAITING_PART') THEN 1 END) AS active_tickets_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN maintenance_requests mr ON u.id = mr.technician_id
      WHERE r.code = 'TECHNICIAN' AND u.status = 'ACTIVE'
      GROUP BY u.id
      ORDER BY active_tickets_count ASC, u.full_name ASC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
  }
}

module.exports = new MaintenanceRepository();
