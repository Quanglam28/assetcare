const { pool } = require('../config/db');

/**
 * Repository thao tác dữ liệu thiết bị (Devices) với MySQL (asset_maintenance_system)
 */
class DeviceRepository {
  /**
   * Lấy danh sách thiết bị kèm phân trang, tìm kiếm, lọc đa tiêu chí và sắp xếp
   */
  async findAll({
    page = 1,
    limit = 10,
    search = '',
    deviceTypeId = null,
    locationId = null,
    buildingId = null,
    departmentId = null,
    supplierId = null,
    status = '',
    healthStatus = '',
    riskLevel = '',
    dataQuality = '',
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = {}) {
    const numLimit = Math.max(1, parseInt(limit, 10) || 10);
    const numPage = Math.max(1, parseInt(page, 10) || 1);
    const numOffset = (numPage - 1) * numLimit;

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(d.code LIKE ? OR d.name LIKE ? OR d.model LIKE ? OR d.serial_number LIKE ? OR loc.room_name LIKE ? OR d.qr_token LIKE ?)');
      const p = `%${search.trim()}%`;
      params.push(p, p, p, p, p, p);
    }

    if (deviceTypeId) {
      conditions.push('d.device_type_id = ?');
      params.push(Number(deviceTypeId));
    }

    if (locationId) {
      conditions.push('d.location_id = ?');
      params.push(Number(locationId));
    }

    if (buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(buildingId));
    }

    if (departmentId) {
      conditions.push('d.department_id = ?');
      params.push(Number(departmentId));
    }

    if (supplierId) {
      conditions.push('d.supplier_id = ?');
      params.push(Number(supplierId));
    }

    if (status && status.trim() !== '') {
      conditions.push('d.status = ?');
      params.push(status.trim().toUpperCase());
    }

    if (healthStatus && healthStatus.trim() !== '') {
      conditions.push('h.health_status = ?');
      params.push(healthStatus.trim().toUpperCase());
    }

    if (riskLevel && riskLevel.trim() !== '') {
      conditions.push('r.risk_level = ?');
      params.push(riskLevel.trim().toUpperCase());
    }

    if (dataQuality === 'INSUFFICIENT') {
      conditions.push('(h.data_completeness < 70 OR h.health_status = "INSUFFICIENT_DATA")');
    } else if (dataQuality === 'COMPLETE') {
      conditions.push('(h.data_completeness >= 70 AND h.health_status != "INSUFFICIENT_DATA")');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sortBy column
    const allowedSortColumns = {
      id: 'd.id',
      code: 'd.code',
      name: 'd.name',
      purchase_date: 'd.purchase_date',
      purchase_price: 'd.purchase_price',
      warranty_end: 'd.warranty_end',
      status: 'd.status',
      created_at: 'd.created_at',
      health_score: 'h.health_score',
      risk_score: 'r.risk_score',
    };
    const orderColumn = allowedSortColumns[sortBy] || 'd.created_at';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Đếm tổng số thiết bị
    const countSql = `
      SELECT COUNT(*) AS total
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN suppliers s ON d.supplier_id = s.id
      LEFT JOIN asset_health_scores h ON d.id = h.device_id
      LEFT JOIN asset_risk_assessments r ON d.id = r.device_id
      ${whereClause}
    `;
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0]?.total || 0;

