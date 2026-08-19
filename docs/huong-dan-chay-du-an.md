# HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH TOÀN BỘ HỆ THỐNG ASSETCARE
> **Hệ thống Quản lý Tài sản & Bảo trì Thiết bị Đại học bằng mã QR Code (AssetCare)**  
> *Tài liệu chuẩn dành cho Giảng viên hướng dẫn, Hội đồng phản biện và Lập trình viên*

---

## 📌 MỤC LỤC
1. [Yêu Cầu Môi Trường Cài Đặt](#1-yêu-cầu-môi-trường-cài-đặt)
2. [Cấu Trúc Thư Mục Dự Án](#2-cấu-trúc-thư-mục-dự-án)
3. [Cấu Hình Cơ Sở Dữ Liệu MySQL](#3-cấu-hình-cơ-sở-dữ-liệu-mysql)
4. [Cấu Hình Biến Môi Trường (.env)](#4-cấu-hình-biến-môi-trường-env)
5. [Cài Đặt & Nạp Dữ Liệu Mẫu (Seed Demo Data)](#5-cài-đặt--nạp-dữ-liệu-mẫu-seed-demo-data)
6. [Cách 1: Chạy Chế Độ Phát Triển (Development - 2 Cổng 5000 & 5173)](#6-cách-1-chạy-chế-độ-phát-triển-development)
7. [Cách 2: Chạy Chế Độ Đóng Gói Toàn Diện (Full-Stack 1 Cổng 5000 - Khuyên Dùng)](#7-cách-2-chạy-chế-độ-đóng-gói-toàn-diện-full-stack)
8. [Hướng Dẫn Mở Ứng Dụng Trên Điện Thoại & Quét QR](#8-hướng-dẫn-mở-ứng-dụng-trên-điện-thoại--quét-qr)
9. [Danh Sách Tài Khoản Thử Nghiệm Theo 4 Vai Trò](#9-danh-sách-tài-khoản-thử-nghiệm)
10. [Chạy Bộ Kiểm Thử Tự Động (Automated Test Suite)](#10-chạy-bộ-kiểm-thử-tự-động)
11. [Xử Lý Các Lỗi Thường Gặp (Troubleshooting)](#11-xử-lý-các-lỗi-thường-gặp)

---

## 1. Yêu Cầu Môi Trường Cài Đặt

Trước khi bắt đầu, đảm bảo máy tính đã cài đặt các phần mềm sau:
- **Node.js**: Phiên bản **`v18.x`** trở lên (Khuyến nghị Node.js LTS `v20.x` hoặc `v22.x`).  
  *Kiểm tra: `node -v`*
- **npm**: Phiên bản **`v9.x`** trở lên.  
  *Kiểm tra: `npm -v`*
- **MySQL Server**: Phiên bản **`8.0+`** hoặc **XAMPP / MariaDB** (Đang mở dịch vụ MySQL tại cổng `3306`).
- **Trình duyệt**: Google Chrome, Microsoft Edge, Safari, Firefox bản mới nhất.

---

## 2. Cấu Trúc Thư Mục Dự Án

```text
LAMm/
├── backend/                   # Máy chủ Backend (Node.js + Express RESTful API)
│   ├── src/
│   │   ├── config/            # Kết nối MySQL Pool (db.js)
│   │   ├── controllers/       # Điều khiển nghiệp vụ (Auth, Device, Maintenance, SLA, Report...)
│   │   ├── middlewares/       # Xác thực JWT, phân quyền RBAC 4 vai trò, Rate Limiting, Upload
│   │   ├── routes/            # Khai báo các API Endpoints
│   │   ├── services/          # Xử lý logic tính SLA, Health Score, sinh mã QR, Excel
│   │   ├── seed_demo_data.js  # Script tự động tạo cơ sở dữ liệu và 50 thiết bị demo chuẩn
│   │   ├── app.js             # Express App & phục vụ Single-Port PWA
│   │   └── server.js          # Khởi chạy máy chủ HTTP (Cổng 5000)
│   ├── uploads/               # Thư mục lưu trữ hình ảnh hiện trường sự cố
│   └── package.json
│
├── frontend/                  # Ứng dụng Frontend (React 18 + Vite + Tailwind CSS + PWA)
│   ├── public/
│   │   ├── icons/             # Biểu tượng PWA (192x192, 512x512 maskable)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/        # UI Buttons, Cards, Modals, Scanner, PWA Prompt, Bottom Nav
│   │   ├── context/           # React Context (AuthContext, ToastContext)
│   │   ├── layouts/           # Sidebar, Navbar, MobileBottomNav, MainLayout, AuthLayout
│   │   ├── pages/             # Dashboard, Thiết bị, Báo hỏng, Xử lý KTV, Báo cáo, Quét QR
│   │   ├── services/          # Axios HTTP Services kết nối API
│   │   └── utils/             # Hằng số, định dạng tiền tệ VND, định dạng ngày tháng
│   ├── vite.config.js         # Cấu hình Vite PWA, Service Worker và Proxy
│   └── package.json
│
├── docs/                      # Toàn bộ tài liệu kỹ thuật & báo cáo đồ án
│   ├── huong-dan-chay-du-an.md# (File này) Cẩm nang cài đặt & chạy toàn diện
│   ├── mobile-pwa.md          # Hướng dẫn PWA & trải nghiệm di động
│   ├── system-overview.md     # Tổng quan bài toán & giá trị thực tiễn
│   ├── architecture.md        # Kiến trúc 3 tầng & sơ đồ luồng máy trạng thái
│   ├── api.md                 # Đặc tả 32+ RESTful API Endpoints
│   ├── database.md            # ERD & từ điển 14 bảng dữ liệu MySQL
│   ├── testing.md             # Báo cáo kiểm thử 10 module & 10 ca kiểm thử bảo mật
│   └── demo-script.md         # Kịch bản thuyết trình bảo vệ 7-10 phút
└── README.md                  # Giới thiệu tổng quan dự án chuẩn Enterprise
```

---

## 3. Cấu Hình Cơ Sở Dữ Liệu MySQL

1. Mở **XAMPP Control Panel** và bấm **Start** tại mục **MySQL** (hoặc mở dịch vụ MySQL Server).
2. Mở trình quản trị phpMyAdmin (`http://localhost/phpmyadmin`) hoặc phần mềm **MySQL Workbench** / **HeidiSQL** / **Navicat**.
3. Tạo mới cơ sở dữ liệu bằng câu lệnh SQL sau:

```sql
CREATE DATABASE IF NOT EXISTS asset_maintenance_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

---

## 4. Cấu Hình Biến Môi Trường (.env)

### A. Backend `.env` (`backend/.env`):
Đảm bảo file `backend/.env` có nội dung chính xác theo môi trường máy bạn:

```ini
NODE_ENV=development
PORT=5000

# Cấu hình kết nối MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=asset_maintenance_system

# Khóa bí mật JWT Token
JWT_SECRET=AssetCare_University_Super_Secure_JWT_Secret_2026!
JWT_EXPIRES_IN=7d

# Cổng Frontend React
CLIENT_URL=http://localhost:5173
```

---

## 5. Cài Đặt & Nạp Dữ Liệu Mẫu (Seed Demo Data)

Hệ thống có sẵn script tự động tạo toàn bộ cấu trúc 14 bảng MySQL và nạp dữ liệu chuẩn mực môi trường đại học Việt Nam (3 tòa nhà, 10 phòng lab/hội trường, 50 thiết bị, 15 tài khoản người dùng, 30 phiếu bảo trì, 10 kế hoạch bảo dưỡng định kỳ, thông báo real-time).

Mở Terminal / PowerShell và chạy:

```bash
# 1. Đi vào thư mục backend
cd backend

# 2. Cài đặt thư viện dependencies
npm install

# 3. Chạy script tạo bảng và nạp dữ liệu mẫu
node src/seed_demo_data.js
```

> **Kết quả hiển thị mong đợi:**
> ```text
> ✅ Đã kết nối MySQL thành công!
> ✅ Đã tạo cấu trúc 14 bảng dữ liệu chuẩn hóa!
> ✅ Đã nạp 3 tòa nhà, 10 phòng học, 10 loại thiết bị, 5 nhà cung cấp
> ✅ Đã tạo 15 tài khoản người dùng (bcrypt password123)
> ✅ Đã tạo 50 thiết bị (34 Active, 6 Broken, 6 Maintenance, 4 Retired)
> ✅ Đã nạp 30 phiếu bảo trì (kèm SLA due_at, linh kiện, chi phí)
> 🌟 NẠP DỮ LIỆU DEMO HOÀN TẤT 100%!
> ```

---

## 6. Cách 1: Chạy Chế Độ Phát Triển (Development)

Phù hợp khi bạn đang viết code, chỉnh sửa giao diện và muốn tính năng Hot-Reload (HMR) tức thì.

Mở **2 cửa sổ Terminal song song**:

### Terminal 1: Chạy Backend API (Cổng 5000)
```bash
cd backend
node src/server.js
```
*Backend chạy tại: `http://localhost:5000` | Health check: `http://localhost:5000/api/health`*

### Terminal 2: Chạy Frontend Vite (Cổng 5173)
```bash
cd frontend
npm install
npm run dev
```
*Frontend chạy tại: `http://localhost:5173`*

---

## 7. Cách 2: Chạy Chế Độ Đóng Gói Toàn Diện (Full-Stack 1 Cổng 5000 - Khuyên Dùng)

Đây là cách chạy **mượt mà, tối ưu hiệu năng nhất** và thuận tiện nhất khi báo cáo, thuyết trình hoặc mở trên điện thoại mà không lo xung đột cổng:

```bash
# Bước 1: Đóng gói giao diện Frontend PWA
cd frontend
npm run build

# Bước 2: Khởi động máy chủ duy nhất (Phục vụ cả Web App PWA và RESTful API)
cd ../backend
node src/server.js
```

👉 **Mở trình duyệt trên máy tính và truy cập**:  
🔗 [**http://localhost:5000**](http://localhost:5000)

---

## 8. Hướng Dẫn Mở Ứng Dụng Trên Điện Thoại & Quét QR

### Cách 8.1: Truy cập trực tiếp qua mạng Wi-Fi LAN
1. Kết nối điện thoại vào **cùng mạng Wi-Fi** với máy tính.
2. Tra cứu địa chỉ IP của máy tính (Gõ lệnh `ipconfig` trong Terminal, tìm dòng `IPv4 Address`, ví dụ: `192.168.42.111`).
3. Trên điện thoại, mở trình duyệt và gõ địa chỉ:  
   👉 `http://<IP_MÁY_TÍNH>:5000` (Ví dụ: `http://192.168.42.111:5000` hoặc `http://192.168.42.111:5173`).
4. Bấm nút **"📱 Cài đặt AssetCare"** trên banner dưới cùng để thêm vào màn hình chính điện thoại.

### Cách 8.2: Quét mã QR bằng Camera điện thoại
1. Trên điện thoại, nhấn vào nút tròn màu xanh **"Quét QR"** ở chính giữa thanh điều hướng dưới màn hình.
2. Nhấn **"Bật Camera Quét Mã"** ➔ Chọn **"Cho phép (Allow)"** khi trình duyệt hỏi quyền truy cập Camera.
3. Hướng camera vào tem mã QR của thiết bị trên màn hình máy tính (trang danh sách thiết bị) để mở ngay hồ sơ kỹ thuật, điểm sức khỏe máy và nút báo hỏng sự cố.

---

## 9. Danh Sách Tài Khoản Thử Nghiệm (Trường ĐH Công Nghệ GTVT)

Tất cả các tài khoản demo đều sử dụng chung mật khẩu mặc định: **`password123`**

| Vai trò | Tên tài khoản | Họ và tên | Mật khẩu | Chức năng chính được phân quyền |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin` | **Phạm Quang Lâm** | `password123` | Toàn quyền cấu hình hệ thống, quản lý người dùng, phân quyền, xem 8 biểu đồ, xuất báo cáo Excel |
| **Quản lý thiết bị (MANAGER)** | `manager` | **Tống Quang Trung** | `password123` | Trưởng ban Quản trị CSVC & Thiết bị, phân công KTV, giám sát hạn chót SLA, duyệt phiếu |
| **Quản lý Khoa (MANAGER)** | `manager_thu` | **Dư Thị Kim Thu** | `password123` | Trưởng khoa CNTT, theo dõi tài sản và sự cố máy tính tại các phòng Lab thực hành |
| **Kỹ thuật viên trưởng (TECHNICIAN)** | `tech_nam` | **Vũ Hải Vịnh** | `password123` | Nhận phiếu sự cố, bấm "Bắt đầu sửa", "Chờ linh kiện", "Hoàn thành", nhập chi phí & nguyên nhân |
| **Kỹ thuật viên 2 (TECHNICIAN)** | `tech_hoang` | **Lê Huy Hoàng** | `password123` | Kỹ thuật viên chuyên trách phần cứng mạng & máy chủ Lab |
| **Giảng viên / Người dùng (USER)** | `user_ha` | **TS. Nguyễn Thu Hà** | `password123` | Quét QR trong phòng học, gửi phiếu báo sự cố kèm ảnh hiện trường, nghiệm thu 5 sao |
| **Giảng viên / Người dùng (USER)** | `user_tuan` | **ThS. Lê Minh Tuấn** | `password123` | Cán bộ quản lý phòng máy thực hành khoa CNTT |

---

## 10. Chạy Bộ Kiểm Thử Tự Động (Automated Test Suite)

Dự án tích hợp bộ kiểm thử tự động toàn diện kiểm tra 100% các module chức năng từ Auth, Device, QR, Maintenance, Technician, SLA, Asset Health đến Báo mật RBAC:

```bash
cd backend
node src/seed_demo_data.js # Nạp lại dữ liệu sạch
node test_master_suite.js  # (hoặc chạy test script trong thư mục test)
```

> **Kết quả kiểm thử đạt chuẩn 100%:**
> ```text
> ✅ [PASS] M1.1 Cơ sở dữ liệu có đủ 14/14 bảng chuẩn hóa
> ✅ [PASS] M2.1 Đăng nhập cấp JWT Token thành công cho cả 4 vai trò
> ✅ [PASS] M4.1 Lấy danh sách thiết bị phân trang & lọc đa chiều
> ✅ [PASS] M5.1 Quét mã QR công khai nhận diện chính xác thiết bị
> ✅ [PASS] M6.1 Tạo phiếu sự cố mới sinh mã REQ000xx tự động
> ✅ [PASS] M7.1 Hoàn tất chu trình KTV: PENDING ➔ ASSIGNED ➔ IN_PROGRESS ➔ COMPLETED
> ✅ [PASS] M8.1 Người dùng nghiệm thu 5 sao ➔ Chuyển trạng thái CLOSED
> ✅ [PASS] M11.1 Thống kê 8 thẻ KPI và 8 biểu đồ quản trị
> ✅ [PASS] M12.1 Xuất thành công file Excel (.xlsx) chuẩn định dạng
> ✅ [PASS] M13.1 Tự động tính hạn chót SLA theo mức độ ưu tiên
> ✅ [PASS] M14.1 Tính toán điểm Asset Health Score (0-100)
> 🏆 TỔNG KẾT: 15/15 TEST SUITES PASSED (100% HOÀN HẢO)
> ```

---

## 11. Xử Lý Các Lỗi Thường Gặp (Troubleshooting)

### 🔴 Lỗi 1: `ECONNREFUSED 127.0.0.1:3306` (Không kết nối được MySQL)
- **Nguyên nhân**: Dịch vụ MySQL chưa được khởi động.
- **Khắc phục**: Mở XAMPP Control Panel và bấm nút **Start** ở dòng MySQL. Kiểm tra lại cổng `DB_PORT=3306` trong file `backend/.env`.

### 🔴 Lỗi 2: `Error: listen EADDRINUSE: address already in use :::5000` (Cổng 5000 bị chiếm)
- **Nguyên nhân**: Có một tiến trình Node.js cũ đang chạy ngầm trên cổng 5000.
- **Khắc phục trên Windows**:
  ```powershell
  # Tìm PID đang chiếm cổng 5000
  netstat -ano | findstr :5000
  # Dừng tiến trình (thay PID bằng số thực tế)
  taskkill /PID <PID_NUMBER> /F
  ```

### 🔴 Lỗi 3: Điện thoại không mở được địa chỉ IP máy tính (`192.168.x.x:5000`)
- **Nguyên nhân**: Tường lửa Windows (Windows Defender Firewall) đang chặn kết nối ngoài vào mạng nội bộ.
- **Khắc phục**:
  1. Mở **Windows Defender Firewall** trên máy tính.
  2. Chọn **Turn Windows Defender Firewall on or off**.
  3. Tắt tạm thời mục **Private network settings** rồi mở lại trên điện thoại.

### 🔴 Lỗi 4: Camera điện thoại không quét được mã QR
- **Nguyên nhân**: Chưa cấp quyền truy cập Camera cho trình duyệt trên điện thoại.
- **Khắc phục**: Nhấn vào biểu tượng Ổ khóa / Cài đặt trang web trên thanh địa chỉ trình duyệt điện thoại ➔ Cho phép quyền **Camera**. Hoặc sử dụng tính năng **Nhập mã Token thủ công** (`UNI-QR-2026-0001`) có sẵn trên giao diện.

---

*Tài liệu được biên soạn và chuẩn hóa phục vụ vận hành và bảo vệ đồ án tốt nghiệp hệ thống thông tin quản lý tài sản AssetCare 2026.*
