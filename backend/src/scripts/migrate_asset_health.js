const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../utils/logger');

async function runMigration() {
  console.log('========================================================================');
  console.log('🚀 ĐANG CHẠY MIGRATION: ASSET HEALTH SCORES & PREDICTIVE RISK ENGINE');
  console.log('========================================================================\n');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS asset_health_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id INT NOT NULL UNIQUE,
        health_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        health_status ENUM('GOOD', 'FAIR', 'WARNING', 'CRITICAL', 'INSUFFICIENT_DATA') NOT NULL DEFAULT 'GOOD',
        age_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        failure_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        maintenance_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        repair_cost_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        downtime_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        warranty_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        evaluated_factors_count INT DEFAULT 6,
        total_factors_count INT DEFAULT 6,
        calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_health_device (device_id),
        INDEX idx_health_score (health_score),
        INDEX idx_health_status (health_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS asset_risk_assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id INT NOT NULL UNIQUE,
        risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        risk_level ENUM('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN') NOT NULL DEFAULT 'VERY_LOW',
        recent_failure_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        failure_trend_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        repair_cost_trend_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        age_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        downtime_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        maintenance_overdue_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        critical_incident_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        failure_trend_percent DECIMAL(7,2) NULL,
        repair_cost_trend_percent DECIMAL(7,2) NULL,
        recommendation_action ENUM('SCHEDULE_MAINTENANCE', 'INSPECT_ASSET', 'MONITOR_ASSET', 'REPAIR_ASSET', 'CONSIDER_REPLACEMENT') NOT NULL DEFAULT 'MONITOR_ASSET',
        recommendation_text TEXT NOT NULL,
        recommendation_reasons JSON NULL,
        replacement_indicator VARCHAR(50) NOT NULL DEFAULT 'CONTINUE_MONITORING',
        data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_risk_device (device_id),
        INDEX idx_risk_score (risk_score),
        INDEX idx_risk_level (risk_level),
        INDEX idx_recommendation_action (recommendation_action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS asset_health_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id INT NOT NULL,
        health_score DECIMAL(5,2) NOT NULL,
        risk_score DECIMAL(5,2) NOT NULL,
        health_status VARCHAR(50) NOT NULL,
        risk_level VARCHAR(50) NOT NULL,
        total_repair_cost DECIMAL(15,2) DEFAULT 0.00,
        incident_count INT DEFAULT 0,
        downtime_hours INT DEFAULT 0,
        snapshot_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_hist_dev_date (device_id, snapshot_date),
        INDEX idx_hist_snapshot_date (snapshot_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Tạo thành công 3 bảng: asset_health_scores, asset_risk_assessments, asset_health_history!');
    return true;
  } catch (error) {
    console.error('❌ Lỗi chạy migration:', error.message);
    throw error;
  }
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigration };
