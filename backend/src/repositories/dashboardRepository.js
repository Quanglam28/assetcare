const { pool } = require('../config/db');

/**
 * Repository tổng hợp số liệu phân tích Dashboard & Biểu đồ từ CSDL
 */
class DashboardRepository {
  /**
   * Xây dựng câu điều kiện WHERE động cho các bảng dựa trên bộ lọc
   */
  _buildFilters(filters = {}, prefix = 'mr') {
    const conditions = [];
    const params = [];

    if (filters.startDate) {
      conditions.push(`${prefix}.created_at >= ?`);
      params.push(`${filters.startDate} 00:00:00`);
    }

    if (filters.endDate) {
      conditions.push(`${prefix}.created_at <= ?`);
      params.push(`${filters.endDate} 23:59:59`);
    }

    if (filters.status) {
      conditions.push(`${prefix}.status = ?`);
      params.push(filters.status.toUpperCase());
    }

    if (filters.priority) {
      conditions.push(`${prefix}.priority = ?`);
      params.push(filters.priority.toUpperCase());
    }

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

    return {
      whereSql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  /**
   * 8 Thẻ KPI Thống Kê Tổng Quan
   */
  async getOverviewStats(filters = {}) {
    // 1. Thống kê Thiết bị
    const devConditions = [];
    const devParams = [];

    if (filters.buildingId) {
      devConditions.push('loc.building_id = ?');
      devParams.push(Number(filters.buildingId));
    }
    if (filters.locationId) {
      devConditions.push('d.location_id = ?');
      devParams.push(Number(filters.locationId));
    }
    if (filters.deviceTypeId) {
      devConditions.push('d.device_type_id = ?');
      devParams.push(Number(filters.deviceTypeId));
    }

    const devWhere = devConditions.length > 0 ? `WHERE ${devConditions.join(' AND ')}` : '';
    const deviceSql = `
      SELECT
        COUNT(*) AS total_devices,
        COUNT(CASE WHEN d.status = 'ACTIVE' THEN 1 END) AS active_devices,
        COUNT(CASE WHEN d.status = 'BROKEN' THEN 1 END) AS broken_devices,
        COUNT(CASE WHEN d.status = 'MAINTENANCE' THEN 1 END) AS maintenance_devices,
        COUNT(CASE WHEN d.status = 'RETIRED' THEN 1 END) AS retired_devices
      FROM devices d
      JOIN locations loc ON d.location_id = loc.id
      ${devWhere}
    `;
    const [devRows] = await pool.execute(deviceSql, devParams);
    const dStat = devRows[0] || {};

    // 2. Thống kê Phiếu Bảo trì, SLA & Chi phí
    const { whereSql, params } = this._buildFilters(filters, 'mr');
    const ticketSql = `
      SELECT
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN mr.status IN ('PENDING', 'ASSIGNED') THEN 1 END) AS pending_tickets,
        COUNT(CASE WHEN mr.status IN ('IN_PROGRESS', 'WAITING_PART', 'REOPENED') THEN 1 END) AS in_progress_tickets,
        COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() > mr.due_at THEN 1 END) AS overdue_tickets,
        COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() <= mr.due_at AND TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) <= 120 THEN 1 END) AS due_soon_tickets,
        COUNT(CASE WHEN mr.status = 'COMPLETED' THEN 1 END) AS completed_tickets,
        COUNT(CASE WHEN mr.status = 'CLOSED' THEN 1 END) AS closed_tickets,
        COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') AND ((mr.completed_at IS NOT NULL AND mr.completed_at <= mr.due_at) OR (mr.closed_at IS NOT NULL AND mr.closed_at <= mr.due_at)) THEN 1 END) AS on_time_tickets,
        ROUND(AVG(CASE WHEN mr.started_at IS NOT NULL AND mr.completed_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, mr.started_at, mr.completed_at) / 60.0 END), 1) AS avg_resolution_hours,
        COALESCE(SUM(mr.actual_cost), 0) AS total_maintenance_cost
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereSql}
    `;
    const [ticketRows] = await pool.execute(ticketSql, params);
    const tStat = ticketRows[0] || {};

    const totalFinished = Number(tStat.completed_tickets || 0) + Number(tStat.closed_tickets || 0);
    const onTimeFinished = Number(tStat.on_time_tickets || 0);
    const slaComplianceRate = totalFinished > 0
      ? Number(((onTimeFinished / totalFinished) * 100).toFixed(1))
      : 100.0;

    return {
      totalDevices: Number(dStat.total_devices || 0),
      activeDevices: Number(dStat.active_devices || 0),
      brokenDevices: Number(dStat.broken_devices || 0),
      maintenanceDevices: Number(dStat.maintenance_devices || 0),
      retiredDevices: Number(dStat.retired_devices || 0),
      pendingTickets: Number(tStat.pending_tickets || 0),
      inProgressTickets: Number(tStat.in_progress_tickets || 0),
      overdueTickets: Number(tStat.overdue_tickets || 0),
      dueSoonTickets: Number(tStat.due_soon_tickets || 0),
      completedTickets: Number(tStat.completed_tickets || 0),
      closedTickets: Number(tStat.closed_tickets || 0),
      totalTickets: Number(tStat.total_tickets || 0),
      totalMaintenanceCost: Number(tStat.total_maintenance_cost || 0),
      slaComplianceRate,
      avgResolutionHours: Number(tStat.avg_resolution_hours || 0),
    };
  }

  /**
   * 1. Số lượng sự cố theo tháng (Requests by Month)
   */
  async getRequestsByMonth(filters = {}) {
    const { whereSql, params } = this._buildFilters(filters, 'mr');
    const sql = `
      SELECT
        DATE_FORMAT(mr.created_at, '%m/%Y') AS month_label,
        DATE_FORMAT(mr.created_at, '%Y-%m') AS sort_key,
        COUNT(*) AS count,
        COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') THEN 1 END) AS resolved_count
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereSql}
      GROUP BY DATE_FORMAT(mr.created_at, '%Y-%m'), DATE_FORMAT(mr.created_at, '%m/%Y')
      ORDER BY sort_key ASC
      LIMIT 12
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 2. Phân bổ sự cố theo trạng thái (Requests by Status)
   */
  async getRequestsByStatus(filters = {}) {
    const { whereSql, params } = this._buildFilters(filters, 'mr');
    const sql = `
      SELECT
        mr.status,
        COUNT(*) AS count
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereSql}
      GROUP BY mr.status
      ORDER BY count DESC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 3. Phân bổ sự cố theo mức độ ưu tiên (Requests by Priority)
   */
  async getRequestsByPriority(filters = {}) {
    const { whereSql, params } = this._buildFilters(filters, 'mr');
    const sql = `
      SELECT
        mr.priority,
        COUNT(*) AS count
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereSql}
      GROUP BY mr.priority
      ORDER BY FIELD(mr.priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW')
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 4. Cơ cấu thiết bị theo loại (Devices by Type)
   */
  async getDevicesByType(filters = {}) {
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

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT
        dt.id,
        dt.name AS type_name,
        dt.code AS type_code,
        COUNT(d.id) AS count
      FROM devices d
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereSql}
      GROUP BY dt.id, dt.name, dt.code
      ORDER BY count DESC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 5. Phân bổ thiết bị theo tòa nhà (Devices by Location / Building)
   */
  async getDevicesByBuilding(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.deviceTypeId) {
      conditions.push('d.device_type_id = ?');
      params.push(Number(filters.deviceTypeId));
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT
        b.id AS building_id,
        b.name AS building_name,
        b.code AS building_code,
        COUNT(d.id) AS device_count,
        COUNT(CASE WHEN d.status = 'ACTIVE' THEN 1 END) AS active_count,
        COUNT(CASE WHEN d.status = 'BROKEN' THEN 1 END) AS broken_count
      FROM devices d
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      ${whereSql}
      GROUP BY b.id, b.name, b.code
      ORDER BY device_count DESC
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 6. Chi phí bảo trì theo tháng (Maintenance Cost by Month)
   */
  async getMaintenanceCostByMonth(filters = {}) {
    const { whereSql, params } = this._buildFilters(filters, 'mr');
    const sql = `
      SELECT
        DATE_FORMAT(mr.created_at, '%m/%Y') AS month_label,
        DATE_FORMAT(mr.created_at, '%Y-%m') AS sort_key,
        COALESCE(SUM(mr.actual_cost), 0) AS total_cost,
        COUNT(*) AS ticket_count
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereSql}
      GROUP BY DATE_FORMAT(mr.created_at, '%Y-%m'), DATE_FORMAT(mr.created_at, '%m/%Y')
      ORDER BY sort_key ASC
      LIMIT 12
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 7. Top 10 thiết bị có nhiều sự cố nhất (Top Devices with Incidents)
   */
  async getTopDevicesWithIncidents(filters = {}, limit = 10) {
    const { whereSql, params } = this._buildFilters(filters, 'mr');
    const numLimit = Math.max(1, parseInt(limit, 10) || 10);
    const sql = `
      SELECT
        d.id,
        d.code AS device_code,
        d.name AS device_name,
        d.model AS device_model,
        dt.name AS device_type_name,
        loc.room_name,
        b.name AS building_name,
        COUNT(mr.id) AS incident_count,
        COALESCE(SUM(mr.actual_cost), 0) AS total_cost
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      ${whereSql}
      GROUP BY d.id, d.code, d.name, d.model, dt.name, loc.room_name, b.name
      ORDER BY incident_count DESC, total_cost DESC
      LIMIT ${numLimit}
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 8. Top địa điểm / phòng học có nhiều sự cố nhất (Top Locations with Incidents)
   */
  async getTopLocationsWithIncidents(filters = {}, limit = 10) {
    const { whereSql, params } = this._buildFilters(filters, 'mr');
    const numLimit = Math.max(1, parseInt(limit, 10) || 10);
    const sql = `
      SELECT
        loc.id,
        loc.code AS location_code,
        loc.room_name,
        loc.floor,
        b.name AS building_name,
        COUNT(mr.id) AS incident_count,
        COALESCE(SUM(mr.actual_cost), 0) AS total_cost
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      ${whereSql}
      GROUP BY loc.id, loc.code, loc.room_name, loc.floor, b.name
      ORDER BY incident_count DESC, total_cost DESC
      LIMIT ${numLimit}
    `;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 9. Thống kê chi tiết tuân thủ SLA (SLA Compliance Analytics)
   */
  async getSlaComplianceStats(filters = {}) {
    const { whereSql, params } = this._buildFilters(filters, 'mr');

    // 1. Phân bổ tuân thủ SLA theo Mức độ ưu tiên (By Priority)
    const prioritySql = `
      SELECT
        mr.priority,
        mr.sla_hours,
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') AND ((mr.completed_at IS NOT NULL AND mr.completed_at <= mr.due_at) OR (mr.closed_at IS NOT NULL AND mr.closed_at <= mr.due_at)) THEN 1 END) AS on_time_tickets,
        COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') AND ((mr.completed_at IS NOT NULL AND mr.completed_at > mr.due_at) OR (mr.closed_at IS NOT NULL AND mr.closed_at > mr.due_at)) THEN 1 END) AS overdue_completed_tickets,
        COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() > mr.due_at THEN 1 END) AS currently_overdue_tickets,
        COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() <= mr.due_at AND TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) <= 120 THEN 1 END) AS currently_due_soon_tickets,
        ROUND(AVG(CASE WHEN mr.started_at IS NOT NULL AND mr.completed_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, mr.started_at, mr.completed_at) / 60.0 END), 1) AS avg_hours
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      ${whereSql}
      GROUP BY mr.priority, mr.sla_hours
      ORDER BY FIELD(mr.priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW')
    `;
    const [byPriorityRows] = await pool.execute(prioritySql, params);

    const byPriority = byPriorityRows.map(row => {
      const completed = Number(row.on_time_tickets || 0) + Number(row.overdue_completed_tickets || 0);
      const onTime = Number(row.on_time_tickets || 0);
      return {
        priority: row.priority,
        slaHours: Number(row.sla_hours || 24),
        totalTickets: Number(row.total_tickets || 0),
        onTimeTickets: onTime,
        overdueCompletedTickets: Number(row.overdue_completed_tickets || 0),
        currentlyOverdueTickets: Number(row.currently_overdue_tickets || 0),
        currentlyDueSoonTickets: Number(row.currently_due_soon_tickets || 0),
        avgResolutionHours: Number(row.avg_hours || 0),
        complianceRate: completed > 0 ? Number(((onTime / completed) * 100).toFixed(1)) : 100.0,
      };
    });

    // 2. Phân bổ tuân thủ SLA theo Kỹ thuật viên (By Technician)
    const techSql = `
      SELECT
        u.id AS technician_id,
        u.full_name AS technician_name,
        u.username AS technician_username,
        COUNT(mr.id) AS total_assigned_tickets,
        COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') THEN 1 END) AS total_completed_tickets,
        COUNT(CASE WHEN mr.status IN ('COMPLETED', 'CLOSED') AND ((mr.completed_at IS NOT NULL AND mr.completed_at <= mr.due_at) OR (mr.closed_at IS NOT NULL AND mr.closed_at <= mr.due_at)) THEN 1 END) AS on_time_tickets,
        COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() > mr.due_at THEN 1 END) AS currently_overdue_tickets,
        COUNT(CASE WHEN mr.status NOT IN ('COMPLETED', 'CLOSED') AND NOW() <= mr.due_at AND TIMESTAMPDIFF(MINUTE, NOW(), mr.due_at) <= 120 THEN 1 END) AS currently_due_soon_tickets,
        ROUND(AVG(CASE WHEN mr.started_at IS NOT NULL AND mr.completed_at IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, mr.started_at, mr.completed_at) / 60.0 END), 1) AS avg_hours
      FROM users u
      JOIN roles r ON u.role_id = r.id AND r.code = 'TECHNICIAN'
      LEFT JOIN maintenance_requests mr ON u.id = mr.technician_id
      WHERE u.status = 'ACTIVE'
      GROUP BY u.id, u.full_name, u.username
      ORDER BY on_time_tickets DESC, total_assigned_tickets DESC
    `;
    const [byTechRows] = await pool.execute(techSql);

    const byTechnician = byTechRows.map(row => {
      const completed = Number(row.total_completed_tickets || 0);
      const onTime = Number(row.on_time_tickets || 0);
      return {
        technicianId: row.technician_id,
        technicianName: row.technician_name,
        technicianUsername: row.technician_username,
        totalAssignedTickets: Number(row.total_assigned_tickets || 0),
        completedTickets: completed,
        onTimeTickets: onTime,
        currentlyOverdueTickets: Number(row.currently_overdue_tickets || 0),
        currentlyDueSoonTickets: Number(row.currently_due_soon_tickets || 0),
        avgResolutionHours: Number(row.avg_hours || 0),
        complianceRate: completed > 0 ? Number(((onTime / completed) * 100).toFixed(1)) : 100.0,
      };
    });

    return {
      byPriority,
      byTechnician,
    };
  }

  /**
   * Lấy danh sách options cho bộ lọc đa chiều (Tòa nhà, Phòng học, Loại thiết bị)
   */
  async getFilterOptions() {
    const [buildings] = await pool.execute('SELECT id, code, name FROM buildings ORDER BY name ASC');
    const [locations] = await pool.execute('SELECT id, code, room_name, building_id FROM locations ORDER BY room_name ASC');
    const [deviceTypes] = await pool.execute('SELECT id, code, name FROM device_types ORDER BY name ASC');

    return {
      buildings,
      locations,
      deviceTypes,
    };
  }
}

module.exports = new DashboardRepository();
