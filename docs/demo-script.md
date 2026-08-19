# KỊCH BẢN THUYẾT TRÌNH & BẢO VỆ ĐỒ ÁN (DEMO SCRIPT: 7 - 10 PHÚT)
> **Trường Đại học Công nghệ Giao thông Vận tải (UTT) — Hệ thống Quản lý Tài sản & Bảo trì QR Code**

---

## 1. Phân Bổ Thời Gian Thuyết Trình Tổng Thể

| Bước | Nội Dung Trình Diễn | Thời Gian | Tài Khoản Sử Dụng | Màn Hình / Thao Tác |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Giới thiệu & Đăng nhập hệ thống | 0.5 phút | `admin` (Phạm Quang Lâm) | Trang Đăng nhập `/login` |
| **2** | Quản lý danh mục thiết bị & Mã QR | 1.0 phút | `admin` (Phạm Quang Lâm) | Trang Thiết bị `/devices` & In nhãn QR |
| **3** | Giả lập Quét mã QR trên điện thoại | 1.0 phút | Khách / Giảng viên | Trang Quét QR `/qr-scanner` hoặc `/device/:token` |
| **4** | Gửi phiếu báo hỏng sự cố (30s) | 1.0 phút | `user_ha` (TS. Nguyễn Thu Hà) | Trang Báo hỏng `/report-issue` |
| **5** | Quản lý phân công Kỹ thuật viên | 0.5 phút | `manager` (Tống Quang Trung) | Danh sách phiếu `/maintenance` |
| **6** | Kỹ thuật viên tiếp nhận & Xử lý | 1.0 phút | `tech_nam` (Vũ Hải Vịnh) | Dashboard KTV `/technician/dashboard` |
| **7** | KTV ghi nhận linh kiện & Hoàn thành | 1.0 phút | `tech_nam` (Vũ Hải Vịnh) | Modal Hoàn thành sửa chữa |
| **8** | Giảng viên nghiệm thu 5 sao đóng vé | 1.0 phút | `user_ha` (TS. Nguyễn Thu Hà) | Phiếu của tôi `/my-tickets` ➔ Nghiệm thu |
| **9** | Ban Quản lý xem Dashboard & 8 Biểu đồ | 1.0 phút | `manager` (Tống Quang Trung) | Bảng điều khiển `/dashboard` |
| **10**| Xem & Xuất Báo cáo Excel / PDF | 1.0 phút | `manager` (Tống Quang Trung) | Trung tâm báo cáo `/reports` |

---

## 2. Kịch Bản Chi Tiết Từng Bước (Step-by-Step Script)

### 🎙️ Bước 1: Giới thiệu & Đăng nhập Hệ Thống (0:00 - 0:30)
- **Lời thoại**: *"Kính thưa Hội đồng, em xin phép bắt đầu phần trình diễn hệ thống Quản lý tài sản và bảo trì thiết bị trong Trường Đại học Công nghệ Giao thông Vận tải (UTT) bằng mã định danh QR Code. Đầu tiên, em đăng nhập với tài khoản Quản trị viên `admin` (Phạm Quang Lâm)..."*
- **Thao tác**:
  - Truy cập `http://localhost:5000/login` (hoặc `http://192.168.42.111:5000`).
  - Nhập Username: `admin`, Password: `password123` ➔ Bấm **"Đăng nhập"**.
  - Hệ thống hiển thị thông báo Toast xanh *"Đăng nhập thành công"*, điều hướng vào giao diện Quản trị.

---

