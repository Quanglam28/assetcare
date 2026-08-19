# Quy Chuẩn REST API và Đặc Tả Giao Tiếp (API Specification)

## 1. Nguyên Tắc Thiết Kế API
- Chuẩn kiến trúc **RESTful JSON API**.
- URL có tiền tố phiên bản: `/api/v1/...` và alias `/api/...`.
- Xác thực Stateless qua HTTP Header: `Authorization: Bearer <JWT_ACCESS_TOKEN>`.
- Mật khẩu băm an toàn bằng `bcrypt` (10 rounds), không lưu plaintext và không hard-code JWT secret.

---

## 2. Chuẩn Hóa Cấu Trúc Response

### Phản hồi thành công (200 OK, 201 Created):
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Phản hồi thất bại (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Server Error):
```json
{
  "success": false,
  "message": "Thông điệp lỗi chi tiết cho người dùng",
  "errors": [
    {
      "field": "username",
      "message": "Tên đăng nhập không được để trống"
    }
  ]
}
```

---

## 3. Đặc Tả Endpoints MODULE 2: Authentication & Authorization
- `POST /api/auth/login`: Đăng nhập cấp JWT Token
- `GET /api/auth/me`: Lấy thông tin cá nhân hiện tại
- `PUT /api/auth/change-password`: Đổi mật khẩu
- `POST /api/auth/logout`: Đăng xuất

---

## 4. Đặc Tả Endpoints MODULE 3: Quản Lý Người Dùng (User Management)
- `GET /api/users`: Danh sách phân trang, tìm kiếm, lọc
- `GET /api/users/:id`: Chi tiết người dùng kèm thống kê số phiếu sự cố
- `POST /api/users`: Tạo người dùng mới (Chỉ ADMIN)
- `PUT /api/users/:id`: Sửa thông tin người dùng (Chỉ ADMIN)
- `PATCH /api/users/:id/status`: Khóa / Mở khóa tài khoản (Chỉ ADMIN)
- `PATCH /api/users/:id/reset-password`: Đặt lại mật khẩu tài khoản (Chỉ ADMIN)

---

## 5. Đặc Tả Endpoints MODULE 4: Quản Lý Thiết Bị & Danh Mục (Device & Asset Master Data)
- `GET /api/devices`: Danh sách thiết bị (Phân trang, tìm kiếm, lọc theo loại/tòa nhà/trạng thái, sắp xếp)
- `GET /api/devices/:id`: Chi tiết thiết bị kèm danh sách lịch sử sửa chữa/bảo trì
- `POST /api/devices`: Thêm mới thiết bị, tự động sinh mã Token QR duy nhất
- `PUT /api/devices/:id`: Cập nhật cấu hình thiết bị
- `PATCH /api/devices/:id/status`: Cập nhật nhanh trạng thái thiết bị
- `DELETE /api/devices/:id`: Xóa hoàn toàn hoặc tự động chuyển `status = 'RETIRED'` nếu đã có lịch sử bảo trì
- `GET/POST/PUT/DELETE /api/buildings`: Quản lý Tòa nhà
- `GET/POST/PUT/DELETE /api/locations`: Quản lý Phòng học / Địa điểm
- `GET/POST/PUT/DELETE /api/departments`: Quản lý Khoa / Phòng ban
- `GET/POST/PUT/DELETE /api/device-types`: Quản lý Loại thiết bị & chu kỳ bảo dưỡng
- `GET/POST/PUT/DELETE /api/suppliers`: Quản lý Nhà cung cấp & đối tác bảo hành

---

## 6. Đặc Tả Endpoints MODULE 5: QR Code & Public Scanning Endpoints
- `GET /api/devices/:id/qr`: Lấy dữ liệu QR, link URL và Base64 PNG HD (Admin/Manager)
- `GET /api/public/devices/qr/:token`: Tra cứu thông tin thiết bị công khai khi quét QR bằng Camera điện thoại (Public, không cần đăng nhập)

