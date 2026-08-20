# 🏛️ TÀI LIỆU KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)
## HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ ĐẠI HỌC UTT (ASSETCARE)

---

### 1. Kiến trúc Tổng thể (High-Level Architecture)

Hệ thống **AssetCare** được xây dựng theo mô hình kiến trúc phân lớp hướng dịch vụ (**Layered Clean Architecture**) hiện đại, chia tách rõ ràng giữa tầng hiển thị (**Frontend SPA/PWA**), cổng giao tiếp (**REST API Layer**), nghiệp vụ lõi (**Domain Services & Analytical Engines**) và tầng lưu trữ dữ liệu (**MySQL/TiDB Cloud Data Persistence**).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER (FRONTEND)                      │
│   React 18 + Vite 5 + Tailwind CSS + Lucide Icons + Recharts + PWA SW  │
│   ├── Pages (Auth, Devices, QR Scanner, Work Orders, Risk Matrix...)    │
│   ├── Contexts (AuthContext, ThemeContext, NotificationContext)         │
│   └── Services (Axios HTTP Client withCredentials, with CSRF Header)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / JSON / HttpOnly Cookies
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY & MIDDLEWARE LAYER                      │
│   Express.js + Helmet + CORS Whitelist + Rate Limiters + CSRF Guard     │
│   ├── authMiddleware (Cookie-First / Bearer Fallback)                   │
│   ├── csrfProtection (Origin & Header Validation)                       │
│   ├── rateLimitMiddleware (Auth Limiter, Public QR Scan Limiter)        │
│   └── errorHandler (Centralized, Production Stack-Trace Sanitized)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BUSINESS & ANALYTICAL ENGINES                        │
│   ├── Phase 1: Asset Health Score Engine (0 - 100 / 6 Quantitative Dim) │
│   ├── Phase 2: Failure Risk Score Engine (0 - 100 / Dual-Cycle Trend)   │
│   ├── Phase 3: Priority & Recommendation Engine (R1/R2/R3 + Work Orders)│
│   └── Phase 4: Predictive What-If Simulation Engine (In-Memory Decay)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER (REPOSITORIES)                    │
│   17 Repositories (Parameterized Prepared Statements, Zero SQLi)        │
│   ├── deviceRepository, workOrderRepository, maintenanceRepository      │
│   ├── healthRepository, riskRepository, simulationRepository            │
│   └── auditRepository (Credential Masked Sanitization)                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA PERSISTENCE (DATABASE)                        │
│   MySQL 8.0 / TiDB Cloud Managed Cluster (utf8mb4, 22 Tables, Indexes) │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Các Động cơ Nghiệp vụ Thông minh Lõi (Core Engines)

#### A. Phase 1 — Động cơ Điểm Sức khỏe Tài sản (Asset Health Score Engine):
- **Khoảng điểm**: 0 – 100 [EXCELLENT: 85–100, GOOD: 70–84, FAIR: 50–69, POOR: 0–49].
- **6 Chiều định lượng**:
  1. *Tuổi thọ thiết bị* ($w_1 = 20\%$): Tính dựa trên tỷ lệ tuổi so với tuổi thọ thiết kế.
  2. *Tần suất sự cố* ($w_2 = 25\%$): Dựa trên số lượng phiếu bảo trì trong 12 tháng gần nhất.
  3. *Lịch sử bảo dưỡng định kỳ* ($w_3 = 20\%$): Dựa trên số ngày quá hạn so với lịch bảo trì tiếp theo.
  4. *Tỷ lệ chi phí sửa chữa* ($w_4 = 15\%$): Tỷ lệ tổng chi phí bảo trì so với nguyên giá thiết bị.
  5. *Thời gian hoạt động (Downtime)* ($w_5 = 10\%$): Tổng số giờ ngừng hoạt động của thiết bị.
  6. *Tình trạng bảo hành* ($w_6 = 10\%$): Còn hạn bảo hành của nhà sản xuất.

#### B. Phase 2 — Động cơ Đánh giá Rủi ro Hỏng hóc (Failure Risk Score Engine):
- **Khoảng điểm**: 0 – 100 [LOW: 0–29, MEDIUM: 30–59, HIGH: 60–79, CRITICAL: 80–100].
- **Mô hình Xu hướng Đa chu kỳ**: So sánh tần suất hỏng hóc và chi phí sửa chữa giữa 2 chu kỳ thời gian (6 tháng gần nhất vs 6 tháng trước đó) để phát hiện sớm xu hướng xuống cấp.

#### C. Phase 3 — Động cơ Ưu tiên Xử lý & Khuyến nghị Hành động (Priority & Recommendations):
- **Phân loại Ưu tiên**: R1 (Khẩn cấp), R2 (Cao), R3 (Trung bình).
- **Quy trình Lệnh công tác**: Tự động sinh khuyến nghị (`REPAIR_NOW`, `SCHEDULE_PREVENTIVE`, `REPLACE_PARTS`...) và cho phép chuyển đổi trực tiếp thành Lệnh công tác (`maintenance_work_orders`) kèm phân công Kỹ thuật viên.

#### D. Phase 4 — Động cơ Mô phỏng Dự báo Suy giảm Tương lai (Predictive Simulation):
- **Kịch bản Mô phỏng**: `DO_NOTHING` (Không can thiệp), `MAINTAIN_NOW` (Bảo dưỡng ngay), `OVERDUE_30D` (Trễ hạn 30 ngày), `OVERDUE_90D` (Trễ hạn 90 ngày).
- **Tính toán Real-time In-Memory**: Hoàn toàn không ghi dữ liệu giả lập vào CSDL sản xuất, đảm bảo độ sạch 100% cho dữ liệu thật.

---

### 3. Kiến trúc Bảo mật Đa lớp (Defense-in-Depth Security)

1. **HttpOnly Secure Cookie Session**: Access Token được bảo vệ trong Cookie HttpOnly, miễn nhiễm với tấn công XSS đánh cắp thông tin.
2. **CSRF Shield**: Kết hợp Whitelist Origin chặt chẽ, kiểm tra Referer và Custom Header `X-Requested-With`.
3. **CORS Dynamic Whitelist**: Kiểm soát nghiêm ngặt các domain được phép gọi API có `credentials`.
4. **Rate Limiting**: Chống Brute-force mật khẩu và DoS endpoint quét QR.
5. **SQL Injection Defense**: 100% Prepared Statements qua thư viện `mysql2/promise`.
6. **Masking & Sanitization**: Che giấu toàn bộ thông tin nhạy cảm trong hệ thống Log và thông báo lỗi.