### 🎙️ Bước 2: Quản Lý Thiết Bị, Điểm Sức Khỏe & In Tem QR (0:30 - 1:30)
- **Lời thoại**: *"Hệ thống quản lý toàn diện 50 thiết bị được phân bổ tại 3 tòa nhà (Tòa H1, H2, H3 - Cơ sở Triều Khúc - UTT) và 10 phòng học Lab. Tại đây, mỗi thiết bị đều có hồ sơ kỹ thuật chi tiết, điểm sức khỏe Asset Health Score và mã QR độc bản..."*
- **Thao tác**:
  - Truy cập menu **"Danh sách thiết bị"** (`/devices`).
  - Tìm kiếm thử thiết bị `Máy chiếu Laser Hội trường H101`.
  - Bấm vào nút **"In nhãn QR"** ➔ Mở modal xem trước tem nhãn công nghiệp chứa Logo trường ĐH Công nghệ GTVT, Tên máy, Vị trí phòng và Mã QR.
  - Bấm xem chi tiết thiết bị ➔ Giới thiệu chỉ số **Asset Health Score: 95/100 (GOOD)** được tính toán tự động từ số lần hỏng và tuổi thọ máy.

---

### 🎙️ Bước 3: Giả Lập Quét Mã QR Trên Điện Thoại (1:30 - 2:30)
- **Lời thoại**: *"Bây giờ, em đóng vai trò một Giảng viên bước vào phòng học H202 và phát hiện máy chiếu bị mờ. Giảng viên chỉ cần dùng camera điện thoại quét mã QR dán trên máy..."*
- **Thao tác**:
  - Mở trên điện thoại qua Wi-Fi `http://192.168.42.111:5000` hoặc mở đường dẫn công khai `/device/UNI-QR-2026-0001`.
  - Màn hình hiển thị giao diện **Mobile-First**: Tên thiết bị, Vị trí, Thời hạn bảo hành và Lịch sử sửa chữa gần nhất.
  - Giảng viên bấm nút lớn màu đỏ: **"Báo sự cố thiết bị"**.

---

### 🎙️ Bước 4: Giảng Viên Gửi Báo Hỏng Trong 30 Giây (2:30 - 3:30)
- **Lời thoại**: *"Biểu mẫu báo hỏng tự động điền sẵn mã máy và phòng học. Giảng viên chỉ cần mô tả nhanh hiện tượng và chọn mức độ ưu tiên..."*
- **Thao tác**:
  - Đăng nhập với tài khoản Giảng viên `user_ha` (TS. Nguyễn Thu Hà).
  - Nhập tiêu đề: *"Máy chiếu mờ hình ảnh và ngả màu vàng bài giảng"*.
  - Chọn mức độ ưu tiên: `HIGH` (SLA cam kết xử lý trong 8 giờ).
  - Bấm **"Gửi yêu cầu"** ➔ Hệ thống cấp mã phiếu tự động `REQ00034`, thông báo Toast thành công.

---

### 🎙️ Bước 5: Ban Quản Lý Phân Công Kỹ Thuật Viên (3:30 - 4:00)
- **Lời thoại**: *"Ban Quản lý nhận được thông báo sự cố mới trên chuông báo Header và tiến hành phân công Kỹ thuật viên phụ trách..."*
- **Thao tác**:
  - Đăng nhập tài khoản Ban Quản lý `manager` (Tống Quang Trung).
  - Mở danh sách phiếu `/maintenance` ➔ Bấm **"Phân công"** phiếu vừa tạo cho `KTV. Vũ Hải Vịnh` (Kỹ thuật viên trưởng).
  - Phiếu chuyển trạng thái từ `PENDING` sang `ASSIGNED`.

---

### 🎙️ Bước 6 & 7: Kỹ Thuật Viên Tiếp Nhận, Xử Lý & Nhập Chi Phí (4:00 - 6:00)
- **Lời thoại**: *"Kỹ thuật viên Vũ Hải Vịnh đăng nhập vào Dashboard KTV, thấy phiếu được giao kèm cảnh báo đếm ngược thời gian SLA..."*
- **Thao tác**:
  - Đăng nhập tài khoản `tech_nam` (Vũ Hải Vịnh) ➔ Vào **"Kỹ thuật viên Dashboard"**.
  - Bấm nút **"Bắt đầu xử lý"** ➔ Phiếu chuyển sang `IN_PROGRESS`.
  - Trình bày tính năng **"Tạm dừng chờ linh kiện"** (`WAITING_PART`) và tiếp tục (`IN_PROGRESS`).
  - Bấm nút **"Hoàn thành xử lý"**:
    - Nhập nguyên nhân: *"Bám bụi gương lăng kính quang học và lỏng cáp tín hiệu"*.
    - Nhập cách sửa: *"Vệ sinh cụm lăng kính và siết lại đầu cáp"*.
    - Nhập chi phí: `150,000 VNĐ`.
  - Bấm **"Xác nhận hoàn thành"** ➔ Phiếu chuyển sang `COMPLETED`, tự động gửi thông báo cho Giảng viên nghiệm thu.

