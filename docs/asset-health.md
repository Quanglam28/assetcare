# TÀI LIỆU KỸ THUẬT: ĐỘNG CƠ ĐÁNH GIÁ SỨC KHỎE TÀI SẢN & DỰ BÁO NGUY CƠ BẢO TRÌ PHÒNG NGỪA (RULE-BASED ASSET HEALTH & PREDICTIVE RISK ENGINE)

> **Hệ thống Quản lý Vòng đời Tài sản & Bảo trì Thiết bị Đại học (QR Code) — Trường Đại học Công nghệ Giao thông Vận tải (UTT)**  
> **Phiên bản Engine**: `v1.0 (Rule-Based Expert Engine)`  
> **Mã nguồn**: Backend (`backend/src/services/assetHealthService.js`, `assetRiskService.js`, `recommendationService.js`), Frontend (`frontend/src/components/devices/`)

---

## 1. Asset Health Score Là Gì?
**Asset Health Score (Điểm Sức Khỏe Thiết Bị)** là chỉ số định lượng tổng hợp từ **0 đến 100 điểm**, biểu thị mức độ hoạt động ổn định, độ tin cậy cơ học và giá trị còn lại của thiết bị trong khuôn viên trường học:
- **100 điểm**: Thiết bị ở trạng thái hoàn hảo, mới xuất xưởng hoặc được bảo dưỡng chuẩn mực, không có sự cố.
- **0 điểm**: Thiết bị xuống cấp cực kỳ nghiêm trọng, hỏng hóc thường xuyên, chi phí sửa chữa vượt quá giá trị mua ban đầu.

---

## 2. Các Yếu Tố Tính Điểm Sức Khỏe & Trọng Số (Weights)

Mô hình đánh giá sức khỏe sử dụng **6 nhóm chỉ số thành phần (Sub-Scores)** với tổng trọng số chuẩn bằng **100%**:

| STT | Nhóm Chỉ Số | Trọng Số | Ý Nghĩa Kỹ Thuật & Nghiệp Vụ | Thang Điểm |
| :--- | :--- | :---: | :--- | :---: |
| 1 | **Age Score (Tuổi thọ)** | **20%** | Thời gian đưa vào vận hành thực tế so với ngày mua ban đầu (`purchase_date`). | 0 - 100 |
| 2 | **Failure Frequency (Sự cố)** | **25%** | Tổng số lần báo hỏng và sự cố kỹ thuật phát sinh trong vòng đời máy. | 0 - 100 |
| 3 | **Maintenance (Bảo dưỡng)** | **15%** | Mức độ tuân thủ quy trình bảo trì định kỳ, số ngày quá hạn lịch bảo dưỡng. | 0 - 100 |
| 4 | **Repair Cost (Chi phí sửa)** | **20%** | Tỷ lệ tổng chi phí vật tư/linh kiện sửa chữa so với nguyên giá mua ban đầu. | 0 - 100 |
| 5 | **Downtime (Thời gian gián đoạn)** | **10%** | Tổng thời gian thiết bị phải ngừng hoạt động để sửa chữa (giờ gián đoạn). | 0 - 100 |
| 6 | **Warranty (Thời hạn bảo hành)** | **10%** | Thiết bị còn trong hạn bảo hành chính hãng, sắp hết hạn hay đã hết hạn. | 0 - 100 |

---

## 3. Công Thức Tính Toán Asset Health Score

$$\text{Health Score} = (\text{AgeScore} \times 0.20) + (\text{FailureScore} \times 0.25) + (\text{MaintenanceScore} \times 0.15) + (\text{RepairCostScore} \times 0.20) + (\text{DowntimeScore} \times 0.10) + (\text{WarrantyScore} \times 0.10)$$

### Bảng Quy Đổi Ngưỡng Chi Tiết:

1. **Tuổi thọ thiết bị (`AgeScore`)**:
   - $\le 1$ năm: `100đ`
   - $> 1$ và $\le 2$ năm: `90đ`
   - $> 2$ và $\le 3$ năm: `80đ`
   - $> 3$ và $\le 4$ năm: `65đ`
   - $> 4$ và $\le 5$ năm: `45đ`
   - $> 5$ năm: `25đ`

2. **Tần suất sự cố (`FailureScore`)**:
   - $0$ sự cố: `100đ` | $1$ sự cố: `90đ` | $2$ sự cố: `80đ` | $3$ sự cố: `65đ` | $4$ sự cố: `50đ` | $5$ sự cố: `35đ` | $> 5$ sự cố: `20đ`

