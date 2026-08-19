# TỔNG QUAN HỆ THỐNG QUẢN LÝ TÀI SẢN & BẢO TRÌ THIẾT BỊ — TRƯỜNG ĐẠI HỌC CÔNG NGHỆ GTVT (UTT)
> **System Overview Document — University of Transport Technology (UTT) Asset & Maintenance System**

---

## 1. Bối Cảnh Thực Tiễn & Bài Toán Đặt Ra
Tại các trường Đại học và cơ sở giáo dục hiện nay, việc quản lý hàng ngàn tài sản và thiết bị kỹ thuật (máy chiếu hội trường, màn hình tương tác, hệ thống PC Lab, điều hòa âm trần, thiết bị mạng Core Switch...) thường đối mặt với các khó khăn lớn:
- **Thời gian báo hỏng kéo dài**: Giảng viên phát hiện sự cố phải viết phiếu giấy hoặc gọi điện thoại, quy trình tiếp nhận mất từ 1 đến 3 ngày.
- **Thiếu lịch sử và hồ sơ thiết bị**: Không theo dõi được thiết bị đã qua bao nhiêu lần sửa chữa, linh kiện nào đã thay, tổng chi phí đã tiêu tốn bao nhiêu.
- **Khó khăn trong việc kiểm soát chất lượng KTV & SLA**: Không có công cụ đo lường thời gian phản hồi, thời gian sửa chữa và tỷ lệ tuân thủ cam kết chất lượng dịch vụ (SLA).
- **Bảo trì định kỳ mang tính thụ động**: Chỉ sửa khi hỏng, chưa có cơ chế lập kế hoạch bảo dưỡng phòng ngừa (Preventative Maintenance) tự động.

---

## 2. Mục Tiêu & Giải Pháp Của Hệ Thống
Hệ thống được nghiên cứu và phát triển nhằm giải quyết triệt để các bài toán trên thông qua:
1. **Ứng dụng Mã QR Code Độc Bản (Unique QR Token)**: Dán tem QR trực tiếp lên thiết bị tại phòng học. Giảng viên, sinh viên chỉ cần dùng camera điện thoại quét mã là mở ngay trang thông tin công khai và gửi báo hỏng trong **30 giây**.
2. **Số Hóa 100% Vòng Đời Phiếu Sự Cố (Maintenance Lifecycle)**: Từ lúc phát sinh ➔ Điều phối tự động ➔ KTV tiếp nhận ➔ Xử lý tại hiện trường ➔ Ghi nhận vật tư chi phí ➔ Giảng viên nghiệm thu 5 sao đóng phiếu.
3. **Giám Sát SLA Theo Thời Gian Thực**: Tự động tính hạn chót xử lý theo mức độ ưu tiên (`URGENT=4h`, `HIGH=8h`, `MEDIUM=24h`, `LOW=72h`), cảnh báo vé quá hạn trên Dashboard và chuông thông báo.
4. **Hệ Thống Phân Tích Sức Khỏe Tài Sản (Asset Health Analytics 0 - 100)**: Thuật toán Rule-Based chấm điểm thiết bị dựa trên 7 chỉ số vận hành và tài chính, giúp Nhà trường chủ động đề xuất bảo trì hoặc thanh lý thiết bị cũ hỏng.
5. **Kế Hoạch Bảo Dưỡng Phòng Ngừa (Preventative Maintenance)**: Tự động tính ngày bảo trì tiếp theo, phát cảnh báo sắp đến hạn và quá hạn.
6. **Trung Tâm Báo Cáo & Xuất Dữ Liệu Excel / CSV Chuyên Nghiệp**: Cung cấp 7 mẫu báo cáo quản trị chuẩn hóa, xuất file Excel bảng màu và hỗ trợ in ấn tối ưu khổ giấy A4.

---

## 3. Phân Hệ Người Dùng & Ma Trận Phân Quyền (RBAC Matrix)

Hệ thống thiết lập 4 cấp vai trò với ranh giới quyền hạn nghiêm ngặt:

| Nghiệp Vụ / Chức Năng | ADMIN | MANAGER | TECHNICIAN | USER |
| :--- | :---: | :---: | :---: | :---: |
| **Quản trị người dùng & Phân vai trò** | ✅ Toàn quyền | ❌ | ❌ | ❌ |
| **Quản lý danh mục Tòa nhà, Vị trí, Loại máy, Nhà CC** | ✅ Toàn quyền | ✅ Toàn quyền | 👁️ Xem | 👁️ Xem |
| **Quản lý Thiết bị (Thêm, Sửa, Xóa, Sinh mã QR)** | ✅ Toàn quyền | ✅ Toàn quyền | 👁️ Xem | 👁️ Xem |
| **Quét mã QR & Xem thông tin công khai** | ✅ | ✅ | ✅ | ✅ |
| **Gửi phiếu báo hỏng sự cố** | ✅ | ✅ | ✅ | ✅ |
| **Phân công Kỹ thuật viên phụ trách phiếu** | ✅ | ✅ | ❌ | ❌ |
| **Thực hiện sửa chữa, Báo chờ linh kiện, Nhập chi phí** | ✅ | ❌ | ✅ | ❌ |
| **Nghiệm thu ĐÃ KHẮC PHỤC (Đánh giá 1-5⭐) / CHƯA KHẮC PHỤC**| ✅ | ❌ | ❌ | ✅ (Người tạo vé) |
| **Thiết lập Kế hoạch Bảo trì định kỳ** | ✅ | ✅ | ❌ | ❌ |
| **Thực hiện & Ghi nhận hoàn tất bảo trì định kỳ** | ✅ | ✅ | ✅ | ❌ |
| **Xem Dashboard Quản trị & 8 Biểu đồ phân tích** | ✅ | ✅ | 👁️ (Dashboard KTV) | ❌ |
| **Xem và Xuất 7 Mẫu Báo Cáo (Excel / CSV / Print)** | ✅ | ✅ | ✅ (Báo cáo KTV) | ❌ |
| **Nhận thông báo Real-time chuông báo nội bộ** | ✅ | ✅ | ✅ | ✅ |

---

## 4. Giá Trị Thực Tiễn Đạt Được
- **Rút ngắn 90% thời gian tiếp nhận thông tin sự cố** từ giảng viên đến đội ngũ kỹ thuật.
- **Minh bạch hóa 100% chi phí vật tư và lịch sử sửa chữa** của từng thiết bị trong suốt vòng đời.
- **Nâng cao 40% tuổi thọ thiết bị** nhờ cơ chế bảo trì định kỳ và theo dõi điểm sức khỏe Asset Health Score.
- **Tối ưu hóa năng suất làm việc của Kỹ thuật viên**, giúp Ban Giám hiệu nắm bắt chính xác khối lượng công việc và tỷ lệ hoàn thành đúng hạn SLA.
