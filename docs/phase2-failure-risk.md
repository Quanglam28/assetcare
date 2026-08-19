# BÁO CÁO THIẾT KẾ & ĐO ĐẠC: PHASE 2 — FAILURE RISK SCORE ENGINE

> **Hệ thống Quản lý Vòng đời Tài sản & Bảo trì Thiết bị Đại học (AssetCare) — UTT**  
> **Động cơ**: Rule-Based Failure Risk Engine (Version 1.0)  
> **Thời điểm hoàn thành**: 20/08/2026  
> **Nguyên tắc**: Tính toán định lượng theo quy tắc chuyên gia, đo đạc theo các cửa sổ thời gian 30 ngày / 90 ngày, hoàn toàn không dùng giả định.

---

## 1. Mục Tiêu Nghiệp Vụ (Business Objective)

Động cơ **Failure Risk Score** giải quyết bài toán:
> *"Thiết bị này có xác suất xảy ra sự cố hư hỏng trong thời gian tới ở mức độ nào?"*

### Phân biệt rõ rệt giữa Health Score và Failure Risk:
- **Asset Health Score (Phase 1)**: Đánh giá *tình trạng hiện tại và mức độ hao mòn tích lũy toàn diện* ($0 \rightarrow 100$, điểm càng cao càng tốt).
- **Failure Risk Score (Phase 2)**: Đánh giá *xác suất và nguy cơ xảy ra sự cố trong ngắn hạn/trung hạn* ($0 \rightarrow 100$, điểm càng cao càng nguy hiểm).
- **Ví dụ thực tế**: Một máy tính mới 1 năm tuổi có `Health Score = 85 (GOOD)` nhưng trong 30 ngày qua liên tục phát sinh 4 sự cố bất thường thì `Failure Risk = HIGH (75/100)`. Đây là kết quả nghiệp vụ hoàn toàn chính xác.

---

## 2. Công Thức Tính Điểm Nguy Cơ (Risk Formula)

$$\text{Failure Risk Score} = (\text{FrequencyScore} \times 0.30) + (\text{TrendScore} \times 0.25) + (\text{MaintenanceRisk} \times 0.15) + (\text{CostTrendScore} \times 0.10) + (\text{DowntimeTrend} \times 0.10) + (\text{AgeRiskScore} \times 0.10)$$

### Thang Phân Loại Nguy Cơ (Risk Classification):
- **`0.0` → `19.9`**: 🟢 **`VERY_LOW`** (Rất thấp — Thiết bị vận hành cực kỳ ổn định)
- **`20.0` → `39.9`**: 🔵 **`LOW`** (Thấp — Rủi ro thấp, vận hành bình thường)
- **`40.0` → `59.9`**: 🟡 **`MEDIUM`** (Trung bình — Có dấu hiệu hao mòn hoặc sự cố lẻ tẻ)
- **`60.0` → `79.9`**: 🟠 **`HIGH`** (Cao — Xu hướng sự cố tăng hoặc bảo dưỡng quá hạn)
- **`80.0` → `100.0`**: 🔴 **`CRITICAL`** (Nguy cấp — Sự cố dồn dập, chi phí tăng đột biến)
- **Thiếu dữ liệu**: ⚪ **`INSUFFICIENT_DATA`**

---

## 3. Các Yếu Tố Rủi Ro & Trọng Số (Risk Factors & Weights)