3. **Bảo trì định kỳ (`MaintenanceScore`)**:
   - Không quá hạn: `100đ`
   - Quá hạn $\le 7$ ngày: `80đ`
   - Quá hạn $8 - 30$ ngày: `60đ`
   - Quá hạn $31 - 60$ ngày: `40đ`
   - Quá hạn $> 60$ ngày: `20đ`

4. **Tỷ lệ chi phí sửa chữa / Nguyên giá (`RepairCostScore`)**:
   - $\text{Repair Ratio} = \frac{\text{Tổng chi phí sửa chữa}}{\text{Nguyên giá mua}}$
   - $< 10\%$: `100đ` | $10\% - 20\%$: `85đ` | $20\% - 40\%$: `65đ` | $40\% - 60\%$: `40đ` | $> 60\%$: `20đ`

5. **Thời gian ngừng máy (`DowntimeScore`)**:
   - $0$ giờ: `100đ` | $\le 8$ giờ: `90đ` | $8 - 24$ giờ: `75đ` | $1 - 3$ ngày: `60đ` | $3 - 7$ ngày: `40đ` | $> 7$ ngày: `20đ`

6. **Bảo hành (`WarrantyScore`)**:
   - Còn bảo hành $> 30$ ngày: `100đ` | Sắp hết hạn ($\le 30$ ngày): `70đ` | Đã hết bảo hành: `40đ`

---

## 4. Failure Risk Score (Điểm Nguy Cơ Sự Cố: 0 → 100%)

Failure Risk Score biểu thị **xác suất rủi ro phát sinh sự cố đột ngột** trong 90 ngày tiếp theo. Risk Score **không đơn thuần là $100 - \text{HealthScore}$**, mà là mô hình rủi ro đa biến gồm 7 yếu tố:

$$\text{Risk Score} = \sum_{i=1}^7 (\text{RiskFactor}_i \times \text{Weight}_i)$$

1. **Số sự cố trong 90 ngày gần nhất** (25%): 0 sự cố = 0%, 1 = 25%, 2 = 50%, 3 = 75%, $\ge 4 = 100\%$.
2. **Xu hướng sự cố hỏng (Failure Trend)** (20%): So sánh số sự cố 90 ngày hiện tại vs 90 ngày trước đó ($\text{Trend} = \frac{\text{Current} - \text{Previous}}{\text{Previous}} \times 100\%$). Tăng $> 50\% \rightarrow 95\%$ rủi ro.
3. **Xu hướng chi phí sửa (Cost Trend)** (15%): So sánh chi phí sửa chữa 90 ngày hiện tại vs 90 ngày trước đó.
4. **Rủi ro tuổi thọ (Age Risk)** (15%): Khấu hao thời gian và độ mỏi cơ học.
5. **Rủi ro gián đoạn (Downtime Risk)** (10%): Thời gian máy không sẵn sàng.
6. **Rủi ro bảo trì quá hạn (Overdue Risk)** (10%): Không được bôi trơn, vệ sinh, kiểm tra đúng hạn.
7. **Sự cố nghiêm trọng trước đó (Critical Incidents)** (5%): Tiền sử từng gặp sự cố mức `URGENT` hoặc `HIGH`.

---

## 5. Phân Loại Sức Khỏe & Nguy Cơ (Classification)

### Phân loại Health Score:
- 🟢 **GOOD (80 - 100 điểm)**: Thiết bị hoạt động ổn định, độ tin cậy cao.
- 🟡 **FAIR (60 - 79 điểm)**: Thiết bị bình thường, có dấu hiệu hao mòn nhẹ.
- 🟠 **WARNING (40 - 59 điểm)**: Cần lưu ý kiểm tra, phát sinh hỏng hóc hoặc quá hạn bảo dưỡng.
- 🔴 **CRITICAL (0 - 39 điểm)**: Nguy cấp, hỏng hóc nghiêm trọng hoặc chi phí sửa vượt ngưỡng.
- ⚪ **INSUFFICIENT_DATA**: Chưa đủ dữ liệu lịch sử để đánh giá chính xác.

### Phân loại Failure Risk Level:
- 🟢 **VERY_LOW (0 - 20%)** | 🟢 **LOW (21 - 40%)** | 🟡 **MEDIUM (41 - 60%)** | 🟠 **HIGH (61 - 80%)** | 🔴 **CRITICAL (81 - 100%)**

---

