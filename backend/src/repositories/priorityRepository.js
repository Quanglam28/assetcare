const { pool } = require('../config/db');

/**
 * PriorityRepository
 * Thao tác dữ liệu bảng priority_scores và ma trận rủi ro thiết bị
 */
class PriorityRepository {
  /**
   * Lưu hoặc cập nhật điểm ưu tiên xử lý của thiết bị
   */
  async upsertPriorityScore(data) {
    const sql = `
      INSERT INTO priority_scores (
        device_id, priority_score, priority_status, risk_score,
        business_criticality_score, asset_value_score, downtime_impact_score,
        data_completeness, evaluated_factors_count, total_factors_count,
        calculation_version, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        priority_score = VALUES(priority_score),
        priority_status = VALUES(priority_status),
        risk_score = VALUES(risk_score),
        business_criticality_score = VALUES(business_criticality_score),
        asset_value_score = VALUES(asset_value_score),
        downtime_impact_score = VALUES(downtime_impact_score),
        data_completeness = VALUES(data_completeness),
        evaluated_factors_count = VALUES(evaluated_factors_count),
        total_factors_count = VALUES(total_factors_count),
        calculation_version = VALUES(calculation_version),
        calculated_at = NOW(),
        updated_at = NOW()
    `;

    const params = [
      data.deviceId,
      data.priorityScore,
      data.priorityStatus,
      data.riskScore,
      data.businessCriticalityScore,
      data.assetValueScore,
      data.downtimeImpactScore,
      data.dataCompleteness || 100,
      data.evaluatedFactorsCount || 4,
      data.totalFactorsCount || 4,
      data.calculationVersion || 'v1.0',
    ];

    await pool.execute(sql, params);
  }

  /**
   * Lấy chi tiết điểm ưu tiên theo deviceId
   */
  async findByDeviceId(deviceId) {
    const sql = `
      SELECT p.*, d.code AS device_code, d.name AS device_name, d.status AS device_status,
             d.business_criticality, d.purchase_price,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name,
             dept.name AS department_name
      FROM priority_scores p
      JOIN devices d ON p.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE p.device_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [deviceId]);
    return rows[0] || null;
  }

  /**
   * Lấy Top N thiết bị có mức độ ưu tiên xử lý cao nhất (Top Priority Assets)
   */
  async findTopPriorityDevices(limit = 5) {
    const sql = `
      SELECT p.device_id, p.priority_score, p.priority_status, p.risk_score,
             h.health_score, h.health_status,
             d.code AS device_code, d.name AS device_name, d.status AS device_status,
             d.business_criticality, d.purchase_price,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name,
             dept.name AS department_name
      FROM priority_scores p
      JOIN devices d ON p.device_id = d.id
      LEFT JOIN asset_health_scores h ON p.device_id = h.device_id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE d.status != 'RETIRED'
      ORDER BY p.priority_score DESC, p.risk_score DESC, h.health_score ASC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  }

  /**
   * Lấy toàn bộ dữ liệu ma trận rủi ro (Risk Matrix Dashboard: X = Health, Y = Risk)
   */
  async getRiskMatrixData(filters = {}) {
    let sql = `
      SELECT 
        d.id, d.code, d.name, d.status AS device_status, d.business_criticality,
        COALESCE(h.health_score, 100.00) AS health_score,
        COALESCE(h.health_status, 'GOOD') AS health_status,
        COALESCE(r.risk_score, 10.00) AS risk_score,
        COALESCE(r.risk_status, 'LOW') AS risk_status,
        COALESCE(p.priority_score, 20.00) AS priority_score,
        COALESCE(p.priority_status, 'LOW') AS priority_status,
        loc.room_name, b.name AS building_name,
        dept.name AS department_name, dt.name AS device_type_name
      FROM devices d
      LEFT JOIN asset_health_scores h ON d.id = h.device_id
      LEFT JOIN failure_risk_scores r ON d.id = r.device_id
      LEFT JOIN priority_scores p ON d.id = p.device_id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      JOIN device_types dt ON d.device_type_id = dt.id
      WHERE d.status != 'RETIRED'
    `;

    const params = [];

    if (filters.departmentId) {
      sql += ` AND d.department_id = ?`;
      params.push(filters.departmentId);
    }
    if (filters.locationId) {
      sql += ` AND d.location_id = ?`;
      params.push(filters.locationId);
    }
    if (filters.status) {
      sql += ` AND d.status = ?`;
      params.push(filters.status);
    }
    if (filters.riskStatus) {
      sql += ` AND r.risk_status = ?`;
      params.push(filters.riskStatus);
    }
    if (filters.priorityStatus) {
      sql += ` AND p.priority_status = ?`;
      params.push(filters.priorityStatus);
    }
    if (filters.businessCriticality) {
      sql += ` AND d.business_criticality = ?`;
      params.push(filters.businessCriticality);
    }

    sql += ` ORDER BY p.priority_score DESC, r.risk_score DESC LIMIT 500`;

    const [rows] = await pool.query(sql, params);
    return rows;
  }
}

module.exports = new PriorityRepository();
