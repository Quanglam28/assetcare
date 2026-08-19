# THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ERD)
> **Database Architecture, Entity-Relationship Diagram & Data Dictionary**

---

## 1. Sơ Đồ Thực Thể Quan Hệ (Entity-Relationship Diagram - ERD)

Cơ sở dữ liệu **`asset_maintenance_system`** được thiết kế đạt chuẩn chuẩn hóa **3NF (Third Normal Form)**, gồm 14 bảng quan hệ và 17 khóa ngoại bảo đảm toàn vẹn dữ liệu:

```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    DEPARTMENTS ||--o{ USERS : "belongs to"
    DEPARTMENTS ||--o{ DEVICES : "manages"
    BUILDINGS ||--o{ LOCATIONS : "contains"
    LOCATIONS ||--o{ DEVICES : "located at"
    DEVICE_TYPES ||--o{ DEVICES : "categorizes"
    SUPPLIERS ||--o{ DEVICES : "supplies"
    
    DEVICES ||--o{ MAINTENANCE_REQUESTS : "generates"
    DEVICES ||--o{ MAINTENANCE_SCHEDULES : "has"
    
    USERS ||--o{ MAINTENANCE_REQUESTS : "reports"
    USERS ||--o{ MAINTENANCE_REQUESTS : "assigned to"
    USERS ||--o{ MAINTENANCE_HISTORIES : "performs"
    USERS ||--o{ MAINTENANCE_SCHEDULES : "executes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    MAINTENANCE_REQUESTS ||--o{ MAINTENANCE_HISTORIES : "logs"
    MAINTENANCE_REQUESTS ||--o{ MAINTENANCE_PARTS : "replaces"

    ROLES {
        int id PK
        string code UK
        string name
        string description
    }

    DEPARTMENTS {
        int id PK
        string code UK
        string name
        string description
    }

    BUILDINGS {
        int id PK
        string code UK
        string name
        string description
    }

    LOCATIONS {
        int id PK
        int building_id FK
        string code UK
        string room_name
        int floor
        string type
    }

    USERS {
        int id PK
        int role_id FK
        int department_id FK
        string username UK
        string password_hash
        string full_name
        string email UK
        string phone
        string status
    }

    DEVICE_TYPES {
        int id PK
        string code UK
        string name
        string category
        int maintenance_interval_days
    }

    SUPPLIERS {
        int id PK
        string code UK
        string name
        string contact_person
        string email
        string phone
        string address
    }

    DEVICES {
        int id PK
        string code UK
        string name
        int device_type_id FK
        int location_id FK
        int department_id FK
        int supplier_id FK
        string model
        string serial_number
        date purchase_date
        decimal purchase_price
        date warranty_end
        string status
        string qr_token UK
        text description
    }

    MAINTENANCE_REQUESTS {
        int id PK
        string code UK
        int device_id FK
        int reporter_id FK
        int technician_id FK
        string title
        text description
        string priority
        int sla_hours
        datetime due_at
        string status
        datetime created_at
        datetime assigned_at
        datetime started_at
        datetime completed_at
        datetime closed_at
        decimal actual_cost
        text resolution
        text root_cause
    }

    MAINTENANCE_HISTORIES {
        int id PK
        int request_id FK
        int actor_id FK
        string from_status
        string to_status
        string action
        text notes
        decimal cost
        datetime created_at
    }

    MAINTENANCE_PARTS {
        int id PK
        int request_id FK
        string part_name
        int quantity
        decimal unit_price
        decimal total_price
        text notes
    }

    MAINTENANCE_SCHEDULES {
        int id PK
        int device_id FK
        string title
        string frequency
        date scheduled_date
        date next_run_date
        int assigned_technician_id FK
        string status
        text notes
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        string type
        string entity_type
        int entity_id
        boolean is_read
        datetime created_at
    }

    ATTACHMENTS {
        int id PK
        string entity_type
        int entity_id
        string file_name
        string file_path
        int file_size
        string mime_type
        int uploaded_by FK
        datetime created_at
    }
```

---

## 2. Từ Điển Dữ Liệu & Chỉ Mục Tối Ưu Hóa (Data Dictionary & Indexes)

### A. Bảng `devices` (Thiết bị)
- **Primary Key**: `id`
- **Unique Indexes**: `code`, `qr_token`
- **Secondary Indexes**: `device_type_id`, `location_id`, `department_id`, `status`
- **Mô tả trạng thái (`status`)**:
  - `ACTIVE`: Thiết bị đang hoạt động bình thường tại phòng học.
  - `MAINTENANCE`: Đang trong chu trình bảo dưỡng hoặc sửa chữa.
  - `BROKEN`: Thiết bị hỏng đang chờ kỹ thuật viên tiếp nhận xử lý.
  - `RETIRED`: Thiết bị đã thanh lý hoặc ngừng sử dụng (Khóa chặn tạo vé bảo trì mới).

### B. Bảng `maintenance_requests` (Phiếu yêu cầu bảo trì)
- **Primary Key**: `id`
- **Unique Indexes**: `code`
- **Secondary Indexes**: `device_id`, `reporter_id`, `technician_id`, `status`, `priority`, `due_at`
- **Mô tả trạng thái (`status`)**:
  - `PENDING`: Sự cố mới tạo, chờ Ban Quản lý phân công KTV.
  - `ASSIGNED`: Đã chỉ định KTV phụ trách.
  - `IN_PROGRESS`: KTV đã có mặt tại hiện trường và bắt đầu xử lý.
  - `WAITING_PART`: Tạm dừng chờ xuất kho linh kiện thay thế.
  - `COMPLETED`: KTV hoàn thành sửa chữa, chờ người dùng nghiệm thu.
  - `CLOSED`: Người dùng xác nhận đã khắc phục và đóng phiếu thành công.
  - `REOPENED`: Người dùng phản hồi chưa khắc phục đạt yêu cầu, mở lại vé.
