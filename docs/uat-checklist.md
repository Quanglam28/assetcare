# 📋 BẢNG CHECKLIST KIỂM THỬ CHẤP NHẬN NGƯỜI DÙNG (UAT CHECKLIST)
## HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ ĐẠI HỌC UTT (ASSETCARE)

---

### 1. Phân quyền Người dùng Tham gia UAT (Test User Personas)

| Vai trò (Role) | Tài khoản Demo | Mật khẩu Demo | Phạm vi Chức năng Kiểm thử |
|---|---|---|---|
| **Quản trị viên (ADMIN)** | `admin` | `password123` | Toàn quyền hệ thống, quản lý người dùng, cấu hình thiết bị, ma trận rủi ro. |
| **Trưởng phòng / Quản lý (MANAGER)** | `manager` | `password123` | Điều phối lệnh công tác, phê duyệt kế hoạch bảo trì, xem báo cáo thống kê. |
| **Kỹ thuật viên (TECHNICIAN)** | `tech_nam` | `password123` | Nhận lệnh công tác, bắt đầu xử lý, cập nhật chi phí và hoàn tất sửa chữa. |
| **Giảng viên / Sinh viên (USER)** | `user_ha` | `password123` | Quét mã QR tại phòng học, báo cáo sự cố thiết bị, theo dõi tiến độ xử lý. |

---

### 2. Danh mục Kịch bản Kiểm thử UAT (21 Test Scenarios)

| # | Kịch bản Kiểm thử (Test Scenario) | Các bước Thực hiện (Test Steps) | Kết quả Mong đợi (Expected Result) | Trạng thái |
|---|---|---|---|:---:|
| 1 | **Admin Login / Logout** | Đăng nhập với `admin` / `password123` → Đăng xuất. | Đăng nhập thành công, Cookie `access_token` được gán; khi đăng xuất Cookie bị xóa sạch. | ✅ PASS |
| 2 | **User Register & Auto-Login** | Vào `/register` → Đăng ký tài khoản mới. | Tài khoản được tạo với Role `USER`, tự động tạo session và chuyển hướng tới Dashboard. | ✅ PASS |
| 3 | **Change Password** | Vào Thông tin cá nhân → Đổi mật khẩu mới (8+ ký tự có chữ và số). | Mật khẩu đổi thành công, mật khẩu cũ không còn đăng nhập được. | ✅ PASS |
| 4 | **Reset Password (Admin)** | Admin vào Quản lý người dùng → Reset password cho user. | Mật khẩu được cập nhật chuẩn xác theo chính sách tối thiểu 8 ký tự. | ✅ PASS |
| 5 | **QR Scanner (Camera)** | Mở Camera trên thiết bị di động quét mã QR dán trên máy chiếu/PC. | Ứng dụng nhận diện mã QR ngay lập tức, chuyển hướng tới trang thông tin thiết bị. | ✅ PASS |
| 6 | **QR Deep Link Direct Access** | Mở đường link `https://.../device/UNI-QR-2026-0001` từ tin nhắn/Zalo. | Mở trực tiếp trang thiết bị nếu đã đăng nhập; nếu chưa đăng nhập, lưu redirect và mở sau khi login. | ✅ PASS |
| 7 | **Device Detail Information** | Xem chi tiết thiết bị `DEV-2026-0001` (Máy chiếu Laser Panasonic). | Hiển thị đầy đủ thông số: Vị trí (Phòng 402-A1), tình trạng, lịch sử bảo trì, thời hạn bảo hành. | ✅ PASS |
| 8 | **Asset Health Score (Phase 1)** | Xem điểm sức khỏe thiết bị tại tab Sức khỏe. | Hiển thị điểm 0–100 [EXCELLENT/GOOD/FAIR/POOR] kèm 6 yếu tố định lượng (Tuổi thọ, sự cố...). | ✅ PASS |
| 9 | **Failure Risk Score (Phase 2)** | Xem điểm rủi ro hỏng hóc tại tab Rủi ro. | Hiển thị điểm 0–100 [LOW/MEDIUM/HIGH/CRITICAL] kèm giải thích định lượng đa chu kỳ. | ✅ PASS |
| 10 | **Maintenance Priority (Phase 3)** | Xem điểm ưu tiên xử lý thiết bị. | Hiển thị thứ tự ưu tiên (R1/R2/R3) kết hợp giữa Health Score và Risk Score. | ✅ PASS |
| 11 | **Auto Recommendation (Phase 3)** | Xem khuyến nghị hành động của hệ thống. | Hiển thị khuyến nghị thông minh: `REPAIR_NOW`, `SCHEDULE_PREVENTIVE`, `MONITOR`... | ✅ PASS |
| 12 | **Create Work Order (Phase 3)** | Manager tạo Lệnh công tác bảo trì từ khuyến nghị. | Phiếu công tác được tạo với mã chuẩn `WO-YYYY-XXXX`, gửi thông báo tới KTV được gán. | ✅ PASS |
| 13 | **Assign Technician** | Phân công KTV `tech_nam` vào Lệnh công tác. | Trạng thái chuyển sang `ASSIGNED`, KTV nhìn thấy phiếu trong danh sách công việc. | ✅ PASS |
| 14 | **Start & Complete Work Order** | KTV bắt đầu xử lý → Nhập chi phí thực tế → Nghiệm thu hoàn tất. | Lệnh công tác hoàn tất (`COMPLETED`), hệ thống tự động tính toán lại điểm Health & Risk. | ✅ PASS |
| 15 | **Real-time Notifications** | Báo cáo sự cố hoặc phân công công việc. | Chuông thông báo hiển thị số lượng chưa đọc; click mở đúng thực thể. | ✅ PASS |
| 16 | **Risk Matrix Analytics** | Mở trang Ma trận Rủi ro (`/analytics/risk-matrix`). | Biểu đồ 4 phân vùng trực quan (Khẩn cấp, Cần theo dõi, Dự phòng, An toàn) với 46 thiết bị. | ✅ PASS |
| 17 | **Predictive Simulation (Phase 4)** | Chọn kịch bản `MAINTAIN_NOW` hoặc `OVERDUE_90D` mô phỏng 60 ngày. | Đường cong biểu diễn suy giảm sức khỏe trong tương lai hiển thị mượt mà mà không làm ô nhiễm DB. | ✅ PASS |
| 18 | **Executive Dashboard** | Xem trang Tổng quan điều hành. | KPI cards hiển thị tổng thiết bị, tỷ lệ sẵn sàng, số phiếu sự cố đang mở, cảnh báo nguy cấp. | ✅ PASS |
| 19 | **RBAC Authorization Check** | User thường thử truy cập `/users` hoặc `/devices/create`. | Hệ thống chặn bằng trang `403 Forbidden` thân thiện, không cho phép thao tác trái phép. | ✅ PASS |
| 20 | **IDOR Access Control Check** | User thường thử xem phiếu sự cố của người khác. | Backend trả về HTTP 403 Forbidden, bảo mật thông tin giữa các người dùng. | ✅ PASS |
| 21 | **Safe Redirect Fallback** | Thử nhập `/login?redirect=https://evil.com`. | Hệ thống lọc an toàn và chuyển hướng về `/dashboard`, không để xảy ra Open Redirect. | ✅ PASS |