    // Lấy dữ liệu chi tiết
    const dataSql = `
      SELECT d.*,
             dt.code AS device_type_code, dt.name AS device_type_name, dt.category AS device_category,
             loc.code AS location_code, loc.room_name, loc.floor,
             b.id AS building_id, b.code AS building_code, b.name AS building_name,
             dept.code AS department_code, dept.name AS department_name,
             s.code AS supplier_code, s.name AS supplier_name,
             COALESCE(h.health_score, 100.0) AS health_score,
             COALESCE(h.health_status, 'GOOD') AS health_status,
             COALESCE(h.data_completeness, 100.0) AS data_completeness,
             COALESCE(r.risk_score, 0.0) AS risk_score,
             COALESCE(r.risk_level, 'VERY_LOW') AS risk_level,
             COALESCE(r.recommendation_action, 'MONITOR_ASSET') AS recommendation_action,
             COALESCE(r.replacement_indicator, 'CONTINUE_MONITORING') AS replacement_indicator,
             (SELECT COUNT(*) FROM maintenance_requests mr WHERE mr.device_id = d.id) AS total_maintenance_requests,
             (SELECT COUNT(*) FROM maintenance_requests mr WHERE mr.device_id = d.id AND mr.status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART')) AS active_requests_count
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN suppliers s ON d.supplier_id = s.id
      LEFT JOIN asset_health_scores h ON d.id = h.device_id
      LEFT JOIN asset_risk_assessments r ON d.id = r.device_id
      ${whereClause}
      ORDER BY ${orderColumn} ${orderDirection}
      LIMIT ${numLimit} OFFSET ${numOffset}
    `;
    const [rows] = await pool.execute(dataSql, params);

