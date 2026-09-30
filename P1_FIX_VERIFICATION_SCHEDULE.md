# BÁO CÁO XÁC NHẬN SỬA LỖI P1 — LỊCH BẢO TRÌ ASSETCARE
**Tài liệu:** `P1_FIX_VERIFICATION_SCHEDULE.md`  
**Ngày thực hiện:** 01/10/2026  
**Môi trường kiểm thử:** Node.js v24.16.0 | Express REST API | React Vite | TiDB Cloud Cluster (AWS ap-southeast-1)

---

## 1. SCOPE (PHẠM VI CÔNG VIỆC)

Thực hiện giải quyết triệt để 3 vấn đề mức **P1** đã được xác nhận trong báo cáo audit/re-verification về phân hệ Lịch bảo trì (Preventive Maintenance):
- **P1.1 — Date/Timezone parsing**: Khắc phục hiện tượng lệch ngày khi hiển thị ngày chỉ có ngày (`YYYY-MM-DD`) tại các múi giờ âm (UTC-4, UTC-7).
- **P1.2 — Monthly/Quarterly date calculation**: Khắc phục lỗi tràn tháng (overflow) của `Date.setMonth()` khi cộng tháng cho các ngày cuối tháng (31/01, 31/03, 31/05, 31/08, 31/10, năm nhuận 29/02), áp dụng cơ chế **Month Clamping (EOM Clamping)** chuẩn quốc tế.
- **P1.3 — Edit Schedule UI**: Bổ sung giao diện chỉnh sửa lịch bảo trì vào trang `/schedules` thông qua component `EditScheduleModal`, kết nối API `PUT /api/v1/schedules/:id` hiện có, tuân thủ RBAC và ràng buộc trạng thái P0.

### Cam kết tuân thủ:
- ✅ **KHÔNG** sửa database schema / migration.
- ✅ **KHÔNG** đổi API contract hiện tại.
- ✅ **KHÔNG** đổi kiến trúc xác thực (Authentication) hoặc RBAC.
- ✅ **KHÔNG** sửa đổi hoặc làm sai lệch 4 lỗi P0 đã PASS.
- ✅ **KHÔNG** commit / push Git repository.
- ✅ Dữ liệu production và CSDL TiDB Cloud được bảo toàn toàn vẹn 100%.

---

## 2. BẢNG TỔNG HỢP BEFORE / AFTER

| Vấn đề | Trước khi sửa (Before) | Sau khi sửa (After) | Kết quả |
| :--- | :--- | :--- | :---: |
| **P1.1 Timezone Parsing** | Dùng `new Date("YYYY-MM-DD").toLocaleDateString()` dẫn đến bị lùi 1 ngày tại múi giờ âm (Ví dụ `2026-09-05` hiển thị thành `04/09/2026` tại New York / Los Angeles). | Tạo helper `formatDateOnly` và nâng cấp `formatDate` phân tách regex `YYYY-MM-DD` trực tiếp, không phụ thuộc vào UTC offset. Luôn hiển thị `05/09/2026` trên toàn bộ múi giờ. | **PASS** ✅ |
| **P1.2 Date Calculation** | `d.setMonth(d.getMonth() + N)` bị tràn tháng khi ngày gốc không có trong tháng đích (Ví dụ: `31/01 + 1M` thành `03/03/2026`; `31/01 + 3M` thành `01/05/2026`). | Áp dụng thuật toán **Month Clamping (EOM Clamping)**: lấy ngày nhỏ hơn giữa ngày gốc và ngày tối đa của tháng đích. `31/01 + 1M` thành `28/02` (hoặc `29/02` năm nhuận); `31/01 + 3M` thành `30/04`. | **PASS** ✅ |
| **P1.3 Edit Schedule UI** | Giao diện `/schedules` chỉ có nút "Bảo Dưỡng" và "Xóa". Nút Edit (`Edit3`) bị thiếu hoàn toàn dù Backend đã có `PUT /api/v1/schedules/:id`. | Tạo component `EditScheduleModal.jsx` hoàn chỉnh, thêm nút Edit vào bảng cho Admin/Manager, hỗ trợ sửa đầy đủ các trường, khóa trạng thái khi đã COMPLETED/CANCELLED. | **PASS** ✅ |

---

## 3. P1.1 — TIMEZONE VERIFICATION (CHI TIẾT KIỂM THỬ MÚI GIỜ)

- **Input kiểm thử:** Chuỗi ngày date-only từ DB: `"2026-09-05"`.
- **Expected format:** `"05/09/2026"` trên mọi múi giờ.

