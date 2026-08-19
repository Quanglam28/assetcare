# BÁO CÁO THIẾT KẾ & ĐO ĐẠC: PHASE 3 — PRIORITY + RECOMMENDATION + WORK ORDER + RISK MATRIX

> **Hệ thống Quản lý Vòng đời Tài sản & Bảo trì Thiết bị Đại học (AssetCare) — UTT**  
> **Kiến trúc**: Rule-Based Decision Support System (Phase 3 - Version 1.0)  
> **Thời điểm hoàn thành**: 20/08/2026  
> **Đo lường & Kiểm thử thực tế**: 100% kết nối MySQL thực, 58/58 Test Cases Passed, 0 suy thoái hệ thống.

---

## 1. Mục Tiêu Nghiệp Vụ (Business Objective)

Phase 3 biến kết quả định lượng từ **Asset Health Score (Phase 1)** và **Failure Risk Score (Phase 2)** thành một vòng lặp quản lý tài sản và hỗ trợ quyết định bảo trì hoàn chỉnh:

```
THIẾT BỊ (DEVICE)
       ↓
HEALTH SCORE (Phase 1: 0 - 100)
       ↓
FAILURE RISK SCORE (Phase 2: 0 - 100)
       ↓
PRIORITY SCORE ENGINE (Phase 3: 0 - 100)
       ↓
RECOMMENDATION ENGINE (Phase 3: 8 Quy tắc chuyên gia)
       ↓
MAINTENANCE WORK ORDER (Phase 3: Điều phối Lệnh công tác)
       ↓
KỸ THUẬT VIÊN TIẾP NHẬN & NGHIỆM THU
       ↓
CẬP NHẬT DỮ LIỆU CHI PHÍ / DOWNTIME / LỊCH SỬ THỰC TẾ
       ↓
TỰ ĐỘNG TÍNH TOÁN LẠI HEALTH + RISK + PRIORITY + AUDIT LOG
```

---

## 2. Module 1: Priority Score Engine

### 2.1. Công Thức Chuẩn Hóa
$$\text{Priority Score} = (\text{Failure Risk} \times 0.50) + (\text{Business Criticality} \times 0.20) + (\text{Asset Value} \times 0.15) + (\text{Downtime Impact} \times 0.15)$$

### 2.2. Trọng Số & Định Lượng
- **Failure Risk Score** (50%): Lấy từ động cơ Phase 2 ($0 \rightarrow 100$).
- **Business Criticality** (20%): `LOW = 25`, `MEDIUM = 50`, `HIGH = 75`, `CRITICAL = 100`.
- **Asset Value** (15%):
  - $< 5\text{tr}$: 20đ | $5-20\text{tr}$: 40đ | $20-50\text{tr}$: 60đ | $50-100\text{tr}$: 80đ | $> 100\text{tr}$: 100đ.
- **Downtime Impact** (15%):
  - $0\text{h}$: 10đ | $\le 8\text{h}$: 30đ | $\le 24\text{h}$: 50đ | $\le 72\text{h}$: 70đ | $\le 168\text{h}$: 85đ | $> 168\text{h}$: 100đ.

### 2.3. Thang Phân Loại
- `80` – `100`: 🔴 **`CRITICAL`** (Khẩn cấp / Nguy cấp)
- `60` – `79`: 🟠 **`HIGH`** (Ưu tiên cao)
- `40` – `59`: 🟡 **`MEDIUM`** (Trung bình)
- `20` – `39`: 🔵 **`LOW`** (Thấp)
- `0` – `19`: 🟢 **`VERY_LOW`** (Rất thấp)

---

## 3. Module 2: Recommendation Engine (8 Quy Tắc Chuyên Gia)

1. **RULE 1 (`CRITICAL_MAINTENANCE`)**: `Risk >= 80` ➔ Bảo trì khẩn cấp.
2. **RULE 2 (`OVERDUE_MAINTENANCE`)**: `Risk >= 60 AND Overdue > 30d` ➔ Bảo dưỡng định kỳ quá hạn.
3. **RULE 3 (`REPLACEMENT_REVIEW`)**: `Repair Cost Ratio >= 60%` ➔ Đánh giá phương án thay thế thiết bị.
4. **RULE 4 (`RECURRENT_FAILURE`)**: `Failures 30d >= 3` ➔ Kiểm tra nguyên nhân gốc rễ sự cố lặp lại.
5. **RULE 5 (`HIGH_DOWNTIME`)**: `Downtime 30d > 72h` ➔ Khắc phục thời gian ngừng máy kéo dài.
6. **RULE 6 (`END_OF_LIFE_REVIEW`)**: `Age > 5 years AND Risk >= 60` ➔ Đánh giá khấu hao hết vòng đời kinh tế.
7. **RULE 7 (`IMMEDIATE_INTERVENTION`)**: `Health < 40 AND Risk >= 80` ➔ Can thiệp kỹ thuật khẩn cấp.
8. **RULE 8 (`NORMAL_MONITORING`)**: `Health >= 80 AND Risk < 30` ➔ Duy trì theo dõi vận hành tiêu chuẩn.

