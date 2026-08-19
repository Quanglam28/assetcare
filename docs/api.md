# ĐẶC TẢ CHI TIẾT RESTFUL API (API SPECIFICATION)
> **University Asset & Maintenance Management RESTful API Reference**

---

## 1. Chuẩn Quy Ước API (API Conventions)

- **Base URL**: `http://localhost:5000/api`
- **Định dạng Dữ liệu**: `application/json` (Encoding: UTF-8)
- **Xác thực**: Bearer Token gửi qua HTTP Header:  
  `Authorization: Bearer <your_jwt_access_token>`
- **Cấu trúc Phản hồi Chuẩn (Standard Response Format)**:
  - **Thành công (200, 201)**:
    ```json
    {
      "success": true,
      "message": "Thông báo thực hiện thành công",
      "data": { ... },
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50,
        "totalPages": 5
      }
    }
    ```
  - **Thất bại (400, 401, 403, 404, 500)**:
    ```json
    {
      "success": false,
      "message": "Nội dung thông báo lỗi cụ thể",
      "errorCode": "RESOURCE_NOT_FOUND",
      "errors": []
    }
    ```

---

## 2. Danh Mục Các Endpoint RESTful API

### A. Phân Hệ Xác Thực (Authentication - `/api/auth`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Public | Đăng nhập hệ thống (Body: `username`, `password`) |
| `GET` | `/api/auth/me` | Authenticated | Lấy thông tin tài khoản đang đăng nhập |
| `POST` | `/api/auth/change-password` | Authenticated | Đổi mật khẩu tài khoản |

---

### B. Phân Hệ Tra Cứu Công Khai QR Code (Public QR - `/api/public`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/public/devices/qr/:token` | Public | Tra cứu thông tin thiết bị công khai không nhạy cảm khi quét mã QR |

---

### C. Phân Hệ Quản Lý Thiết Bị (Devices - `/api/devices`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/devices` | Authenticated | Danh sách thiết bị (Hỗ trợ phân trang `page`, `limit`, tìm kiếm `search`, lọc `buildingId`, `locationId`, `deviceTypeId`, `status`) |
| `GET` | `/api/devices/:id` | Authenticated | Chi tiết thiết bị & Hồ sơ lịch sử bảo trì |
| `GET` | `/api/devices/:id/qr` | Admin, Manager | Lấy mã QR Base64 PNG HD |
| `GET` | `/api/devices/:id/health-analytics`| Authenticated | Lấy phân tích 7 chỉ số & Asset Health Score (0-100) |
| `POST` | `/api/devices` | Admin, Manager | Thêm thiết bị mới vào hệ thống |
| `PUT` | `/api/devices/:id` | Admin, Manager | Chỉnh sửa thông tin thiết bị |
| `DELETE` | `/api/devices/:id` | Admin, Manager | Xóa thiết bị khỏi hệ thống |

---

### D. Phân Hệ Quản Lý Phiếu Bảo Trì (Maintenance Requests - `/api/maintenance`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/maintenance` | Authenticated | Tạo phiếu báo hỏng sự cố mới |
| `GET` | `/api/maintenance` | Admin, Manager, Tech | Danh sách toàn bộ phiếu bảo trì trong trường |
| `GET` | `/api/maintenance/my` | Authenticated | Danh sách phiếu do chính người dùng hiện tại báo |
| `GET` | `/api/maintenance/:id` | Authenticated | Chi tiết phiếu, danh sách vật tư & timeline lịch sử |
| `POST` | `/api/maintenance/:id/assign` | Admin, Manager | Phân công Kỹ thuật viên phụ trách phiếu |
| `POST` | `/api/maintenance/:id/start` | Technician, Admin | KTV bắt đầu tiến hành sửa chữa tại hiện trường |
| `POST` | `/api/maintenance/:id/waiting-part`| Technician, Admin | KTV báo tạm dừng chờ linh kiện thay thế |
| `POST` | `/api/maintenance/:id/resume` | Technician, Admin | KTV tiếp tục xử lý sau khi nhận linh kiện |
| `POST` | `/api/maintenance/:id/complete` | Technician, Admin | KTV hoàn thành sửa chữa (Linh kiện, chi phí, giải pháp) |
| `POST` | `/api/maintenance/:id/accept` | User, Admin | Giảng viên nghiệm thu ĐÃ KHẮC PHỤC (1-5 sao ⭐) và đóng phiếu |
| `POST` | `/api/maintenance/:id/reopen` | User, Admin | Giảng viên phản hồi CHƯA KHẮC PHỤC và yêu cầu sửa lại |

---

### E. Phân Hệ Bảo Trì Định Kỳ (Preventative Maintenance - `/api/schedules`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/schedules` | Authenticated | Danh sách kế hoạch bảo dưỡng định kỳ |
| `GET` | `/api/schedules/stats` | Authenticated | Thống kê số lượng kế hoạch theo trạng thái |
| `POST` | `/api/schedules` | Admin, Manager | Thiết lập lịch bảo dưỡng định kỳ mới |
| `POST` | `/api/schedules/:id/execute` | Technician, Manager | Ghi nhận thực hiện hoàn tất bảo dưỡng định kỳ |

---

### F. Phân Hệ Thông Báo Nội Bộ (Notifications - `/api/notifications`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/notifications` | Authenticated | Danh sách thông báo nội bộ của người dùng |
| `GET` | `/api/notifications/unread-count`| Authenticated | Đếm số lượng thông báo chưa đọc |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Đánh dấu đã đọc một thông báo |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Đánh dấu đã đọc toàn bộ thông báo |

---

### G. Phân Hệ Bảng Điều Khiển Quản Trị (Dashboard - `/api/dashboard`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/dashboard/stats` | Admin, Manager | Lấy 8 thẻ KPI tổng quan số liệu tài sản & bảo trì |
| `GET` | `/api/dashboard/charts` | Admin, Manager | Lấy dữ liệu 8 biểu đồ phân tích chuyên sâu |

---

### H. Phân Hệ Trung Tâm Báo Cáo (Reports - `/api/reports`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/reports/:type/preview` | Admin, Manager, Tech | Xem trước bảng dữ liệu báo cáo (Hỗ trợ 7 mẫu báo cáo) |
| `GET` | `/api/reports/:type/export` | Admin, Manager, Tech | Xuất báo cáo ra định dạng file Excel `.xlsx` hoặc `.csv` |

---

### I. Phân Hệ Tải Lên Tệp Tin (File Upload - `/api/upload`)
| Phương thức | Endpoint | Yêu cầu Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/upload/image` | Authenticated | Tải lên hình ảnh minh chứng sự cố (JPG, PNG, WebP) |
| `POST` | `/api/upload/document` | Authenticated | Tải lên tài liệu kỹ thuật hoặc PDF |