## 6. Khái Niệm Bảo Trì Phòng Ngừa (Predictive Maintenance)
Thay vì chờ thiết bị hỏng hoàn toàn mới cử kỹ thuật viên đi sửa chữa (*Reactive Maintenance*), hệ thống tự động quét dữ liệu vận hành hàng ngày, phát hiện sớm các dấu hiệu suy giảm hiệu năng để **cảnh báo kiểm tra và bảo dưỡng chủ động trước khi sự cố xảy ra**.

---

## 7. Động Cơ Khuyến Nghị Kỹ Thuật (Recommendation Engine)

Hệ thống đưa ra 5 loại khuyến nghị hành động thông minh:

1. **`SCHEDULE_MAINTENANCE` (Lập lịch bảo dưỡng ngay)**:
   - *Điều kiện kích hoạt*: Lịch bảo trì định kỳ đã quá hạn hoặc Risk $\ge 40\%$.
2. **`INSPECT_ASSET` (Kiểm tra chuyên sâu tại hiện trường)**:
   - *Điều kiện kích hoạt*: Risk $\ge 60\%$ hoặc Health $< 60$ điểm.
3. **`MONITOR_ASSET` (Duy trì vận hành ổn định)**:
   - *Điều kiện kích hoạt*: Thiết bị hoạt động bình thường, không quá hạn, Risk $< 40\%$.
4. **`REPAIR_ASSET` (Theo dõi tiến độ sửa chữa)**:
   - *Điều kiện kích hoạt*: Thiết bị đang ở trạng thái `BROKEN` hoặc `MAINTENANCE`.
5. **`CONSIDER_REPLACEMENT` (Đề xuất xem xét thay mới thiết bị)**:
   - *Điều kiện kích hoạt*:
     $$\text{Repair Cost Ratio} > 60\% \quad \land \quad \text{Health Score} < 40 \quad \land \quad \text{Risk Score} > 70\%$$
   - *Lưu ý*: Hệ thống chỉ hiển thị khuyến nghị hỗ trợ ra quyết định, không tự ý thanh lý máy nếu chưa được Ban Quản lý phê duyệt.

---

## 8. Xử Lý Khi Thiếu Dữ Liệu (Insufficient Data Handling)
- Đối với thiết bị mới tạo hoặc thiếu ngày mua, nguyên giá mua, hệ thống **không bao giờ gán điểm 0 hoặc sinh lỗi `NaN`/`null`/`Infinity`**.
- Hệ thống tính toán chỉ số **Data Completeness (Độ hoàn thiện dữ liệu %)**:
  $$\text{Data Completeness} = \frac{\text{Số chỉ số có đủ dữ liệu}}{\text{Tổng 6 chỉ số}} \times 100\%$$
- Nếu $\text{Data Completeness} < 50\%$ và chưa có sự cố, trạng thái hiển thị rõ: *"Chưa đủ dữ liệu để đánh giá chính xác (Đánh giá dựa trên 3/6 chỉ số: 50%)"*.

---

## 9. Phiên Bản Công Thức Tính Toán (Calculation Versioning)
Mỗi bản ghi đánh giá sức khỏe và nguy cơ trong database đều được lưu kèm trường `calculation_version: 'v1.0'`. Khi nhà trường điều chỉnh trọng số hoặc cập nhật thuật toán trong tương lai, hệ thống có thể đối chiếu chính xác điểm số được tính toán dựa trên phiên bản nào.

---

## 10. Kiến Trúc Sẵn Sàng Nâng Cấp Lên Machine Learning (Future ML Upgrade)

Hệ thống được thiết kế theo mẫu kiến trúc **Provider Pattern**:

```
                  ┌─────────────────────────────────────┐
                  │      RiskAssessmentProvider         │
                  │        (Abstract Interface)         │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────────┐
│       RuleBasedRiskProvider         │   │          MLRiskProvider             │
│   (Hiện thực hóa v1.0 hiện tại)     │   │   (Mô hình ML nâng cấp tương lai)   │
└─────────────────────────────────────┘   └─────────────────────────────────────┘
```

Trong tương lai, khi hệ thống tích lũy đủ hàng nghìn bản ghi sự cố và cảm biến IoT:
- Có thể huấn luyện mô hình Machine Learning (*Random Forest*, *XGBoost* hoặc *LSTM Time-Series*).
- Tạo lớp `MLRiskProvider` kế thừa `RiskAssessmentProvider` để dự báo thời gian trung bình giữa các sự cố (*MTBF - Mean Time Between Failures*) và tuổi thọ hữu dụng còn lại (*RUL - Remaining Useful Life*) mà không cần sửa đổi các Controller hay giao diện người dùng.