---

## 7. Đặc Tả Endpoints MODULE 6: Báo Cáo Sự Cố (Maintenance Requests)
- `POST /api/maintenance`: Tạo phiếu báo sự cố mới (Tự sinh mã `REQ00001`, tự động tính `due_at` theo SLA, `status = PENDING`)
- `GET /api/maintenance/my`: Danh sách phiếu cá nhân của người dùng hiện tại
- `GET /api/maintenance/:id`: Xem chi tiết phiếu kèm dòng thời gian lịch sử và thông số hạn chót SLA

---

## 8. Đặc Tả Endpoints MODULE 7: Quy Trình Kỹ Thuật Viên (Technician Workflow)
- `POST /api/maintenance/:id/assign`: Phân công KTV (`PENDING` ➔ `ASSIGNED`)
- `POST /api/maintenance/:id/start`: Bắt đầu xử lý (`ASSIGNED` / `REOPENED` ➔ `IN_PROGRESS`)
- `POST /api/maintenance/:id/waiting-part`: Chờ linh kiện (`IN_PROGRESS` ➔ `WAITING_PART`)
- `POST /api/maintenance/:id/resume`: Tiếp tục xử lý (`WAITING_PART` ➔ `IN_PROGRESS`)
- `POST /api/maintenance/:id/complete`: Hoàn tất sửa chữa (`IN_PROGRESS` ➔ `COMPLETED`), lưu linh kiện và chi phí
- `GET /api/maintenance/technician/stats`: Thống kê KPI Dashboard Kỹ thuật viên (kèm `dueSoonTickets`, `overdueTickets`, `slaComplianceRate`)

---

## 9. Đặc Tả Endpoints MODULE 8: Nghiệm Thu Người Dùng & Đóng Phiếu (Acceptance)
- `POST /api/maintenance/:id/accept`: Xác nhận "Đã khắc phục" ➔ `CLOSED`
- `POST /api/maintenance/:id/reopen`: Phản hồi "Chưa khắc phục" ➔ `REOPENED`

---

## 10. Đặc Tả Endpoints MODULE 9: Kế Hoạch & Lịch Bảo Dưỡng Định Kỳ (Preventative Maintenance)
- `GET /api/schedules`: Danh sách lịch bảo dưỡng
- `GET /api/schedules/stats`: Thống kê chỉ số cảnh báo (Upcoming, Due, Overdue, Completed)
- `POST /api/schedules`: Tạo lịch bảo trì định kỳ mới, tự động tính ngày chạy kế tiếp
- `PUT /api/schedules/:id`: Cập nhật lịch bảo dưỡng
- `POST /api/schedules/:id/execute`: Thực hiện bảo dưỡng và tính chu kỳ tiếp theo
- `DELETE /api/schedules/:id`: Xóa kế hoạch bảo dưỡng

---

## 11. Đặc Tả Endpoints MODULE 10: Hệ Thống Thông Báo Nội Bộ (Notification System)
- `GET /api/notifications`: Danh sách thông báo người dùng
- `GET /api/notifications/unread-count`: Số lượng thông báo chưa đọc
- `PATCH /api/notifications/:id/read`: Đánh dấu 1 thông báo đã đọc
- `PATCH /api/notifications/read-all`: Đánh dấu tất cả đã đọc
- `DELETE /api/notifications/:id`: Xóa thông báo
- `POST /api/notifications/scan-system-alerts`: Quét cảnh báo hệ thống tự động

---

## 12. Đặc Tả Endpoints MODULE 11: Bảng Điều Khiển Quản Trị & Biểu Đồ (Management Dashboard)
- `GET /api/dashboard/stats`: Thống kê 8 thẻ KPI tổng quan kèm tỷ lệ tuân thủ SLA
- `GET /api/dashboard/charts`: Lấy toàn bộ dữ liệu 8 biểu đồ phân tích
- `GET /api/dashboard/meta/filters`: Lấy danh mục options cho bộ lọc đa chiều