---

### 🎙️ Bước 8: Giảng Viên Nghiệm Thu 5 Sao & Đóng Phiếu (6:00 - 7:00)
- **Lời thoại**: *"Giảng viên nhận được thông báo mời nghiệm thu. Sau khi kiểm tra thiết bị hoạt động tốt, Giảng viên đánh giá chất lượng phục vụ..."*
- **Thao tác**:
  - Đăng nhập lại `user_ha` ➔ Vào **"Phiếu của tôi"** (`/my-tickets`).
  - Bấm nút **"Nghiệm thu thiết bị"** ➔ Mở modal nghiệm thu.
  - Chọn **"Đã khắc phục hoàn toàn"**, đánh giá **5 sao ⭐⭐⭐⭐⭐** và ghi nhận xét: *"KTV hỗ trợ rất nhanh, hình ảnh chiếu sắc nét trở lại."*
  - Bấm **"Xác nhận"** ➔ Phiếu chuyển sang `CLOSED`, tự động cập nhật máy về trạng thái `ACTIVE`.

---

### 🎙️ Bước 9: Ban Quản Lý Xem Dashboard Quản Trị & 8 Biểu Đồ (7:00 - 8:30)
- **Lời thoại**: *"Toàn bộ dữ liệu vận hành được tổng hợp theo thời gian thực lên Dashboard Quản trị..."*
- **Thao tác**:
  - Đăng nhập `manager` ➔ Mở `/dashboard`.
  - Giới thiệu **8 Thẻ KPI**: Tổng thiết bị (50), Máy hoạt động (35), Đang sửa (6), Chi phí bảo trì.
  - Giới thiệu **8 Biểu đồ phân tích (Recharts)**:
    1. Biểu đồ diễn biến sự cố 12 tháng.
    2. Biểu đồ tỷ lệ tuân thủ cam kết SLA.
    3. Biểu đồ cơ cấu thiết bị theo tòa nhà và chủng loại.
    4. Top 10 thiết bị phát sinh sự cố nhiều nhất để nhà trường lên kế hoạch thay mới.
  - Sử dụng bộ lọc Khoảng ngày / Tòa nhà để chứng minh biểu đồ thay đổi động 100%.

---

### 🎙️ Bước 10: Xem & Xuất Báo Cáo Quản Trị (8:30 - 10:00)
- **Lời thoại**: *"Cuối cùng là Trung tâm Báo cáo với 7 mẫu báo cáo quản trị phục vụ công tác kiểm kê và thanh quyết toán..."*
- **Thao tác**:
  - Mở menu **"Báo cáo & Thống kê"** (`/reports`).
  - Chọn mẫu: **"Báo cáo kiểm kê danh mục tài sản"** ➔ Xem bảng dữ liệu phân trang.
  - Bấm nút **"Xuất Excel (.xlsx)"** ➔ Trình diễn file Excel tải về máy với định dạng tiêu đề, border và màu sắc chuyên nghiệp.
  - Bấm nút **"In báo cáo"** ➔ Trình diễn giao diện Print layout tối ưu khổ A4.

---

## 3. Tổng Kết & Câu Nói Kết Thúc
- **Lời thoại**: *"Hệ thống đã hoạt động ổn định, bảo mật và đáp ứng đầy đủ tất cả các yêu cầu thực tế trong công tác quản lý tài sản đại học. Em xin trân trọng cảm ơn Thầy/Cô trong Hội đồng đã chú ý lắng nghe và xin phép đón nhận các câu hỏi phản biện!"*
