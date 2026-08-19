# BÁO CÁO KỸ THUẬT: PHASE 4 — RULE-BASED PREDICTIVE MAINTENANCE & WHAT-IF SIMULATION ENGINE

> **Dự án**: AssetCare — Hệ thống Thông tin Quản lý Tài sản & Bảo trì Thiết bị Đại học (ĐH Công Nghệ GTVT - UTT)  
> **Kiến trúc**: Rule-Based Predictive Simulation (Phase 4 - Version 1.0)  
> **Thời điểm hoàn thành**: 20/08/2026  
> **Đo lường & Kiểm thử thực tế**: 100% kết nối MySQL thực, **85/85 Test Cases Passed (100%)**, 0 suy thoái hệ thống.

---

## 1. Bản Chất & Bài Toán Nghiệp Vụ (Business Problem)

Phase 4 giải quyết câu hỏi trọng tâm của Ban Quản trị Cơ sở vật chất và Kỹ thuật viên:

> *"Nếu không bảo trì thiết bị trong 7, 14, 30, 60 hoặc 90 ngày tới thì tình trạng thiết bị (Health, Failure Risk, Priority) sẽ chuyển dịch ra sao? Và nếu can thiệp bảo dưỡng ngay bây giờ thì phục hồi được bao nhiêu điểm?"*

### Tuyên Bố Bản Chất Kỹ Thuật (Truthful Classification)
- Đây là **Hệ Thống Hỗ Trợ Ra Quyết Định (Decision Support System)** hoạt động theo cơ chế **Rule-Based Predictive Simulation** dựa trên dữ liệu đo đạc lịch sử thực tế (Tần suất sự cố, Thời gian quá hạn, Xu hướng biến động, Tuổi thọ máy, Downtime).
- Tuyệt đối **không tuyên bố là Machine Learning / AI** hoặc đưa ra các con số "xác suất hỏng ngẫu nhiên".
- Kết quả mô phỏng là **tất định 100% (Deterministic)** — cùng dữ liệu đầu vào + cùng số ngày mô phỏng $\longrightarrow$ luôn trả về kết quả số học nhất quán, không dùng `Math.random()`.
- **Zero Database Pollution**: Tính toán hoàn toàn Real-time In-Memory, không ghi đè dữ liệu giả định lên các bảng nghiệp vụ thực tế.

---

## 2. Mô Hình Toán & Quy Tắc Mô Phỏng (Mathematical Model & Rules)

### 2.1. Khung Thời Gian Mô Phỏng
Hỗ trợ 5 mốc thời gian: **`7 ngày`**, **`14 ngày`**, **`30 ngày`**, **`60 ngày`**, **`90 ngày`**.

---

### 2.2. Kịch Bản A: `NO_MAINTENANCE` (Trì Hoãn / Không Bảo Trì)

#### A. Sức Khỏe Dự Kiến (Projected Health Score)
$$\Delta H = \text{BaseDailyRate} \times \text{Days} \times M_{\text{overdue}} \times M_{\text{age}} \times M_{\text{trend}}$$
$$H_{\text{projected}} = \max(5, \min(100, \text{round}(H_0 - \Delta H)))$$

- $\text{BaseDailyRate} = 0.15$ điểm/ngày.
- $M_{\text{overdue}}$ (Hệ số quá hạn): $\le 0\text{d}: 1.0\text{x} \mid \le 7\text{d}: 1.2\text{x} \mid \le 30\text{d}: 1.5\text{x} \mid \le 60\text{d}: 2.0\text{x} \mid > 60\text{d}: 2.8\text{x}$.
- $M_{\text{age}}$ (Hệ số tuổi máy): $\le 1\text{y}: 0.8\text{x} \mid \le 3\text{y}: 1.0\text{x} \mid \le 5\text{y}: 1.4\text{x} \mid > 5\text{y}: 1.8\text{x}$.
- $M_{\text{trend}}$ (Hệ số xu hướng): $\text{Decreasing}: 0.8\text{x} \mid \text{Stable}: 1.0\text{x} \mid \text{Increasing}: 1.3\text{x} - 2.2\text{x}$.

#### B. Nguy Cơ Sự Cố Dự Kiến (Projected Failure Risk)
$$\Delta R = (\text{BaseDailyGrowth} \times \text{Days} \times M_{\text{recent}}) + \text{OverdueBoost}$$
$$R_{\text{projected}} = \max(5, \min(100, \text{round}(R_0 + \Delta R)))$$

- $\text{BaseDailyGrowth} = 0.20$ điểm/ngày.
- $M_{\text{recent}}$: $0\text{ sự cố}: 0.8\text{x} \mid 1\text{ sự cố}: 1.1\text{x} \mid 2\text{ sự cố}: 1.5\text{x} \mid 3\text{ sự cố}: 2.0\text{x} \mid \ge 4\text{ sự cố}: 2.6\text{x}$.
- $\text{OverdueBoost} = 0.10 \times \text{Days}$ (nếu đang hoặc sẽ bị quá hạn).

#### C. Mức Độ Ưu Tiên Dự Kiến (Projected Priority Score)
$$\text{Priority}_{\text{projected}} = (R_{\text{projected}} \times 0.50) + (\text{CritScore} \times 0.20) + (\text{ValueScore} \times 0.15) + (\text{DowntimeScore}_{\text{projected}} \times 0.15)$$

---

### 2.3. Kịch Bản B: `MAINTAIN_NOW` (Bảo Trì Ngay Lập Tức)
- **Sức Khỏe Phục Hồi**: $H_{\text{maintain}} = \min(95, H_0 + 12.0)$ điểm.
- **Rủi Ro Giảm**: $R_{\text{maintain}} = \max(15, \text{round}(R_0 \times (1 - 0.45)))$ điểm (giảm $45\%$).
- **Điểm Ưu Tiên**: Giảm tỷ lệ tương ứng theo công thức Phase 3.

