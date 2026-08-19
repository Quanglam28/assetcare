const { pool } = require('../config/db');

async function migratePhase3() {
  console.log('🔄 Bắt đầu chạy Migration Phase 3...');

  // 1. Thêm cột business_criticality vào bảng devices (nếu chưa có)
  console.log('1. Kiểm tra cột business_criticality trong bảng devices...');
  const [deviceCols] = await pool.query("SHOW COLUMNS FROM devices LIKE 'business_criticality'");
  if (deviceCols.length === 0) {
    await pool.query(`
      ALTER TABLE devices 
      ADD COLUMN business_criticality ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM' 
      AFTER status;
    `);
    console.log('   ✅ Đã thêm cột business_criticality vào bảng devices.');
  } else {
    console.log('   ℹ️ Cột business_criticality đã tồn tại.');
  }

  // 2. Tạo bảng priority_scores
  console.log('2. Khởi tạo bảng priority_scores...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS priority_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id INT NOT NULL,
      priority_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      priority_status ENUM('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'LOW',
      risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      business_criticality_score DECIMAL(5,2) NOT NULL DEFAULT 50.00,
      asset_value_score DECIMAL(5,2) NOT NULL DEFAULT 20.00,
      downtime_impact_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
      data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00,
      evaluated_factors_count INT NOT NULL DEFAULT 4,
      total_factors_count INT NOT NULL DEFAULT 4,
      calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
      calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_device_priority (device_id),
      INDEX idx_priority_score (priority_score),
      INDEX idx_priority_status (priority_status),
      CONSTRAINT fk_priority_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('   ✅ Bảng priority_scores đã sẵn sàng.');

  // 3. Tạo bảng recommendations
  console.log('3. Khởi tạo bảng recommendations...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
      title VARCHAR(200) NOT NULL,
      description TEXT NULL,
      action VARCHAR(100) NOT NULL,
      reason TEXT NOT NULL,
      source_factors JSON NULL,
      suggested_deadline DATE NULL,
      status ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_rec_device (device_id),
      INDEX idx_rec_status (status),
      INDEX idx_rec_type (type),
      CONSTRAINT fk_rec_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('   ✅ Bảng recommendations đã sẵn sàng.');

  // 4. Tạo bảng maintenance_work_orders
  console.log('4. Khởi tạo bảng maintenance_work_orders...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenance_work_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id INT NOT NULL,
      recommendation_id INT NULL,
      work_order_code VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(200) NOT NULL,
      description TEXT NULL,
      type ENUM('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION', 'REPLACEMENT_REVIEW') NOT NULL DEFAULT 'CORRECTIVE',
      priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
      status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
      assigned_to INT NULL,
      reported_by INT NOT NULL,
      scheduled_at TIMESTAMP NULL,
      started_at TIMESTAMP NULL,
      completed_at TIMESTAMP NULL,
      estimated_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      actual_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      resolution TEXT NULL,
      technician_note TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_wo_device (device_id),
      INDEX idx_wo_status (status),
      INDEX idx_wo_assigned (assigned_to),
      INDEX idx_wo_code (work_order_code),
      CONSTRAINT fk_wo_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
      CONSTRAINT fk_wo_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      CONSTRAINT fk_wo_reporter FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('   ✅ Bảng maintenance_work_orders đã sẵn sàng.');

  // 5. Tạo bảng audit_logs
  console.log('5. Khởi tạo bảng audit_logs...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INT NOT NULL,
      old_values JSON NULL,
      new_values JSON NULL,
      ip_address VARCHAR(45) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_action (action),
      INDEX idx_audit_entity (entity_type, entity_id),
      INDEX idx_audit_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('   ✅ Bảng audit_logs đã sẵn sàng.');

  // 6. Cập nhật bảng notifications nếu cần
  console.log('6. Kiểm tra các cột trong bảng notifications...');
  const [notifCols] = await pool.query("SHOW COLUMNS FROM notifications LIKE 'reference_type'");
  if (notifCols.length === 0) {
    await pool.query(`
      ALTER TABLE notifications
      ADD COLUMN reference_type VARCHAR(50) NULL AFTER entity_id,
      ADD COLUMN reference_id INT NULL AFTER reference_type,
      ADD COLUMN read_at TIMESTAMP NULL AFTER is_read;
    `);
    console.log('   ✅ Đã cập nhật các trường mở rộng cho bảng notifications.');
  } else {
    console.log('   ℹ️ Bảng notifications đã có đầy đủ các trường.');
  }

  console.log('🎉 Hoàn thành toàn bộ Migration Phase 3!');
  process.exit(0);
}

migratePhase3().catch(err => {
  console.error('❌ Lỗi Migration Phase 3:', err);
  process.exit(1);
});
