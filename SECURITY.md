# CHÍNH SÁCH BẢO MẬT VÀ QUY CHUẨN AN TOÀN HỆ THỐNG (SECURITY.MD)

Dự án: **"Hệ thống thông tin quản lý tài sản và bảo trì thiết bị trong trường đại học bằng mã QR Code"**  
Tiêu chuẩn bảo mật: **OWASP Top 10 Security Standard Hardening**

---

## 1. Tổng Quan Kiến Trúc Bảo Mật (Security Architecture)

Hệ thống được thiết kế theo mô hình phòng thủ theo chiều sâu (*Defense in Depth*) với 8 lớp bảo vệ chặt chẽ:

```
[Client / Browser / QR Scanner]
        │
        ▼
[1. Helmet Security Headers + CORS Protection]
        │
        ▼
[2. Rate Limiting Middleware (Chống Brute-force / DoS)]
        │
        ▼
[3. JWT Authentication Middleware (Xác thực danh tính)]
        │
        ▼
[4. Server-Side RBAC Authorization (Phân quyền 4 vai trò)]
        │
        ▼
[5. Joi Input Validation + File Upload Whitelist Filter]
        │
        ▼
[6. Business Logic Services (Quy tắc nghiệp vụ)]
        │
        ▼
[7. Parameterized SQL Queries (Chống 100% SQL Injection)]
        │
        ▼
[8. MySQL Database + Masked Logger + Centralized Error Handler]
```

---

## 2. Xác Thực Danh Tính & Quản Lý Mật Khẩu (Authentication & Password Security)

### A. Mật khẩu & Thuật toán băm:
- Toàn bộ mật khẩu người dùng được băm an toàn bằng thuật toán **`bcrypt`** với hệ số muối (*Salt Rounds*) **10**.
- Tuyệt đối không lưu trữ hay truyền tải mật khẩu dưới dạng văn bản thô (*Plaintext*).
- Không trả về trường `password_hash` trong bất kỳ phản hồi API nào (`GET /api/users`, `GET /api/auth/me`, `GET /api/reports`...).

### B. Quản lý JSON Web Token (JWT):
- Xác thực Stateless qua HTTP Header `Authorization: Bearer <token>`.
- JWT Token được ký bảo mật với thuật toán mã hóa `HS256` và chuỗi `JWT_SECRET` độc lập trong biến môi trường.
- Thời gian sống của Token (`JWT_EXPIRES_IN`) được thiết lập có thời hạn.
- Tự động bắt và xử lý các lỗi `TokenExpiredError`, `JsonWebTokenError`.
- Tuyệt đối không để lộ `JWT_SECRET` ra ngoài máy khách hoặc trong mã nguồn Frontend.

---

## 3. Phân Quyền Kiểm Soát Truy Cập Dựa Trên Vai Trò (Role-Based Access Control - RBAC)

Hệ thống phân cấp 4 nhóm quyền rõ ràng và kiểm tra 100% tại máy chủ (Server-Side Enforcement):

| Vai Trò | Mã Quyền | Quyền Hạn Nghiệp Vụ Chính |
| :--- | :---: | :--- |
| **Quản trị viên** | `ADMIN` | Toàn quyền quản trị: Quản lý người dùng, Danh mục tài sản, Phân công, Duyệt sửa chữa, Cấu hình hệ thống, Xem báo cáo. |
| **Ban Quản lý** | `MANAGER` | Quản lý thiết bị phòng ban, Điều phối & giao việc KTV, Thiết lập lịch bảo dưỡng định kỳ, Xem Dashboard & Báo cáo thống kê. |
| **Kỹ thuật viên** | `TECHNICIAN` | Tiếp nhận ticket, Cập nhật tiến độ sửa chữa, Ghi nhận linh kiện & chi phí, Báo chờ vật tư, Hoàn tất kỹ thuật. Không có quyền sửa người dùng/xóa thiết bị. |
| **Người dùng** | `USER` | Quét QR Code, Xem thông tin máy, Tạo phiếu báo hỏng sự cố, Theo dõi tiến độ cá nhân, Nghiệm thu thiết bị 5 sao khi hoàn tất. |

---

## 4. Phòng Chống Tấn Công SQL Injection

- **100% câu lệnh truy vấn CSDL** sử dụng phương thức `pool.execute(sql, [params])` với cơ chế tham số hóa (*Parameterized Queries / Prepared Statements*) bằng ký tự giữ chỗ `?`.
- Tuyệt đối không sử dụng kỹ thuật nối chuỗi trực tiếp (`String concatenation / Template literals`) vào câu lệnh SQL.
- Các tham số phân trang (`LIMIT`, `OFFSET`) được ép kiểu số nguyên an toàn `parseInt(..., 10)`.
- Các trường sắp xếp (`sortBy`, `sortOrder`) được kiểm tra qua danh sách trắng (*Whitelist allowed columns*) trước khi thực thi.