Cấu hình tại [`backend/src/config/failureRiskConfig.js`](file:///d:/LAMm/backend/src/config/failureRiskConfig.js):

| Yếu Tố Rủi Ro (Factor) | Trọng Số (Weight) | Cửa Sổ Thời Gian | Ý Nghĩa Định Lượng |
| :--- | :---: | :---: | :--- |
| **1. Recent Failure Frequency** | **30%** (`0.30`) | **30 ngày gần nhất** | Đo lường mật độ phát sinh sự cố trong thời gian gần |
| **2. Failure Trend** | **25%** (`0.25`) | **30d hiện tại vs 30d trước** | Tốc độ gia tăng ($\Delta\%$) sự cố hỏng hóc |
| **3. Maintenance Overdue Risk**| **15%** (`0.15`) | **Thời gian thực** | Mức độ rủi ro khi bị bỏ quên bảo dưỡng định kỳ |
| **4. Repair Cost Trend** | **10%** (`0.10`) | **90d hiện tại vs 90d trước** | Tốc độ gia tăng ($\Delta\%$) chi phí sửa chữa |
| **5. Downtime Trend** | **10%** (`0.10`) | **30d hiện tại vs 30d trước** | Tốc độ gia tăng thời gian ngừng hoạt động |
| **6. Asset Age Risk** | **10%** (`0.10`) | **Toàn vòng đời** | Nguy cơ hỏng hóc tự nhiên theo tuổi đời và khấu hao |
| **Tổng cộng** | **100%** (`1.00`) | | |

---

## 4. Bảng Ngưỡng Đánh Giá Định Lượng (Thresholds)

1. **Recent Failure Frequency (30d)**:
   - 0 sự cố: **`10 điểm`**
   - 1 sự cố: **`30 điểm`**
   - 2 sự cố: **`60 điểm`**
   - 3 sự cố: **`80 điểm`**
   - $\ge 4$ sự cố: **`95 điểm`**
2. **Failure Trend ($\Delta\%$ giữa 30d hiện tại và 30d trước)**:
   - Giảm mạnh ($\le -50\%$): **`10 điểm`**
   - Giảm nhẹ ($-50\% < \Delta \le -10\%$): **`25 điểm`**
   - Ổn định ($-10\% < \Delta \le +10\%$): **`40 điểm`**
   - Tăng nhẹ ($+10\% < \Delta \le +50\%$): **`60 điểm`**
   - Tăng vừa ($+50\% < \Delta \le +150\%$): **`75 điểm`**
   - Tăng mạnh ($> +150\%$ hoặc tăng mới từ 0): **`90 điểm`**
3. **Maintenance Overdue Risk**:
   - Đúng hạn: **`10 điểm`**
   - Quá hạn $\le 7$ ngày: **`30 điểm`**
   - Quá hạn $\le 30$ ngày: **`60 điểm`**
   - Quá hạn $\le 60$ ngày: **`80 điểm`**
   - Quá hạn $> 60$ ngày: **`95 điểm`**
4. **Repair Cost Trend (90d hiện tại vs 90d trước)**:
   - Chi phí giảm: **`20 điểm`**
   - Chi phí ổn định ($\le 15\%$): **`35 điểm`**
   - Chi phí tăng nhẹ ($+15\% < \Delta \le +50\%$): **`65 điểm`**
   - Chi phí tăng đáng kể ($+50\% < \Delta \le +150\%$): **`80 điểm`**
   - Chi phí tăng đột biến ($> +150\%$ hoặc $> 5.000.000$đ): **`95 điểm`**
5. **Downtime Trend (30d)**:
   - Downtime giảm: **`15 điểm`**
   - Downtime ổn định: **`35 điểm`**
   - Downtime tăng nhẹ: **`60 điểm`**
   - Downtime tăng mạnh: **`85 điểm`**
6. **Age Risk**:
   - $\le 1$ năm: **`10 điểm`**
   - $\le 2$ năm: **`20 điểm`**
   - $\le 3$ năm: **`35 điểm`**
   - $\le 4$ năm: **`50 điểm`**
   - $\le 5$ năm: **`70 điểm`**
   - $> 5$ năm: **`90 điểm`**

---

## 5. Cơ Sở Dữ Liệu & Bảng `failure_risk_scores`

Khởi tạo bảng MySQL tiêu chuẩn:
```sql
CREATE TABLE IF NOT EXISTS failure_risk_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  risk_score DECIMAL(5,2) NULL,
  risk_status ENUM('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'INSUFFICIENT_DATA') NOT NULL DEFAULT 'LOW',
  failure_frequency_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  failure_trend_score DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  maintenance_risk_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  repair_cost_trend_score DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  downtime_trend_score DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  age_risk_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  data_completeness DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  evaluated_factors_count INT NOT NULL DEFAULT 6,
  total_factors_count INT NOT NULL DEFAULT 6,
  calculation_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_device_risk (device_id),
  CONSTRAINT fk_failure_risk_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. Service Architecture & REST APIs

### Service Layer:
[`backend/src/services/failureRiskService.js`](file:///d:/LAMm/backend/src/services/failureRiskService.js)
- `calculateFailureRisk(deviceId)`
- `getFailureRiskBreakdown(deviceId)`
- `calculateFailureTrend(deviceId)`
- `calculateRepairCostTrend(deviceId)`
- `calculateDowntimeTrend(deviceId)`
- `getRiskDataCompleteness(deviceId)`
- `recalculateAllRiskScores()`

### REST Endpoints:
- `GET /api/devices/:id/risk`
- `GET /api/devices/:id/risk/breakdown`
- `GET /api/assets/:id/risk`
- `GET /api/assets/:id/risk/breakdown`

**Mẫu JSON Response chuẩn:**
```json
{
  "success": true,
  "message": "Đánh giá nguy cơ sự cố thiết bị thành công",
  "data": {
    "deviceId": 1,
    "riskScore": 45,
    "status": "MEDIUM",
    "dataCompleteness": "6/6 factors",
    "breakdown": {
      "failureFrequencyScore": 30,
      "failureTrendScore": 90,
      "maintenanceRiskScore": 10,
      "repairCostTrendScore": 35,
      "downtimeTrendScore": 35,
      "ageRiskScore": 50
    },
    "trends": {
      "failures": { "current30d": 1, "previous30d": 0, "changePercent": 100 },
      "repairCost": { "current90d": 0, "previous90d": 0, "changePercent": 0 },
      "downtime": { "current30d": 0, "previous30d": 0, "changePercent": 0 }
    },
    "explainableReasons": [
      "ℹ️ Phát sinh 1 sự cố trong 30 ngày qua",
      "⚠️ Xu hướng sự cố tăng mạnh +100% so với 30 ngày trước",
      "✅ Lịch bảo dưỡng định kỳ tuân thủ đúng hạn"
    ],
    "calculationVersion": "v1.0",
    "calculatedAt": "2026-08-19T17:21:42.000Z"
  }
}
```

---

## 7. Giao Diện Device Detail & Explainability (UI)

- **Vị trí**: Tab *Sức Khỏe & Dự Báo Rủi Ro* trong [`DeviceDetailPage.jsx`](file:///d:/LAMm/frontend/src/pages/devices/DeviceDetailPage.jsx).
- **Thẻ FailureRiskCard**:
  - Khối Hero: Điểm rủi ro nổi bật (`45%`), Badge mức độ (`🟡 TRUNG BÌNH`).
  - 3 Thẻ Delta Trend nhẹ (CSS): Xu hướng hỏng (30d), Xu hướng chi phí (90d), Downtime (30d) với biểu tượng mũi tên đổi màu.
  - 6 Khối Sub-Scores Breakdown có thanh tiến trình đổi màu (xanh lá $\rightarrow$ vàng $\rightarrow$ cam $\rightarrow$ đỏ).
  - Khối **"Giải thích định lượng nguyên nhân rủi ro" (Why is risk at this level?)**: Tự động sinh từ dữ liệu thật.

---

## 8. Kết Quả Kiểm Thử (20/20 Test Cases Passed)

Chạy test suite tự động: `node backend/test_phase2_risk_suite.js`

1. ✅ **TEST 1**: 0 sự cố / 30d ➔ Score = 10.
2. ✅ **TEST 2**: 1 sự cố / 30d ➔ Score = 30.
3. ✅ **TEST 3**: $\ge 4$ sự cố / 30d ➔ Score = 95.
4. ✅ **TEST 4**: Increasing failure trend ($1 \rightarrow 4$, $+300\%$) ➔ Score = 90.
5. ✅ **TEST 5**: Decreasing failure trend ($4 \rightarrow 1$, $-75\%$) ➔ Score = 10.
6. ✅ **TEST 6**: Stable failure trend ($2 \rightarrow 2$, $0\%$) ➔ Score = 40.
7. ✅ **TEST 7**: Maintenance overdue 25 ngày ➔ Score = 60.
8. ✅ **TEST 8**: Repair cost increasing ($1\text{tr} \rightarrow 3\text{tr}$, $+200\%$) ➔ Score = 95.
9. ✅ **TEST 9**: Repair cost decreasing ($4\text{tr} \rightarrow 1\text{tr}$, $-75\%$) ➔ Score = 20.
10. ✅ **TEST 10**: Downtime increasing ($4\text{h} \rightarrow 16\text{h}$, $+300\%$) ➔ Score = 85.
11. ✅ **TEST 11**: Downtime decreasing ($20\text{h} \rightarrow 2\text{h}$, $-90\%$) ➔ Score = 15.
12. ✅ **TEST 12**: Old asset (6 năm tuổi) ➔ AgeRisk = 90.
13. ✅ **TEST 13**: New asset (3 tháng tuổi) ➔ AgeRisk = 10.
14. ✅ **TEST 14**: Missing data handling ➔ `Data Completeness: 6/6 factors (100%)`.
15. ✅ **TEST 15**: Division by zero safety ($P = 0$) ➔ An toàn tuyệt đối không lỗi chia 0.
16. ✅ **TEST 16**: No historical data ➔ Trả về trạng thái ổn định chuẩn.
17. ✅ **TEST 17**: Null dates ➔ Xử lý an toàn với score fallback.
18. ✅ **TEST 18**: Future maintenance date (chưa tới hạn) ➔ Score = 10.
19. ✅ **TEST 19**: Very large repair cost ($100.000.000$đ) ➔ Score = 95.
20. ✅ **TEST 20**: E2E REST API `GET /api/devices/1/risk` & `GET /api/devices/1/risk/breakdown` ➔ HTTP 200 OK.

---

## 9. Kiểm Thử Hồi Quy (Regression Tests: 100% Passed)

- **Phase 1 Asset Health Suite** (`test_phase1_health_suite.js`): **11/11 Passed (100%)**.
- **QR & Auth Flow Suite** (`test_qr_auth_flow_suite.js`): **7/7 Passed (100%)**.

---

## 10. Kết Quả Build Production

```bash
vite v5.4.21 building for production...
✓ 2553 modules transformed.
✓ built in 7.90s
dist/assets/DeviceDetailPage-JyPxwNTy.js 41.70 kB │ gzip: 10.63 kB
PWA v1.3.0 mode generateSW (58 entries precached)
```

---

## 11. Danh Sách Tập Tin Đã Tạo & Chỉnh Sửa

1. [`backend/src/config/failureRiskConfig.js`](file:///d:/LAMm/backend/src/config/failureRiskConfig.js): Cấu hình trọng số, cửa sổ thời gian 30d/90d, ngưỡng định lượng và phân loại 5 cấp độ nguy cơ.
2. [`backend/src/scripts/migrate_failure_risk_scores.js`](file:///d:/LAMm/backend/src/scripts/migrate_failure_risk_scores.js): Script khởi tạo bảng `failure_risk_scores`.
3. [`backend/src/services/failureRiskService.js`](file:///d:/LAMm/backend/src/services/failureRiskService.js): Động cơ tính toán rủi ro theo quy tắc chuyên gia, phân tích xu hướng 30d/90d và sinh giải thích định lượng.
4. [`backend/src/repositories/healthRepository.js`](file:///d:/LAMm/backend/src/repositories/healthRepository.js): Bổ sung hàm upsert/find cho `failure_risk_scores` và truy vấn dữ liệu theo các cửa sổ thời gian.
5. [`backend/src/controllers/healthController.js`](file:///d:/LAMm/backend/src/controllers/healthController.js): Cung cấp handler `getDeviceRisk` và `getDeviceRiskBreakdown`.
6. [`backend/src/routes/healthRoutes.js`](file:///d:/LAMm/backend/src/routes/healthRoutes.js): Khai báo endpoint `/devices/:id/risk`, `/assets/:id/risk`.
7. [`frontend/src/components/devices/FailureRiskCard.jsx`](file:///d:/LAMm/frontend/src/components/devices/FailureRiskCard.jsx): Giao diện hiển thị Failure Risk, 3 hộp Delta Trends, 6 Sub-scores breakdown và danh sách giải thích định lượng.
8. [`backend/test_phase2_risk_suite.js`](file:///d:/LAMm/backend/test_phase2_risk_suite.js): Test suite 20/20 bài kiểm thử tự động.
9. [`docs/phase2-failure-risk.md`](file:///d:/LAMm/docs/phase2-failure-risk.md): Tài liệu đặc tả kỹ thuật chi tiết Phase 2.