| Timezone | UTC Offset | Expected | Actual (formatDate / formatDateOnly) | Result |
| :--- | :---: | :---: | :---: | :---: |
| `Asia/Ho_Chi_Minh` | UTC+7 | `05/09/2026` | `05/09/2026` | **PASS** ✅ |
| `America/New_York` | UTC-4 (EDT) | `05/09/2026` | `05/09/2026` | **PASS** ✅ |
| `America/Los_Angeles` | UTC-7 (PDT) | `05/09/2026` | `05/09/2026` | **PASS** ✅ |
| `UTC` | UTC+0 | `05/09/2026` | `05/09/2026` | **PASS** ✅ |
| `Europe/London` | UTC+1 (BST) | `05/09/2026` | `05/09/2026` | **PASS** ✅ |
| `Asia/Tokyo` | UTC+9 | `05/09/2026` | `05/09/2026` | **PASS** ✅ |

**Các vị trí đã cập nhật hiển thị:**
1. [SchedulesPage.jsx](file:///d:/LAMm/frontend/src/pages/schedules/SchedulesPage.jsx): Hạn bảo trì (`item.scheduled_date`) & Chu kỳ kế tiếp (`item.next_run_date`).
2. [ExecuteScheduleModal.jsx](file:///d:/LAMm/frontend/src/components/schedules/ExecuteScheduleModal.jsx): Hạn hiện tại (`schedule.scheduled_date`).
3. [formatters.js](file:///d:/LAMm/frontend/src/utils/formatters.js): Cung cấp `formatDate` & `formatDateOnly` an toàn múi giờ cho toàn hệ thống.

---

## 4. P1.2 — MONTHLY / QUARTERLY CALCULATION (CHI TIẾT TÍNH CHU KỲ)

### Nguyên tắc nghiệp vụ đã thống nhất (Assumption & Specification):
Khi cộng thêm tháng cho một ngày lịch $D$ vào tháng đích có số ngày tối đa là $D_{max}$ (với $D > D_{max}$), ngày của chu kỳ tiếp theo sẽ được **kẹp về ngày cuối cùng của tháng đích**:
$$\text{TargetDay} = \min(D, D_{max})$$
Quy tắc này bảo đảm không bao giờ bị nhảy vọt sang tháng kế tiếp, bảo đảm tính định kỳ chính xác của kế hoạch bảo trì.

### Bảng kết quả kiểm thử toàn diện:

| Test Case | Base Date | Frequency | Expected | Actual (Backend) | Actual (Frontend) | Result |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 31/01/2026 + 1M (Tháng 2 không nhuận) | `2026-01-31` | `MONTHLY` | `2026-02-28` | `2026-02-28` | `28/02/2026` | **PASS** ✅ |
| 31/01/2024 + 1M (Tháng 2 năm nhuận) | `2024-01-31` | `MONTHLY` | `2024-02-29` | `2024-02-29` | `29/02/2024` | **PASS** ✅ |
| 29/02/2024 + 1M (Sau ngày nhuận) | `2024-02-29` | `MONTHLY` | `2024-03-29` | `2024-03-29` | `29/03/2024` | **PASS** ✅ |
| 31/03/2026 + 1M (Tháng 4 có 30 ngày) | `2026-03-31` | `MONTHLY` | `2026-04-30` | `2026-04-30` | `30/04/2026` | **PASS** ✅ |
| 30/04/2026 + 1M (Tháng 5 có 31 ngày) | `2026-04-30` | `MONTHLY` | `2026-05-30` | `2026-05-30` | `30/05/2026` | **PASS** ✅ |
| 31/05/2026 + 1M (Tháng 6 có 30 ngày) | `2026-05-31` | `MONTHLY` | `2026-06-30` | `2026-06-30` | `30/06/2026` | **PASS** ✅ |
| 31/07/2026 + 1M (Tháng 8 có 31 ngày) | `2026-07-31` | `MONTHLY` | `2026-08-31` | `2026-08-31` | `31/08/2026` | **PASS** ✅ |
| 31/08/2026 + 1M (Tháng 9 có 30 ngày) | `2026-08-31` | `MONTHLY` | `2026-09-30` | `2026-09-30` | `30/09/2026` | **PASS** ✅ |
| 31/10/2026 + 1M (Tháng 11 có 30 ngày) | `2026-10-31` | `MONTHLY` | `2026-11-30` | `2026-11-30` | `30/11/2026` | **PASS** ✅ |
| 31/12/2026 + 1M (Chuyển giao năm) | `2026-12-31` | `MONTHLY` | `2027-01-31` | `2027-01-31` | `31/01/2027` | **PASS** ✅ |
| 31/01/2026 + 3M (QUARTERLY -> Tháng 4) | `2026-01-31` | `QUARTERLY` | `2026-04-30` | `2026-04-30` | `30/04/2026` | **PASS** ✅ |
| 30/04/2026 + 3M (QUARTERLY -> Tháng 7) | `2026-04-30` | `QUARTERLY` | `2026-07-30` | `2026-07-30` | `30/07/2026` | **PASS** ✅ |
| 31/07/2026 + 3M (QUARTERLY -> Tháng 10) | `2026-07-31` | `QUARTERLY` | `2026-10-31` | `2026-10-31` | `31/10/2026` | **PASS** ✅ |
| 31/10/2026 + 3M (QUARTERLY -> Tháng 1) | `2026-10-31` | `QUARTERLY` | `2027-01-31` | `2027-01-31` | `31/01/2027` | **PASS** ✅ |
| Ngày thường: 15/01/2026 + 1M | `2026-01-15` | `MONTHLY` | `2026-02-15` | `2026-02-15` | `15/02/2026` | **PASS** ✅ |
| Ngày thường: 15/01/2026 + 3M | `2026-01-15` | `QUARTERLY` | `2026-04-15` | `2026-04-15` | `15/04/2026` | **PASS** ✅ |
| Nửa năm: 31/08/2026 + 6M | `2026-08-31` | `SEMI_ANNUALLY`| `2027-02-28` | `2027-02-28` | `28/02/2027` | **PASS** ✅ |
| Hàng năm: 29/02/2024 + 12M | `2024-02-29` | `ANNUALLY` | `2025-02-28` | `2025-02-28` | `28/02/2025` | **PASS** ✅ |
| Tùy chỉnh: 15/01/2026 + 45 ngày | `2026-01-15` | `CUSTOM (45d)` | `2026-03-01` | `2026-03-01` | `01/03/2026` | **PASS** ✅ |

---

## 5. P1.3 — EDIT SCHEDULE UI & RBAC VERIFICATION

### Kiểm thử Giao diện & Modal:
- Component: [EditScheduleModal.jsx](file:///d:/LAMm/frontend/src/components/schedules/EditScheduleModal.jsx).
- Mở modal khi nhấn icon Edit (`Edit3`) tại từng dòng lịch bảo trì trên trang `/schedules`.
- Banner thông tin thiết bị: hiển thị mã thiết bị, tên, vị trí phòng ban (read-only).
- Xem trước trực tiếp (Live Preview) ngày chu kỳ kế tiếp ứng với chu kỳ và ngày dự kiến được chọn.
- Xử lý trạng thái (State Transition Guard):
  - Khi lịch có status là `SCHEDULED`: cho phép chọn tiếp `SCHEDULED` hoặc hủy `CANCELLED`.
  - Khi lịch có status là `COMPLETED`: khóa trường trạng thái, hiển thị nhãn `COMPLETED` cùng ghi chú cảnh báo: *"Trạng thái kết thúc - không thể mở lại"*.
  - Khi lịch có status là `CANCELLED`: khóa trường trạng thái, hiển thị nhãn `CANCELLED`.

### Kiểm thử API PUT & Phân quyền RBAC:
- **Test 3.1: GET chi tiết lịch bảo trì trước khi sửa**  
  - Endpoint: `GET /api/v1/schedules/:id`  
  - Status: **200 OK**  
  - Result: Lấy đúng tiêu đề ban đầu `"Original Title Before Edit"`.
- **Test 3.2: PUT cập nhật kế hoạch bảo trì (ADMIN)**  
  - Payload: `{ title: "Updated Title After Edit", frequency: "QUARTERLY", scheduledDate: "2026-03-31", assignedTechnicianId: 5 }`  
  - Status: **200 OK**  
  - DB Verification: `title` được cập nhật, `next_run_date` tự động tính và kẹp đúng thành `"2026-06-30"` (không bị tràn thành `01/07`).
- **Test 3.3: RBAC TECHNICIAN không được gọi PUT**  
  - Request: Kỹ thuật viên gọi `PUT /api/v1/schedules/:id`.  
  - Status: **403 Forbidden**  
  - Message: *"Bạn không có quyền thực hiện hành động này. Yêu cầu một trong các quyền: [ADMIN, MANAGER]. Vai trò hiện tại của bạn: [TECHNICIAN]."*
- **Test 3.4: RBAC USER không được gọi PUT**  
  - Request: Người dùng gọi `PUT /api/v1/schedules/:id`.  
  - Status: **403 Forbidden**.
- **Test 3.5: Validation KTV trong PUT (P0.2)**  
  - Request: PUT gán `assignedTechnicianId` là người dùng có role `USER`.  
  - Status: **400 Bad Request**  
  - Message: *"Người dùng được phân công phải có vai trò Kỹ thuật viên (TECHNICIAN)."*

---

## 6. P0 REGRESSION VERIFICATION (HỒI QUY TOÀN BỘ 4 LỖI P0)

Để đảm bảo các sửa đổi cho P1 không làm ảnh hưởng tới 4 lỗi P0 đã sửa trước đó:

| Mã P0 | Tình huống kiểm tra | Expected | Actual | Result |
| :--- | :--- | :---: | :---: | :---: |
| **P0.1** | KTV B execute lịch được phân công cho KTV A | HTTP 403 Forbidden | HTTP 403 | **PASS** ✅ |
| **P0.2** | Gán người dùng role USER/ADMIN làm KTV phụ trách | HTTP 400 Bad Request | HTTP 400 | **PASS** ✅ |
| **P0.3** | Execute lịch đã `COMPLETED` lần thứ 2 | HTTP 400 Bad Request | HTTP 400 | **PASS** ✅ |
| **P0.3** | PUT chuyển `status: "SCHEDULED"` cho lịch đã `COMPLETED` | HTTP 400 Bad Request | HTTP 400 | **PASS** ✅ |
| **P0.4** | Xóa thiết bị đang có kế hoạch bảo trì liên kết | HTTP 400 Bad Request (Không bị 500 DB FK) | HTTP 400 | **PASS** ✅ |

---

## 7. FRONTEND PRODUCTION BUILD

- **Lệnh thực hiện:** `npm run build` tại thư mục `frontend/`.
- **Kết quả:**
  ```text
  vite v5.4.21 building for production...
  ✓ 2563 modules transformed.
  rendering chunks...
  dist/assets/SchedulesPage-jKDGrcm9.js    34.78 kB │ gzip: 8.00 kB
  ✓ built in 7.06s
  PWA v1.3.0
  mode      generateSW
  precache  62 entries (1616.01 KiB)
  ```
- **Trạng thái:** **0 errors, 0 warnings**.

---

## 8. DATABASE INTEGRITY VERIFICATION

Kiểm tra trực tiếp trên CSDL đám mây TiDB Cloud sau toàn bộ quá trình kiểm thử:
- **Orphan schedules (`d.id IS NULL`):** `0` bản ghi.
- **Dữ liệu rác kiểm thử (`DEV-P1%`, `DEV-TEST%`):** `0` bản ghi.
- **Tổng số thiết bị trong hệ thống:** `51` thiết bị (nguyên vẹn).
- **Tổng số lịch bảo trì:** `17` kế hoạch (nguyên vẹn).
- **Tổng số phiếu sự cố bảo trì:** `68` phiếu (nguyên vẹn).

---

## 9. FILES CHANGED (DANH SÁCH TẬP TIN ĐÃ THAY ĐỔI)

### Files Modified:
1. `backend/src/repositories/scheduleRepository.js` — Thêm cơ chế EOM Month Clamping và phân tách date-only chống lệch múi giờ trong `calculateNextRunDate`.
2. `frontend/src/utils/formatters.js` — Bổ sung `formatDateOnly`, nâng cấp `formatDate` an toàn múi giờ và hàm tính ngày xem trước `calculateNextRunDateClamped`.
3. `frontend/src/pages/schedules/SchedulesPage.jsx` — Tích hợp modal `EditScheduleModal`, gắn nút Edit (`Edit3`) cho Admin/Manager, áp dụng `formatDate` chống lệch ngày.
4. `frontend/src/components/schedules/ExecuteScheduleModal.jsx` — Hiển thị `scheduled_date` an toàn múi giờ qua `formatDate`.
5. `frontend/src/components/schedules/CreateScheduleModal.jsx` — Cập nhật tính ngày kế tiếp xem trước bằng `calculateNextRunDateClamped`.

### Files Added:
1. `frontend/src/components/schedules/EditScheduleModal.jsx` — Component modal chỉnh sửa kế hoạch bảo trì.
2. `P1_FIX_VERIFICATION_SCHEDULE.md` — Báo cáo nghiệm thu kỹ thuật P1.

### Files Deleted:
- Không có.

### Xác nhận tuân thủ:
- Không thay đổi cấu trúc bảng / CSDL CSDL (Schema & Migration: giữ nguyên).
- Không thay đổi cấu trúc xác thực JWT / Cookie / Roles (RBAC: giữ nguyên).
- Không thay đổi API Contract (request / response payload: giữ nguyên).
- Tuyệt đối không commit / push Git repository.

---

## 10. REMAINING ISSUES & FINAL CONCLUSION

### Remaining Issues:
- Không còn lỗi tồn đọng thuộc phân nhóm P0 và P1 của phân hệ Lịch bảo trì.

### Final Conclusion:
- Cả 3 lỗi P1 (Date/Timezone, Monthly/Quarterly calculation, Edit Schedule UI) đã được xử lý triệt để, kiểm thử tự động đạt **100% PASS** trên toàn bộ các múi giờ, chu kỳ ngày tháng và phân quyền người dùng. Hệ thống hoàn toàn sẵn sàng đưa vào vận hành.
