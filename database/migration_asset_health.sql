-- =================================================================================
-- MIGRATION: ASSET HEALTH SCORES & PREDICTIVE MAINTENANCE RISK ENGINE
-- DATABASE NAME: asset_maintenance_system
-- =================================================================================

USE asset_maintenance_system;

-- -----------------------------------------------------------------------------
-- 1. Bảng asset_health_scores: Lưu điểm số sức khỏe hiện tại và các điểm thành phần
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asset_health_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL UNIQUE,
    health_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Tổng điểm sức khỏe 0 - 100',
    health_status ENUM('GOOD', 'FAIR', 'WARNING', 'CRITICAL', 'INSUFFICIENT_DATA') NOT NULL DEFAULT 'GOOD',
    age_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Điểm tuổi thọ và khấu hao (20%)',
    failure_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Điểm tần suất sự cố hỏng (25%)',
    maintenance_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Điểm tuân thủ bảo trì định kỳ (15%)',
    repair_cost_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Điểm chi phí sửa chữa / nguyên giá (20%)',
    downtime_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Điểm thời gian gián đoạn hoạt động (10%)',
    warranty_score DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Điểm thời hạn bảo hành (10%)',
    data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT 'Tỷ lệ hoàn thiện dữ liệu đánh giá (0 - 100%)',
    evaluated_factors_count INT DEFAULT 6 COMMENT 'Số lượng chỉ số đủ dữ liệu đánh giá',
    total_factors_count INT DEFAULT 6 COMMENT 'Tổng số chỉ số trong mô hình',
    calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0' COMMENT 'Phiên bản công thức tính toán',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_health_device (device_id),
    INDEX idx_health_score (health_score),
    INDEX idx_health_status (health_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Bảng asset_risk_assessments: Lưu điểm nguy cơ sự cố (Failure Risk) & Dự đoán
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asset_risk_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL UNIQUE,
    risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Điểm rủi ro sự cố hỏng hóc 0 - 100%',
    risk_level ENUM('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN') NOT NULL DEFAULT 'VERY_LOW',
    recent_failure_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Rủi ro từ số sự cố gần đây (25%)',
    failure_trend_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Rủi ro từ xu hướng hỏng hóc (20%)',
    repair_cost_trend_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Rủi ro từ xu hướng tăng chi phí sửa (15%)',
    age_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Rủi ro từ tuổi thọ thiết bị (15%)',
    downtime_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Rủi ro từ thời gian ngừng máy (10%)',
    maintenance_overdue_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Rủi ro từ quá hạn bảo trì (10%)',
    critical_incident_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Rủi ro từ các sự cố nghiêm trọng URGENT/HIGH (5%)',
    failure_trend_percent DECIMAL(7,2) NULL COMMENT 'Tỷ lệ tăng/giảm số sự cố so với chu kỳ trước (%)',
    repair_cost_trend_percent DECIMAL(7,2) NULL COMMENT 'Tỷ lệ tăng/giảm chi phí sửa chữa so với chu kỳ trước (%)',
    recommendation_action ENUM('SCHEDULE_MAINTENANCE', 'INSPECT_ASSET', 'MONITOR_ASSET', 'REPAIR_ASSET', 'CONSIDER_REPLACEMENT') NOT NULL DEFAULT 'MONITOR_ASSET',
    recommendation_text TEXT NOT NULL COMMENT 'Nội dung khuyến nghị kỹ thuật ngắn gọn',
    recommendation_reasons JSON NULL COMMENT 'Mảng lý do định lượng giải thích nguyên nhân rủi ro',
    replacement_indicator VARCHAR(50) NOT NULL DEFAULT 'CONTINUE_MONITORING' COMMENT 'CONSIDER_REPLACEMENT hoặc CONTINUE_MONITORING',
    data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_risk_device (device_id),
    INDEX idx_risk_score (risk_score),
    INDEX idx_risk_level (risk_level),
    INDEX idx_recommendation_action (recommendation_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Bảng asset_health_history: Lưu vết biến động điểm số theo thời gian (Trend Line)
-- -----------------------------------------------------------------------------
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
    FOREIGN KEY (device_id) REFERENCES devices(id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_hist_dev_date (device_id, snapshot_date),
    INDEX idx_hist_snapshot_date (snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
