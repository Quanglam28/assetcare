# 🌐 HƯỚNG DẪN TRIỂN KHAI PRODUCTION (DEPLOYMENT GUIDE)
## HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ ĐẠI HỌC UTT (ASSETCARE)

---

### 1. Kiến trúc Triển khai Tiêu chuẩn (Production Architecture)

Hệ thống AssetCare hỗ trợ triển khai linh hoạt theo 2 mô hình chính:

```
                               ┌────────────────────────┐
                               │  Vercel Frontend (SPA) │
                               │  https://assetcare.app │
                               └───────────┬────────────┘
                                           │ HTTPS + HttpOnly Cookies
                                           ▼
┌──────────────────────┐       ┌────────────────────────┐
│  Giảng viên / SV / KTV├──────►│ Render Backend REST API│
│  (Mobile QR / Laptop)│       │ https://backend.render │
└──────────────────────┘       └───────────┬────────────┘
                                           │ TLS 1.2+ SSL Pool
                                           ▼
                               ┌────────────────────────┐
                               │  TiDB Cloud / MySQL 8.0│
                               │  (Managed Cluster)     │
                               └────────────────────────┘
```

---

### 2. Triển khai Backend lên Render.com (Web Service)

1. **Kết nối Git Repository**:
   - Truy cập [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**.
   - Chọn kho lưu trữ GitHub: `https://github.com/laamlaam0328-afk/assetcare.git`.

2. **Cấu hình Web Service**:
   - **Name**: `assetcare-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --omit=dev`
   - **Start Command**: `node src/server.js`
   - **Plan**: Free hoặc Starter

3. **Cấu hình Environment Variables (Render)**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DB_HOST`: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` (hoặc máy chủ MySQL)
   - `DB_PORT`: `4000`
   - `DB_USER`: `sq6Mjn2QT6979VH.root`
   - `DB_PASSWORD`: `[Mật khẩu TiDB Cloud]`
   - `DB_NAME`: `asset_maintenance_system`
   - `DB_SSL`: `true`
   - `JWT_SECRET`: `[Chuỗi ngẫu nhiên 32+ ký tự]`
   - `FRONTEND_URL`: `https://assetcare-utt.vercel.app`
   - `CLIENT_URL`: `https://assetcare-utt.vercel.app`

---

### 3. Triển khai Frontend lên Vercel

1. **Import Project vào Vercel**:
   - Truy cập [Vercel Dashboard](https://vercel.com/) → **Add New...** → **Project**.
   - Chọn kho lưu trữ `assetcare`.

2. **Cấu hình Build & Output Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables trên Vercel**:
   - `VITE_API_URL`: `https://assetcare-backend.onrender.com`
   - `VITE_APP_TITLE`: `AssetCare - Quản Lý Tài Sản & Bảo Trì ĐH UTT`

4. **Cấu hình SPA Rewrite (`frontend/vercel.json`)**:
   File `vercel.json` đã được cấu hình sẵn để chuyển hướng toàn bộ request về `index.html`, tránh lỗi 404 khi người dùng refresh hoặc quét QR Deep Link.

---

### 4. Kiểm tra Sau khi Triển khai (Post-Deployment Smoke Test)

1. Mở trang chủ Frontend trên trình duyệt: `https://assetcare-utt.vercel.app`.
2. Kiểm tra Health Endpoint của Backend: `curl https://assetcare-backend.onrender.com/api/health`.
3. Đăng nhập tài khoản `admin` / `password123`.
4. Dùng điện thoại quét thử mã QR của máy chiếu hoặc mở `/device/UNI-QR-2026-0001`.
5. Đảm bảo toàn bộ biểu đồ Ma trận Rủi ro và Điểm sức khỏe tải thành công.
