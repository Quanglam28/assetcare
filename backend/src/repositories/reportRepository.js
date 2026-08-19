const { pool } = require('../config/db');

/**
 * Repository tổng hợp 7 loại báo cáo quản trị chuyên sâu
 */
class ReportRepository {
  /**
   * 1. Báo cáo kiểm kê thiết bị & tài sản (Device Inventory Report)
   */
  async getDeviceInventoryReport(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(filters.buildingId));
    }
    if (filters.locationId) {
      conditions.push('d.location_id = ?');
      params.push(Number(filters.locationId));
    }
    if (filters.deviceTypeId) {
      conditions.push('d.device_type_id = ?');
      params.push(Number(filters.deviceTypeId));
    }
    if (filters.status) {
      conditions.push('d.status = ?');
      params.push(filters.status.toUpperCase());
    }
    if (filters.startDate) {
      conditions.push('d.purchase_date >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('d.purchase_date <= ?');
      params.push(filters.endDate);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT
        d.code AS device_code,
        d.name AS device_name,
        dt.name AS device_type_name,
        d.model,
        d.serial_number,
        loc.room_name,
        b.name AS building_name,
        dep.name AS department_name,
        sup.name AS supplier_name,
        d.purchase_price,
        d.purchase_date,
        d.warranty_start,
        d.warranty_end,
        d.status AS device_status,
        COALESCE(h.health_score, 100.0) AS health_score,
        COALESCE(h.health_status, 'GOOD') AS health_status,
        COALESCE(r.risk_score, 0.0) AS risk_score,
        COALESCE(r.risk_level, 'VERY_LOW') AS risk_level,
        COALESCE(r.recommendation_action, 'MONITOR_ASSET') AS recommendation_action,
        d.created_at
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dep ON d.department_id = dep.id
      LEFT JOIN suppliers sup ON d.supplier_id = sup.id
      LEFT JOIN asset_health_scores h ON d.id = h.device_id
      LEFT JOIN asset_risk_assessments r ON d.id = r.device_id
      ${whereSql}
      ORDER BY b.name ASC, loc.room_name ASC, d.code ASC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 2. Báo cáo tổng hợp sự cố & bảo trì (Maintenance Report)
   */
  async getMaintenanceReport(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.startDate) {
      conditions.push('mr.created_at >= ?');
      params.push(`${filters.startDate} 00:00:00`);
    }
    if (filters.endDate) {
      conditions.push('mr.created_at <= ?');
      params.push(`${filters.endDate} 23:59:59`);
    }
    if (filters.status) {
      conditions.push('mr.status = ?');
      params.push(filters.status.toUpperCase());
    }
    if (filters.priority) {
      conditions.push('mr.priority = ?');
      params.push(filters.priority.toUpperCase());
    }
    if (filters.deviceId) {
      conditions.push('mr.device_id = ?');
      params.push(Number(filters.deviceId));
    }
    if (filters.technicianId) {
      conditions.push('mr.technician_id = ?');
      params.push(Number(filters.technicianId));
    }
    if (filters.buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(filters.buildingId));
    }
    if (filters.locationId) {
      conditions.push('d.location_id = ?');
      params.push(Number(filters.locationId));
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT
        mr.code AS request_code,
        mr.title AS request_title,
        d.code AS device_code,
        d.name AS device_name,
        loc.room_name,
        b.name AS building_name,
        u_rep.full_name AS reporter_name,
        u_tech.full_name AS technician_name,
        mr.priority,
        mr.status AS request_status,
        mr.created_at,
        mr.started_at,
        mr.completed_at,
        mr.closed_at,
        TIMESTAMPDIFF(HOUR, mr.started_at, mr.completed_at) AS resolution_hours,
        mr.actual_cost,
        mr.root_cause,
        mr.resolution
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN users u_rep ON mr.reporter_id = u_rep.id
      LEFT JOIN users u_tech ON mr.technician_id = u_tech.id
      ${whereSql}
      ORDER BY mr.created_at DESC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 3. Báo cáo chi phí bảo trì & linh kiện thay thế (Maintenance Cost Report)
   */
  async getMaintenanceCostReport(filters = {}) {
    const conditions = ["mr.status IN ('COMPLETED', 'CLOSED')"];
    const params = [];

    if (filters.startDate) {
      conditions.push('mr.completed_at >= ?');
      params.push(`${filters.startDate} 00:00:00`);
    }
    if (filters.endDate) {
      conditions.push('mr.completed_at <= ?');
      params.push(`${filters.endDate} 23:59:59`);
    }
    if (filters.deviceId) {
      conditions.push('mr.device_id = ?');
      params.push(Number(filters.deviceId));
    }
    if (filters.buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(filters.buildingId));
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;
    const sql = `
      SELECT
        mr.code AS request_code,
        d.code AS device_code,
        d.name AS device_name,
        loc.room_name,
        b.name AS building_name,
        u_tech.full_name AS technician_name,
        mr.completed_at,
        mp.part_name,
        mp.part_code,
        COALESCE(mp.quantity, 1) AS quantity,
        COALESCE(mp.unit_price, 0) AS unit_price,
        COALESCE(mp.total_price, 0) AS part_total_cost,
        mr.actual_cost AS request_total_cost
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN users u_tech ON mr.technician_id = u_tech.id
      LEFT JOIN maintenance_parts mp ON mr.id = mp.request_id
      ${whereSql}
      ORDER BY mr.completed_at DESC, mr.id DESC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 4. Báo cáo hiệu suất kỹ thuật viên (Technician Performance Report)
   */
  async getTechnicianPerformanceReport(filters = {}) {
    const conditions = ["u.status = 'ACTIVE'"];
    const params = [];

    if (filters.technicianId) {
      conditions.push('u.id = ?');
      params.push(Number(filters.technicianId));
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;
    const sql = `
      SELECT
        u.id AS technician_id,
        u.username,
        u.full_name AS technician_name,
        u.phone AS technician_phone,
        u.email AS technician_email,
        COUNT(mr.id) AS total_assigned_tickets,
        COUNT(CASE WHEN mr.status = 'COMPLETED' THEN 1 END) AS completed_tickets,
        COUNT(CASE WHEN mr.status = 'CLOSED' THEN 1 END) AS closed_tickets,
        COUNT(CASE WHEN mr.status IN ('IN_PROGRESS', 'WAITING_PART', 'REOPENED') THEN 1 END) AS in_progress_tickets,
        COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND TIMESTAMPDIFF(HOUR, mr.created_at, NOW()) >= 48 THEN 1 END) AS overdue_tickets,
        ROUND(AVG(CASE WHEN mr.started_at IS NOT NULL AND mr.completed_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, mr.started_at, mr.completed_at) END), 1) AS avg_resolution_hours,
        COALESCE(SUM(mr.actual_cost), 0) AS total_repair_cost,
        CASE
          WHEN COUNT(mr.id) > 0 THEN ROUND((COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') THEN 1 END) / COUNT(mr.id)) * 100, 1)
          ELSE 100.0
        END AS completion_rate
      FROM users u
      JOIN roles r ON u.role_id = r.id AND r.code = 'TECHNICIAN'
      LEFT JOIN maintenance_requests mr ON u.id = mr.technician_id
      ${whereSql}
      GROUP BY u.id, u.username, u.full_name, u.phone, u.email
      ORDER BY completed_tickets DESC, total_assigned_tickets DESC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 5. Báo cáo tần suất sự cố theo thiết bị (Device Incident Frequency)
   */
  async getDeviceIncidentFrequencyReport(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(filters.buildingId));
    }
    if (filters.deviceTypeId) {
      conditions.push('d.device_type_id = ?');
      params.push(Number(filters.deviceTypeId));
    }
    if (filters.startDate) {
      conditions.push('mr.created_at >= ?');
      params.push(`${filters.startDate} 00:00:00`);
    }
    if (filters.endDate) {
      conditions.push('mr.created_at <= ?');
      params.push(`${filters.endDate} 23:59:59`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT
        d.id AS device_id,
        d.code AS device_code,
        d.name AS device_name,
        d.model,
        dt.name AS device_type_name,
        loc.room_name,
        b.name AS building_name,
        d.status AS device_status,
        COUNT(mr.id) AS incident_count,
        COALESCE(SUM(mr.actual_cost), 0) AS total_maintenance_cost,
        MAX(mr.created_at) AS last_incident_date
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN maintenance_requests mr ON d.id = mr.device_id
      ${whereSql}
      GROUP BY d.id, d.code, d.name, d.model, dt.name, loc.room_name, b.name, d.status
      ORDER BY incident_count DESC, total_maintenance_cost DESC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 6. Báo cáo thời hạn bảo hành thiết bị (Warranty Expiration Report)
   */
  async getWarrantyExpirationReport(filters = {}) {
    const conditions = ['d.warranty_end IS NOT NULL'];
    const params = [];

    if (filters.buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(filters.buildingId));
    }
    if (filters.deviceTypeId) {
      conditions.push('d.device_type_id = ?');
      params.push(Number(filters.deviceTypeId));
    }
    if (filters.status) {
      if (filters.status === 'EXPIRED') {
        conditions.push('d.warranty_end < CURDATE()');
      } else if (filters.status === 'EXPIRING_SOON') {
        conditions.push('d.warranty_end BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
      } else if (filters.status === 'VALID') {
        conditions.push('d.warranty_end > DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
      }
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;
    const sql = `
      SELECT
        d.code AS device_code,
        d.name AS device_name,
        dt.name AS device_type_name,
        sup.name AS supplier_name,
        sup.phone AS supplier_phone,
        loc.room_name,
        b.name AS building_name,
        d.purchase_date,
        d.warranty_start,
        d.warranty_end,
        DATEDIFF(d.warranty_end, CURDATE()) AS days_remaining,
        CASE
          WHEN d.warranty_end < CURDATE() THEN 'EXPIRED'
          WHEN d.warranty_end BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'EXPIRING_SOON'
          ELSE 'VALID'
        END AS warranty_status,
        d.status AS device_status
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN suppliers sup ON d.supplier_id = sup.id
      ${whereSql}
      ORDER BY d.warranty_end ASC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 7. Báo cáo kế hoạch bảo dưỡng định kỳ (Scheduled Maintenance Report)
   */
  async getScheduledMaintenanceReport(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.frequency) {
      conditions.push('ms.frequency = ?');
      params.push(filters.frequency.toUpperCase());
    }
    if (filters.status) {
      conditions.push('ms.status = ?');
      params.push(filters.status.toUpperCase());
    }
    if (filters.technicianId) {
      conditions.push('ms.assigned_technician_id = ?');
      params.push(Number(filters.technicianId));
    }
    if (filters.buildingId) {
      conditions.push('loc.building_id = ?');
      params.push(Number(filters.buildingId));
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT
        ms.title AS schedule_title,
        d.code AS device_code,
        d.name AS device_name,
        dt.name AS device_type_name,
        loc.room_name,
        b.name AS building_name,
        ms.frequency,
        ms.scheduled_date,
        ms.next_run_date,
        ms.last_performed_at,
        u_tech.full_name AS technician_name,
        ms.status AS schedule_status,
        CASE
          WHEN ms.status = 'COMPLETED' THEN 'COMPLETED'
          WHEN ms.scheduled_date < CURDATE() THEN 'OVERDUE'
          WHEN ms.scheduled_date = CURDATE() THEN 'DUE'
          ELSE 'UPCOMING'
        END AS alert_status,
        ms.notes
      FROM maintenance_schedules ms
      JOIN devices d ON ms.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN users u_tech ON ms.assigned_technician_id = u_tech.id
      ${whereSql}
      ORDER BY ms.scheduled_date ASC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

module.exports = new ReportRepository();
