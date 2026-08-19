const { pool } = require('../config/db');

/**
 * HealthRepository
 * Thao tác dữ liệu bảng asset_health_scores, asset_risk_assessments và asset_health_history
 */
class HealthRepository {
  /**
   * Lưu hoặc cập nhật điểm sức khỏe thiết bị
   */
  async upsertHealthScore(data) {
    const sql = `
      INSERT INTO asset_health_scores (
        device_id, health_score, health_status, age_score, failure_score,
        maintenance_score, repair_cost_score, downtime_score, warranty_score,
        data_completeness, evaluated_factors_count, total_factors_count,
        calculation_version, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        health_score = VALUES(health_score),
        health_status = VALUES(health_status),
        age_score = VALUES(age_score),
        failure_score = VALUES(failure_score),
        maintenance_score = VALUES(maintenance_score),
        repair_cost_score = VALUES(repair_cost_score),
        downtime_score = VALUES(downtime_score),
        warranty_score = VALUES(warranty_score),
        data_completeness = VALUES(data_completeness),
        evaluated_factors_count = VALUES(evaluated_factors_count),
        total_factors_count = VALUES(total_factors_count),
        calculation_version = VALUES(calculation_version),
        calculated_at = NOW(),
        updated_at = NOW()
    `;

    const params = [
      data.deviceId,
      data.healthScore,
      data.healthStatus,
      data.ageScore,
      data.failureScore,
      data.maintenanceScore,
      data.repairCostScore,
      data.downtimeScore,
      data.warrantyScore,
      data.dataCompleteness,
      data.evaluatedFactorsCount || 6,
      data.totalFactorsCount || 6,
      data.calculationVersion || 'v1.0',
    ];

    await pool.execute(sql, params);
  }

  /**
   * Lưu hoặc cập nhật đánh giá rủi ro thiết bị
   */
  async upsertRiskAssessment(data) {
    const sql = `
      INSERT INTO asset_risk_assessments (
        device_id, risk_score, risk_level, recent_failure_score, failure_trend_score,
        repair_cost_trend_score, age_risk_score, downtime_risk_score,
        maintenance_overdue_score, critical_incident_score, failure_trend_percent,
        repair_cost_trend_percent, recommendation_action, recommendation_text,
        recommendation_reasons, replacement_indicator, data_completeness,
        calculation_version, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        risk_score = VALUES(risk_score),
        risk_level = VALUES(risk_level),
        recent_failure_score = VALUES(recent_failure_score),
        failure_trend_score = VALUES(failure_trend_score),
        repair_cost_trend_score = VALUES(repair_cost_trend_score),
        age_risk_score = VALUES(age_risk_score),
        downtime_risk_score = VALUES(downtime_risk_score),
        maintenance_overdue_score = VALUES(maintenance_overdue_score),
        critical_incident_score = VALUES(critical_incident_score),
        failure_trend_percent = VALUES(failure_trend_percent),
        repair_cost_trend_percent = VALUES(repair_cost_trend_percent),
        recommendation_action = VALUES(recommendation_action),
        recommendation_text = VALUES(recommendation_text),
        recommendation_reasons = VALUES(recommendation_reasons),
        replacement_indicator = VALUES(replacement_indicator),
        data_completeness = VALUES(data_completeness),
        calculation_version = VALUES(calculation_version),
        calculated_at = NOW(),
        updated_at = NOW()
    `;

    const params = [
      data.deviceId,
      data.riskScore,
      data.riskLevel,
      data.recentFailureScore,
      data.failureTrendScore,
      data.repairCostTrendScore,
      data.ageRiskScore,
      data.downtimeRiskScore,
      data.maintenanceOverdueScore,
      data.criticalIncidentScore,
      data.failureTrendPercent,
      data.repairCostTrendPercent,
      data.recommendationAction,
      data.recommendationText,
      JSON.stringify(data.recommendationReasons || []),
      data.replacementIndicator || 'CONTINUE_MONITORING',
      data.dataCompleteness || 100,
      data.calculationVersion || 'v1.0',
    ];

    await pool.execute(sql, params);
  }