---

## 5. Phòng Chống Tấn Công XSS & CSRF (Cross-Site Scripting & Request Forgery)

- **HTTP Security Headers**: Sử dụng thư viện `helmet` thiết lập các tiêu đề bảo mật nâng cao:
  - `X-Content-Type-Options: nosniff` (Chống MIME-type sniffing).
  - `X-Frame-Options: SAMEORIGIN` (Chống Clickjacking).
  - `X-XSS-Protection: 1; mode=block` (Chống Cross-site scripting).
  - `Strict-Transport-Security` (Cưỡng bức HTTPS).
- **CORS Protection**: Cấu hình giới hạn danh sách Domain nguồn cho phép truy cập tài nguyên.
- **Xác thực Stateless**: Sử dụng JWT Bearer Token trong Header giúp loại bỏ hoàn toàn nguy cơ tấn công CSRF phổ biến trên Cookie.

---

## 6. Kiểm Soát Tần Suất Truy Cập (Rate Limiting)

Hệ thống tích hợp 3 cấp độ Rate Limiting nhằm chống lại các cuộc tấn công Brute-force dò mật khẩu và từ chối dịch vụ (DoS):

1. **Cổng Đăng Nhập (`authRateLimiter`)**: Tối đa **15 yêu cầu / phút / IP** tại `/api/auth/login` và `/api/auth/change-password`.
2. **Cổng Quét Mã QR Công Khai (`publicScanRateLimiter`)**: Tối đa **60 lượt quét / phút / IP** tại `/api/public/devices/qr/:token`.
3. **Toàn Bộ Hệ Thống API (`apiRateLimiter`)**: Tối đa **500 yêu cầu / phút / IP**.

---

## 7. Quy Chuẩn Tải Lên Tệp Tin An Toàn (File Upload Hardening)

Quy trình tải lên tệp tin đính kèm và hình ảnh sự cố được kiểm soát nghiêm ngặt:

1. **Whitelist MIME Type**: Chỉ chấp nhận `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`.
2. **Whitelist Extension**: Chỉ cho phép `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.pdf`.
3. **Blacklist Cấm Tuyệt Đối Tệp Thực Thi Nguy Hiểm**:
   - Khóa chặn toàn bộ các đuôi tệp: `.exe`, `.bat`, `.cmd`, `.sh`, `.php`, `.phtml`, `.js`, `.py`, `.pl`, `.cgi`, `.msi`, `.vbs`, `.scr`, `.jar`, `.asp`, `.aspx`, `.env`...
4. **Tên tệp ngẫu nhiên an toàn**: Tự động sinh tên file mới bằng chuỗi mã hóa ngẫu nhiên `crypto.randomBytes` kết hợp Timestamp, triệt tiêu nguy cơ tấn công *Path Traversal* (`../`).
5. **Giới hạn dung lượng**: Giới hạn tối đa **5MB / tệp** và tối đa **5 tệp / lần tải lên**.

---

## 8. Chống Rò Rỉ Thông Tin Nhạy Cảm & Xử Lý Lỗi (Information Leakage Prevention)

- **Bộ Lọc Ghi Nhật Ký (Masked Logger)**:
  - Tự động phát hiện và khử/ẩn (*Mask*) toàn bộ các trường nhạy cảm như `password`, `oldPassword`, `newPassword`, `token`, `secret`, `jwtSecret` trước khi ghi ra Console hoặc File log.
- **Middleware Bắt Lỗi Tập Trung**:
  - Không bao giờ trả về Stack trace, cấu trúc bảng CSDL hoặc lỗi hệ thống thô cho Client.
  - Phản hồi lỗi chuẩn hóa: `{ success: false, message: "...", errors: [...] }`.

---

## 9. Quản Lý Biến Môi Trường & Bí Mật Hệ Thống

- Mọi thông tin nhạy cảm (Tài khoản CSDL, Mật khẩu DB, JWT Secret, Port) được lưu trữ riêng biệt trong file `.env`.
- File `.env` được đưa vào `.gitignore` để tránh đẩy lên kho lưu trữ mã nguồn công khai.
- Cung cấp file `.env.example` với các cấu hình mẫu phục vụ triển khai an toàn.

---

## 10. Hướng Dẫn Báo Cáo Lỗ Hổng An Ninh (Security Disclosure)

Nếu phát hiện bất kỳ nguy cơ hoặc lỗ hổng bảo mật nào trong hệ thống, vui lòng liên hệ trực tiếp với Ban Quản trị Hệ thống CNTT Nhà trường để được tiếp nhận và vá lỗi kịp thời.