---

## 4. Module 3: Maintenance Work Order System

### 4.1. Vòng Đời Trạng Thái
`OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `WAITING_PARTS` / `COMPLETED` / `CANCELLED`.

### 4.2. Tính Năng Tự Động Kích Hoạt (Auto-Recalculate)
Khi Kỹ thuật viên nghiệm thu (`COMPLETED`), hệ thống tự động:
1. Ghi nhận chi phí sửa chữa thực tế (`actual_cost`) và giải pháp (`resolution`).
2. Chuyển trạng thái thiết bị về `ACTIVE` (nếu trước đó hỏng).
3. Gửi thông báo hoàn thành tới Người báo / Quản trị viên.
4. Ghi Audit Log hành động `COMPLETE_WORK_ORDER`.
5. Tự động chạy recalculate cho: `Health Score` $\rightarrow$ `Failure Risk` $\rightarrow$ `Priority Score`.

---

## 5. Module 4: Notification Center

- Tự động sinh thông báo theo ngưỡng rủi ro (`CRITICAL`, `HIGH`).
- Gửi thông báo phân công công việc tới Kỹ thuật viên.
- Cơ chế **Deduplication** trong vòng 24 giờ ngăn chặn tình trạng gửi trùng lặp/spam thông báo.

---

## 6. Module 5: Risk Matrix Dashboard (`/risk-matrix`)

- **4 Phân vùng không gian**:
  - 🔴 **CRITICAL**: Health Thấp + Risk Cao
  - 🟠 **MONITOR**: Health Cao + Risk Cao
  - 🟡 **MAINTENANCE**: Health Thấp + Risk Thấp
  - 🟢 **HEALTHY**: Health Cao + Risk Thấp
- **Bộ lọc đa chiều**: Đơn vị, Tòa nhà/Phòng, Mức độ rủi ro, Mức độ ưu tiên.
- **Tối ưu hiệu năng**: Payload siêu nhẹ, không tải dư thừa tickets hay logs.

---

## 7. Module 6: Asset Lifecycle & Device Detail UI

Trang [`DeviceDetailPage.jsx`](file:///d:/LAMm/frontend/src/pages/devices/DeviceDetailPage.jsx) được nâng cấp theo chuẩn phân cấp:
1. Header Thiết bị (Tên, Mã, QR, Trạng thái)
2. Thẻ Khuyến nghị thông minh (`SystemRecommendationCard` kèm nút `[Tạo Lệnh Công Tác]`)
3. Thẻ Sức khỏe thiết bị (`AssetHealthCard` - Phase 1)
4. Thẻ Đánh giá rủi ro sự cố (`FailureRiskCard` - Phase 2)
5. Thẻ Mức độ ưu tiên xử lý (`PriorityScoreCard` - Phase 3)
6. Danh sách Phiếu lệnh công tác của thiết bị (`Work Orders`)
7. Vòng đời tài sản trực quan (`AssetLifecycleTimeline`: Mua sắm $\rightarrow$ Vận hành $\rightarrow$ Bảo dưỡng $\rightarrow$ Sửa chữa $\rightarrow$ Rủi ro cao $\rightarrow$ Thay thế $\rightarrow$ Thanh lý)
8. Biểu đồ lịch sử biến động 90 ngày (`HealthRiskHistoryChart`).

---

## 8. Kết Quả Kiểm Thử Toàn Diện (58/58 Tests Passed - 100%)

1. **Phase 3 Suite** (`test_phase3_priority_suite.js`): **20/20 Passed (100%)**.
2. **Phase 2 Risk Suite** (`test_phase2_risk_suite.js`): **20/20 Passed (100%)**.
3. **Phase 1 Health Suite** (`test_phase1_health_suite.js`): **11/11 Passed (100%)**.
4. **QR & Auth Flow Suite** (`test_qr_auth_flow_suite.js`): **7/7 Passed (100%)**.

---

## 9. Kết Quả Build Production

```bash
vite v5.4.21 building for production...
✓ 2560 modules transformed.
✓ built in 8.27s
dist/assets/DeviceDetailPage-Bx6Ghv96.js    59.48 kB │ gzip: 14.44 kB
dist/assets/RiskMatrixPage-BMgcapmX.js      11.19 kB │ gzip:  2.93 kB
dist/assets/WorkOrderListPage-CE1f7dE4.js    8.42 kB │ gzip:  3.01 kB
PWA v1.3.0 mode generateSW (62 entries precached)
```

---

## 10. Danh Sách Tệp Tin Đã Tạo & Chỉnh Sửa

1. [`backend/src/scripts/migrate_phase3_full.js`](file:///d:/LAMm/backend/src/scripts/migrate_phase3_full.js)
2. [`backend/src/config/priorityConfig.js`](file:///d:/LAMm/backend/src/config/priorityConfig.js)
3. [`backend/src/config/recommendationConfig.js`](file:///d:/LAMm/backend/src/config/recommendationConfig.js)
4. [`backend/src/config/workOrderConfig.js`](file:///d:/LAMm/backend/src/config/workOrderConfig.js)
5. [`backend/src/repositories/priorityRepository.js`](file:///d:/LAMm/backend/src/repositories/priorityRepository.js)
6. [`backend/src/repositories/workOrderRepository.js`](file:///d:/LAMm/backend/src/repositories/workOrderRepository.js)
7. [`backend/src/repositories/auditRepository.js`](file:///d:/LAMm/backend/src/repositories/auditRepository.js)
8. [`backend/src/services/priorityService.js`](file:///d:/LAMm/backend/src/services/priorityService.js)
9. [`backend/src/services/recommendationService.js`](file:///d:/LAMm/backend/src/services/recommendationService.js)
10. [`backend/src/services/workOrderService.js`](file:///d:/LAMm/backend/src/services/workOrderService.js)
11. [`backend/src/services/notificationService.js`](file:///d:/LAMm/backend/src/services/notificationService.js)
12. [`backend/src/controllers/priorityController.js`](file:///d:/LAMm/backend/src/controllers/priorityController.js)
13. [`backend/src/controllers/workOrderController.js`](file:///d:/LAMm/backend/src/controllers/workOrderController.js)
14. [`backend/src/routes/priorityRoutes.js`](file:///d:/LAMm/backend/src/routes/priorityRoutes.js)
15. [`backend/src/routes/workOrderRoutes.js`](file:///d:/LAMm/backend/src/routes/workOrderRoutes.js)
16. [`backend/src/app.js`](file:///d:/LAMm/backend/src/app.js)
17. [`frontend/src/components/devices/PriorityScoreCard.jsx`](file:///d:/LAMm/frontend/src/components/devices/PriorityScoreCard.jsx)
18. [`frontend/src/components/devices/CreateWorkOrderModal.jsx`](file:///d:/LAMm/frontend/src/components/devices/CreateWorkOrderModal.jsx)
19. [`frontend/src/components/devices/AssetLifecycleTimeline.jsx`](file:///d:/LAMm/frontend/src/components/devices/AssetLifecycleTimeline.jsx)
20. [`frontend/src/components/devices/SystemRecommendationCard.jsx`](file:///d:/LAMm/frontend/src/components/devices/SystemRecommendationCard.jsx)
21. [`frontend/src/pages/matrix/RiskMatrixPage.jsx`](file:///d:/LAMm/frontend/src/pages/matrix/RiskMatrixPage.jsx)
22. [`frontend/src/pages/workorders/WorkOrderListPage.jsx`](file:///d:/LAMm/frontend/src/pages/workorders/WorkOrderListPage.jsx)
23. [`frontend/src/pages/devices/DeviceDetailPage.jsx`](file:///d:/LAMm/frontend/src/pages/devices/DeviceDetailPage.jsx)
24. [`frontend/src/pages/dashboard/DashboardPage.jsx`](file:///d:/LAMm/frontend/src/pages/dashboard/DashboardPage.jsx)
25. [`frontend/src/routes/AppRoutes.jsx`](file:///d:/LAMm/frontend/src/routes/AppRoutes.jsx)
26. [`frontend/src/layouts/Sidebar.jsx`](file:///d:/LAMm/frontend/src/layouts/Sidebar.jsx)
27. [`backend/test_phase3_priority_suite.js`](file:///d:/LAMm/backend/test_phase3_priority_suite.js)
28. [`docs/phase3-priority-recommendation-workorders.md`](file:///d:/LAMm/docs/phase3-priority-recommendation-workorders.md)