  /**
   * Lưu bản ghi snapshot lịch sử biến động
   */
  async insertHistorySnapshot(data) {
    const sql = `
      INSERT INTO asset_health_history (
        device_id, health_score, risk_score, health_status, risk_level,
        total_repair_cost, incident_count, downtime_hours, snapshot_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        health_score = VALUES(health_score),
        risk_score = VALUES(risk_score),
        health_status = VALUES(health_status),
        risk_level = VALUES(risk_level),
        total_repair_cost = VALUES(total_repair_cost),
        incident_count = VALUES(incident_count),
        downtime_hours = VALUES(downtime_hours)
    `;

    const params = [
      data.deviceId,
      data.healthScore,
      data.riskScore,
      data.healthStatus,
      data.riskLevel,
      data.totalRepairCost || 0,
      data.incidentCount || 0,
      data.downtimeHours || 0,
      data.snapshotDate || new Date().toISOString().split('T')[0],
    ];

    await pool.execute(sql, params);
  }

  /**
   * Lấy chi tiết điểm sức khỏe hiện tại của thiết bị
   */
  async findHealthByDeviceId(deviceId) {
    const sql = `
      SELECT h.*, d.code AS device_code, d.name AS device_name, d.status AS device_status,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name
      FROM asset_health_scores h
      JOIN devices d ON h.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      WHERE h.device_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [deviceId]);
    return rows[0] || null;
  }

  /**
   * Lấy chi tiết đánh giá rủi ro hiện tại của thiết bị
   */
  async findRiskByDeviceId(deviceId) {
    const sql = `
      SELECT r.*, d.code AS device_code, d.name AS device_name, d.status AS device_status,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name
      FROM asset_risk_assessments r
      JOIN devices d ON r.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      WHERE r.device_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [deviceId]);
    return rows[0] || null;
  }

  /**
   * Lấy chuỗi lịch sử snapshot theo thời gian của thiết bị
   */
  async findHistoryByDeviceId(deviceId, days = 90) {
    const sql = `
      SELECT snapshot_date, health_score, risk_score, health_status, risk_level,
             total_repair_cost, incident_count, downtime_hours
      FROM asset_health_history
      WHERE device_id = ? AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY snapshot_date ASC
    `;
    const [rows] = await pool.execute(sql, [deviceId, days]);
    return rows;
  }

  /**
   * Lấy danh sách Top thiết bị có nguy cơ cao nhất (Top At-Risk Assets)
   */
  async findTopAtRiskDevices(limit = 10) {
    const sql = `
      SELECT r.device_id, r.risk_score, r.risk_level, r.recommendation_action,
             r.recommendation_text, r.replacement_indicator, r.failure_trend_percent,
             h.health_score, h.health_status,
             d.code AS device_code, d.name AS device_name, d.status AS device_status,
             d.purchase_price,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name
      FROM asset_risk_assessments r
      LEFT JOIN asset_health_scores h ON r.device_id = h.device_id
      JOIN devices d ON r.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      WHERE d.status != 'RETIRED'
      ORDER BY r.risk_score DESC, h.health_score ASC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  }

  /**
   * Lấy phân bổ sức khỏe toàn bộ hệ thống (Health Distribution)
   */
  async findHealthDistribution() {
    const sql = `
      SELECT 
        COUNT(CASE WHEN health_status = 'GOOD' THEN 1 END) AS goodCount,
        COUNT(CASE WHEN health_status = 'FAIR' THEN 1 END) AS fairCount,
        COUNT(CASE WHEN health_status = 'WARNING' THEN 1 END) AS warningCount,
        COUNT(CASE WHEN health_status = 'CRITICAL' THEN 1 END) AS criticalCount,
        COUNT(CASE WHEN health_status = 'INSUFFICIENT_DATA' THEN 1 END) AS insufficientCount,
        COUNT(*) AS totalAssessed
      FROM asset_health_scores
    `;
    const [rows] = await pool.execute(sql);
    return rows[0] || {};
  }

  /**
   * Lấy tổng quan rủi ro bảo trì phục vụ Dashboard
   */
  async findMaintenanceRiskSummary() {
    const sql = `
      SELECT
        COUNT(CASE WHEN risk_level IN ('HIGH', 'CRITICAL') THEN 1 END) AS highRiskCount,
        COUNT(CASE WHEN risk_level = 'CRITICAL' THEN 1 END) AS criticalRiskCount,
        COUNT(CASE WHEN recommendation_action = 'CONSIDER_REPLACEMENT' THEN 1 END) AS considerReplacementCount,
        COUNT(CASE WHEN recommendation_action = 'SCHEDULE_MAINTENANCE' THEN 1 END) AS overdueMaintenanceCount,
        COUNT(CASE WHEN recommendation_action = 'INSPECT_ASSET' THEN 1 END) AS inspectAssetCount,
        AVG(risk_score) AS avgRiskScore,
        AVG(health_score) AS avgHealthScore
      FROM asset_risk_assessments r
      LEFT JOIN asset_health_scores h ON r.device_id = h.device_id
    `;
    const [rows] = await pool.execute(sql);
    return rows[0] || {};
  }

  /**
   * Lưu hoặc cập nhật bảng failure_risk_scores
   */
  async upsertFailureRiskScore(data) {
    const sql = `
      INSERT INTO failure_risk_scores (
        device_id, risk_score, risk_status, failure_frequency_score, failure_trend_score,
        maintenance_risk_score, repair_cost_trend_score, downtime_trend_score,
        age_risk_score, data_completeness, evaluated_factors_count, total_factors_count,
        calculation_version, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        risk_score = VALUES(risk_score),
        risk_status = VALUES(risk_status),
        failure_frequency_score = VALUES(failure_frequency_score),
        failure_trend_score = VALUES(failure_trend_score),
        maintenance_risk_score = VALUES(maintenance_risk_score),
        repair_cost_trend_score = VALUES(repair_cost_trend_score),
        downtime_trend_score = VALUES(downtime_trend_score),
        age_risk_score = VALUES(age_risk_score),
        data_completeness = VALUES(data_completeness),
        evaluated_factors_count = VALUES(evaluated_factors_count),
        total_factors_count = VALUES(total_factors_count),
        calculation_version = VALUES(calculation_version),
        calculated_at = NOW(),
        updated_at = NOW()
    `;

    const params = [
      data.deviceId,
      data.riskScore,
      data.riskStatus,
      data.failureFrequencyScore,
      data.failureTrendScore,
      data.maintenanceRiskScore,
      data.repairCostTrendScore,
      data.downtimeTrendScore,
      data.ageRiskScore,
      data.dataCompleteness || 100,
      data.evaluatedFactorsCount || 6,
      data.totalFactorsCount || 6,
      data.calculationVersion || 'v1.0',
    ];

    await pool.execute(sql, params);
  }

  /**
   * Lấy chi tiết đánh giá rủi ro từ bảng failure_risk_scores
   */
  async findFailureRiskScoreByDeviceId(deviceId) {
    const sql = `
      SELECT r.*, d.code AS device_code, d.name AS device_name, d.status AS device_status,
             dt.name AS device_type_name, loc.room_name, b.name AS building_name
      FROM failure_risk_scores r
      JOIN devices d ON r.device_id = d.id
      JOIN device_types dt ON d.device_type_id = dt.id
      JOIN locations loc ON d.location_id = loc.id
      JOIN buildings b ON loc.building_id = b.id
      WHERE r.device_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute(sql, [deviceId]);
    return rows[0] || null;
  }

  /**
   * Truy vấn tổng hợp dữ liệu sự cố, chi phí, lịch bảo dưỡng thực tế từ MySQL
   */
  async getRawAssetMetrics(deviceId) {
    // 1. Thống kê sự cố, chi phí & thời gian ngừng máy theo các cửa sổ thời gian (30d, 90d, previous periods)
    const reqSql = `
      SELECT 
        COUNT(*) AS total_requests,
        COUNT(CASE WHEN status != 'CLOSED' AND status != 'COMPLETED' THEN 1 END) AS open_requests,
        COUNT(CASE WHEN priority = 'URGENT' THEN 1 END) AS urgent_requests,
        COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) AS high_requests,
        
        -- Sự cố 30 ngày gần nhất & 30 ngày liền kề trước đó
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS failures_last_30d,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) AS failures_prev_30d,

        -- Sự cố 90 ngày gần nhất & 90 ngày liền kề trước đó
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 1 END) AS failures_last_90d,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 180 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 1 END) AS failures_prev_90d,

        -- Chi phí thực tế all-time
        COALESCE(SUM(actual_cost), 0) AS total_repair_cost,
        
        -- Chi phí 30 ngày & 90 ngày gần nhất vs chu kỳ trước
        COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN actual_cost ELSE 0 END), 0) AS cost_last_30d,
        COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN actual_cost ELSE 0 END), 0) AS cost_prev_30d,
        COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN actual_cost ELSE 0 END), 0) AS cost_last_90d,
        COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 180 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) THEN actual_cost ELSE 0 END), 0) AS cost_prev_90d,

        -- Thời gian ngừng máy (Downtime tính bằng giờ)
        COALESCE(SUM(
          CASE 
            WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
              THEN TIMESTAMPDIFF(HOUR, started_at, completed_at)
            WHEN completed_at IS NOT NULL 
              THEN TIMESTAMPDIFF(HOUR, created_at, completed_at)
            ELSE 0 
          END
        ), 0) AS downtime_hours,

        -- Downtime 30 ngày hiện tại vs 30 ngày trước
        COALESCE(SUM(
          CASE 
            WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN
              CASE 
                WHEN completed_at IS NOT NULL AND started_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, started_at, completed_at)
                WHEN completed_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, created_at, completed_at)
                ELSE 0 
              END
            ELSE 0 
          END
        ), 0) AS downtime_last_30d,

        COALESCE(SUM(
          CASE 
            WHEN created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN
              CASE 
                WHEN completed_at IS NOT NULL AND started_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, started_at, completed_at)
                WHEN completed_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, created_at, completed_at)
                ELSE 0 
              END
            ELSE 0 
          END
        ), 0) AS downtime_prev_30d,

        MAX(created_at) AS last_incident_date
      FROM maintenance_requests
      WHERE device_id = ?
    `;

    // 2. Thống kê lịch bảo dưỡng định kỳ
    const schedSql = `
      SELECT 
        COUNT(*) AS total_schedules,
        COUNT(CASE WHEN status = 'OVERDUE' OR (status = 'SCHEDULED' AND scheduled_date < CURDATE()) THEN 1 END) AS overdue_schedules,
        COALESCE(MAX(CASE WHEN status = 'OVERDUE' OR (status = 'SCHEDULED' AND scheduled_date < CURDATE()) THEN DATEDIFF(CURDATE(), scheduled_date) ELSE 0 END), 0) AS max_overdue_days,
        MAX(last_performed_at) AS last_maintenance_date
      FROM maintenance_schedules
      WHERE device_id = ?
    `;

    const [[reqStat], [schedStat]] = await Promise.all([
      pool.execute(reqSql, [deviceId]),
      pool.execute(schedSql, [deviceId]),
    ]);

    return {
      requests: reqStat[0] || {},
      schedules: schedStat[0] || {},
    };
  }
}

module.exports = new HealthRepository();
