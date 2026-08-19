# BÁO CÁO KIỂM THỬ HỆ THỐNG TOÀN DIỆN (SYSTEM TESTING & QUALITY ASSURANCE)
> **Comprehensive Test Suites, Edge Cases Verification & Database Validation**

---

## 1. Tổng Kết Kiểm Thử Toàn Diện (Testing Summary)

Toàn bộ hệ thống đã trải qua quá trình kiểm thử tự động hóa nghiêm ngặt trên cả 10 phân hệ tính năng và 10 kịch bản biên quan trọng (*Critical Edge Cases*).

- **Tổng số kịch bản kiểm thử**: **23 / 23 Kịch bản**
- **Tỷ lệ Pass**: **100% (23 PASSED | 0 FAILED)**
- **Thời gian thực thi Test Suite**: **~4.8 giây**
- **Tập tin kiểm thử chính**: `backend/src/test_full_system_suite.js`

---

## 2. Chi Tiết Kết Quả Kiểm Thử 10 Module Cốt Lõi

| STT | Module Kiểm Thử | Trường Hợp Kiểm Thử (Test Cases) | Kết Quả |
| :---: | :--- | :--- | :---: |
| 1 | **AUTH** | Đăng nhập cấp JWT Bearer Token thành công cho cả 4 vai trò: `ADMIN`, `MANAGER`, `TECHNICIAN`, `USER`. | ✅ PASS |
| 2 | **DEVICE** | Lấy danh sách thiết bị phân trang, tìm kiếm đa tiêu chí và xem chi tiết hồ sơ tài sản. | ✅ PASS |
| 3 | **QR ENGINE** | Sinh mã QR Base64 PNG HD và tra cứu thông tin công khai không cần đăng nhập. | ✅ PASS |
| 4 | **MAINTENANCE** | Tạo phiếu báo hỏng sự cố mới, tự động cấp mã tuần tự `REQ000xx` và tính hạn chót SLA. | ✅ PASS |
| 5 | **TECHNICIAN** | Chu trình vòng đời KTV: `PENDING` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `WAITING_PART` ➔ `COMPLETED`. | ✅ PASS |
| 6 | **SCHEDULE** | Thống kê và quản lý 10 kế hoạch bảo trì định kỳ (`UPCOMING`, `DUE`, `OVERDUE`, `COMPLETED`). | ✅ PASS |
| 7 | **NOTIFICATION**| Đếm số lượng thông báo chưa đọc, đánh dấu đã đọc một chạm và quét cảnh báo quá hạn. | ✅ PASS |
| 8 | **DASHBOARD** | Truy vấn tổng hợp động 8 thẻ KPI và 8 biểu đồ phân tích chuyên sâu từ CSDL MySQL. | ✅ PASS |
| 9 | **REPORT** | Kết xuất dữ liệu 7 mẫu báo cáo quản trị và xuất file Excel `.xlsx` / `.csv`. | ✅ PASS |
| 10| **RBAC** | Xác thực phân quyền 4 cấp vai trò chặt chẽ tại Backend Middleware. | ✅ PASS |

---

## 3. Chi Tiết 10 Kịch Bản Biên Quan Trọng (10 Critical Edge Cases)

```
[Case 1] USER không thể truy cập API Quản trị
➔ HTTP 403 Forbidden: "Bạn không có quyền thực hiện hành động này. Yêu cầu một trong các quyền: [ADMIN]"
➔ Trạng thái: ✅ PASS

[Case 2] TECHNICIAN không thể xóa thiết bị
➔ HTTP 403 Forbidden: "Bạn không có quyền thực hiện hành động này. Yêu cầu: [ADMIN, MANAGER]"
➔ Trạng thái: ✅ PASS

[Case 3] USER chỉ xem được phiếu yêu cầu của chính mình
➔ HTTP 403 Forbidden: "Bạn không có quyền xem phiếu yêu cầu bảo trì của người khác"
➔ Trạng thái: ✅ PASS

[Case 4] Tra cứu mã QR token không tồn tại trong hệ thống
➔ HTTP 404 Not Found: "Không tìm thấy thiết bị ứng với mã QR: [INVALID_NON_EXISTENT_QR_TOKEN_99999]"
➔ Trạng thái: ✅ PASS

[Case 5] Khóa chặn bước chuyển trạng thái sai quy trình (State Machine Validation)
➔ Chuyển trực tiếp từ PENDING sang COMPLETED
➔ HTTP 400 Bad Request: "Không thể hoàn thành trực tiếp phiếu đang ở trạng thái PENDING. Cần được phân công và bắt đầu xử lý."
➔ Trạng thái: ✅ PASS

[Case 6] Phiếu đã nghiệm thu và đóng (CLOSED) không thể sửa tùy tiện
➔ Cố ý phân công lại hoặc thay đổi trạng thái vé đã CLOSED
➔ HTTP 400 Bad Request: "Phiếu bảo trì này đã được nghiệm thu và đóng hoàn tất (CLOSED), không thể phân công lại."
➔ Trạng thái: ✅ PASS

[Case 7] Khóa chặn tải lên tệp tin thực thi nguy hiểm (.exe, .php, .sh)
➔ HTTP 400 Bad Request: "Cảnh báo an ninh: Loại tệp [.exe] bị cấm tải lên hệ thống."
➔ Trạng thái: ✅ PASS

[Case 8] Thiết bị đã thanh lý (RETIRED) không thể tạo phiếu bảo trì mới
➔ HTTP 400 Bad Request: "Thiết bị này đã được thanh lý hoặc ngừng sử dụng (RETIRED), không thể tạo phiếu bảo trì mới."
➔ Trạng thái: ✅ PASS

[Case 9] Tự động tính toán hạn chót SLA chính xác tuyệt đối
➔ Mức URGENT: due_at = created_at + 4 giờ
➔ Trạng thái: ✅ PASS

[Case 10] Số liệu Bảng điều khiển (Dashboard) tổng hợp động 100% từ CSDL MySQL
➔ Khớp 100% giữa kết quả API Dashboard và câu lệnh SQL Aggregate trực tiếp trên database
➔ Trạng thái: ✅ PASS
```