---

## 3. Cấu Trúc Dữ Liệu API (Current vs Projected)

```json
{
  "success": true,
  "data": {
    "deviceId": 1,
    "simulationPeriodDays": 30,
    "current": {
      "healthScore": 84.5,
      "healthStatus": "GOOD",
      "failureRisk": 45,
      "riskStatus": "MEDIUM",
      "priorityScore": 46,
      "priorityStatus": "MEDIUM"
    },
    "scenarios": {
      "NO_MAINTENANCE": {
        "scenarioName": "Không bảo trì (Trì hoãn)",
        "projected": {
          "healthScore": 75,
          "healthStatus": "FAIR",
          "failureRisk": 50,
          "riskStatus": "MEDIUM",
          "priorityScore": 51,
          "priorityStatus": "MEDIUM"
        },
        "delta": { "health": -9.5, "risk": 5, "priority": 5 },
        "statusChange": {
          "health": "GOOD ➔ FAIR",
          "risk": "MEDIUM ➔ MEDIUM",
          "priority": "MEDIUM ➔ MEDIUM"
        },
        "explanations": [
          "ℹ️ Sau 30 ngày không can thiệp, Priority Score dự kiến thay đổi từ 46 lên 51 điểm."
        ]
      },
      "MAINTAIN_NOW": {
        "scenarioName": "Bảo trì ngay lập tức",
        "projected": {
          "healthScore": 95,
          "healthStatus": "GOOD",
          "failureRisk": 25,
          "riskStatus": "LOW",
          "priorityScore": 36,
          "priorityStatus": "LOW"
        },
        "delta": { "health": 10.5, "risk": -20, "priority": -10 },
        "statusChange": {
          "health": "GOOD ➔ GOOD",
          "risk": "MEDIUM ➔ LOW",
          "priority": "MEDIUM ➔ LOW"
        },
        "explanations": [
          "✅ Bảo trì ngay giúp giảm nguy cơ sự cố từ 45 xuống 25 điểm (-20 điểm).",
          "✅ Điểm sức khỏe phục hồi từ 84.5 lên 95 điểm (+10.5 điểm).",
          "✅ Thứ tự ưu tiên giảm từ 46 xuống 36 điểm (MEDIUM ➔ LOW)."
        ]
      }
    }
  }
}
```

---

## 4. Giao Diện Người Dùng (UI Components)

1. **`PredictiveSimulationCard.jsx`**:
   - Bộ chọn thời gian: `[7 ngày] [14 ngày] [30 ngày] [60 ngày] [90 ngày]`.
   - Bộ chuyển đổi kịch bản: `⚠️ Trì hoãn` vs `✅ Bảo trì ngay`.
   - Thanh so sánh trực quan siêu nhẹ (CSS thuần) cho Health, Failure Risk, Priority Score.
   - Thẻ Khuyến nghị quyết định kèm cảnh báo chuyển bậc rủi ro và nút `[Tạo Lệnh Công Tác]` trực tiếp.
2. **`DashboardPage.jsx`**:
   - Widget **Predictive Maintenance Alerts** (Cảnh báo chuyển sang CRITICAL, Tăng rủi ro đột biến, Sức khỏe sụt giảm).
   - Bảng **Top 10 Thiết bị có nguy cơ xấu đi nhanh nhất trong 30 ngày tới** (sắp xếp theo $\Delta \text{Priority}$ giảm dần).

---

## 5. Kết Quả Kiểm Thử Toàn Bộ Hệ Thống (85/85 Tests Passed)

```bash
========================================================================
🧪 TỔNG HỢP KIỂM THỬ TOÀN BỘ HỆ THỐNG ASSETCARE (PHASES 1 - 4)
========================================================================
▶ Phase 4 Simulation Suite:       27/27 PASS (100%)
▶ Phase 3 Priority & Work Order:  20/20 PASS (100%)
▶ Phase 2 Failure Risk Suite:     20/20 PASS (100%)
▶ Phase 1 Asset Health Suite:     11/11 PASS (100%)
▶ QR & Authentication Flow Suite:  7/7  PASS (100%)
========================================================================
🎉 TỔNG CỘNG: 85/85 BÀI KIỂM THỬ ĐẠT 100% HOÀN HẢO!
========================================================================
```

---

## 6. Kết Quả Build Production

```bash
vite v5.4.21 building for production...
✓ 2560 modules transformed.
✓ built in 9.88s
dist/assets/DeviceDetailPage-fbKxnOKH.js    68.61 kB │ gzip: 16.01 kB
dist/assets/DashboardPage-DrRAVYey.js       45.24 kB │ gzip:  9.23 kB
dist/assets/RiskMatrixPage-BMgcapmX.js      11.19 kB │ gzip:  2.93 kB
dist/assets/WorkOrderListPage-CE1f7dE4.js    8.42 kB │ gzip:  3.01 kB
PWA v1.3.0 mode generateSW (62 entries precached)
```

---

## 7. Giới Hạn Kỹ Thuật (Known Limitations)

1. Mô hình mô phỏng hoạt động theo phương pháp heuristic rule-based chuẩn hóa trên các yếu tố quá hạn, tần suất sự cố, tuổi thiết bị và downtime. Khi hệ thống tích lũy đủ chuỗi thời gian lớn (>1.000 sự cố), có thể tích hợp thêm mô hình học máy (Machine Learning) để huấn luyện trọng số tự động.
2. Quá trình tính toán là thời gian thực (in-memory) phục vụ tức thì cho người dùng duyệt web, không lưu vết mô phỏng vào DB để đảm bảo độ sạch và toàn vẹn của dữ liệu vận hành.
