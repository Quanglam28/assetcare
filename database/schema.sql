-- =================================================================================
-- HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ TRONG TRƯỜNG ĐẠI HỌC (QR CODE)
-- DATABASE SCHEMA: MySQL 8.0+
-- DATABASE NAME: asset_maintenance_system
-- =================================================================================

-- Tạo cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS asset_maintenance_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE asset_maintenance_system;

-- Tắt kiểm tra khóa ngoại tạm thời khi tạo bảng
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Bảng roles: Vai trò người dùng trong hệ thống (ADMIN, MANAGER, TECHNICIAN, USER)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã vai trò: ADMIN, MANAGER, TECHNICIAN, USER',
    name VARCHAR(100) NOT NULL COMMENT 'Tên hiển thị vai trò',
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Bảng departments: Khoa / Phòng ban / Trung tâm trong trường đại học
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã đơn vị: CNTT, DTVT, QTTB, DT, TTTV...',
    name VARCHAR(150) NOT NULL COMMENT 'Tên phòng ban / khoa',
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Bảng users: Người dùng hệ thống (Admin, Manager, Technician, Giảng viên, Sinh viên)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    department_id INT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(255) NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_users_role (role_id),
    INDEX idx_users_department (department_id),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Bảng buildings: Danh mục Tòa nhà trong khuôn viên trường
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS buildings;
CREATE TABLE buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã tòa nhà: A1, B2, C3...',
    name VARCHAR(150) NOT NULL COMMENT 'Tên tòa nhà: Nhà Hiệu Bộ A1, Khu Giảng Đường B2...',
    address VARCHAR(255) NULL,
    total_floors INT DEFAULT 1,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Bảng locations: Vị trí phòng học / Phòng thí nghiệm / Phòng họp / Server
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã phòng: A1-101, B2-301, C3-401...',
    room_name VARCHAR(100) NOT NULL COMMENT 'Tên phòng',
    floor INT DEFAULT 1,
    type ENUM('CLASSROOM', 'LABORATORY', 'OFFICE', 'MEETING_ROOM', 'WAREHOUSE', 'SERVER_ROOM', 'OTHER') DEFAULT 'CLASSROOM',
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_locations_building (building_id),
    INDEX idx_locations_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Bảng device_types: Loại / Nhóm thiết bị (Máy tính, Máy chiếu, Điều hòa, Switch...)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS device_types;
