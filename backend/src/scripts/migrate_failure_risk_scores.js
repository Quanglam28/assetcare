const { pool } = require('../config/db');

async function migrateFailureRiskScores() {
  console.log('🔄 Đang khởi tạo bảng failure_risk_scores...');

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS failure_risk_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id INT NOT NULL,
      risk_score DECIMAL(5,2) NULL,
      risk_status ENUM('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'INSUFFICIENT_DATA') NOT NULL DEFAULT 'LOW',
      failure_frequency_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
      failure_trend_score DECIMAL(5,2) NOT NULL DEFAULT 40.00,
      maintenance_risk_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
      repair_cost_trend_score DECIMAL(5,2) NOT NULL DEFAULT 30.00,
      downtime_trend_score DECIMAL(5,2) NOT NULL DEFAULT 20.00,
      age_risk_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
      data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00,
      evaluated_factors_count INT NOT NULL DEFAULT 6,
      total_factors_count INT NOT NULL DEFAULT 6,
      calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
      calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_device_risk (device_id),
      CONSTRAINT fk_failure_risk_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(createTableSql);
  console.log('✅ Bảng failure_risk_scores đã được tạo thành công!');
  process.exit(0);
}

migrateFailureRiskScores().catch(err => {
  console.error('❌ Lỗi tạo bảng failure_risk_scores:', err);
  process.exit(1);
});
