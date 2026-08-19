# HƯỚNG DẪN TRIỂN KHAI ONLINE MIỄN PHÍ 100% (VERCEL + RENDER + CLOUD MYSQL)

> **Dự án**: AssetCare — Hệ thống Quản lý Tài sản & Bảo trì Thiết bị Đại học (UTT)  
> **Chi phí**: **0 VNĐ (Miễn phí vĩnh viễn 100%)**  
> **Thời gian thực hiện**: ~5 đến 10 phút.  
> **Kết quả**: Bạn sẽ có link web chính thức chạy 24/7 (VD: `https://assetcare-utt.vercel.app`), bất kỳ ai dùng 4G/5G ở bất kỳ đâu quét mã QR đều xem được tức thì.

---

## 🏗️ KIẾN TRÚC TRIỂN KHAI (FREE TIER)

```
[ FRONTEND (Vercel) ] ➔ Tên miền HTTPS miễn phí: https://assetcare-utt.vercel.app
         │
         ▼ (Gọi API)
[ BACKEND (Render.com) ] ➔ Web Service Node.js miễn phí: https://assetcare-backend.onrender.com
         │
         ▼ (Kết nối SQL)
[ DATABASE (TiDB Cloud / Aiven) ] ➔ MySQL Cloud Serverless miễn phí 5GB
```

---

## 📌 BƯỚC 1: TẠO CƠ SỞ DỮ LIỆU MYSQL MIỄN PHÍ (0 ĐỒNG)

Có 2 nhà cung cấp MySQL Cloud miễn phí tốt nhất hiện nay:

### Lựa chọn khuyên dùng: **TiDB Cloud (Serverless MySQL)**
1. Truy cập: [https://tidbcloud.com](https://tidbcloud.com) ➔ Đăng ký/Đăng nhập bằng Google/GitHub.
2. Bấm **Create Cluster** ➔ Chọn **Serverless (Free Tier - 0$)**.
3. Đặt tên Cluster: `assetcare-db` ➔ Bấm **Create**.
4. Bấm nút **Connect**:
   - Chọn ngôn ngữ: **Node.js** hoặc **General**.
   - Lưu lại các thông số kết nối:
     - `Host`: `gateway01...prod.aws.tidbcloud.com`
     - `Port`: `4000`
     - `User`: `...`
     - `Password`: `...`
     - `Database`: `test` (hoặc tạo database `asset_maintenance_system`)

---

## 📌 BƯỚC 2: DEPLOY BACKEND LÊN RENDER.COM (0 ĐỒNG)

1. Đẩy mã nguồn dự án lên GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: complete assetcare system with vercel and render configs"
   git branch -M main
   git remote add origin https://github.com/<your-username>/assetcare.git
   git push -u origin main
   ```
2. Truy cập: [https://render.com](https://render.com) ➔ Đăng nhập bằng GitHub.
3. Bấm **New +** ➔ Chọn **Web Service**.
4. Chọn repository GitHub vừa đẩy lên.
5. Cấu hình thông số Render:
   - **Name**: `assetcare-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Thêm các biến môi trường (**Environment Variables**):
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DB_HOST`: `<Host TiDB của bạn>`
   - `DB_PORT`: `<Port TiDB, thường là 4000>`
   - `DB_USER`: `<User TiDB>`
   - `DB_PASSWORD`: `<Password TiDB>`
   - `DB_NAME`: `asset_maintenance_system`
   - `JWT_SECRET`: `super_secure_jwt_token_assetcare_utt_2026`
   - `CLIENT_URL`: `https://assetcare-utt.vercel.app`
7. Bấm **Create Web Service**.  
   👉 Sau khi build xong, bạn sẽ nhận được đường link Backend URL (Ví dụ: `https://assetcare-backend.onrender.com`).

8. **Nạp dữ liệu mẫu vào Cloud DB**:
   - Mở terminal trên máy tính của bạn và chạy lệnh:
   ```bash
   cd backend
   node src/seed_demo_data.js
   ```
   *(Với file `.env` trỏ vào thông số TiDB vừa tạo để tự động nạp 50 thiết bị, 33 phiếu sửa chữa, 10 lịch bảo trì vào Cloud)*.

---

## 📌 BƯỚC 3: DEPLOY FRONTEND LÊN VERCEL (0 ĐỒNG)

1. Truy cập: [https://vercel.com](https://vercel.com) ➔ Đăng nhập bằng GitHub.
2. Bấm **Add New...** ➔ Chọn **Project**.
3. Chọn repository `assetcare`.
4. Cấu hình Project trên Vercel:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Bấm Edit ➔ Chọn thư mục `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Thêm biến môi trường (**Environment Variables**):
   - **Key**: `VITE_API_URL`
   - **Value**: `https://assetcare-backend.onrender.com` *(Link Render ở Bước 2)*
6. Bấm nút **Deploy**!  
   👉 Chỉ sau 30 giây, Vercel sẽ cấp cho bạn tên miền: **`https://assetcare-utt.vercel.app`**!

---

## 🎉 KẾT QUẢ ĐẠT ĐƯỢC

1. **Trang web chạy 24/7 trực tuyến**:  
   👉 Mọi người ở bất kỳ đâu truy cập: `https://assetcare-utt.vercel.app`
2. **Tem mã QR dán máy thật**:  
   👉 Khi in tem QR từ web Vercel, mã QR sẽ tự động chứa link `https://assetcare-utt.vercel.app/device/UNI-QR-2026-0001`.
3. **Quét mã bằng Camera điện thoại**:  
   👉 Bất kỳ ai dùng điện thoại 4G/5G/Wi-Fi quét tem đều xem được ngay lập tức 100%!
