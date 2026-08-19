# HƯỚNG DẪN TRẢI NGHIỆM PROGRESSIVE WEB APP (PWA) & MOBILE EXPERIENCE
> **AssetCare Mobile & Progressive Web App (PWA) User & Deployment Guide**

---

## 1. PWA Là Gì & Lợi Ích Trong Quản Lý Tài Sản Đại Học?

**Progressive Web App (PWA)** là công nghệ cho phép website ứng dụng có trải nghiệm và tính năng tương đương một ứng dụng di động Native (Android/iOS) mà **không cần cài đặt qua Google Play Store hoặc Apple App Store**.

### Lợi ích vượt trội của AssetCare PWA:
- **Cài đặt một chạm (Add to Home Screen)**: Biểu tượng AssetCare xuất hiện ngay trên màn hình chính của điện thoại.
- **Khởi chạy độc lập (Standalone Mode)**: Mở toàn màn hình không có thanh địa chỉ trình duyệt, mang lại trải nghiệm chuyên nghiệp.
- **Tốc độ mở tức thì (Instant App Launch)**: Service Worker lưu trữ sẵn App Shell (HTML, CSS, JS, biểu tượng), giúp ứng dụng mở mượt mà ngay cả khi mạng 4G/Wi-Fi chập chờn.
- **Quét mã QR bằng Camera điện thoại tức thì**: Giảng viên, sinh viên quét mã trực tiếp trên giảng đường để mở trang tra cứu và báo hỏng trong vòng **30 giây**.
- **Không tốn dung lượng**: Ứng dụng siêu nhẹ (~380KB), không chiếm bộ nhớ điện thoại.

---

## 2. Cách Khởi Chạy Local Trên Máy Tính

```bash
# 1. Khởi động Backend API (Port 5000)
cd backend
node src/server.js

# 2. Khởi động Frontend Vite Dev Server (Port 5173 - Cho phép truy cập mạng LAN)
cd frontend
npm run dev
```

---

## 3. Cách Mở Trên Điện Thoại Cùng Mạng Wi-Fi (Development on LAN)

Khi chạy `npm run dev`, Vite sẽ mở cổng lắng nghe trên toàn bộ địa chỉ IP mạng nội bộ của bạn:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.15:5173/   <-- Sử dụng địa chỉ IP này trên điện thoại
```

### Các bước mở trên điện thoại:
1. Kết nối điện thoại và máy tính vào **cùng một mạng Wi-Fi**.
2. Mở trình duyệt trên điện thoại (Google Chrome trên Android hoặc Safari trên iPhone).
3. Nhập địa chỉ: `http://<IP_MÁY_TÍNH>:5173` (Ví dụ: `http://192.168.1.15:5173`).

---

## 4. Hướng Dẫn Cài Đặt PWA Trên Android (Google Chrome)

1. Mở ứng dụng AssetCare trên trình duyệt **Google Chrome**.
2. Hệ thống sẽ tự động hiển thị thanh thông báo nổi bên dưới:  
   👉 **"📱 Cài đặt AssetCare - Cài đặt lên màn hình chính để mở nhanh..."**
3. Bấm nút **"Cài Đặt Ngay"** ➔ Chọn **"Cài đặt (Install)"**.
4. Biểu tượng **AssetCare** màu xanh sẽ xuất hiện trên màn hình chính của điện thoại.
5. *Cách thủ công*: Bấm menu 3 chấm góc trên bên phải Chrome ➔ Chọn **"Thêm vào Màn hình chính (Add to Home screen)"** hoặc **"Cài đặt ứng dụng (Install app)"**.

---

## 5. Hướng Dẫn Cài Đặt PWA Trên iPhone / iPad (Apple Safari)

1. Mở ứng dụng AssetCare trên trình duyệt **Safari** (Lưu ý: Bắt buộc dùng Safari trên iOS).
2. Nhấn vào biểu tượng **Chia sẻ (Share)** ở thanh công cụ dưới cùng của màn hình (Hình vuông có mũi tên trỏ lên).
3. Cuộn xuống danh sách tùy chọn và chọn: **"Thêm vào MH chính" (Add to Home Screen)**.
4. Nhấn nút **"Thêm" (Add)** ở góc trên bên phải.
5. Biểu tượng **AssetCare** sẽ xuất hiện trên màn hình chính iPhone.

---

## 6. Hướng Dẫn Thử Nghiệm Quét Mã QR (QR Testing)

1. Mở ứng dụng AssetCare trên điện thoại.
2. Nhấn vào nút tròn màu xanh nổi bật **"Quét QR"** ở chính giữa thanh điều hướng dưới cùng (Mobile Bottom Nav).
3. Bấm **"Bật Camera Quét Mã"**.
4. Trình duyệt sẽ hiển thị hộp thoại xin quyền: *"AssetCare muốn sử dụng Camera của bạn"* ➔ Chọn **"Cho phép (Allow)"**.
5. Hướng camera vào tem mã QR của thiết bị:
   - Nếu không có tem in thực tế, bạn có thể mở màn hình máy tính trang `/devices/1/qr` và dùng camera điện thoại quét mã trên màn hình.
   - Hoặc bấm chọn các nút **Mẹo Thử Nghiệm Nhanh** (`UNI-QR-2026-0001`, `UNI-QR-2026-0004`...) để vào thẳng trang thiết bị.
6. Màn hình tự động mở trang tra cứu công khai `/device/UNI-QR-2026-0001` với đầy đủ thông số máy, điểm sức khỏe Asset Health và nút đỏ lớn: **"🔴 Báo Sự Cố Thiết Bị Này"**.

---

## 7. Xử Lý Quyền Truy Cập Camera (Camera Permissions)

- **Nguyên tắc an toàn**: Hệ thống **không bao giờ tự động bật camera khi mở ứng dụng**, camera chỉ được kích hoạt khi người dùng chủ động nhấn nút *"Bật Camera Quét Mã"*.
- **Trường hợp từ chối quyền (Permission Denied)**:
  - Trên Android Chrome: Nhấn vào biểu tượng Khóa bảo mật cạnh thanh địa chỉ ➔ Chọn **Quyền (Permissions)** ➔ Bật **Camera**.
  - Trên iOS Safari: Vào **Cài đặt (Settings)** của iPhone ➔ Chọn **Safari** ➔ **Camera** ➔ Chọn **Hỏi (Ask)** hoặc **Cho phép (Allow)**.
- **Chế độ dự phòng (Manual Fallback)**: Nếu thiết bị không có camera hoặc camera bị hỏng, người dùng có thể nhập trực tiếp mã Token (VD: `UNI-QR-2026-0001`) hoặc mã thiết bị vào ô tìm kiếm thủ công.

---

## 8. Yêu Cầu HTTPS Khi Triển Khai Production (HTTPS Requirement)

Theo tiêu chuẩn bảo mật của các trình duyệt hiện đại (Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox):
- **Tính năng Service Worker, Web App Manifest và Camera API bắt buộc phải chạy trên giao thức bảo mật HTTPS** trong môi trường Production (Ngoại lệ duy nhất là `localhost` / `127.0.0.1` trong môi trường Development).
- Khi triển khai trên máy chủ thật (VPS Linux / Nginx), bạn cần kích hoạt chứng chỉ SSL miễn phí thông qua **Let's Encrypt Certbot**:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d assetcare.university.edu.vn
```