CREATE TABLE device_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã loại: PC_DESKTOP, PROJECTOR, AIR_CONDITIONER...',
    name VARCHAR(100) NOT NULL COMMENT 'Tên loại thiết bị',
    category ENUM('IT_EQUIPMENT', 'OFFICE_EQUIPMENT', 'ELECTRICAL', 'LAB_EQUIPMENT', 'NETWORK', 'FURNITURE', 'OTHER') DEFAULT 'IT_EQUIPMENT',
    maintenance_interval_days INT DEFAULT 90 COMMENT 'Chu kỳ bảo trì định kỳ tính theo ngày',
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Bảng suppliers: Nhà cung cấp & Đối tác bảo hành
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã NCC: SUP-DELL, SUP-PANASONIC...',
    name VARCHAR(150) NOT NULL COMMENT 'Tên nhà cung cấp / Công ty',
    contact_person VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    address VARCHAR(255) NULL,
    tax_code VARCHAR(50) NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Bảng devices: Danh mục Tài sản và Thiết bị trường học
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS devices;
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã tài sản / thiết bị: DEV-2026-0001',
    name VARCHAR(150) NOT NULL COMMENT 'Tên thiết bị',
    device_type_id INT NOT NULL,
    location_id INT NOT NULL,
    department_id INT NULL,
    supplier_id INT NULL,
    model VARCHAR(100) NULL,
    serial_number VARCHAR(100) NULL,
    purchase_date DATE NULL,
    purchase_price DECIMAL(15,2) DEFAULT 0.00,
    warranty_start DATE NULL,
    warranty_end DATE NULL,
    status ENUM('ACTIVE', 'MAINTENANCE', 'BROKEN', 'RETIRED') DEFAULT 'ACTIVE',
    description TEXT NULL,
    qr_token VARCHAR(255) NOT NULL UNIQUE COMMENT 'Token định danh duy nhất quét mã QR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_type_id) REFERENCES device_types(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_devices_code (code),
    INDEX idx_devices_qr (qr_token),
    INDEX idx_devices_status (status),
    INDEX idx_devices_type (device_type_id),
    INDEX idx_devices_location (location_id),
    INDEX idx_devices_department (department_id),
    INDEX idx_devices_supplier (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. Bảng maintenance_requests: Yêu cầu bảo trì / Sự cố thiết bị (Tickets)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS maintenance_requests;
CREATE TABLE maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Mã phiếu yêu cầu: REQ-2026-0001',
    device_id INT NOT NULL,
    reporter_id INT NOT NULL COMMENT 'Người báo sự cố (User / Giảng viên / SV)',
    technician_id INT NULL COMMENT 'Kỹ thuật viên được giao xử lý',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    sla_hours INT DEFAULT 24 COMMENT 'Số giờ cam kết SLA: LOW=72, MEDIUM=24, HIGH=8, URGENT=4',
    due_at TIMESTAMP NULL COMMENT 'Hạn chót SLA tự động tính khi tạo yêu cầu',
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'COMPLETED', 'CLOSED', 'REOPENED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    estimated_cost DECIMAL(15,2) DEFAULT 0.00,
    actual_cost DECIMAL(15,2) DEFAULT 0.00,
    resolution TEXT NULL COMMENT 'Biện pháp / Kết quả sửa chữa',
    root_cause TEXT NULL COMMENT 'Nguyên nhân hỏng hóc',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_req_code (code),
    INDEX idx_req_device (device_id),
    INDEX idx_req_reporter (reporter_id),
    INDEX idx_req_technician (technician_id),
    INDEX idx_req_status (status),
    INDEX idx_req_priority (priority),
    INDEX idx_req_due_at (due_at),
    INDEX idx_req_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. Bảng maintenance_histories: Nhật ký từng bước xử lý yêu cầu bảo trì
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS maintenance_histories;
CREATE TABLE maintenance_histories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    actor_id INT NOT NULL COMMENT 'Người thực hiện hành động',
    from_status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'COMPLETED', 'CLOSED', 'REOPENED') NULL,
    to_status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'COMPLETED', 'CLOSED', 'REOPENED') NOT NULL,
    action VARCHAR(100) NOT NULL COMMENT 'Hành động: TẠO YÊU CẦU, TIẾP NHẬN, BẮT ĐẦU XỬ LÝ, HOÀN THÀNH, NGHIỆM THU...',
    notes TEXT NULL,
    cost DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_hist_request (request_id),
    INDEX idx_hist_actor (actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. Bảng maintenance_schedules: Kế hoạch và Lịch bảo dưỡng định kỳ
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS maintenance_schedules;
CREATE TABLE maintenance_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    title VARCHAR(150) NOT NULL COMMENT 'Tiêu đề lịch bảo dưỡng định kỳ',
    frequency ENUM('MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY') DEFAULT 'QUARTERLY',
    scheduled_date DATE NOT NULL,
    next_run_date DATE NULL,
    last_performed_at TIMESTAMP NULL,
    assigned_technician_id INT NULL,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED') DEFAULT 'SCHEDULED',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_sched_device (device_id),
    INDEX idx_sched_technician (assigned_technician_id),
    INDEX idx_sched_status (status),
    INDEX idx_sched_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. Bảng maintenance_parts: Linh kiện / Phụ tùng thay thế
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS maintenance_parts;
CREATE TABLE maintenance_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    part_name VARCHAR(150) NOT NULL COMMENT 'Tên linh kiện thay thế',
    part_code VARCHAR(50) NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(15,2) DEFAULT 0.00,
    total_price DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    replaced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_parts_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. Bảng notifications: Thông báo sự kiện trong hệ thống
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'WARNING', 'SUCCESS', 'URGENT') DEFAULT 'INFO',
    entity_type VARCHAR(50) NULL COMMENT 'MAINTENANCE_REQUEST, DEVICE, SCHEDULE...',
    entity_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_unread (user_id, is_read),
    INDEX idx_notif_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. Bảng attachments: Tệp đính kèm và hình ảnh sự cố / trước & sau sửa chữa
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS attachments;
CREATE TABLE attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('DEVICE', 'MAINTENANCE_REQUEST', 'MAINTENANCE_HISTORY', 'USER_AVATAR') NOT NULL,
    entity_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NULL,
    file_size INT NULL COMMENT 'Dung lượng (bytes)',
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_att_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- -----------------------------------------------------------------------------
-- 15. Bảng asset_health_scores: Điểm số sức khỏe thiết bị (Asset Health Score)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS asset_health_scores;
CREATE TABLE asset_health_scores (
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
    FOREIGN KEY (device_id) REFERENCES devices(id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_health_device (device_id),
    INDEX idx_health_score (health_score),
    INDEX idx_health_status (health_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. Bảng asset_risk_assessments: Đánh giá nguy cơ sự cố (Predictive Risk Engine)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS asset_risk_assessments;
CREATE TABLE asset_risk_assessments (
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
    FOREIGN KEY (device_id) REFERENCES devices(id) ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_risk_device (device_id),
    INDEX idx_risk_score (risk_score),
    INDEX idx_risk_level (risk_level),
    INDEX idx_recommendation_action (recommendation_action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. Bảng asset_health_history: Lịch sử biến động sức khỏe & rủi ro theo thời gian
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS asset_health_history;
CREATE TABLE asset_health_history (
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

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;
