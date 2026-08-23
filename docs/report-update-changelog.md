# BÁO CÁO CẬP NHẬT & NHẬT KÝ THAY ĐỔI TÀI LIỆU
## ASSETCARE — HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ ĐẠI HỌC UTT
**Mã tài liệu**: `docs/report-update-changelog.md`  
**Ngày cập nhật**: 22/08/2026  
**Nguyên tắc bảo toàn**: **BASELINE ĐƯỢC BẢO TOÀN 100%** (Không xóa, không sửa đổi logic/công thức cũ, chỉ bổ sung và mở rộng).

---

# I. TỔNG QUAN CẬP NHẬT TÀI LIỆU BÁO CÁO

Báo cáo chính [`docs/bao-cao-AssetCare.md`](file:///d:/LAMm/docs/bao-cao-AssetCare.md) và bản Word [`docs/bao-cao-AssetCare.docx`](file:///d:/LAMm/docs/bao-cao-AssetCare.docx) đã được cập nhật toàn diện để phản ánh 3 nhóm chức năng nâng cấp mới của hệ thống AssetCare mà không làm thay đổi bất kỳ nội dung, số liệu, bảng biểu hay công thức nào từ báo cáo gốc (*Baseline*).

---

# II. MA TRẬN CHI TIẾT CÁC NỘI DUNG MỚI ĐƯỢC BỔ SUNG VÀO BÁO CÁO

| STT | Chức Năng Mới Bổ Sung | Chương / Mục Được Bổ Sung | Nội Dung Chi Tiết Bổ Sung | Frontend File | Backend File | API Endpoints | Database Tác Động | Test Cases Bổ Sung |
|:---:|---|---|---|---|---|---|---|:---:|
| **1** | **Trung Tâm Thông Báo Thông Minh (Notification Center)** | • Mục 3.1.3 (Yêu cầu chức năng FR-16)<br>• **Mục 3.2.10 (Phân tích chi tiết 10 tiểu mục)**<br>• Mục 3.3.4 (Bảng 3.29b: 5 APIs mới)<br>• Mục 4.8.1 (Cài đặt Notification Center)<br>• Mục 5.7 (Test cases UG-01 $\to$ UG-07)<br>• Mục 5.8 (UAT-NEW-01)<br>• Hình 3.8b & Hình 3.14b (Mermaid) | • Tự động phát thông báo đa cấp độ (`INFO`, `WARNING`, `URGENT`) cho toàn bộ Quản trị viên và Cán bộ Quản lý khi có sự cố mới.<br>• Quản trị thông báo: Header chuông + Badge unread count, trang `/notifications` phân loại đa chiều, đánh dấu đã đọc, đánh dấu tất cả đã đọc.<br>• Quét kích hoạt cảnh báo rủi ro toàn hệ thống tự động. | `NotificationPage.jsx`, Header Bell Dropdown, `notificationService.js` | `notificationController.js`, `notificationService.js`, `notificationRepository.js`, `notificationRoutes.js` | `GET /api/notifications`<br>`GET /api/notifications/unread-count`<br>`PATCH /api/notifications/:id/read`<br>`PATCH /api/notifications/read-all`<br>`POST /api/notifications/scan-system-alerts` | Bảng `notifications` (`user_id`, `device_id`, `type`, `title`, `severity`, `is_read`...) | **UG-01 $\to$ UG-07 (Suite 8)**<br>7/7 Tests PASS 100% |
| **2** | **Lịch Sử Hoạt Động Thiết Bị (Device Activity Timeline Aggregator)** | • Mục 3.1.3 (Yêu cầu chức năng FR-17)<br>• **Mục 3.2.11 (Phân tích chi tiết 10 tiểu mục)**<br>• Mục 3.3.4 (Bảng 3.29b: API Timeline)<br>• Mục 4.8.2 (Cài đặt Activity Timeline)<br>• Mục 5.7 (Test cases UG-08 $\to$ UG-12)<br>• Mục 5.8 (UAT-NEW-02)<br>• Hình 3.14c (Sequence Mermaid) | • API tổng hợp thời gian thực các sự kiện từ 5 bảng dữ liệu (`devices`, `maintenance_requests`, `maintenance_histories`, `maintenance_work_orders`, `audit_logs`).<br>• Phân loại 5 nhóm sự kiện (`INCIDENT`, `MAINTENANCE`, `WORK_ORDER`, `AUDIT`, `LIFECYCLE`), hỗ trợ phân trang `page`/`limit` và lọc đa chiều.<br>• Component Timeline tích hợp tại tab Lịch sử trang Chi tiết thiết bị. | `DeviceActivityTimeline.jsx`, `DeviceDetailPage.jsx`, `deviceService.js` | `deviceController.js`, `deviceService.js`, `deviceRoutes.js` | `GET /api/devices/:id/timeline` | Tổng hợp 5 bảng (`devices`, `maintenance_requests`, `maintenance_histories`, `maintenance_work_orders`, `audit_logs`) | **UG-08 $\to$ UG-12 (Suite 8)**<br>5/5 Tests PASS 100% |
| **3** | **Bảng Điều Khiển & Phân Hệ Báo Cáo Chuyên Sâu (Advanced Dashboard & Reporting)** | • Mục 3.1.3 (Yêu cầu chức năng FR-18)<br>• **Mục 3.2.12 (Phân tích chi tiết 10 tiểu mục)**<br>• Mục 3.3.4 (Bảng 3.29b: 4 APIs mới)<br>• Mục 4.8.3 (Cài đặt Báo cáo & Dashboard)<br>• Mục 5.7 (Test cases UG-13 $\to$ UG-17)<br>• Mục 5.8 (UAT-NEW-03)<br>• Hình 3.8c & Hình 3.14d (Mermaid) | • Dashboard: 9 KPI thẻ thời gian thực + 6 biểu đồ phân tích rủi ro, xu hướng, phân bổ trạng thái và suy giảm sức khỏe Phase 4.<br>• Phân hệ Báo cáo 7 loại biểu mẫu: Kiểm kê tài sản, Tổng hợp bảo trì, Chi phí linh kiện, Hiệu suất KTV, Tần suất sự cố, Hạn bảo hành, Kế hoạch PM.<br>• Xem trước dữ liệu (Preview) và Xuất file Excel (`.xlsx`) qua `ExcelJS` & CSV UTF-8. | `ReportsPage.jsx`, `DashboardPage.jsx`, `reportService.js`, `dashboardService.js` | `reportController.js`, `reportService.js`, `reportRepository.js`, `dashboardService.js`, `reportRoutes.js`, `dashboardRoutes.js` | `GET /api/dashboard/stats`<br>`GET /api/dashboard/charts`<br>`GET /api/dashboard/sla`<br>`GET /api/reports/:type/preview`<br>`GET /api/reports/:type/export` | 8 Bảng CSDL nghiệp vụ | **UG-13 $\to$ UG-17 (Suite 8)**<br>5/5 Tests PASS 100% |

---

# III. CHI TIẾT TỪNG TIỂU MỤC ĐƯỢC BỔ SUNG VÀO BÁO CÁO

### 1. Bổ sung vào Chương 3: Phân Tích và Thiết Kế Hệ Thống
- **Mục 3.1.3 (Bảng 3.2: Yêu cầu chức năng)**: Bổ sung FR-16 (Notification Center), FR-17 (Device Activity Timeline), FR-18 (Advanced Reporting & KPI).
- **Mục 3.2.10**: Bổ sung phân tích toàn diện chức năng **Trung tâm Thông báo Thông minh & Cảnh báo Tự động (Notification Center)** với đầy đủ 10 tiểu mục chuẩn:
  - 3.2.10.1. Mục đích
  - 3.2.10.2. Actor
  - 3.2.10.3. Luồng nghiệp vụ
  - 3.2.10.4. Quy tắc nghiệp vụ
  - 3.2.10.5. Thiết kế Frontend
  - 3.2.10.6. Thiết kế Backend
  - 3.2.10.7. Bảng đặc tả API
  - 3.2.10.8. Cấu trúc Database
  - 3.2.10.9. Phân quyền & bảo mật
  - 3.2.10.10. Bảng kết quả kiểm thử thực tế
- **Mục 3.2.11**: Bổ sung phân tích toàn diện chức năng **Lịch Sử Hoạt Động & Vòng Đời Thiết Bị Tích Hợp (Device Activity Timeline Aggregator)** với đầy đủ 10 tiểu mục chuẩn.
- **Mục 3.2.12**: Bổ sung phân tích toàn diện chức năng **Bảng Điều Khiển & Phân Hệ Báo Cáo Chuyên Sâu (Advanced Dashboard & Reporting)** với đầy đủ 10 tiểu mục chuẩn.
- **Mục 3.3.4 (Thiết kế RESTful API)**: Giữ nguyên Bảng 3.29 (24 APIs gốc) và bổ sung Bảng 3.29b (10 APIs mới nâng cấp).
- **Biểu đồ bổ sung (Mermaid)**:
  - **Hình 3.8b**: Biểu đồ Hoạt động – Quản trị & Điều phối Thông báo Thông minh.
  - **Hình 3.8c**: Biểu đồ Hoạt động – Xem Trước & Xuất Báo Cáo Excel/CSV Chuyên Sâu.
  - **Hình 3.14b**: Biểu đồ Trình tự – Phát và Nhận Thông Báo Tự Động Toàn Hệ Thống.
  - **Hình 3.14c**: Biểu đồ Trình tự – Tổng hợp Lịch Sử Hoạt Động (Timeline Aggregator).
  - **Hình 3.14d**: Biểu đồ Trình tự – Xử Lý Xuất Báo Cáo Excel/CSV Stream.

### 2. Bổ sung vào Chương 4: Xây Dựng và Triển Khai Chương Trình
- **Mục 4.2**: Bổ sung mô tả 2 trang chức năng mới: `NotificationPage.jsx` và `ReportsPage.jsx`.
- **Mục 4.8**: Bổ sung tiểu mục chuyên sâu **"Cài đặt Trung tâm Thông báo, Lịch sử Hoạt động và Phân hệ Báo cáo Chuyên sâu"** bao gồm 4.8.1 (Notification Center), 4.8.2 (Device Activity Timeline) và 4.8.3 (Dashboard & ExcelJS Reports).

### 3. Bổ sung vào Chương 5: Kiểm Thử và Đánh Giá Hệ Thống
- **Mục 5.2 (Bảng 5.1: Tổng hợp kiểm thử tự động)**: Mở rộng từ 7 Suites (136 tests) lên **8 Suites (153 tests)** đạt **100% PASS**.
- **Mục 5.7**: Bổ sung Bảng 5.2 chi tiết kết quả 17 ca kiểm thử của Module 8 (Upgraded Features Suite).
- **Mục 5.8**: Bổ sung Bảng 5.3 (UAT Checklist mở rộng với UAT-NEW-01, UAT-NEW-02, UAT-NEW-03).
- **Mục 5.9**: Bổ sung phần Đánh giá mức độ sẵn sàng triển khai Bổ sung (*Additional Production Readiness Verification*).

### 4. Bổ sung vào Phần Phụ Lục & Kết Thúc Báo Cáo
- **Phụ lục Ma trận Yêu cầu - Chức năng - API - Database**: Bổ sung các dòng ánh xạ cho FR-16, FR-17, FR-18.
- **Bảng Đối chiếu Source code thực tế**: Nâng tổng số API endpoints đối soát từ 24 lên 34 endpoints.
- **Phần Changelog — Chức năng bổ sung**: Bảng tổng kết thay đổi.
- **Phần Baseline Preservation Check**: Danh sách 12 tiêu chí xác nhận bảo toàn nguyên vẹn 100% baseline cũ.

---

# IV. XÁC NHẬN BẢO TOÀN BASELINE (BASELINE PRESERVATION CHECK)

- `[PASS]` Nội dung báo cáo cũ được giữ nguyên 100% (Toàn bộ 6 chương, phân tích, kiến trúc, bảng biểu).
- `[PASS]` Không xóa chương cũ, không xóa mục cũ.
- `[PASS]` Không thay đổi Phase 1: Asset Health Score (Giữ nguyên 6 trọng số, công thức, phân cấp).
- `[PASS]` Không thay đổi Phase 2: Failure Risk Score (Giữ nguyên 4 nhân tố, hệ số K_Criticality, công thức).
- `[PASS]` Không thay đổi Phase 3: Priority Score & Risk Matrix (Giữ nguyên 4 vùng, 4 quy tắc đề xuất).
- `[PASS]` Không thay đổi Phase 4: What-If Predictive Simulation (Giữ nguyên 2 kịch bản, In-Memory, Deterministic 100%).
- `[PASS]` Không thay đổi công thức toán học và nguyên lý số học.
- `[PASS]` Không thay đổi nghiệp vụ cũ (Vòng đời 5 bước Work Order, luồng QR Code).
- `[PASS]` Không xóa biểu đồ cũ, bổ sung biểu đồ mới (Hình 3.8b, 3.8c, 3.14b, 3.14c, 3.14d).
- `[PASS]` Không xóa bảng cũ, bổ sung bảng mới (Bảng 3.29b, Bảng 5.2, Bảng 5.3, Changelog).
- `[PASS]` Không thay đổi số liệu cũ (136/136 test cũ được bảo toàn, mở rộng thêm 17 test mới thành 153/153 tests).
- `[PASS]` Chỉ bổ sung nội dung mới theo đúng cấu trúc tiêu chuẩn học thuật.