    return {
      devices: rows,
      total: Number(total),
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit) || 1,
    };
  }

  /**
   * Lấy chi tiết một thiết bị theo ID
   */
  async findById(id) {
    const sql = `
      SELECT d.*,
             dt.code AS device_type_code, dt.name AS device_type_name, dt.category AS device_category, dt.maintenance_interval_days,
             loc.code AS location_code, loc.room_name, loc.floor, loc.type AS location_type,
             b.id AS building_id, b.code AS building_code, b.name AS building_name, b.address AS building_address,
             dept.code AS department_code, dept.name AS department_name, dept.phone AS department_phone,
             s.code AS supplier_code, s.name AS supplier_name, s.contact_person AS supplier_contact, s.phone AS supplier_phone, s.email AS supplier_email,
             (SELECT COUNT(*) FROM maintenance_requests mr WHERE mr.device_id = d.id) AS total_maintenance_requests
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN suppliers s ON d.supplier_id = s.id
      WHERE d.id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Tìm thiết bị theo mã QR Token
   */
  async findByQrToken(qrToken) {
    const tokenClean = String(qrToken).trim();
    const sql = `
      SELECT d.*,
             dt.code AS device_type_code, dt.name AS device_type_name, dt.category AS device_category,
             loc.code AS location_code, loc.room_name, loc.floor,
             b.id AS building_id, b.code AS building_code, b.name AS building_name,
             dept.code AS department_code, dept.name AS department_name,
             s.code AS supplier_code, s.name AS supplier_name
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN suppliers s ON d.supplier_id = s.id
      WHERE d.qr_token = ? OR d.code = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [tokenClean, tokenClean]);
    return rows[0] || null;
  }

  /**
   * Tìm thiết bị theo mã nghiệp vụ code
   */
  async findByCode(code) {
    const sql = `SELECT * FROM devices WHERE code = ? LIMIT 1`;
    const [rows] = await pool.execute(sql, [code]);
    return rows[0] || null;
  }

  /**
   * Lấy lịch sử bảo trì & các phiếu sửa chữa của thiết bị
   */
  async findMaintenanceHistory(deviceId) {
    const sql = `
      SELECT mr.*,
             rep.full_name AS reporter_name, rep.username AS reporter_username, rep.email AS reporter_email,
             tech.full_name AS technician_name, tech.username AS technician_username, tech.phone AS technician_phone
      FROM maintenance_requests mr
      JOIN users rep ON mr.reporter_id = rep.id
      LEFT JOIN users tech ON mr.technician_id = tech.id
      WHERE mr.device_id = ?
      ORDER BY mr.created_at DESC
    `;
    const [rows] = await pool.execute(sql, [deviceId]);
    return rows;
  }

  /**
   * Lấy thông tin công khai (Public non-sensitive) của thiết bị cho trang quét QR Code
   */
  async findPublicByQrToken(qrToken) {
    const tokenClean = String(qrToken).trim();
    const sql = `
      SELECT d.id, d.code, d.name, d.model, d.status, d.qr_token, d.warranty_end,
             dt.code AS device_type_code, dt.name AS device_type_name, dt.category AS device_category,
             loc.code AS location_code, loc.room_name, loc.floor, loc.type AS location_type,
             b.code AS building_code, b.name AS building_name, b.address AS building_address,
             dept.name AS department_name,
             (SELECT COUNT(*) FROM maintenance_requests mr WHERE mr.device_id = d.id) AS total_maintenance_requests
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE d.qr_token = ? OR d.code = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [tokenClean, tokenClean]);
    return rows[0] || null;
  }

  /**
   * Lấy lần bảo trì gần nhất của thiết bị
   */
  async findLastMaintenance(deviceId) {
    const sql = `
      SELECT mr.id, mr.code, mr.title, mr.status, mr.completed_at, mr.created_at, mr.resolution,
             tech.full_name AS technician_name
      FROM maintenance_requests mr
      LEFT JOIN users tech ON mr.technician_id = tech.id
      WHERE mr.device_id = ?
      ORDER BY mr.created_at DESC
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [deviceId]);
    return rows[0] || null;
  }

  /**
   * Đếm số lượng phiếu bảo trì liên quan đến thiết bị
   */
  async countMaintenanceRequests(deviceId) {
    const sql = `SELECT COUNT(*) AS total FROM maintenance_requests WHERE device_id = ?`;
    const [rows] = await pool.execute(sql, [deviceId]);
    return rows[0]?.total || 0;
  }

  /**
   * Tạo mới thiết bị
   */
  async create({
    code,
    name,
    deviceTypeId,
    locationId,
    departmentId,
    supplierId,
    model,
    serialNumber,
    purchaseDate,
    purchasePrice,
    warrantyStart,
    warrantyEnd,
    status = 'ACTIVE',
    description,
    qrToken,
  }) {
    const sql = `
      INSERT INTO devices (
        code, name, device_type_id, location_id, department_id, supplier_id,
        model, serial_number, purchase_date, purchase_price, warranty_start, warranty_end,
        status, description, qr_token
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      code.trim().toUpperCase(),
      name.trim(),
      deviceTypeId,
      locationId,
      departmentId || null,
      supplierId || null,
      model?.trim() || null,
      serialNumber?.trim() || null,
      purchaseDate || null,
      purchasePrice || 0,
      warrantyStart || null,
      warrantyEnd || null,
      status || 'ACTIVE',
      description?.trim() || null,
      qrToken.trim(),
    ]);
    return result.insertId;
  }

  /**
   * Cập nhật thông tin thiết bị
   */
  async update(id, {
    name,
    deviceTypeId,
    locationId,
    departmentId,
    supplierId,
    model,
    serialNumber,
    purchaseDate,
    purchasePrice,
    warrantyStart,
    warrantyEnd,
    status,
    description,
  }) {
    const sql = `
      UPDATE devices
      SET name = COALESCE(?, name),
          device_type_id = COALESCE(?, device_type_id),
          location_id = COALESCE(?, location_id),
          department_id = ?,
          supplier_id = ?,
          model = ?,
          serial_number = ?,
          purchase_date = ?,
          purchase_price = COALESCE(?, purchase_price),
          warranty_start = ?,
          warranty_end = ?,
          status = COALESCE(?, status),
          description = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      name ? name.trim() : null,
      deviceTypeId || null,
      locationId || null,
      departmentId !== undefined ? departmentId : null,
      supplierId !== undefined ? supplierId : null,
      model !== undefined ? (model?.trim() || null) : null,
      serialNumber !== undefined ? (serialNumber?.trim() || null) : null,
      purchaseDate !== undefined ? purchaseDate : null,
      purchasePrice !== undefined ? purchasePrice : null,
      warrantyStart !== undefined ? warrantyStart : null,
      warrantyEnd !== undefined ? warrantyEnd : null,
      status || null,
      description !== undefined ? (description?.trim() || null) : null,
      id,
    ]);
    return result.affectedRows > 0;
  }

  /**
   * Cập nhật trạng thái thiết bị (ACTIVE, MAINTENANCE, BROKEN, RETIRED)
   */
  async updateStatus(id, status) {
    const sql = `UPDATE devices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const [result] = await pool.execute(sql, [status, id]);
    return result.affectedRows > 0;
  }

  /**
   * Truy vấn toàn bộ dữ liệu chỉ số phục vụ Phân tích Tình trạng Sức khỏe Thiết bị (Module 14: Asset Health Analytics)
   */
  async getAssetHealthData(id) {
    const deviceSql = `
      SELECT d.*,
             dt.name AS device_type_name,
             loc.room_name, b.name AS building_name,
             TIMESTAMPDIFF(MONTH, COALESCE(d.purchase_date, d.created_at), NOW()) AS age_months,
             DATEDIFF(NOW(), COALESCE(d.purchase_date, d.created_at)) AS age_days
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      WHERE d.id = ?
    `;
    const [devRows] = await pool.execute(deviceSql, [id]);
    if (!devRows || devRows.length === 0) return null;
    const device = devRows[0];

    // Thống kê sự cố & sửa chữa từ maintenance_requests
    const maintSql = `
      SELECT
        COUNT(*) AS total_incidents,
        COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') THEN 1 END) AS completed_repairs,
        COUNT(CASE WHEN mr.status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'REOPENED') THEN 1 END) AS open_incidents,
        COUNT(CASE WHEN mr.priority = 'URGENT' THEN 1 END) AS urgent_incidents,
        COUNT(CASE WHEN mr.priority = 'HIGH' THEN 1 END) AS high_incidents,
        COALESCE(SUM(mr.actual_cost), 0) AS total_repair_cost,
        COALESCE(SUM(
          CASE 
            WHEN mr.started_at IS NOT NULL AND mr.completed_at IS NOT NULL 
              THEN TIMESTAMPDIFF(HOUR, mr.started_at, mr.completed_at)
            WHEN mr.created_at IS NOT NULL AND mr.completed_at IS NOT NULL 
              THEN TIMESTAMPDIFF(HOUR, mr.created_at, mr.completed_at)
            WHEN mr.status NOT IN ('COMPLETED', 'CLOSED')
              THEN TIMESTAMPDIFF(HOUR, mr.created_at, NOW())
            ELSE 0
          END
        ), 0) AS total_downtime_hours
      FROM maintenance_requests mr
      WHERE mr.device_id = ?
    `;
    const [maintRows] = await pool.execute(maintSql, [id]);
    const maintStat = maintRows[0] || {};

    // Thống kê lịch bảo trì định kỳ từ maintenance_schedules
    const schedSql = `
      SELECT
        COUNT(*) AS total_schedules,
        COUNT(CASE WHEN ms.status = 'COMPLETED' THEN 1 END) AS completed_schedules,
        COUNT(CASE WHEN ms.status != 'COMPLETED' AND ms.scheduled_date < CURDATE() THEN 1 END) AS overdue_schedules,
        MAX(ms.last_performed_at) AS last_scheduled_maintenance
      FROM maintenance_schedules ms
      WHERE ms.device_id = ?
    `;
    const [schedRows] = await pool.execute(schedSql, [id]);
    const schedStat = schedRows[0] || {};

    return {
      device,
      maintStat,
      schedStat,
    };
  }

  /**
   * Xóa vật lý thiết bị (chỉ thực hiện khi không có ràng buộc lịch sử)
   */
  async delete(id) {
    const sql = `DELETE FROM devices WHERE id = ?`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new DeviceRepository();