---

## 13. Đặc Tả Endpoints MODULE 12: Trung Tâm Báo Cáo & Xuất Dữ Liệu (Reporting & Exports)
- `GET /api/reports/:type/preview`: Xem trước bảng dữ liệu 7 loại báo cáo
- `GET /api/reports/:type/export?format=xlsx|csv`: Xuất tải file Excel (.xlsx) hoặc CSV chuẩn UTF-8

---

## 14. Đặc Tả Endpoints MODULE 13: Quản Lý Cam Kết Mức Độ Dịch Vụ (SLA Management)
- `GET /api/dashboard/sla`: Phân tích tuân thủ SLA theo mức ưu tiên và theo KTV
- `GET /api/maintenance?isOverdue=true`: Lọc danh sách các phiếu đã quá hạn SLA
- `GET /api/maintenance?isDueSoon=true`: Lọc danh sách các phiếu sắp quá hạn SLA (<= 2 giờ)

---

## 15. Đặc Tả Endpoints MODULE 14: Phân Tích Tình Trạng Sức Khỏe Thiết Bị (Asset Health Analytics)

### 15.1. Phân tích sức khỏe thiết bị & Tính điểm Asset Health Score (0 - 100)
- **Endpoint**: `GET /api/devices/:id/health-analytics`
- **Quyền hạn**: Mọi người dùng đã đăng nhập (`ADMIN`, `MANAGER`, `TECHNICIAN`, `USER`)
- **Thuật toán**: Rule-Based Analytics Engine (Quy tắc định lượng minh bạch)
- **Response**:
```json
{
  "success": true,
  "message": "Phân tích sức khỏe thiết bị thành công",
  "data": {
    "deviceId": 1,
    "deviceCode": "DEV-2026-0001",
    "deviceName": "Máy chiếu Sony Laser VPL-PHZ60 #A1-101",
    "deviceStatus": "ACTIVE",
    "metrics": {
      "incidentCount": 2,
      "maintenanceCount": 3,
      "totalRepairCost": 550000,
      "downtimeHours": 1,
      "assetAgeMonths": 36,
      "assetAgeYears": 3.0,
      "assetAgeText": "3 năm (36 tháng)",
      "avgRepairCost": 275000,
      "incidentFrequencyPerYear": 0.67
    },
    "healthScore": 76,
    "healthRating": "WARNING",
    "ratingLabel": "CẦN LƯU Ý",
    "ratingColor": "amber",
    "recommendation": "Thiết bị có dấu hiệu hao mòn hoặc tần suất hỏng nhẹ. Cần tăng cường kiểm tra định kỳ và vệ sinh bảo dưỡng.",
    "deductions": [
      {
        "factor": "Tần suất sự cố hỏng hóc",
        "points": -12,
        "detail": "2 lần sự cố"
      },
      {
        "factor": "Thời gian vận hành & Khấu hao thiết bị",
        "points": -12,
        "detail": "Đã đưa vào sử dụng 3 năm (36 tháng)"
      }
    ],
    "lastEvaluatedAt": "2026-08-19T00:50:00.000Z"
  }
}
```

### 15.2. Thang đo phân loại tình trạng sức khỏe:
- **80 — 100**: `GOOD` (🟢 Tốt — Vận hành ổn định, độ tin cậy cao)
- **60 — 79**: `WARNING` (🟡 Cần Lưu Ý — Có hao mòn nhẹ, cần bảo dưỡng phòng ngừa)
- **40 — 59**: `RISK` (🟠 Nguy Cơ Cao — Hỏng hóc thường xuyên, chi phí sửa cao)
- **0 — 39**: `CRITICAL` (🔴 Nghiêm Trọng — Hư hỏng nặng hoặc vượt ngưỡng kinh tế, đề xuất thanh lý/thay mới)
