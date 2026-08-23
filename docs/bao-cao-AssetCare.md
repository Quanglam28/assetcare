# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP / HỆ THỐNG THÔNG TIN
# ASSETCARE — HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ ĐẠI HỌC QUA MÃ QR CODE
**Đơn vị nghiên cứu & áp dụng**: Trường Đại học Công nghệ Giao thông Vận tải (UTT)  
**Chuyên ngành**: Hệ thống Thông tin / Kỹ thuật Phần mềm  
**Năm học**: 2025 – 2026  

---

# MỤC LỤC

- [DANH MỤC TỪ VIẾT TẮT](#danh-mục-từ-viết-tắt)
- [DANH MỤC BẢNG BIỂU](#danh-mục-bảng-biểu)
- [DANH MỤC HÌNH VẼ VÀ BIỂU ĐỒ MERMAID](#danh-mục-hình-vẽ-và-biểu-đồ-mermaid)
- [CHƯƠNG 1. TỔNG QUAN](#chương-1-tổng-quan)
  - [1.1. Lý do chọn đề tài](#11-lý-do-chọn-đề-tài)
  - [1.2. Mục tiêu của đề tài](#12-mục-tiêu-của-đề-tài)
  - [1.3. Giới hạn và phạm vi đề tài](#13-giới-hạn-và-phạm-vi-đề-tài)
  - [1.4. Kết quả đạt được thực tế](#14-kết-quả-đạt-được-thực-tế)
- [CHƯƠNG 2. KIẾN THỨC NỀN TẢNG](#chương-2-kiến-thức-nền-tảng)
  - [2.1. Cơ sở lý thuyết](#21-cơ-sở-lý-thuyết)
    - [2.1.1. Hệ thống thông tin quản lý tài sản (EAM)](#211-hệ-thống-thông-tin-quản-lý-tài-sản-eam)
    - [2.1.2. Quản lý bảo trì và Lệnh công tác (CMMS & Work Orders)](#212-quản-lý-bảo-trì-và-lệnh-công-tác-cmms--work-orders)
    - [2.1.3. Công nghệ QR Code và QR Deep Link](#213-công-nghệ-qr-code-và-qr-deep-link)
    - [2.1.4. Động cơ tính điểm Sức khỏe tài sản (Asset Health Score)](#214-động-cơ-tính-điểm-sức-khỏe-tài-sản-asset-health-score)
    - [2.1.5. Động cơ đánh giá Nguy cơ sự cố (Failure Risk Score)](#215-động-cơ-đánh-giá-nguy-cơ-sự-cố-failure-risk-score)
    - [2.1.6. Bảo trì dự báo và Mô phỏng What-If (Predictive Simulation)](#216-bảo-trì-dự-báo-và-mô-phỏng-what-if-predictive-simulation)
    - [2.1.7. Kiểm soát truy cập dựa trên vai trò (RBAC)](#217-kiểm-soát-truy-cập-dựa-trên-vai-trò-rbac)
    - [2.1.8. An ninh bảo mật Web và API (OWASP Top 10)](#218-an-ninh-bảo-mật-web-và-api-owasp-top-10)
  - [2.2. Công cụ và công nghệ sử dụng thực tế](#22-công-cụ-và-công-nghệ-sử-dụng-thực-tế)
    - [2.2.1. React.js v18.3.1](#221-reactjs-v1831)
    - [2.2.2. Vite v5.4.14](#222-vite-v5414)
    - [2.2.3. Node.js v24 LTS](#223-nodejs-v24-lts)
    - [2.2.4. Express.js v4.21.2](#224-expressjs-v4212)
    - [2.2.5. MySQL / TiDB Cloud Serverless](#225-mysql--tidb-cloud-serverless)
    - [2.2.6. JSON Web Token (JWT HS256)](#226-json-web-token-jwt-hs256)
    - [2.2.7. HttpOnly Cookie & Session Defense](#227-httponly-cookie--session-defense)
    - [2.2.8. RESTful API Architecture](#228-restful-api-architecture)
    - [2.2.9. Progressive Web App (PWA)](#229-progressive-web-app-pwa)
    - [2.2.10. Vercel & Render Cloud Deployment](#2210-vercel--render-cloud-deployment)
    - [2.2.11. Git & GitHub Version Control](#2211-git--github-version-control)
- [CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-3-phân-tích-và-thiết-kế-hệ-thống)
  - [3.1. Khảo sát hệ thống](#31-khảo-sát-hệ-thống)
    - [3.1.1. Tổng quan hệ thống AssetCare](#311-tổng-quan-hệ-thống-assetcare)
    - [3.1.2. Đánh giá hiện trạng so sánh](#312-đánh-giá-hiện-trạng-so-sánh)
    - [3.1.3. Xác định yêu cầu hệ thống (Chức năng & Phi chức năng)](#313-xác-định-yêu-cầu-hệ-thống-chức-năng--phi-chức-năng)
    - [3.1.4. Kế hoạch triển khai](#314-kế-hoạch-triển-khai)
  - [3.2. Phân tích hệ thống](#32-phân-tích-hệ-thống)
    - [3.2.1. Xác định tác nhân (Actors) và Ma trận Phân quyền (RBAC Matrix)](#321-xác-định-tác-nhân-actors-và-ma-trận-phân-quyền-rbac-matrix)
    - [3.2.2. Biểu đồ Use Case tổng quát và chi tiết](#322-biểu-đồ-use-case-tổng-quát-và-chi-tiết)
    - [3.2.3. Đặc tả chi tiết từng Use Case nghiệp vụ](#323-đặc-tả-chi-tiết-từng-use-case-nghiệp-vụ)
    - [3.2.4. Biểu đồ hoạt động (Activity Diagrams)](#324-biểu-đồ-hoạt-động-activity-diagrams)
    - [3.2.5. Biểu đồ trình tự (Sequence Diagrams)](#325-biểu-đồ-trình-tự-sequence-diagrams)
    - [3.2.6. Biểu đồ lớp (Class Diagram)](#326-biểu-đồ-lớp-class-diagram)
    - [3.2.7. Phân tích chuyên sâu chu trình Báo hỏng và Vòng đời Lệnh công tác](#327-phân-tích-chuyên-sâu-chu-trình-báo-hỏng-và-vòng-đời-lệnh-công-tác)
    - [3.2.8. Phân tích chuyên sâu 4 Động cơ Toán học hỗ trợ ra quyết định (Phases 1–4)](#328-phân-tích-chuyên-sâu-4-động-cơ-toán-học-hỗ-trợ-ra-quyết-định-phases-14)
    - [3.2.9. Phân tích kiến trúc an ninh bảo mật (24 tiêu chí OWASP)](#329-phân-tích-kiến-trúc-an-ninh-bảo-mật-24-tiêu-chí-owasp)
    - [3.2.10. Chức năng mới: Trung tâm Thông báo Thông minh & Cảnh báo Tự động (Notification Center)](#3210-chức-năng-mới-trung-tâm-thông-báo-thông-minh--cảnh-báo-tự-động-notification-center)
    - [3.2.11. Chức năng mới: Lịch Sử Hoạt Động & Vòng Đời Thiết Bị Tích Hợp (Device Activity Timeline Aggregator)](#3211-chức-năng-mới-lịch-sử-hoạt-động--vòng-đời-thiết-bị-tích-hợp-device-activity-timeline-aggregator)
    - [3.2.12. Chức năng mới: Bảng Điều Khiển & Phân Hệ Báo Cáo Chuyên Sâu (Advanced Dashboard & Reporting)](#3212-chức-năng-mới-bảng-điều-khiển--phân-hệ-báo-cáo-chuyên-sâu-advanced-dashboard--reporting)
  - [3.3. Thiết kế hệ thống](#33-thiết-kế-hệ-thống)
    - [3.3.1. Thiết kế kiến trúc tổng thể (System Architecture)](#331-thiết-kế-kiến-trúc-tổng-thể-system-architecture)
    - [3.3.2. Thiết kế Frontend SPA & Components](#332-thiết-kế-frontend-spa--components)
    - [3.3.3. Thiết kế Backend 3-Tier Layered Architecture](#333-thiết-kế-backend-3-tier-layered-architecture)
    - [3.3.4. Danh mục và thiết kế chi tiết RESTful API Endpoints](#334-danh-mục-và-thiết-kế-chi-tiết-restful-api-endpoints)
    - [3.3.5. Thiết kế Cơ sở dữ liệu: Sơ đồ ERD & Đặc tả 15 Bảng TiDB Cloud](#335-thiết-kế-cơ-sở-dữ-liệu-sơ-đồ-erd--đặc-tả-15-bảng-tidb-cloud)
    - [3.3.6. Thiết kế luồng QR Code & Deep Link](#336-thiết-kế-luồng-qr-code--deep-link)
    - [3.3.7. Thiết kế triển khai hạ tầng đám mây (Production Infrastructure)](#337-thiết-kế-triển-khai-hạ-tầng-đám-mây-production-infrastructure)
- [CHƯƠNG 4. XÂY DỰNG VÀ TRIỂN KHAI CHƯƠNG TRÌNH](#chương-4-xây-dựng-và-triển-khai-chương-trình)
  - [4.1. Môi trường phát triển và cấu hình](#41-môi-trường-phát-triển-và-cấu-hình)
  - [4.2. Xây dựng 15 Phân hệ Giao diện Modern Enterprise Responsive](#42-xây-dựng-15-phân-hệ-giao-diện-modern-enterprise-responsive)
  - [4.3. Xây dựng Phân hệ Xác thực & Quản lý người dùng](#43-xây-dựng-phân-hệ-xác-thực--quản-lý-người-dùng)
  - [4.4. Xây dựng Phân hệ Quản lý Hồ sơ Tài sản & Mã QR Code](#44-xây-dựng-phân-hệ-quản-lý-hồ-sơ-tài-sản--mã-qr-code)
  - [4.5. Xây dựng Phân hệ Báo hỏng và Điều phối Lệnh công tác](#45-xây-dựng-phân-hệ-báo-hỏng-và-điều-phối-lệnh-công-tác)
  - [4.6. Xây dựng Bàn làm việc Kỹ thuật viên (Technician Workspace)](#46-xây-dựng-bàn-làm-việc-kỹ-thuật-viên-technician-workspace)
  - [4.7. Cài đặt chi tiết 4 Động cơ Toán học (Phases 1–4 Engines)](#47-cài-đặt-chi-tiết-4-động-cơ-toán-học-phases-14-engines)
  - [4.8. Cài đặt Trung tâm Thông báo, Lịch sử Hoạt động và Phân hệ Báo cáo Chuyên sâu](#48-cài-đặt-trung-tâm-thông-báo-lịch-sử-hoạt-động-và-phân-hệ-báo-cáo-chuyên-sâu)
  - [4.9. Cấu hình Progressive Web App (PWA)](#49-cấu-hình-progressive-web-app-pwa)
- [CHƯƠNG 5. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG](#chương-5-kiểm-thử-và-đánh-giá-hệ-thống)
  - [5.1. Mục tiêu và phương pháp kiểm thử](#51-mục-tiêu-và-phương-pháp-kiểm-thử)
  - [5.2. Bảng tổng hợp kết quả 8 Bộ kiểm thử tự động (153/153 PASS)](#52-bảng-tổng-hợp-kết-quả-8-bộ-kiểm-thử-tự-động-153153-pass)
  - [5.3. Kiểm thử an ninh bảo mật & OWASP (36/36 PASS)](#53-kiểm-thử-an-ninh-bảo-mật--owasp-3636-pass)
  - [5.4. Kiểm thử luồng QR và Xác thực phiên (7/7 PASS)](#54-kiểm-thử-luồng-qr-và-xác-thực-phiên-77-pass)
  - [5.5. Kiểm thử 4 Động cơ Toán học Phases 1–4 (78/78 PASS)](#55-kiểm-thử-4-động-cơ-toán-học-phases-14-7878-pass)
  - [5.6. Kiểm thử Đồng bộ Vòng đời Đa vai trò (15/15 PASS)](#56-kiểm-thử-đồng-bộ-vòng-đời-đa-vai-trò-1515-pass)
  - [5.7. Kiểm thử 3 Nhóm Chức Năng Nâng Cấp Mới (17/17 PASS)](#57-kiểm-thử-3-nhóm-chức-năng-nâng-cấp-mới-1717-pass)
  - [5.8. Kiểm thử Nghiệm thu Người dùng (User Acceptance Testing - UAT)](#58-kiểm-thử-nghiệm-thu-người-dùng-user-acceptance-testing---uat)
  - [5.9. Kiểm thử Đóng gói Production Build & Đánh giá Sẵn sàng Triển khai](#59-kiểm-thử-đóng-gói-production-build--đánh-giá-sẵn-sàng-triển-khai)
- [CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-6-kết-luận-và-hướng-phát-triển)
  - [6.1. Kết quả đạt được của đồ án](#61-kết-quả-đạt-được-của-đồ-án)
  - [6.2. Ưu điểm vượt trội của hệ thống](#62-ưu-điểm-vượt-trội-của-hệ-thống)
  - [6.3. Những hạn chế còn tồn tại](#63-những-hạn-chế-còn-tồn-tại)
  - [6.4. Hướng phát triển trong tương lai](#64-hướng-phát-triển-trong-tương-lai)
- [PHỤ LỤC: MA TRẬN YÊU CẦU - CHỨC NĂNG - API - DATABASE](#phụ-lục-ma-trận-yêu-cầu---chức-năng---api---database)
- [ĐỐI CHIẾU BÁO CÁO VỚI SOURCE CODE THỰC TẾ](#đối-chiếu-báo-cáo-với-source-code-thực-tế)
- [CHANGELOG — CHỨC NĂNG BỔ SUNG](#changelog--chức-năng-bổ-sung)
- [BASELINE PRESERVATION CHECK](#baseline-preservation-check)

---

# DANH MỤC TỪ VIẾT TẮT

| Viết Tắt | Thuật Ngữ Tiếng Anh | Giải Thích Nghĩa Tiếng Việt |
|---|---|---|
| **UTT** | University of Transport Technology | Trường Đại học Công nghệ Giao thông Vận tải |
| **RBAC** | Role-Based Access Control | Kiểm soát truy cập dựa trên vai trò |
| **IDOR / BOLA** | Insecure Direct Object References / Broken Object Level Authorization | Lỗ hổng tham chiếu đối tượng trực tiếp không an toàn |
| **JWT** | JSON Web Token | Mã thông báo web JSON phục vụ xác thực phi trạng thái |
| **SLA** | Service Level Agreement | Cam kết thỏa thuận chất lượng và thời gian xử lý dịch vụ |
| **PM** | Preventive Maintenance | Bảo trì phòng ngừa định kỳ ngăn ngừa sự cố |
| **PWA** | Progressive Web App | Ứng dụng web lũy tiến có khả năng cài đặt như ứng dụng gốc |
| **SPA** | Single Page Application | Ứng dụng web trang đơn không nạp lại trang |
| **CRUD** | Create, Read, Update, Delete | Bốn thao tác dữ liệu cơ bản: Tạo, Đọc, Sửa, Xóa |
| **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| **XSS** | Cross-Site Scripting | Lỗ hổng chèn mã kịch bản độc hại phía máy khách |
| **CSRF** | Cross-Site Request Forgery | Tấn công giả mạo yêu cầu từ phía người dùng tin cậy |
| **CORS** | Cross-Origin Resource Sharing | Cơ chế chia sẻ tài nguyên giữa các nguồn gốc khác nhau |
| **EAM** | Enterprise Asset Management | Hệ thống quản lý tài sản doanh nghiệp/tổ chức |
| **CMMS** | Computerized Maintenance Management System | Hệ thống thông tin quản lý bảo trì trên máy tính |

---

# DANH MỤC BẢNG BIỂU

- **Bảng 3.1**: Bảng khảo sát hiện trạng và so sánh phương thức quản lý tài sản UTT
- **Bảng 3.2**: Bảng yêu cầu chức năng hệ thống (Functional Requirements: FR-01 $\to$ FR-18)
- **Bảng 3.3**: Bảng yêu cầu phi chức năng hệ thống (Non-Functional Requirements)
- **Bảng 3.4**: Bảng xác định tác nhân (Actors) và phạm vi quyền hạn dữ liệu
- **Bảng 3.5**: Ma trận phân quyền Actor – Chức năng hệ thống (RBAC Matrix)
- **Bảng 3.6**: Bảng đặc tả Use Case Đăng nhập & Xác thực hệ thống (UC-01)
- **Bảng 3.7**: Bảng đặc tả Use Case Quét QR và Báo hỏng thiết bị (UC-03)
- **Bảng 3.8**: Bảng đặc tả Use Case Tiếp nhận và Phân công Kỹ thuật viên (UC-08)
- **Bảng 3.9**: Bảng đặc tả Use Case Kỹ thuật viên xử lý Lệnh công tác (UC-06)
- **Bảng 3.10**: Bảng đặc tả Use Case Người dùng Nghiệm thu và Đóng phiếu (UC-04)
- **Bảng 3.11**: Bảng đặc tả Use Case Giám sát Ma trận Rủi ro & Điểm ưu tiên (UC-10)
- **Bảng 3.12**: Bảng đặc tả Use Case Mô phỏng dự báo What-If (UC-14)
- **Bảng 3.13**: Cấu trúc bảng CSDL `roles` (Vai trò người dùng)
- **Bảng 3.14**: Cấu trúc bảng CSDL `departments` (Khoa / Phòng ban)
- **Bảng 3.15**: Cấu trúc bảng CSDL `buildings` (Tòa nhà khuôn viên UTT)
- **Bảng 3.16**: Cấu trúc bảng CSDL `locations` (Phòng học / Phòng Lab)
- **Bảng 3.17**: Cấu trúc bảng CSDL `device_types` (Loại trang thiết bị)
- **Bảng 3.18**: Cấu trúc bảng CSDL `suppliers` (Nhà cung ứng thiết bị)
- **Bảng 3.19**: Cấu trúc bảng CSDL `users` (Tài khoản người dùng)
- **Bảng 3.20**: Cấu trúc bảng CSDL `devices` (Hồ sơ trang thiết bị tài sản)
- **Bảng 3.21**: Cấu trúc bảng CSDL `maintenance_requests` (Phiếu yêu cầu báo hỏng)
- **Bảng 3.22**: Cấu trúc bảng CSDL `maintenance_histories` (Nhật ký chuyển đổi trạng thái)
- **Bảng 3.23**: Cấu trúc bảng CSDL `maintenance_parts` (Linh kiện thay thế sửa chữa)
- **Bảng 3.24**: Cấu trúc bảng CSDL `maintenance_work_orders` (Lệnh công tác bảo trì)
- **Bảng 3.25**: Cấu trúc bảng CSDL `maintenance_schedules` (Lịch bảo dưỡng định kỳ PM)
- **Bảng 3.26**: Cấu trúc bảng CSDL `attachments` (Tệp tin và ảnh hiện trường `LONGTEXT`)
- **Bảng 3.27**: Cấu trúc bảng CSDL `notifications` (Thông báo điều phối hệ thống)
- **Bảng 3.28**: Cấu trúc bảng CSDL `audit_logs` (Nhật ký kiểm toán an ninh)
- **Bảng 3.29**: Bảng danh mục 24 RESTful API Endpoints cốt lõi
- **Bảng 3.29b**: Bảng danh mục 10 RESTful API Endpoints Mới Nâng Cấp (Notification, Timeline, Reports)
- **Bảng 4.1**: Trọng số và quy tắc tính điểm Sức khỏe tài sản (Phase 1 Health Engine)
- **Bảng 4.2**: Bảng thông số và hệ số rủi ro sự cố (Phase 2 Failure Risk Engine)
- **Bảng 4.3**: Ma trận rủi ro 4 góc phần tư và định hướng hành động (Phase 3 Priority Engine)
- **Bảng 4.4**: Bảng quy tắc suy giảm và phục hồi mô phỏng What-If (Phase 4 Simulation Engine)
- **Bảng 5.1**: Bảng tổng hợp kết quả 8 Bộ kiểm thử tự động toàn diện (153/153 PASS 100%)
- **Bảng 5.2**: Bảng chi tiết 17 ca kiểm thử Module 8 (Upgraded Features Suite)
- **Bảng 5.3**: Bảng kịch bản kiểm thử nghiệm thu người dùng (UAT Checklist mở rộng)

---

# DANH MỤC HÌNH VẼ VÀ BIỂU ĐỒ MERMAID

- **Hình 3.1**: Biểu đồ Use Case Tổng thể hệ thống AssetCare UTT
- **Hình 3.2**: Biểu đồ Use Case Phân hệ Quản lý Hồ sơ Tài sản & Thiết bị
- **Hình 3.3**: Biểu đồ Use Case Phân hệ Báo hỏng & Tiếp nhận Sự cố
- **Hình 3.4**: Biểu đồ Use Case Phân hệ Lệnh công tác dành cho Kỹ thuật viên
- **Hình 3.5**: Biểu đồ Hoạt động (Activity Diagram) – Quy trình Đăng nhập & Xác thực phiên
- **Hình 3.6**: Biểu đồ Hoạt động (Activity Diagram) – Quy trình Quét QR & Báo hỏng thiết bị
- **Hình 3.7**: Biểu đồ Hoạt động (Activity Diagram) – Vòng đời Lệnh công tác Bảo trì
- **Hình 3.8**: Biểu đồ Hoạt động (Activity Diagram) – Luồng Mô phỏng Dự báo What-If
- **Hình 3.8b**: Biểu đồ Hoạt động (Activity Diagram) – Luồng Quản trị & Điều phối Thông báo Thông minh
- **Hình 3.8c**: Biểu đồ Hoạt động (Activity Diagram) – Luồng Xem trước & Xuất Báo cáo Excel/CSV Chuyên Sâu
- **Hình 3.9**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Đăng nhập & Khôi phục phiên
- **Hình 3.10**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Quét QR & Tra cứu thiết bị
- **Hình 3.11**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Báo hỏng & Phân công Kỹ thuật viên
- **Hình 3.12**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Xử lý & Nghiệm thu phiếu bảo trì
- **Hình 3.13**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Tính toán Điểm Sức khỏe & Rủi ro
- **Hình 3.14**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Chạy Mô phỏng Dự báo What-If
- **Hình 3.14b**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Phát & Nhận Thông báo Tự động Toàn Hệ Thống
- **Hình 3.14c**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Tổng hợp Dữ liệu Lịch sử Hoạt động (Timeline Aggregator)
- **Hình 3.14d**: Biểu đồ Trình tự (Sequence Diagram) – Luồng Xử lý Xuất Báo cáo Excel/CSV Stream
- **Hình 3.15**: Biểu đồ Lớp (Class Diagram) – Cấu trúc 3 lớp Controller $\to$ Service $\to$ Repository
- **Hình 3.16**: Biểu đồ Thực thể Liên kết (ERD) – Cơ sở dữ liệu TiDB Cloud
- **Hình 3.17**: Sơ đồ Kiến trúc Tổng thể Hệ thống (System Architecture)
- **Hình 3.18**: Sơ đồ Kiến trúc An ninh Bảo mật Đa tầng (Security Architecture)
- **Hình 3.19**: Lưu đồ Thuật toán Động cơ Phase 1 (Asset Health Score Engine)
- **Hình 3.20**: Lưu đồ Thuật toán Động cơ Phase 2 (Failure Risk Score Engine)
- **Hình 3.21**: Lưu đồ Thuật toán Động cơ Phase 3 (Priority & Risk Matrix Engine)
- **Hình 3.22**: Lưu đồ Thuật toán Động cơ Phase 4 (What-If Predictive Simulation Engine)

---

# CHƯƠNG 1. TỔNG QUAN

## 1.1. Lý do chọn đề tài
Trường Đại học Công nghệ Giao thông Vận tải (UTT) là cơ sở giáo dục đại học công lập trọng điểm, giữ vai trò quan trọng trong đào tạo nguồn nhân lực chất lượng cao thuộc các lĩnh vực công nghệ, kỹ thuật giao thông, kinh tế và công nghệ thông tin. Nhằm phục vụ công tác giảng dạy, nghiên cứu khoa học và thực hành chuyên sâu, Nhà trường đã đầu tư hệ thống cơ sở vật chất kỹ thuật hiện đại, phân bố rộng khắp tại các khu nhà chức năng:
- **Tòa H1**: Khu Giảng đường trung tâm, Phòng học thông minh và Hội trường lớn.
- **Tòa H2**: Khu Giảng đường Thực hành, Phòng Lab Trí tuệ Nhân tạo & Mạng máy tính.
- **Tòa H3**: Trung tâm Thông tin Thư viện số & Khu Nhà Điều hành Nhà trường.

Khối lượng trang thiết bị kỹ thuật bao gồm hàng nghìn máy móc có giá trị kinh tế và tính năng kỹ thuật cao: máy vi tính All-in-One, máy chiếu laser độ sáng cao, màn hình tương tác thông minh 86 inch, bộ phát Wifi doanh nghiệp chuẩn Wifi 6, hệ thống điều hòa không khí âm trần Inverter, bộ lưu điện UPS chuyên dụng cho trung tâm dữ liệu.

Tuy nhiên, thực tế công tác quản lý tài sản và bảo dưỡng kỹ thuật tại trường đang bộc lộ nhiều hạn chế lớn:
1. **Quản lý phân tán, thủ công**: Thông tin lý lịch máy móc, hồ sơ bảo hành và nhật ký sửa chữa lưu trữ phân tán trên sổ sách cơ học hoặc các file Excel riêng lẻ giữa các Khoa, gây khó khăn cho việc tra cứu tức thời.
2. **Tiếp nhận sự cố chậm trễ**: Khi thiết bị tại giảng đường gặp sự cố, giảng viên và sinh viên thường phải liên hệ thủ công qua bảo vệ hoặc quản lý tòa nhà. Quy trình báo hỏng qua nhiều cấp làm kéo dài thời gian dừng máy (*Downtime*), ảnh hưởng trực tiếp đến tiết học.
3. **Thiếu cơ chế điều phối và giám sát SLA**: Ban Quản lý thiếu công cụ trực quan để theo dõi tải công việc của từng kỹ thuật viên, không kiểm soát được tiến độ xử lý và chi phí linh kiện thay thế tại hiện trường.
4. **Bảo trì theo cơ chế thụ động (Run-to-Failure)**: Chỉ sửa chữa khi thiết bị đã hỏng hoàn toàn; thiếu cơ chế định lượng sức khỏe hao mòn tài sản, không dự báo được nguy cơ sự cố tiềm ẩn để chủ động bảo dưỡng ngăn ngừa (*Preventive Maintenance*).

Từ những yêu cầu cấp thiết trên, đề tài **"AssetCare – Hệ thống Thông tin Quản lý Tài sản và Bảo trì Thiết bị Đại học UTT"** được nghiên cứu và phát triển nhằm số hóa toàn diện quy trình quản trị tài sản, ứng dụng mã phản hồi nhanh (**QR Code**) và tích hợp **Bộ 4 Động cơ Toán học hỗ trợ ra quyết định** (Health Score, Failure Risk, Priority Matrix, Predictive Simulation).

## 1.2. Mục tiêu của đề tài
- **Mục tiêu tổng quát**: Xây dựng hệ thống thông tin hoàn chỉnh trên nền tảng Web hiện đại, quản lý tập trung vòng đời tài sản kỹ thuật và tự động hóa quy trình điều phối bảo trì thiết bị trong khuôn viên Đại học UTT.
- **Mục tiêu cụ thể**:
  1. *Quản lý hồ sơ tài sản toàn diện*: Số hóa hồ sơ kỹ thuật, xuất xứ, nhà cung cấp, nguyên giá, hạn bảo hành, vị trí phòng/tòa nhà và mã QR định danh duy nhất cho từng tài sản.
  2. *Tự động hóa tiếp nhận sự cố qua QR Code*: Cho phép quét mã QR dán trên thân máy bằng camera điện thoại để tra cứu thông số và gửi phiếu báo hỏng trong vòng dưới 30 giây.
  3. *Số hóa quy trình Lệnh công tác (Work Orders)*: Thiết lập quy trình 5 bước minh bạch: Tiếp nhận (`PENDING`) $\to$ Phân công (`ASSIGNED`) $\to$ Đang xử lý (`IN_PROGRESS`) $\to$ Chờ linh kiện (`WAITING_PART`) / Hoàn thành (`COMPLETED`) $\to$ Người dùng nghiệm thu và Đóng phiếu (`CLOSED`).
  4. *Bộ 4 Động cơ Toán học hỗ trợ ra quyết định*:
     - **Phase 1 (Asset Health Score)**: Tính điểm sức khỏe tài sản $[0 - 100]$ dựa trên 6 nhân tố hao mòn định lượng.
     - **Phase 2 (Failure Risk Score)**: Tính điểm nguy cơ xảy ra sự cố $[0 - 100]$ dựa trên tần suất lỗi gần đây, quá hạn bảo dưỡng và xu hướng hư hại.
     - **Phase 3 (Priority & Risk Matrix)**: Tính toán điểm ưu tiên xử lý, phân bổ tài sản vào Ma trận rủi ro 4 vùng và tự động đề xuất lệnh công tác kỹ thuật.
     - **Phase 4 (Predictive Simulation)**: Mô phỏng dự báo What-If theo các mốc 7, 14, 30, 60, 90 ngày (In-Memory, Deterministic 100%, không ô nhiễm CSDL).
  5. *Nâng cấp 3 Phân hệ Chuyên sâu Hiện đại*:
     - **Notification Center**: Trung tâm thông báo thời gian thực, tự động bắn cảnh báo đa cấp độ cho Quản lý khi có sự cố và quét rủi ro toàn hệ thống.
     - **Device Activity Timeline**: Lịch sử hoạt động tổng hợp thời gian thực từ 5 bảng dữ liệu, phân loại sự cố, bảo trì, lệnh công tác, kiểm toán và vòng đời máy.
     - **Advanced Dashboard & Reporting**: 9 KPI + 6 biểu đồ phân tích rủi ro/suy giảm và 7 mẫu báo cáo kiểm kê/chi phí xuất Excel (.xlsx) & CSV UTF-8.
  6. *Bảo mật chuẩn Enterprise*: Triển khai bảo mật theo tiêu chuẩn OWASP (HttpOnly Cookie, JWT HS256, CORS Whitelist, Helmet, Rate Limiting, phòng chống IDOR/BOLA).

## 1.3. Giới hạn và phạm vi đề tài
- **Đối tượng sử dụng**: 4 nhóm vai trò được phân quyền rõ ràng trong Đại học UTT: Quản trị viên (`ADMIN`), Cán bộ Quản lý đơn vị (`MANAGER`), Kỹ thuật viên bảo trì (`TECHNICIAN`), Người sử dụng/Giảng viên/Sinh viên (`USER`).
- **Phạm vi không gian**: Triển khai quản lý các thiết bị thực tế tại Tòa nhà H1, H2, H3 thuộc khuôn viên Cơ sở Triều Khúc - UTT.
- **Phạm vi dữ liệu**: Quản lý thông tin tài sản, sự cố, lịch bảo trì định kỳ, linh kiện thay thế, chi phí sửa chữa và lịch sử nghiệm thu.
- **Giới hạn kỹ thuật**: Hệ thống tập trung giải quyết bài toán quản lý vận hành và bảo trì kỹ thuật; không bao gồm các nghiệp vụ hạch toán kế toán tài sản cố định chuyên sâu của cơ quan quản lý tài chính nhà nước.

## 1.4. Kết quả đạt được thực tế
- Hệ thống ứng dụng Web hoàn chỉnh hoạt động trên máy tính và thiết bị di động (Responsive & PWA).
- Cơ sở dữ liệu phân tán TiDB Cloud lưu trữ đầy đủ dữ liệu thực tế của 50 thiết bị, 59 người dùng, các phiếu sự cố, lệnh công tác và thông báo điều phối.
- Đạt 100% tỷ lệ vượt qua trên toàn bộ **153 ca kiểm thử tự động thuộc 8 bộ test** (Security, QR, Phase 1-4, Multi-Role Lifecycle, Notification, Timeline, Reporting).

---

# CHƯƠNG 2. KIẾN THỨC NỀN TẢNG

## 2.1. Cơ sở lý thuyết

### 2.1.1. Hệ thống thông tin quản lý tài sản (EAM)
Hệ thống thông tin quản lý tài sản (Enterprise Asset Management - EAM) là sự kết hợp giữa phần mềm, quy trình và dữ liệu nhằm theo dõi, đánh giá và tối ưu hóa hiệu suất sử dụng tài sản vật chất trong suốt vòng đời: từ mua sắm, lắp đặt, vận hành, bảo dưỡng định kỳ cho đến thanh lý.

### 2.1.2. Quản lý bảo trì và Lệnh công tác (CMMS & Work Orders)
Quản lý bảo trì là tập hợp các hoạt động kỹ thuật nhằm duy trì hoặc phục hồi thiết bị về trạng thái hoạt động tiêu chuẩn. Hệ thống kết hợp hai phương thức: Bảo trì sửa chữa (Corrective Maintenance) khi có sự cố phát sinh và Bảo trì phòng ngừa định kỳ (Preventive Maintenance - PM) theo thời gian định trước. Lệnh công tác (Work Order) là chứng từ kỹ thuật số hóa ghi nhận nhiệm vụ, nhân sự phụ trách, vật tư linh kiện và thời hạn hoàn thành.

### 2.1.3. Công nghệ QR Code và QR Deep Link
Mã QR (Quick Response Code) là ma trận mã vạch hai chiều cho phép lưu trữ chuỗi ký tự định danh với tốc độ đọc cực nhanh và khả năng phục hồi lỗi cao. Kỹ thuật QR Deep Link cho phép mã hóa đường dẫn URL trực tiếp (`/device/:token`), giúp người dùng quét mã bằng camera điện thoại để mở thẳng trang thông tin thiết bị tương ứng.

### 2.1.4. Động cơ tính điểm Sức khỏe tài sản (Asset Health Score)
Chỉ số Sức khỏe Tài sản là đại lượng định lượng biểu diễn mức độ hao mòn cơ học, suy giảm hiệu năng và độ tin cậy của thiết bị tại thời điểm hiện tại trên thang điểm chuẩn hóa từ $0$ đến $100$.

### 2.1.5. Động cơ đánh giá Nguy cơ sự cố (Failure Risk Score)
Chỉ số Nguy cơ Sự cố là đại lượng xác suất đánh giá khả năng thiết bị phát sinh lỗi kỹ thuật hoặc ngừng hoạt động trong chu kỳ vận hành 30 ngày tiếp theo, dựa trên các yếu tố biến động ngắn hạn.

### 2.1.6. Bảo trì dự báo và Mô phỏng What-If (Predictive Simulation)
Bảo trì dự báo (Predictive Maintenance) ứng dụng các mô hình suy diễn để dự đoán thời điểm hỏng hóc trước khi sự cố thực sự xảy ra. Kỹ thuật Mô phỏng What-If cho phép tính toán các kịch bản ra quyết định (trì hoãn bảo dưỡng so với can thiệp ngay) trong môi trường bộ nhớ ảo (In-Memory).

### 2.1.7. Kiểm soát truy cập dựa trên vai trò (RBAC)
Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control) gán quyền hạn truy cập tài nguyên cho các vai trò (Role), sau đó gán vai trò tương ứng cho từng người dùng, đảm bảo nguyên tắc đặc quyền tối thiểu (Least Privilege).

### 2.1.8. An ninh bảo mật Web và API (OWASP Top 10)
Bao gồm các tiêu chuẩn phòng thủ chống lại các lỗ hổng bảo mật hàng đầu: bảo vệ phiên bằng HttpOnly Cookie chống XSS, kiểm tra quyền sở hữu bản ghi chống IDOR/BOLA, mã hóa mật khẩu bằng hàm băm một chiều `bcrypt`, chống tấn công Cross-Site Request Forgery (CSRF) và giới hạn tần suất gọi API (Rate Limiting).

## 2.2. Công cụ và công nghệ sử dụng thực tế

### 2.2.1. React.js v18.3.1
Thư viện JavaScript mã nguồn mở xây dựng giao diện người dùng dựa trên cơ chế Virtual DOM, khai thác triệt để Functional Components và React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`).

### 2.2.2. Vite v5.4.14
Công cụ build frontend hiện đại với kiến trúc Native ES Modules, cung cấp tốc độ HMR tức thì và phân mảnh mã nguồn tối ưu cho môi trường Production.

### 2.2.3. Node.js v24 LTS
Môi trường thực thi JavaScript phía máy chủ xây dựng trên V8 engine của Google Chrome, vận hành theo mô hình hướng sự kiện bất đồng bộ Non-blocking I/O.

### 2.2.4. Express.js v4.21.2
Web framework tối giản và linh hoạt cho Node.js, cung cấp hệ thống định tuyến mạnh mẽ và chuỗi xử lý Middleware theo tầng.

### 2.2.5. MySQL / TiDB Cloud Serverless
Hệ quản trị cơ sở dữ liệu phân tán đám mây tương thích hoàn toàn với giao thức MySQL 8.0, hỗ trợ giao dịch ACID, phân vùng dữ liệu và mã hóa kết nối TLSv1.2.

### 2.2.6. JSON Web Token (JWT HS256)
Chuẩn mở RFC 7519 định nghĩa cấu trúc truyền thông tin an toàn qua chuỗi token ký bằng thuật toán đối xứng HMAC-SHA256 (`HS256`).

### 2.2.7. HttpOnly Cookie & Session Defense
Cơ chế lưu trữ token xác thực trong Cookie với cờ `HttpOnly`, `SameSite=Lax`, ngăn chặn mã JavaScript trên trình duyệt truy cập trái phép, bảo vệ hệ thống trước tấn công XSS.

### 2.2.8. RESTful API Architecture
Kiến trúc dịch vụ web phi trạng thái trao đổi dữ liệu chuẩn JSON qua các phương thức HTTP tiêu chuẩn (`GET`, `POST`, `PATCH`, `DELETE`).

### 2.2.9. Progressive Web App (PWA)
Công nghệ kết hợp tính năng của Web và ứng dụng di động gốc, sử dụng Service Worker (`sw.js`) để precache tài nguyên tĩnh và Web Manifest để ghim ứng dụng ra màn hình chính.

### 2.2.10. Vercel & Render Cloud Deployment
Hạ tầng đám mây phân tán: Frontend SPA triển khai trên Vercel Edge CDN; Backend API chạy trên Render Web Service.

### 2.2.11. Git & GitHub Version Control
Hệ thống quản lý phiên bản phân tán theo dõi toàn bộ lịch sử thay đổi mã nguồn và quản lý các nhánh phát triển (`main`, `ui/assetcare-modern-ui`).

---

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Khảo sát hệ thống

### 3.1.1. Tổng quan hệ thống AssetCare
AssetCare là hệ thống thông tin phục vụ công tác quản lý tài sản và điều phối bảo trì thiết bị giảng dạy, nghiên cứu tại Đại học UTT. Hệ thống kết nối toàn diện 4 nhóm tác nhân (User, Manager, Technician, Admin) trên cùng một nền tảng dữ liệu thời gian thực.

### 3.1.2. Đánh giá hiện trạng so sánh
**Bảng 3.1: Bảng khảo sát hiện trạng và so sánh phương thức quản lý tài sản UTT**
| Tiêu Chí Đánh Giá | Phương Thức Thủ Công Cũ | Hệ Thống Thông Tin AssetCare |
|---|---|---|
| **Định danh thiết bị** | Dán nhãn giấy in mã số, dễ rách mờ | Mã QR Vector SVG bền vững, quét tức thì bằng Camera |
| **Tiếp nhận sự cố** | Giảng viên gọi điện, ghi sổ trực bảo vệ | Quét QR $\to$ Báo hỏng trực tuyến trong 30 giây kèm ảnh hiện trường |
| **Phân công kỹ thuật** | Trưởng phòng phân công thủ công qua Zalo/gọi điện | Dashboard phân công trực quan, theo dõi tiến độ và kiểm soát hạn chót SLA |
| **Đánh giá tình trạng máy** | Cảm tính, định kỳ kiểm kê cuối năm | Động cơ Phase 1 & 2 chấm điểm Sức khỏe và Rủi ro tự động |
| **Kế hoạch bảo trì** | Sửa chữa thụ động khi máy hỏng (Run-to-Failure) | Dự báo What-If 4 mốc ngày, chủ động xếp lịch bảo dưỡng phòng ngừa |
| **Thông báo & Điều phối** | Gọi điện thoại hoặc gửi tin nhắn rời rạc | Notification Center thời gian thực, tự động bắn thông báo cho Quản lý |
| **Lịch sử vòng đời máy** | Sổ ghi chép rời rạc, dễ thất lạc | Timeline tổng hợp thời gian thực 5 nguồn dữ liệu (Sự cố, Bảo trì, Work Order, Audit) |
| **Báo cáo & Xuất dữ liệu** | Gõ bảng Excel thủ công | 7 Báo cáo chuẩn hóa, xem trước trực quan và xuất Excel .xlsx / CSV UTF-8 |

### 3.1.3. Xác định yêu cầu hệ thống (Chức năng & Phi chức năng)

**Bảng 3.2: Bảng yêu cầu chức năng hệ thống (Functional Requirements)**
| Mã YC | Tên Phân Hệ | Mô Tả Yêu Cầu Nghiệp Vụ Thực Tế | Actor Phép Dùng |
|---|---|---|---|
| **FR-01** | Xác thực & Phiên | Đăng ký tài khoản, Đăng nhập đa vai trò, Đăng xuất, Khôi phục phiên qua Cookie | Tất cả Actors |
| **FR-02** | Quản lý Người dùng | Tạo, sửa thông tin, khóa tài khoản, phân quyền Role hệ thống | ADMIN |
| **FR-03** | Quản lý Danh mục | Quản lý Tòa nhà, Phòng học, Loại thiết bị, Nhà cung cấp | ADMIN, MANAGER |
| **FR-04** | Hồ sơ Thiết bị | Xem danh sách, tìm kiếm, lọc đa chiều, thêm/sửa hồ sơ tài sản | ADMIN, MANAGER, TECH |
| **FR-05** | Tra cứu QR Code | Quét mã QR camera, tra cứu nhanh hồ sơ thiết bị qua QR Token | Tất cả (Công khai) |
| **FR-06** | Báo Cáo Sự Cố | Gửi phiếu báo hỏng kèm mô tả, mức độ ưu tiên, phân loại lỗi và ảnh chụp | USER, MANAGER, ADMIN |
| **FR-07** | Phân Công KTV | Tiếp nhận phiếu PENDING, chỉ định Kỹ thuật viên xử lý, gắn SLA hạn chót | ADMIN, MANAGER |
| **FR-08** | Xử Lý Lệnh Công Tác | KTV bắt đầu làm việc, báo tạm dừng chờ linh kiện, báo hoàn thành sửa chữa | TECHNICIAN |
| **FR-09** | Nghiệm Thu Đóng Phiếu| Người báo kiểm tra hiện trường, xác nhận Đạt/Chưa đạt, chấm điểm dịch vụ | USER (Người báo) |
| **FR-10** | Lịch Bảo Trì (PM) | Tạo lịch bảo dưỡng định kỳ, phân công kiểm tra máy móc theo chu kỳ | ADMIN, MANAGER, TECH |
| **FR-11** | Phase 1: Health Score | Tính toán định lượng điểm sức khỏe tài sản theo 6 nhân tố hao mòn | ADMIN, MANAGER, TECH |
| **FR-12** | Phase 2: Failure Risk | Đánh giá nguy cơ sự cố trong chu kỳ 30 ngày theo 4 nhân tố rủi ro | ADMIN, MANAGER, TECH |
| **FR-13** | Phase 3: Risk Matrix | Trực quan hóa ma trận rủi ro 4 góc phần tư và đề xuất hành động kỹ thuật | ADMIN, MANAGER, TECH |
| **FR-14** | Phase 4: Simulation | Chạy mô phỏng What-If dự báo suy giảm sức khỏe In-Memory qua 5 mốc ngày | ADMIN, MANAGER, TECH |
| **FR-15** | Báo Cáo Thống Kê | Xuất báo cáo tài sản, chi phí bảo trì ra định dạng Excel (.xlsx) / CSV / A4 | ADMIN, MANAGER, TECH |
| **FR-16** | **Notification Center** | **Trung tâm thông báo thời gian thực, chuông cảnh báo, unread count, quét rủi ro tự động** | **Tất cả Actors** |
| **FR-17** | **Device Activity Timeline** | **Dòng thời gian hoạt động tích hợp đa nguồn (Sự cố, Bảo trì, Lệnh công tác, Audit, Vòng đời)** | **ADMIN, MANAGER, TECH** |
| **FR-18** | **Advanced Reporting & KPI** | **9 KPI thời gian thực, 6 biểu đồ phân tích và 7 mẫu báo cáo xuất Excel .xlsx chuyên nghiệp** | **ADMIN, MANAGER, TECH** |

**Bảng 3.3: Bảng yêu cầu phi chức năng hệ thống (Non-Functional Requirements)**
| Tiêu Chí | Chi Tiết Yêu Cầu Kỹ Thuật |
|---|---|
| **Bảo mật (Security)** | Mật khẩu băm `bcrypt` 10 vòng; Token JWT HS256; Prepared Statements 100%; phòng chống IDOR/BOLA; Cookie HttpOnly `SameSite=Lax`. |
| **Hiệu năng (Performance)** | Thời gian phản hồi API trung bình $< 150\text{ms}$; Frontend tải ban đầu $< 1.5\text{s}$ nhờ Code Splitting phân mảnh; tính toán Simulation $< 20\text{ms}$. |
| **Khả năng sử dụng (Usability)** | Giao diện chuẩn Modern Enterprise, Responsive Mobile First (320px - 1440px), hỗ trợ PWA ghim màn hình chính. |
| **Độ tin cậy (Reliability)** | Cơ sở dữ liệu TiDB Cloud phân tán đảm bảo tính toàn vẹn ACID, sao lưu tự động hàng ngày. |

### 3.1.4. Kế hoạch triển khai
Quá trình xây dựng hệ thống AssetCare được chia thành 4 giai đoạn phát triển chính:
1. **Giai đoạn 1**: Khảo sát quy trình nghiệp vụ cơ sở vật chất UTT, thiết kế Database Schema TiDB Cloud và xây dựng khung REST API chuẩn 3 lớp.
2. **Giai đoạn 2**: Xây dựng phân hệ Xác thực bảo mật đa tầng, Quản trị tài sản và Tích hợp camera quét mã QR Code.
3. **Giai đoạn 3**: Phát triển quy trình khép kín Lệnh công tác Bảo trì (Work Orders) và triển khai 4 Động cơ Toán học (Phase 1 Health, Phase 2 Risk, Phase 3 Priority Matrix, Phase 4 Simulation).
4. **Giai đoạn 4**: Nâng cấp 3 phân hệ chuyên sâu (Notification Center, Device Activity Timeline, Advanced Reporting & Dashboard), đóng gói PWA, thực hiện 8 bộ kiểm thử tự động (153 test cases) và triển khai Production trên Vercel/Render.

---

## 3.2. Phân tích hệ thống

### 3.2.1. Xác định tác nhân (Actors) và Ma trận Phân quyền (RBAC Matrix)

**Bảng 3.4: Bảng xác định tác nhân (Actors) và phạm vi quyền hạn**
| Tác Nhân (Actor) | Vai Trò Nghiệp Vụ Trong Trường UTT | Phạm Vi Quyền Hạn Dữ Liệu |
|---|---|---|
| **Quản trị viên (ADMIN)** | Ban Giám hiệu, Trưởng phòng Quản trị Thiết bị | Toàn quyền quản trị hệ thống, quản lý tài khoản, danh mục, phân công, báo cáo. |
| **Cán bộ Quản lý (MANAGER)**| Lãnh đạo Khoa, Cán bộ phụ trách cơ sở vật chất đơn vị | Quản lý thiết bị đơn vị, tiếp nhận sự cố, phân công KTV, xem báo cáo thống kê. |
| **Kỹ thuật viên (TECHNICIAN)**| Đội ngũ kỹ sư, thợ sửa chữa bảo trì của trường | Xem việc được giao, cập nhật tiến độ, báo linh kiện thay thế, hoàn thành bảo trì. |
| **Người sử dụng (USER)** | Giảng viên, Sinh viên, Cán bộ nhân viên nhà trường | Quét QR xem thông số, gửi phiếu báo hỏng, theo dõi và nghiệm thu phiếu cá nhân. |

**Bảng 3.5: Ma trận Phân quyền Actor – Chức năng hệ thống (RBAC Matrix)**
| Nhóm Chức Năng / Phân Hệ | ADMIN | MANAGER | TECHNICIAN | USER |
|---|:---:|:---:|:---:|:---:|
| **Quét QR tra cứu thông tin thiết bị công khai** | ✅ | ✅ | ✅ | ✅ |
| **Tạo phiếu báo hỏng thiết bị (Incident Report)** | ✅ | ✅ | ✅ | ✅ |
| **Xem danh sách & Nghiệm thu phiếu của chính mình** | ✅ | ✅ | ✅ | ✅ |
| **Xem Dashboard Kỹ thuật viên & Việc được giao** | ❌ | ❌ | ✅ | ❌ |
| **Cập nhật tiến độ: Bắt đầu / Chờ linh kiện / Hoàn thành** | ❌ | ❌ | ✅ | ❌ |
| **Xem toàn bộ phiếu sự cố & Phân công Kỹ thuật viên** | ✅ | ✅ | ❌ | ❌ |
| **Quản lý Lịch bảo dưỡng định kỳ (Schedules PM)** | ✅ | ✅ | ✅ (Xem) | ❌ |
| **Xem Ma trận Rủi ro (Risk Matrix) & Điểm Ưu tiên** | ✅ | ✅ | ✅ | ❌ |
| **Chạy Mô phỏng Dự báo What-If (Phase 4 Simulation)** | ✅ | ✅ | ✅ | ❌ |
| **Xuất Báo cáo & Thống kê Chi phí (Excel/CSV/A4)** | ✅ | ✅ | ✅ (Xem) | ❌ |
| **Quản lý Hồ sơ Thiết bị: Thêm / Sửa / Xóa thiết bị** | ✅ | ✅ (Thêm/Sửa) | ❌ | ❌ |
| **Quản lý Người dùng: Tạo tài khoản, Đổi quyền Role** | ✅ | ❌ | ❌ | ❌ |
| **Xem & Quản lý Thông báo cá nhân (Notification Center)** | ✅ | ✅ | ✅ | ✅ |
| **Quét kích hoạt Cảnh báo Hệ thống tự động** | ✅ | ✅ | ❌ | ❌ |
| **Xem Lịch sử Hoạt động Thiết bị (Activity Timeline)** | ✅ | ✅ | ✅ | ❌ |

---

### 3.2.2. Biểu đồ Use Case tổng quát và chi tiết

#### A. Biểu đồ Use Case Tổng Thể Hệ Thống (Hình 3.1)
```mermaid
graph LR
    User([Người dùng USER])
    Tech([Kỹ thuật viên TECHNICIAN])
    Manager([Cán bộ Quản lý MANAGER])
    Admin([Quản trị viên ADMIN])

    subgraph "HỆ THỐNG ASSETCARE UTT"
        UC1(Đăng nhập / Đăng ký / Đăng xuất)
        UC2(Quét QR & Xem thông tin thiết bị)
        UC3(Gửi phiếu báo hỏng thiết bị)
        UC4(Theo dõi & Nghiệm thu phiếu cá nhân)
        UC_Notif(Xem & Quản lý Thông báo cá nhân)
        
        UC5(Xem hàng đợi việc được giao)
        UC6(Cập nhật tiến độ & Linh kiện thay thế)
        UC7(Báo cáo hoàn thành sửa chữa)
        UC_Timeline(Xem Dòng thời gian Lịch sử Thiết bị)
        
        UC8(Duyệt phiếu sự cố & Phân công KTV)
        UC9(Quản lý Lịch bảo dưỡng định kỳ)
        UC10(Giám sát Ma trận Rủi ro & Ưu tiên)
        UC11(Xuất 7 Loại Báo cáo Thống kê Excel/CSV)
        UC_ScanAlert(Quét kích hoạt Cảnh báo Rủi ro Hệ thống)
        
        UC12(Quản trị Hồ sơ Thiết bị & Danh mục)
        UC13(Quản lý Người dùng & Phân quyền)
        UC14(Chạy Mô phỏng Dự báo What-If)
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC_Notif

    Tech --> UC1
    Tech --> UC2
    Tech --> UC5
    Tech --> UC6
    Tech --> UC7
    Tech --> UC10
    Tech --> UC14
    Tech --> UC_Notif
    Tech --> UC_Timeline

    Manager --> UC1
    Manager --> UC2
    Manager --> UC8
    Manager --> UC9
    Manager --> UC10
    Manager --> UC11
    Manager --> UC12
    Manager --> UC14
    Manager --> UC_Notif
    Manager --> UC_Timeline
    Manager --> UC_ScanAlert

    Admin --> UC13
    Admin -.->|Kế thừa toàn quyền| Manager
```

#### B. Biểu đồ Use Case Phân Hệ Quản Lý Hồ Sơ Tài Sản & Thiết Bị (Hình 3.2)
```mermaid
graph LR
    Manager([Quản lý / Admin])
    Tech([Kỹ thuật viên])

    subgraph "PHÂN HỆ QUẢN LÝ TÀI SẢN"
        UC_DevList(Xem danh sách & Lọc đa tiêu chí)
        UC_DevDetail(Xem chi tiết lý lịch & Lịch sử sửa chữa)
        UC_DevTimeline(Xem Dòng thời gian Activity Timeline)
        UC_DevAdd(Thêm mới hồ sơ thiết bị)
        UC_DevEdit(Chỉnh sửa thông số kỹ thuật)
        UC_DevDelete(Thanh lý / Xóa thiết bị)
        UC_DevQR(Tạo & Tải mã QR Vector SVG)
    end

    Manager --> UC_DevList
    Manager --> UC_DevDetail
    Manager --> UC_DevTimeline
    Manager --> UC_DevAdd
    Manager --> UC_DevEdit
    Manager --> UC_DevDelete
    Manager --> UC_DevQR

    Tech --> UC_DevList
    Tech --> UC_DevDetail
    Tech --> UC_DevTimeline
```

#### C. Biểu đồ Use Case Phân Hệ Báo Hỏng & Tiếp Nhận Sự Cố (Hình 3.3)
```mermaid
graph LR
    User([Người dùng])
    Manager([Quản lý / Admin])

    subgraph "PHÂN HỆ TIẾP NHẬN BÁO HỎNG"
        UC_Scan(Quét mã QR thân máy)
        UC_ViewPub(Xem trang Public Device)
        UC_CreateTicket(Nhập tiêu đề, mô tả, ưu tiên & ảnh)
        UC_CheckSpam(Kiểm tra chống spam 15s)
        UC_SaveDB[(Ghi nhận TiDB Cloud PENDING)]
        UC_Notify(Tự động gửi thông báo tức thì cho Quản lý)
        UC_Assign(Chỉ định Kỹ thuật viên xử lý)
    end

    User --> UC_Scan
    UC_Scan --> UC_ViewPub
    UC_ViewPub --> UC_CreateTicket
    UC_CreateTicket --> UC_CheckSpam
    UC_CheckSpam --> UC_SaveDB
    UC_SaveDB --> UC_Notify
    UC_Notify --> Manager
    Manager --> UC_Assign
```

#### D. Biểu đồ Use Case Phân Hệ Lệnh Công Tác Dành Cho Kỹ Thuật Viên (Hình 3.4)
```mermaid
graph LR
    Tech([Kỹ thuật viên])
    User([Người báo])

    subgraph "PHÂN HỆ WORK ORDER"
        UC_ViewAssigned(Xem việc được giao)
        UC_StartWork(Bắt đầu xử lý IN_PROGRESS)
        UC_WaitPart(Tạm dừng chờ linh kiện WAITING_PART)
        UC_Resume(Tiếp tục xử lý RESUME)
        UC_Complete(Nhập biên bản, chi phí COMPLETED)
        UC_Accept(Nghiệm thu ĐÃ KHẮC PHỤC & Đóng phiếu CLOSED)
        UC_Recalc(Tự động tính lại Health/Risk)
    end

    Tech --> UC_ViewAssigned
    UC_ViewAssigned --> UC_StartWork
    UC_StartWork --> UC_WaitPart
    UC_WaitPart --> UC_Resume
    UC_Resume --> UC_Complete
    UC_Complete --> User
    User --> UC_Accept
    UC_Accept --> UC_Recalc
```

---

### 3.2.3. Đặc tả chi tiết từng Use Case nghiệp vụ

#### Bảng 3.7: Đặc tả Use Case Quét QR và Báo hỏng thiết bị (UC-03)
| Thuộc Tính | Nội Dung Đặc Tả Chi Tiết |
|---|---|
| **Tên Use Case** | Quét QR và Gửi phiếu Báo hỏng thiết bị |
| **Mã Use Case** | **UC-03** |
| **Tác nhân (Actor)** | Người sử dụng (`USER`), Cán bộ Quản lý (`MANAGER`), Quản trị viên (`ADMIN`) |
| **Mục tiêu** | Ghi nhận sự cố kỹ thuật của thiết bị thực tế vào TiDB Cloud trong vòng 30 giây |
| **Tiền điều kiện** | Người dùng đã đăng nhập hoặc chuyển hướng đăng nhập thành công; thiết bị có mã QR hợp lệ |
| **Hậu điều kiện** | Bản ghi `maintenance_requests` được tạo ở trạng thái `PENDING`, phát thông báo tự động tới Quản trị viên |
| **Trigger (Kích hoạt)** | Người dùng phát hiện thiết bị hư hỏng tại phòng học và quét mã QR trên thân máy |
| **Luồng chính (Main Flow)** | 1. Mở camera quét mã QR $\to$ 2. Xem thông tin thiết bị công khai $\to$ 3. Bấm "Báo hỏng thiết bị này" $\to$ 4. Nhập tiêu đề ($\ge 3$ ký tự), mô tả ($\ge 5$ ký tự), mức ưu tiên và ảnh chụp hiện trường $\to$ 5. Bấm "Đăng yêu cầu bảo trì" $\to$ 6. Hệ thống kiểm tra chống click spam trong 15s $\to$ 7. Ghi nhận phiếu vào TiDB Cloud $\to$ 8. Gửi thông báo cho toàn bộ Admin & Manager $\to$ 9. Hiển thị mã phiếu xác nhận. |
| **Luồng thay thế** | Người dùng chưa đăng nhập: Hệ thống chuyển sang trang `/login?redirect=/device/:token` $\to$ Đăng nhập xong tự động quay lại form báo hỏng. |
| **Luồng ngoại lệ** | Người dùng click gửi liên tiếp trong 15s: Hệ thống ghi nhận cảnh báo và trả về mã phiếu hiện hành, không tạo bản ghi rác. |
| **API Liên quan** | `POST /api/maintenance`, `GET /api/public/devices/qr/:token` |
| **Bảng CSDL** | `maintenance_requests`, `devices`, `attachments`, `notifications`, `audit_logs` |

#### Bảng 3.8: Đặc tả Use Case Tiếp nhận và Phân công Kỹ thuật viên (UC-08)
| Thuộc Tính | Nội Dung Đặc Tả Chi Tiết |
|---|---|
| **Tên Use Case** | Tiếp nhận và Phân công Kỹ thuật viên xử lý sự cố |
| **Mã Use Case** | **UC-08** |
| **Tác nhân (Actor)** | Quản trị viên (`ADMIN`), Cán bộ Quản lý (`MANAGER`) |
| **Mục tiêu** | Đánh giá tính cấp bách của sự cố và chỉ định Kỹ thuật viên phụ trách kèm SLA cam kết |
| **Tiền điều kiện** | Phiếu sự cố đang ở trạng thái `PENDING` trong CSDL |
| **Hậu điều kiện** | Trạng thái chuyển sang `ASSIGNED`, gắn `technician_id`, phát thông báo cho KTV |
| **Trigger** | Cán bộ quản lý mở Dashboard thấy phiếu sự cố mới phát sinh |
| **Luồng chính** | 1. Chọn phiếu `PENDING` từ danh sách $\to$ 2. Xem chi tiết hiện tượng và ảnh đính kèm $\to$ 3. Chọn KTV phù hợp từ danh sách $\to$ 4. Gắn hạn SLA $\to$ 5. Bấm "Phân công" $\to$ 6. Hệ thống cập nhật CSDL và bắn thông báo tới KTV. |
| **API Liên quan** | `POST /api/maintenance/:id/assign` |
| **Bảng CSDL** | `maintenance_requests`, `maintenance_histories`, `notifications` |

---

### 3.2.4. Biểu đồ hoạt động (Activity Diagrams)

#### A. Biểu đồ Hoạt động – Quét QR & Báo Hỏng Thiết Bị (Hình 3.6)
```mermaid
stateDiagram-v2
    [*] --> Quet_QR: Người dùng mở Camera quét mã QR
    Quet_QR --> KiemTra_QR: Hệ thống trích xuất QR Token
    
    state KiemTra_QR <<choice>>
    KiemTra_QR --> Public_Device: QR hợp lệ
    KiemTra_QR --> BaoLoi_404: QR không tồn tại
    
    BaoLoi_404 --> [*]
    
    Public_Device --> Bam_BaoHong: Xem thông tin & Bấm "Báo Hỏng"
    Bam_BaoHong --> KiemTra_Auth: Kiểm tra đăng nhập
    
    state KiemTra_Auth <<choice>>
    KiemTra_Auth --> Form_BaoHong: Đã đăng nhập
    KiemTra_Auth --> Trang_Login: Chưa đăng nhập
    
    Trang_Login --> Form_BaoHong: Đăng nhập thành công (Giữ redirect URL)
    
    Form_BaoHong --> Gui_Phieu: Nhập tiêu đề (>=3 ký tự), mô tả (>=5 ký tự) & chụp ảnh
    Gui_Phieu --> KiemTra_Spam: Hệ thống kiểm tra throttle 15s
    
    state KiemTra_Spam <<choice>>
    KiemTra_Spam --> Luu_DB: Hợp lệ
    KiemTra_Spam --> TraVe_PhieuCu: Spam click trong 15s
    
    Luu_DB --> Gui_ThongBao: Lưu PENDING vào TiDB Cloud
    Gui_ThongBao --> Modal_ThanhCong: Tự động gửi thông báo đến Quản trị viên
    TraVe_PhieuCu --> Modal_ThanhCong
    Modal_ThanhCong --> [*]
```

#### B. Biểu đồ Hoạt động – Vòng Đời Lệnh Công Tác Bảo Trì (Hình 3.7)
```mermaid
stateDiagram-v2
    [*] --> PENDING: Phiếu sự cố mới tạo
    PENDING --> ASSIGNED: Manager/Admin tiếp nhận & Phân công KTV
    ASSIGNED --> IN_PROGRESS: KTV tiếp nhận tại hiện trường & Bắt đầu làm
    
    state KiemTra_LinhKien <<choice>>
    IN_PROGRESS --> KiemTra_LinhKien: Đánh giá phương án sửa chữa
    
    KiemTra_LinhKien --> WAITING_PART: Thiếu linh kiện thay thế
    KiemTra_LinhKien --> COMPLETED: Đủ điều kiện, hoàn tất sửa chữa
    
    WAITING_PART --> IN_PROGRESS: Linh kiện đã nhập kho (Resume)
    
    COMPLETED --> KiemTra_NghiemThu: KTV nhập chi phí & gửi nghiệm thu
    
    state KiemTra_NghiemThu <<choice>>
    KiemTra_NghiemThu --> CLOSED: Người báo nghiệm thu ĐẠT (Đóng phiếu)
    KiemTra_NghiemThu --> REOPENED: Người báo kiểm tra CHƯA ĐẠT
    
    REOPENED --> IN_PROGRESS: KTV xử lý lại sự cố
    CLOSED --> TinhToan_ChiSo: Kích hoạt tính toán lại Health, Risk, Priority
    TinhToan_ChiSo --> [*]
```

---

### 3.2.5. Biểu đồ trình tự (Sequence Diagrams)

#### A. Biểu đồ Trình tự – Đăng Nhập & Khôi Phục Phiên (Hình 3.9)
```mermaid
sequenceDiagram
    autonumber
    actor Client as Người dùng
    participant UI as React LoginPage
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant DB as UserRepository (TiDB)

    Client->>UI: Nhập username & password
    UI->>Ctrl: POST /api/auth/login
    Ctrl->>Svc: login({ username, password })
    Svc->>DB: findByUsernameWithRole(username)
    DB-->>Svc: Return user record (hash password)

    alt Mật khẩu không đúng hoặc User bị vô hiệu hóa
        Svc-->>Ctrl: Throw UnauthorizedError("Tên đăng nhập hoặc mật khẩu không chính xác")
        Ctrl-->>UI: HTTP 401 Unauthorized
        UI-->>Client: Hiển thị thông báo lỗi
    else Xác thực thành công
        Svc->>Svc: Ký JWT Token HS256
        Svc-->>Ctrl: Return { user, token }
        Ctrl->>Ctrl: Gắn HttpOnly Cookie ('token', MaxAge: 7d)
        Ctrl-->>UI: HTTP 200 OK (User Profile & Session)
        UI->>UI: Cập nhật AuthContext & Điều hướng Dashboard
        UI-->>Client: Hiển thị giao diện theo đúng vai trò Role
    end
```

#### B. Biểu đồ Trình tự – Báo Hỏng Thiết Bị & Phân Công Kỹ Thuật Viên (Hình 3.11)
```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (Người báo)
    actor Mgr as Cán bộ Quản lý
    participant App as Frontend Web/PWA
    participant MCtrl as MaintenanceController
    participant MSvc as MaintenanceService
    participant MRepo as MaintenanceRepository (TiDB)
    participant NRepo as NotificationRepository (TiDB)

    User->>App: Gửi form báo hỏng thiết bị ID: 4 (Priority: HIGH)
    App->>MCtrl: POST /api/maintenance { deviceId: 4, title, description, priority }
    MCtrl->>MSvc: createRequest(data, user)
    MSvc->>MRepo: create(code: "REQ00052", status: "PENDING")
    MRepo-->>MSvc: Return requestId = 52
    MSvc->>NRepo: create (Thông báo sự cố gửi Admin & Manager)
    MSvc-->>MCtrl: Return Ticket Details
    MCtrl-->>App: HTTP 201 Created (Tạo phiếu thành công)

    Mgr->>App: Mở danh sách phiếu chờ duyệt
    App->>MCtrl: GET /api/maintenance?status=PENDING
    MCtrl-->>App: Danh sách phiếu (Bao gồm REQ00052)
    Mgr->>App: Chọn phân công cho KTV tech_nam (ID: 4)
    App->>MCtrl: POST /api/maintenance/52/assign { technicianId: 4 }
    MCtrl->>MSvc: assignTechnician(52, data, mgrUser)
    MSvc->>MRepo: updateWorkflowStatus(52, status: "ASSIGNED")
    MSvc->>NRepo: create (Thông báo phân công gửi KTV tech_nam)
    MSvc-->>MCtrl: Return Success
    MCtrl-->>App: HTTP 200 OK (Đã phân công)
```

#### C. Biểu đồ Trình tự – Kỹ Thuật Viên Xử Lý & Người Dùng Nghiệm Thu (Hình 3.12)
```mermaid
sequenceDiagram
    autonumber
    actor Tech as Kỹ thuật viên (tech_nam)
    actor User as Người dùng (user_ha)
    participant App as Frontend Web/PWA
    participant MCtrl as MaintenanceController
    participant MSvc as MaintenanceService
    participant MRepo as MaintenanceRepository (TiDB)

    Tech->>App: Mở phiếu REQ00052 & Bấm Bắt đầu làm
    App->>MCtrl: POST /api/maintenance/52/start
    MCtrl->>MSvc: startWork(52)
    MSvc->>MRepo: updateWorkflowStatus(52, status: "IN_PROGRESS", startedAt: NOW())
    MCtrl-->>App: HTTP 200 OK (Đang xử lý)

    Tech->>App: Hoàn thành sửa chữa, nhập chi phí & linh kiện
    App->>MCtrl: POST /api/maintenance/52/complete { actualCost: 150000, rootCause, resolution }
    MCtrl->>MSvc: completeWork(52, data)
    MSvc->>MRepo: updateWorkflowStatus(52, status: "COMPLETED", actualCost: 150000)
    MSvc->>MRepo: addParts(52, partsList)
    MCtrl-->>App: HTTP 200 OK (Chờ nghiệm thu)

    User->>App: Nhận thông báo nghiệm thu & Chấm điểm 5 sao
    App->>MCtrl: POST /api/maintenance/52/accept { rating: 5, feedback: "Rất tốt" }
    MCtrl->>MSvc: acceptCompletion(52)
    MSvc->>MRepo: updateWorkflowStatus(52, status: "CLOSED", closedAt: NOW())
    MSvc->>MSvc: Tự động kích hoạt tính lại Health, Risk, Priority
    MCtrl-->>App: HTTP 200 OK (Đóng phiếu hoàn tất)
```

---

### 3.2.6. Biểu đồ lớp (Class Diagram - Hình 3.15)

```mermaid
classDiagram
    class UserController {
        +getUsers(req, res)
        +getUserById(req, res)
        +createUser(req, res)
        +updateUser(req, res)
        +deleteUser(req, res)
    }

    class UserService {
        +getAllUsers(filters)
        +getUserProfile(id)
        +createNewUser(data)
        +updateUserProfile(id, data)
    }

    class UserRepository {
        +findAll(filters)
        +findById(id)
        +create(userData)
        +update(id, userData)
    }

    class MaintenanceController {
        +createRequest(req, res)
        +assignTechnician(req, res)
        +startWork(req, res)
        +waitingPart(req, res)
        +completeWork(req, res)
        +acceptCompletion(req, res)
    }

    class MaintenanceService {
        +createRequest(data, user)
        +assignTechnician(id, data, user)
        +startWork(id, data, user)
        +completeWork(id, data, user)
        +acceptCompletion(id, data, user)
    }

    class MaintenanceRepository {
        +create(ticketData)
        +findById(id)
        +updateWorkflowStatus(id, fields)
        +addHistory(historyData)
        +addParts(id, parts)
    }

    class NotificationController {
        +getNotifications(req, res)
        +getUnreadCount(req, res)
        +markAsRead(req, res)
        +markAllAsRead(req, res)
        +scanSystemAlerts(req, res)
    }

    class NotificationService {
        +getUserNotifications(userId, query)
        +getUnreadCount(userId)
        +markAsRead(id, userId)
        +markAllAsRead(userId)
        +scanAndGenerateSystemAlerts()
    }

    class DeviceService {
        +getDeviceTimeline(deviceId, query)
    }

    class ReportService {
        +getReportPreview(type, filters)
        +exportReport(type, format, filters)
    }

    UserController --> UserService
    UserService --> UserRepository
    MaintenanceController --> MaintenanceService
    MaintenanceService --> MaintenanceRepository
    NotificationController --> NotificationService
```

---

### 3.2.10. Chức năng mới: Trung tâm Thông báo Thông minh & Cảnh báo Tự động (Notification Center)

#### 3.2.10.1. Mục đích
Tự động hóa luồng cảnh báo và điều phối công việc tức thời trong hệ thống AssetCare; đảm bảo khi có sự cố phát sinh, thông tin được chuyển ngay lập tức đến cấp quản lý có thẩm quyền; cung cấp giao diện quản lý tập trung các thông báo vận hành, phân công và cảnh báo rủi ro thiết bị.

#### 3.2.10.2. Actor
- `ADMIN`, `MANAGER`: Nhận thông báo sự cố mới, phân công kỹ thuật, cảnh báo rủi ro cao và thực thi chức năng Quét cảnh báo rủi ro tự động toàn hệ thống.
- `TECHNICIAN`: Nhận thông báo khi được phân công lệnh công tác mới hoặc khi phiếu được nghiệm thu/mở lại.
- `USER`: Nhận thông báo khi kỹ thuật viên hoàn thành sửa chữa yêu cầu nghiệm thu hoặc khi phiếu được xử lý.

#### 3.2.10.3. Luồng nghiệp vụ
1. **Luồng phát thông báo tức thì (Automated Event-Driven Dispatch)**:
   - Khi `USER` gửi phiếu báo hỏng tại `POST /api/maintenance`, `maintenanceService.createRequest()` truy vấn danh sách toàn bộ cán bộ có vai trò `ADMIN` và `MANAGER`.
   - Hệ thống tự động tạo bản ghi thông báo tương ứng cho từng người quản lý với tiêu đề, mô tả và mức độ cảnh báo (`severity`) tương ứng với độ ưu tiên của sự cố (`URGENT` $\to$ `URGENT`, `HIGH` $\to$ `WARNING`, `MEDIUM`/`LOW` $\to$ `INFO`).
2. **Luồng tra cứu & quản lý thông báo người dùng**:
   - Header liên tục cập nhật số lượng thông báo chưa đọc qua `GET /api/notifications/unread-count`.
   - Người dùng bấm biểu tượng Chuông $\to$ Xem Dropdown tóm tắt hoặc mở trang `/notifications`.
   - Người dùng có thể lọc theo phân loại (`INCIDENT`, `MAINTENANCE`, `RISK`, `SYSTEM`), bấm đánh dấu đã đọc từng thông báo (`PATCH /api/notifications/:id/read`) hoặc đánh dấu tất cả đã đọc (`PATCH /api/notifications/read-all`).
3. **Luồng Quét cảnh báo rủi ro tự động (Automated System Alerts Scan)**:
   - Cán bộ Quản lý/Admin bấm "Quét cảnh báo hệ thống" $\to$ Gọi `POST /api/notifications/scan-system-alerts`.
   - `notificationService.scanAndGenerateSystemAlerts()` tự động duyệt các thiết bị có Risk Score $\ge 70$, sắp hết hạn bảo hành hoặc quá hạn bảo dưỡng PM $\ge 15$ ngày để phát cảnh báo điều phối.

#### 3.2.10.4. Quy tắc nghiệp vụ
- **Chống Spam Thông Báo (Deduplication)**: Trong vòng 24 giờ, hệ thống không tạo thông báo cảnh báo rủi ro trùng lặp cho cùng một cặp `(user_id, reference_type, reference_id)`.
- **Ngoại lệ**: Nếu người dùng cố tình đánh dấu thông báo của người khác, middleware IDOR trả về `404 Not Found` hoặc `403 Forbidden`.

#### 3.2.10.5. Thiết kế Frontend
- **Trang & Thành phần**: `NotificationPage.jsx`, Header Notification Bell Component, Dropdown Menu xem nhanh, Tab lọc (`ALL`, `INCIDENT`, `MAINTENANCE`, `RISK`, `SYSTEM`), Phân trang `Pagination.jsx`.
- **Tương tác**: Nút "Đánh dấu tất cả đã đọc" (Mark all as read), Nút "Quét cảnh báo hệ thống" (Scan System Alerts dành cho Admin/Manager), Nút đánh dấu đã đọc trên từng thông báo.
- **Dịch vụ**: `frontend/src/services/notificationService.js`.

#### 3.2.10.6. Thiết kế Backend
- **Controller**: `backend/src/controllers/notificationController.js`.
- **Service**: `backend/src/services/notificationService.js`, `maintenanceService.js`.
- **Repository**: `backend/src/repositories/notificationRepository.js`.
- **Routes & Middleware**: `backend/src/routes/notificationRoutes.js`, `authMiddleware.js`, `roleMiddleware.js`.

#### 3.2.10.7. API
| Method | Endpoint | Role | Input | Output | Mục Đích |
|:---:|---|:---:|---|---|---|
| `GET` | `/api/notifications` | Authenticated | Query: `page`, `limit`, `type`, `isRead` | `{ data: [...], pagination: { page, limit, total, totalPages } }` | Lấy danh sách thông báo cá nhân phân trang |
| `GET` | `/api/notifications/unread-count` | Authenticated | Không | `{ success: true, data: { unreadCount: 26 } }` | Đếm số lượng thông báo chưa đọc hiển thị badge |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Param: `id` | `{ success: true, message: 'Đã đánh dấu đã đọc' }` | Đánh dấu 1 thông báo cụ thể là đã đọc |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Không | `{ success: true, message: 'Đã đánh dấu tất cả đã đọc' }` | Đánh dấu toàn bộ thông báo của user là đã đọc |
| `POST` | `/api/notifications/scan-system-alerts` | `ADMIN`, `MANAGER` | Không | `{ success: true, message: 'Đã quét và kích hoạt 105 cảnh báo' }` | Quét CSDL phát cảnh báo rủi ro tự động |

#### 3.2.10.8. Database
- **Bảng CSDL**: `notifications`.
- **Cấu trúc trường**: `id` (PK, INT Auto), `user_id` (FK, INT), `device_id` (FK, INT Nullable), `type` (VARCHAR), `title` (VARCHAR), `message` (TEXT), `reference_type` (VARCHAR), `reference_id` (INT), `severity` (ENUM: `INFO`, `WARNING`, `URGENT`), `is_read` (TINYINT), `created_at` (TIMESTAMP).
- **Thao tác**: `SELECT` danh sách theo `user_id`; `UPDATE is_read = 1`; `INSERT` bản ghi mới khi có sự kiện sự cố hoặc quét cảnh báo.

#### 3.2.10.9. Phân quyền & bảo mật
- **RBAC**: Chức năng quét cảnh báo `scan-system-alerts` giới hạn nghiêm ngặt cho `ADMIN` và `MANAGER`.
- **IDOR**: Mọi câu truy vấn danh sách hoặc cập nhật đọc đều được cô lập theo `req.user.id`.

#### 3.2.10.10. Kiểm thử
| ID | Chức Năng | Điều Kiện | Input | Expected | Actual | Status |
|:---:|---|---|---|---|---|:---:|
| **UG-01** | Xác thực 4 Roles | Tài khoản hoạt động | Admin, Manager, Tech, User credentials | Đăng nhập thành công, cấp token/cookie | Trả về 200 OK & User profile | **PASS** |
| **UG-02** | Danh sách thông báo | Admin đã đăng nhập | `GET /api/notifications?limit=5` | Trả về danh sách thông báo cá nhân | Trả về 5 thông báo mới nhất | **PASS** |
| **UG-03** | Phân trang thông báo | Gọi kèm limit | `GET /api/notifications?limit=5` | Meta chứa total, page, limit | Meta total > 0 chuẩn xác | **PASS** |
| **UG-04** | Đếm chưa đọc | User có thông báo | `GET /api/notifications/unread-count` | Trả về số lượng unreadCount $\ge 0$ | unreadCount = 26 | **PASS** |
| **UG-05** | Đánh dấu đã đọc tất cả | Admin thao tác | `PATCH /api/notifications/read-all` | Cập nhật `is_read = 1` toàn bộ | unreadCount về 0 thành công | **PASS** |
| **UG-06** | Quét cảnh báo hệ thống | Quyền Admin/Manager | `POST /api/notifications/scan-system-alerts` | Quét rủi ro và tạo cảnh báo tự động | Kích hoạt 105 cảnh báo thành công | **PASS** |
| **UG-07** | Chặn User quét cảnh báo | Quyền User thường | `POST /api/notifications/scan-system-alerts` | RBAC từ chối 403 Forbidden | HTTP 403 Forbidden chuẩn xác | **PASS** |

---

### 3.2.11. Chức năng mới: Lịch Sử Hoạt Động & Vòng Đời Thiết Bị Tích Hợp (Device Activity Timeline Aggregator)

#### 3.2.11.1. Mục đích
Cung cấp bức tranh toàn cảnh, đa chiều và chính xác theo thứ tự thời gian về mọi biến cố, sự cố, lệnh bảo trì và thay đổi cấu hình kỹ thuật của từng trang thiết bị trong khuôn viên UTT.

#### 3.2.11.2. Actor
`ADMIN`, `MANAGER`, `TECHNICIAN`.

#### 3.2.11.3. Luồng nghiệp vụ
1. Người dùng mở trang Chi tiết thiết bị `/devices/:id` $\to$ Chọn tab **"Lịch sử hoạt động" (History)**.
2. Giao diện gọi API `GET /api/devices/:id/timeline?page=1&limit=20`.
3. Backend Service (`deviceService.getDeviceTimeline`) thực hiện truy vấn tổng hợp thời gian thực từ 5 bảng dữ liệu độc lập:
   - `devices`: Ghi nhận sự kiện khởi tạo, đưa vào vận hành (`LIFECYCLE`).
   - `maintenance_requests`: Ghi nhận các phiếu báo hỏng sự cố (`INCIDENT`).
   - `maintenance_histories`: Ghi nhận các mốc chuyển trạng thái sửa chữa (`MAINTENANCE`).
   - `maintenance_work_orders`: Ghi nhận phát hành và nghiệm thu lệnh công tác (`WORK_ORDER`).
   - `audit_logs`: Ghi nhận các can thiệp thay đổi thông số hồ sơ thiết bị (`AUDIT`).
4. Hệ thống chuẩn hóa cấu trúc sự kiện (`eventType`, `title`, `description`, `actorName`, `cost`, `timestamp`, `metadata`), sắp xếp theo `timestamp DESC`, thực hiện phân trang ảo trên tập hợp dữ liệu và trả về cho máy khách.

#### 3.2.11.4. Quy tắc nghiệp vụ
- Nếu `deviceId` không tồn tại trong hệ thống $\to$ Trả về mã lỗi chuẩn `404 Not Found`.
- Thiết bị mới tạo chưa có sự cố $\to$ Hiển thị mốc sự kiện khởi tạo vòng đời ban đầu.

#### 3.2.11.5. Thiết kế Frontend
- **Component**: [`DeviceActivityTimeline.jsx`](file:///d:/LAMm/frontend/src/components/devices/DeviceActivityTimeline.jsx) tích hợp tại tab Lịch sử [`DeviceDetailPage.jsx`](file:///d:/LAMm/frontend/src/pages/devices/DeviceDetailPage.jsx).
- **Bộ lọc & Phân trang**: Tab lọc sự kiện (`ALL`, `INCIDENT`, `MAINTENANCE`, `WORK_ORDER`, `AUDIT`, `LIFECYCLE`), Phân trang `Pagination.jsx`.
- **Dịch vụ**: `frontend/src/services/deviceService.js` $\to$ `getDeviceTimeline(id, params)`.

#### 3.2.11.6. Thiết kế Backend
- **Controller**: `backend/src/controllers/deviceController.js` $\to$ `getDeviceTimeline`.
- **Service**: `backend/src/services/deviceService.js` $\to$ `getDeviceTimeline(deviceId, query)`.
- **Routes**: `backend/src/routes/deviceRoutes.js` $\to$ `GET /api/devices/:id/timeline`.

#### 3.2.11.7. API
| Method | Endpoint | Role | Input | Output | Mục Đích |
|:---:|---|:---:|---|---|---|
| `GET` | `/api/devices/:id/timeline` | `ADMIN`, `MANAGER`, `TECH` | Param: `id`; Query: `page`, `limit`, `type` | `{ data: { device: {...}, timeline: [...], pagination: {...} } }` | Lấy dòng thời gian tổng hợp 5 bảng của thiết bị |

#### 3.2.11.8. Database
- **Bảng CSDL**: Tổng hợp từ 5 bảng: `devices`, `maintenance_requests`, `maintenance_histories`, `maintenance_work_orders`, `audit_logs`.
- **Thao tác**: Không thay đổi schema; thực hiện các câu truy vấn `SELECT` song song và hợp nhất dữ liệu In-Memory.

#### 3.2.11.9. Phân quyền & bảo mật
Bắt buộc xác thực danh tính qua JWT / HttpOnly Cookie; kiểm tra quyền truy cập thiết bị theo phân cấp đơn vị; chặn truy cập trái phép khi thiết bị không tồn tại (`404 Not Found`).

#### 3.2.11.10. Kiểm thử
| ID | Chức Năng | Điều Kiện | Input | Expected | Actual | Status |
|:---:|---|---|---|---|---|:---:|
| **UG-08** | Lấy Timeline thiết bị | Thiết bị ID 1 tồn tại | `GET /api/devices/1/timeline` | Trả về mảng sự kiện tổng hợp | Trả về 20 sự kiện dòng thời gian | **PASS** |
| **UG-09** | Cấu trúc Timeline Event | Sự kiện hợp lệ | Trích xuất phần tử đầu tiên | Đủ eventType, title, timestamp, metadata | Khớp 100% định dạng chuẩn | **PASS** |
| **UG-10** | Phân trang Timeline | Truy vấn page & limit | `GET /api/devices/1/timeline?page=1&limit=3` | Trả về phân trang chuẩn | Trang 1 / 44 sự kiện | **PASS** |
| **UG-11** | Lọc Timeline theo loại | Loại sự kiện INCIDENT | `GET /api/devices/1/timeline?type=INCIDENT` | Chỉ trả về sự kiện sự cố | Lọc đúng 20 sự kiện INCIDENT | **PASS** |
| **UG-12** | Timeline thiết bị không tồn tại | Thiết bị ID 999999 | `GET /api/devices/999999/timeline` | Báo lỗi không tìm thấy | HTTP 404 Not Found | **PASS** |

---

### 3.2.12. Chức năng mới: Bảng Điều Khiển & Phân Hệ Báo Cáo Chuyên Sâu (Advanced Dashboard & Reporting)

#### 3.2.12.1. Mục đích
Cung cấp cho Ban Giám hiệu và Phòng Quản trị Thiết bị công cụ giám sát toàn diện thông qua 9 chỉ số hiệu năng (KPIs), 6 biểu đồ trực quan hóa rủi ro và bộ 7 biểu mẫu báo cáo tiêu chuẩn xuất bản ra định dạng Excel (`.xlsx`) và CSV UTF-8.

#### 3.2.12.2. Actor
`ADMIN`, `MANAGER`, `TECHNICIAN` (Xem dữ liệu phục vụ bảo trì).

#### 3.2.12.3. Luồng nghiệp vụ
1. **Bảng Điều Khiển Giám Sát (Advanced Dashboard)**:
   - Truy vấn 9 chỉ số vận hành thời gian thực từ `GET /api/dashboard/stats`: Tổng tài sản, Số máy đang chạy, Đang bảo trì, Tỷ lệ sẵn sàng (Availability Rate), Phiếu sự cố chờ duyệt, Lệnh công tác đang làm, Điểm sức khỏe trung bình toàn trường, Số máy nguy cơ cao, Tổng chi phí bảo trì lũy kế.
   - Trực quan hóa qua 6 biểu đồ phân tích Recharts (`GET /api/dashboard/charts`): Xu hướng sự cố hàng tháng, Phân bổ trạng thái Work Orders, Tỷ lệ trạng thái tài sản, Top thiết bị rủi ro sự cố cao nhất, Top thiết bị suy giảm sức khỏe nhanh nhất theo mô phỏng Phase 4, Phân bổ phân vùng Health Score.
2. **Phân Hệ 7 Mẫu Báo Cáo Chuyên Nghiệp (7 Standard Reports)**:
   - **Báo cáo 1**: Báo cáo Kiểm kê Danh mục Tài sản (`device-inventory`).
   - **Báo cáo 2**: Báo cáo Tổng hợp Hoạt động Bảo trì (`maintenance`).
   - **Báo cáo 3**: Báo cáo Chi phí & Tiêu hao Linh kiện (`maintenance-cost`).
   - **Báo cáo 4**: Báo cáo Đánh giá Hiệu suất Kỹ thuật viên (`technician-performance`).
   - **Báo cáo 5**: Báo cáo Tần suất Sự cố Thiết bị (`device-incident-frequency`).
   - **Báo cáo 6**: Báo cáo Danh mục Thiết bị Sắp hết Bảo hành (`warranty-expiration`).
   - **Báo cáo 7**: Báo cáo Kế hoạch Bảo trì Định kỳ (`scheduled-maintenance`).
3. **Quy trình Xem Trước & Xuất Bản File**:
   - Cán bộ chọn loại báo cáo $\to$ Xem trước bảng dữ liệu trên giao diện (`GET /api/reports/:type/preview`).
   - Bấm **"Xuất Excel (.xlsx)"** hoặc **"Xuất CSV"** $\to$ Backend sử dụng thư viện `ExcelJS` định dạng tiêu đề, căn lề, border bảng biểu, định dạng tiền tệ VND chuyên nghiệp và stream trực tiếp về trình duyệt.

#### 3.2.12.4. Quy tắc nghiệp vụ
- Dữ liệu tài chính và chi phí sửa chữa được kiểm toán bảo mật, không để lộ cho người dùng thường (`USER`).
- Xuất file hỗ trợ font chữ Unicode UTF-8 tiếng Việt hoàn chỉnh, không bị lỗi hiển thị ký tự.

#### 3.2.12.5. Thiết kế Frontend
- **Trang & Thành phần**: [`ReportsPage.jsx`](file:///d:/LAMm/frontend/src/pages/reports/ReportsPage.jsx), [`DashboardPage.jsx`](file:///d:/LAMm/frontend/src/pages/dashboard/DashboardPage.jsx), Bộ lọc ngày, Nút Xem trước, Nút Xuất Excel, Nút Xuất CSV, Nút In A4.
- **Dịch vụ**: `frontend/src/services/reportService.js`, `frontend/src/services/dashboardService.js`.

#### 3.2.12.6. Thiết kế Backend
- **Controller**: `backend/src/controllers/reportController.js`, `backend/src/controllers/dashboardController.js`.
- **Service**: `backend/src/services/reportService.js`, `backend/src/services/dashboardService.js`.
- **Repository**: `backend/src/repositories/reportRepository.js`, `backend/src/repositories/dashboardRepository.js`.
- **Routes**: `backend/src/routes/reportRoutes.js`, `backend/src/routes/dashboardRoutes.js`.

#### 3.2.12.7. API
| Method | Endpoint | Role | Input | Output | Mục Đích |
|:---:|---|:---:|---|---|---|
| `GET` | `/api/dashboard/stats` | `ADMIN`, `MANAGER`, `TECH` | Query: filters | `{ data: { totalDevices: 50, activeDevices: 36, averageHealthScore: 67... } }` | Lấy 9 chỉ số KPI thời gian thực |
| `GET` | `/api/dashboard/charts` | `ADMIN`, `MANAGER`, `TECH` | Query: filters | `{ data: { incidentTrend: [...], workOrderStatus: [...], topRiskDevices: [...] } }` | Lấy dữ liệu 6 biểu đồ trực quan hóa rủi ro |
| `GET` | `/api/dashboard/sla` | `ADMIN`, `MANAGER`, `TECH` | Query: filters | `{ data: { complianceRate: 98.2, averageResolutionHours: 3.5 } }` | Lấy chỉ số cam kết chất lượng dịch vụ SLA |
| `GET` | `/api/reports/:type/preview`| `ADMIN`, `MANAGER`, `TECH` | Param: `type`; Query: filters | `{ data: { columns: [...], rows: [...] } }` | Xem trước dữ liệu 7 loại biểu mẫu báo cáo |
| `GET` | `/api/reports/:type/export` | `ADMIN`, `MANAGER`, `TECH` | Param: `type`; Query: `format=xlsx|csv` | Binary Stream File (.xlsx hoặc CSV) | Xuất tải file Excel (.xlsx) / CSV UTF-8 |

#### 3.2.12.8. Database
- **Bảng CSDL**: Truy vấn liên kết từ 8 bảng nghiệp vụ (`devices`, `maintenance_requests`, `maintenance_work_orders`, `maintenance_parts`, `users`, `departments`, `locations`, `device_types`).
- **Thao tác**: Không thay đổi schema; thực hiện các câu truy vấn phức tạp `GROUP BY`, `JOIN`, `COUNT`, `SUM` để kết xuất số liệu.

#### 3.2.12.9. Phân quyền & bảo mật
Chặn triệt để `USER` truy cập các endpoint báo cáo tài chính và kiểm kê (trả về `403 Forbidden`).

#### 3.2.12.10. Kiểm thử
| ID | Chức Năng | Điều Kiện | Input | Expected | Actual | Status |
|:---:|---|---|---|---|---|:---:|
| **UG-13** | Dashboard KPI Stats | Đã xác thực | `GET /api/dashboard/stats` | Trả về 9 chỉ số hiệu năng vận hành | Tổng TB: 50, Hoạt động: 36 | **PASS** |
| **UG-14** | Preview Báo cáo Kiểm kê | Quyền Quản lý | `GET /api/reports/device-inventory/preview` | Trả về bảng xem trước danh mục tài sản | Xem trước 50 bản ghi thiết bị | **PASS** |
| **UG-15** | Preview Báo cáo Bảo trì | Quyền Quản lý | `GET /api/reports/maintenance/preview` | Trả về bảng xem trước phiếu bảo trì | Xem trước 76 bản ghi sự cố | **PASS** |
| **UG-16** | Preview Báo cáo Chi phí | Quyền Quản lý | `GET /api/reports/maintenance-cost/preview` | Trả về bảng chi phí & linh kiện | Xem trước 39 bản ghi chi phí | **PASS** |
| **UG-17** | Xuất File Excel (.xlsx) | Quyền Quản lý | `GET /api/reports/device-inventory/export?format=xlsx` | Stream file Excel nhị phân chuẩn | Tải về file Excel 14.645 bytes | **PASS** |

---

## 3.3. Thiết kế hệ thống

### 3.3.1. Thiết kế Kiến trúc Tổng thể (Hình 3.17)

```mermaid
graph TD
    subgraph "CLIENT TIER - VERCEL HOSTING"
        Browser[Trình duyệt Desktop / Mobile] --> PWA[PWA Shell & Service Worker]
        PWA --> ReactApp[React 18 SPA Components]
        ReactApp --> AxiosClient[Axios Interceptor withCredentials]
    end

    subgraph "APPLICATION TIER - RENDER HOSTING"
        AxiosClient -->|HTTPS REST API / JSON| Gateway[Express.js API Gateway]
        Gateway --> SecMid[Helmet + CORS Whitelist + Rate Limiter]
        SecMid --> AuthMid[Cookie & JWT HS256 Authenticator]
        AuthMid --> RBACMid[RBAC & IDOR/BOLA Guard]
        RBACMid --> Controllers[Controllers Layer]
        Controllers --> Services[Services Business Layer]
        Services --> Engines[4 Mathematical Decision Engines]
        Services --> Repos[Repositories Layer Prepared Statements]
    end

    subgraph "DATABASE TIER - TIDB CLOUD"
        Repos -->|TLSv1.2 Connection Pool| TiDB[(TiDB Serverless Distributed SQL)]
    end
```

---

### 3.3.4. Danh mục và thiết kế chi tiết RESTful API Endpoints

#### Bảng 3.29: Danh mục 24 RESTful API Endpoints Cốt Lõi
| STT | Phương Thức | Đường Dẫn API Endpoint | Chức Năng Nghiệp Vụ | Quyền Hạn Cho Phép |
|:---:|:---:|---|---|:---:|
| 1 | `POST` | `/api/auth/register` | Đăng ký tài khoản người dùng mới | Công khai |
| 2 | `POST` | `/api/auth/login` | Đăng nhập hệ thống & Cấp HttpOnly Cookie | Công khai |
| 3 | `GET` | `/api/auth/me` | Lấy thông tin người dùng hiện hành từ phiên | Đã đăng nhập |
| 4 | `POST` | `/api/auth/logout` | Đăng xuất & Hủy HttpOnly Cookie | Đã đăng nhập |
| 5 | `GET` | `/api/public/devices/qr/:token` | Tra cứu thông tin thiết bị công khai qua QR | Công khai |
| 6 | `GET` | `/api/devices` | Lấy danh sách hồ sơ thiết bị (Lọc & Phân trang) | `ADMIN`, `MANAGER`, `TECH` |
| 7 | `GET` | `/api/devices/:id` | Xem chi tiết hồ sơ lý lịch thiết bị | `ADMIN`, `MANAGER`, `TECH` |
| 8 | `POST` | `/api/devices` | Thêm mới hồ sơ thiết bị | `ADMIN`, `MANAGER` |
| 9 | `PUT` | `/api/devices/:id` | Cập nhật thông số kỹ thuật thiết bị | `ADMIN`, `MANAGER` |
| 10 | `DELETE` | `/api/devices/:id` | Xóa / Thanh lý thiết bị khỏi hệ thống | `ADMIN`, `MANAGER` |
| 11 | `POST` | `/api/maintenance` | Tạo phiếu báo hỏng sự cố mới | `USER`, `MANAGER`, `ADMIN` |
| 12 | `GET` | `/api/maintenance` | Lấy danh sách phiếu sự cố bảo trì | Tất cả Roles (Phân quyền) |
| 13 | `GET` | `/api/maintenance/:id` | Xem chi tiết phiếu yêu cầu bảo trì | Phân quyền IDOR |
| 14 | `POST` | `/api/maintenance/:id/assign` | Phân công Kỹ thuật viên xử lý sự cố | `ADMIN`, `MANAGER` |
| 15 | `POST` | `/api/maintenance/:id/start` | Kỹ thuật viên bắt đầu xử lý sự cố | `TECHNICIAN` (Phụ trách) |
| 16 | `POST` | `/api/maintenance/:id/waiting-part` | Báo tạm dừng chờ linh kiện thay thế | `TECHNICIAN` (Phụ trách) |
| 17 | `POST` | `/api/maintenance/:id/resume` | Tiếp tục xử lý sau khi có linh kiện | `TECHNICIAN` (Phụ trách) |
| 18 | `POST` | `/api/maintenance/:id/complete` | KTV hoàn thành sửa chữa & Gửi nghiệm thu | `TECHNICIAN` (Phụ trách) |
| 19 | `POST` | `/api/maintenance/:id/accept` | Người báo nghiệm thu ĐẠT & Đóng phiếu | `USER` (Người báo) |
| 20 | `GET` | `/api/assets/:id/health` | Tính toán điểm Sức khỏe tài sản (Phase 1) | `ADMIN`, `MANAGER`, `TECH` |
| 21 | `GET` | `/api/devices/:id/risk` | Đánh giá Nguy cơ rủi ro sự cố (Phase 2) | `ADMIN`, `MANAGER`, `TECH` |
| 22 | `GET` | `/api/devices/:id/priority` | Tính điểm Ưu tiên xử lý bảo trì (Phase 3) | `ADMIN`, `MANAGER`, `TECH` |
| 23 | `GET` | `/api/analytics/risk-matrix` | Lấy dữ liệu Ma trận Rủi ro 4 góc phần tư | `ADMIN`, `MANAGER`, `TECH` |
| 24 | `GET` | `/api/devices/:id/simulation` | Chạy mô phỏng What-If dự báo (Phase 4) | `ADMIN`, `MANAGER`, `TECH` |

#### Bảng 3.29b: Danh mục 10 RESTful API Endpoints Mới Nâng Cấp
| STT | Phương Thức | Đường Dẫn API Endpoint | Chức Năng Nghiệp Vụ Mới | Quyền Hạn Cho Phép |
|:---:|:---:|---|---|:---:|
| 25 | `GET` | `/api/notifications` | Lấy danh sách thông báo cá nhân (Phân trang, lọc) | Đã đăng nhập |
| 26 | `GET` | `/api/notifications/unread-count`| Lấy số lượng thông báo chưa đọc hiển thị Badge | Đã đăng nhập |
| 27 | `PATCH` | `/api/notifications/:id/read` | Đánh dấu 1 thông báo đã đọc | Đã đăng nhập (IDOR) |
| 28 | `PATCH` | `/api/notifications/read-all` | Đánh dấu toàn bộ thông báo đã đọc | Đã đăng nhập |
| 29 | `POST` | `/api/notifications/scan-system-alerts` | Quét tự động kích hoạt cảnh báo rủi ro hệ thống | `ADMIN`, `MANAGER` |
| 30 | `GET` | `/api/devices/:id/timeline` | Lấy dòng thời gian tổng hợp 5 bảng của thiết bị | `ADMIN`, `MANAGER`, `TECH` |
| 31 | `GET` | `/api/dashboard/stats` | Lấy 9 chỉ số KPI thời gian thực | `ADMIN`, `MANAGER`, `TECH` |
| 32 | `GET` | `/api/dashboard/charts` | Lấy dữ liệu 6 biểu đồ trực quan hóa rủi ro | `ADMIN`, `MANAGER`, `TECH` |
| 33 | `GET` | `/api/reports/:type/preview` | Xem trước dữ liệu 7 loại biểu mẫu báo cáo | `ADMIN`, `MANAGER`, `TECH` |
| 34 | `GET` | `/api/reports/:type/export` | Xuất tải file Excel (.xlsx) / CSV UTF-8 | `ADMIN`, `MANAGER`, `TECH` |

---

### 3.3.5. Thiết kế Cơ sở Dữ liệu: Sơ đồ ERD & Đặc tả 15 Bảng TiDB Cloud (Hình 3.16)

```mermaid
erDiagram
    roles ||--o{ users : "has role"
    departments ||--o{ users : "belongs to"
    departments ||--o{ devices : "manages"
    buildings ||--o{ locations : "contains"
    locations ||--o{ devices : "located at"
    device_types ||--o{ devices : "categorizes"
    suppliers ||--o{ devices : "supplies"
    users ||--o{ maintenance_requests : "reports"
    users ||--o{ maintenance_requests : "assigned tech"
    devices ||--o{ maintenance_requests : "applies to"
    maintenance_requests ||--o{ maintenance_histories : "logs"
    maintenance_requests ||--o{ maintenance_parts : "replaces"
    devices ||--o{ maintenance_work_orders : "generates"
    users ||--o{ maintenance_work_orders : "assigned tech"
    users ||--o{ attachments : "uploads"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "records"

    roles {
        int id PK
        varchar name
        varchar code UK
        varchar description
    }

    users {
        int id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar full_name
        int role_id FK
        int department_id FK
    }

    devices {
        int id PK
        varchar code UK
        varchar name
        varchar qr_token UK
        decimal purchase_price
        date purchase_date
        date warranty_expiry
        enum status
        enum business_criticality
        int location_id FK
        int device_type_id FK
    }

    maintenance_requests {
        int id PK
        varchar code UK
        varchar title
        text description
        enum priority
        int sla_hours
        timestamp due_at
        enum status
        decimal actual_cost
        int device_id FK
        int reporter_id FK
        int technician_id FK
    }

    maintenance_work_orders {
        int id PK
        varchar work_order_code UK
        varchar title
        enum status
        enum priority
        int device_id FK
        int assigned_to FK
    }
```

---

# CHƯƠNG 4. XÂY DỰNG VÀ TRIỂN KHAI CHƯƠNG TRÌNH

## 4.1. Môi trường phát triển và cấu hình
- Hệ điều hành: Windows 11 Pro 64-bit.
- Môi trường thực thi: Node.js v24.16.0 LTS & npm v11.x.
- Công cụ phát triển: Visual Studio Code, Git v2.45, Google Antigravity Agentic IDE.
- Trình duyệt kiểm thử: Google Chrome v128, Apple Safari Mobile (iOS 17/18).

## 4.2. Xây dựng 15 Phân hệ Giao diện Modern Enterprise Responsive
Giao diện người dùng được xây dựng hoàn chỉnh với 15 trang chức năng chuyên nghiệp:
- `LoginPage.jsx` & `RegisterPage.jsx`: Form xác thực hiện đại, loại bỏ hoàn toàn các thông tin cứng (*Hard-coded credentials*), bảo mật mật khẩu.
- `DashboardPage.jsx`: Trung tâm chỉ huy với 9 thẻ KPI thời gian thực và 6 biểu đồ Recharts phân tích đa chiều.
- `DeviceListPage.jsx` & `DeviceDetailPage.jsx`: Giao diện Responsive Dual-View tự động chuyển đổi giữa bảng dữ liệu chi tiết trên Desktop và dạng Thẻ thông tin (*Mobile Cards*) trên điện thoại.
- `QRScannerPage.jsx` & `PublicDevicePage.jsx`: Trình quét camera trực quan, tra cứu thông số máy và kích hoạt báo hỏng nhanh.
- `ReportIncidentPage.jsx`, `MyTicketsPage.jsx`, `TicketDetailPage.jsx`: Phân hệ quản lý vòng đời sự cố và biên bản nghiệm thu 5 sao.
- `TechnicianDashboardPage.jsx` & `WorkOrderListPage.jsx`: Bàn làm việc số hóa dành riêng cho kỹ thuật viên bảo trì.
- `RiskMatrixPage.jsx` & `PredictiveSimulationCard.jsx`: Trực quan hóa ma trận rủi ro và bảng điều khiển mô phỏng dự báo What-If.
- `NotificationPage.jsx` & `ReportsPage.jsx`: Trung tâm quản lý thông báo điều phối và bảng xuất bản 7 loại báo cáo chuyên sâu.

---

## 4.3. Bốn Động Cơ Toán Học Hỗ Trợ Ra Quyết Định (Phases 1–4 Engines)

### 4.3.1. Phase 1: Asset Health Score Engine (Hình 3.19)
- **Vị trí mã nguồn**: `backend/src/services/assetHealthService.js` và `healthRepository.js`.
- **Bảng trọng số 6 Nhân tố hao mòn**:

**Bảng 4.1: Bảng phân bổ trọng số 6 nhân tố tính toán Asset Health Score**
| Nhân Tố Hao Mòn | Trọng Số | Mô Tả & Quy Tắc Tính Điểm |
|---|:---:|---|
| **1. Tuổi thọ thiết bị (Age)** | **25%** | Tính theo tỷ lệ số tháng đã sử dụng trên tuổi thọ định mức: $\text{Ratio} = \frac{\text{Months Used}}{\text{Useful Life Months}}$. Nếu $\le 1$ năm đạt $100$đ; $\ge 5$ năm đạt $25$đ. |
| **2. Tần suất sự cố (Failure Frequency)** | **20%** | Số vụ báo hỏng trong năm: $0$ sự cố = $100$đ; $1$ sự cố = $80$đ; $2$ sự cố = $60$đ; $3-4$ sự cố = $40$đ; $\ge 5$ sự cố = $20$đ. |
| **3. Thời gian dừng máy (Downtime)** | **15%** | Tổng số giờ thiết bị ngừng hoạt động do sự cố: $0\text{h} = 100$đ; $\le 8\text{h} = 85$đ; $\le 24\text{h} = 60$đ; $\le 72\text{h} = 35$đ; $> 72\text{h} = 10$đ. |
| **4. Tỷ lệ chi phí sửa chữa (Cost Ratio)** | **15%** | Tỷ lệ chi phí sửa chữa lũy kế trên nguyên giá: $\text{Ratio} = \frac{\sum \text{Repair Cost}}{\text{Purchase Price}}$. Tỷ lệ $< 10\% = 100$đ; $\ge 60\% = 20$đ. |
| **5. Tuân thủ bảo dưỡng (PM Adherence)** | **15%** | Số ngày quá hạn bảo dưỡng định kỳ: Đúng hạn = $100$đ; quá hạn $\le 15$ ngày = $80$đ; $\le 30$ ngày = $60$đ; $\le 60$ ngày = $40$đ; $> 60$ ngày = $20$đ. |
| **6. Thời hạn bảo hành (Warranty)** | **10%** | Thiết bị còn trong hạn bảo hành chính hãng = $100$đ; đã hết hạn bảo hành = $40$đ. |

---

### 4.3.2. Phase 2: Failure Risk Score Engine (Hình 3.20)
- **Vị trí mã nguồn**: `backend/src/services/failureRiskService.js`.
- **Công thức tính toán**:
$$\text{Base Risk} = R_{\text{Sự cố 30 ngày}} \times 0.35 + R_{\text{Xu hướng sự cố}} \times 0.25 + R_{\text{Quá hạn PM}} \times 0.25 + R_{\text{Tăng chi phí}} \times 0.15$$
$$\text{Failure Risk Score} = \min\left(100, \text{Base Risk} \times K_{\text{Criticality}}\right)$$

---

### 4.3.3. Phase 3: Priority Score & Risk Matrix Engine (Hình 3.21)
- **Vị trí mã nguồn**: `backend/src/services/priorityService.js` và `src/repositories/priorityRepository.js`.
- **Công thức điểm ưu tiên**:
$$\text{Priority Score} = \text{Risk Score} \times 0.50 + \text{Business Criticality} \times 0.20 + \text{Asset Value} \times 0.15 + \text{Downtime Impact} \times 0.15$$

**Bảng 4.3: Ma trận rủi ro 4 góc phần tư và định hướng hành động kỹ thuật**
| Góc Phần Tư Ma Trận | Điều Kiện Ngưỡng Điểm | Hành Động Kỹ Thuật Tự Động Đề Xuất |
|---|---|---|
| **VÙNG ĐỎ (Critical Action)** | $\text{Risk} \ge 60$ và $\text{Priority} \ge 60$ | `EMERGENCY_MAINTENANCE`: Lập tức phát hành Work Order xử lý trong vòng 4-8 giờ. |
| **VÙNG CAM (High Priority PM)** | $\text{Risk} \ge 60$ và $\text{Priority} < 60$ | `SCHEDULE_MAINTENANCE`: Đưa vào lịch bảo dưỡng ngăn ngừa trong vòng 48 giờ. |
| **VÙNG VÀNG (Monitoring)** | $\text{Risk} < 60$ và $\text{Priority} \ge 60$ | `ROUTINE_INSPECTION`: Tăng cường kiểm tra hiện trường định kỳ hàng tuần. |
| **VÙNG XANH (Normal Operation)** | $\text{Risk} < 60$ và $\text{Priority} < 60$ | `MONITOR`: Thiết bị vận hành bình thường, theo dõi chu kỳ chuẩn. |

---

### 4.3.4. Phase 4: What-If Predictive Simulation Engine (Hình 3.22)
- **Vị trí mã nguồn**: `backend/src/services/predictiveSimulationService.js`.
- **Quy tắc toán học 2 Kịch bản**:
  1. *Kịch bản 1: Không can thiệp bảo trì (`NO_MAINTENANCE`)*:
     - Điểm sức khỏe suy giảm: $\Delta H = - \left(0.12 \times \text{Days} \times \frac{\text{Risk}}{50}\right)$
     - Nguy cơ sự cố gia tăng: $\Delta R = + \left(0.18 \times \text{Days} \times K_{\text{Age}}\right)$
  2. *Kịch bản 2: Thực hiện bảo dưỡng phục hồi ngay (`MAINTAIN_NOW`)*:
     - Điểm sức khỏe phục hồi: $H_{\text{Projected}} = \min(100, H_{\text{Current}} + 25)$
     - Nguy cơ rủi ro giảm sâu: $R_{\text{Projected}} = \max(10, R_{\text{Current}} \times 0.40)$
- **Nguyên tắc kỹ thuật**: **100% In-Memory Calculation**, tính toán tức thời $(< 20\text{ms})$, **Deterministic 100% (0% Math.random())**, tuyệt đối **không ghi dữ liệu giả định vào MySQL/TiDB Cloud**.

---

## 4.8. Cài đặt Trung tâm Thông báo, Lịch sử Hoạt động và Phân hệ Báo cáo Chuyên sâu

### 4.8.1. Cài đặt Phân hệ Trung tâm Thông báo (Notification Center)
- Backend phát triển `notificationService.js` và `maintenanceService.js` để tự động điều phối thông báo cho tất cả `ADMIN` và `MANAGER` khi tiếp nhận sự cố.
- Cài đặt `POST /api/notifications/scan-system-alerts` cho phép quét CSDL tìm kiếm các thiết bị nguy cơ rủi ro cao để tạo cảnh báo phòng ngừa.
- Frontend cài đặt `NotificationPage.jsx` với bộ lọc trạng thái, phân trang và thao tác đánh dấu đã đọc mượt mà.

### 4.8.2. Cài đặt Phân hệ Lịch sử Hoạt động Thiết bị (Device Activity Timeline)
- Backend cài đặt `deviceService.getDeviceTimeline()` tổng hợp dữ liệu thời gian thực từ 5 bảng: `devices`, `maintenance_requests`, `maintenance_histories`, `maintenance_work_orders`, `audit_logs`.
- Frontend phát triển Component [`DeviceActivityTimeline.jsx`](file:///d:/LAMm/frontend/src/components/devices/DeviceActivityTimeline.jsx) tích hợp tại tab Lịch sử [`DeviceDetailPage.jsx`](file:///d:/LAMm/frontend/src/pages/devices/DeviceDetailPage.jsx).

### 4.8.3. Cài đặt Bảng Điều Khiển & Xuất Báo Cáo Excel Chuyên Nghiệp
- Dashboard trực quan hóa 9 thẻ KPI thời gian thực và 6 biểu đồ Recharts phân tích xu hướng.
- Phân hệ Báo cáo hỗ trợ xem trước (Preview) và xuất bản 7 loại báo cáo chuẩn hóa ra file Excel (`.xlsx`) thông qua thư viện `ExcelJS` với tiêu đề, đường viền và định dạng tiền tệ chuyên nghiệp.

---

# CHƯƠNG 5. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG

## 5.1. Mục tiêu và phương pháp kiểm thử
Xác minh tính đúng đắn của toàn bộ các luồng nghiệp vụ, bảo mật xác thực, phân quyền chống IDOR, độ chính xác số học của 4 Động cơ toán học và 3 phân hệ mới nâng cấp trên dữ liệu thực tế.

## 5.2. Bảng Tổng Hợp Kết Quả 8 Bộ Kiểm Thử Tự Động (153/153 PASS 100%)

**Bảng 5.1: Kết quả kiểm thử tự động toàn diện hệ thống AssetCare**
| STT | Tên Bộ Kiểm Thử (Test Suite) | File Thực Thi | Số Ca Test | Kết Quả Thực Tế | Trạng Thái |
|:---:|---|---|:---:|:---:|:---:|
| 1 | **Security Hardening & OWASP Top 10** | `test_security_hardening_suite.js` | 36 / 36 | **36 PASS (100%)** | Hoàn thành |
| 2 | **QR Code & Authentication Flow** | `test_qr_auth_flow_suite.js` | 7 / 7 | **7 PASS (100%)** | Hoàn thành |
| 3 | **Phase 1: Asset Health Engine** | `test_phase1_health_suite.js` | 11 / 11 | **11 PASS (100%)** | Hoàn thành |
| 4 | **Phase 2: Failure Risk Engine** | `test_phase2_risk_suite.js` | 20 / 20 | **20 PASS (100%)** | Hoàn thành |
| 5 | **Phase 3: Priority & Work Orders** | `test_phase3_priority_suite.js` | 20 / 20 | **20 PASS (100%)** | Hoàn thành |
| 6 | **Phase 4: What-If Simulation** | `test_phase4_simulation_suite.js` | 27 / 27 | **27 PASS (100%)** | Hoàn thành |
| 7 | **Multi-Role Lifecycle Sync (4 Roles)**| `test_multi_role_sync_suite.js` | 15 / 15 | **15 PASS (100%)** | Hoàn thành |
| 8 | **Upgraded Features (Notif, Timeline, Reports)** | `test_upgrade_modules_suite.js` | 17 / 17 | **17 PASS (100%)** | Hoàn thành |
| **TỔNG**| **8 BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN** | `run_all_tests.js` | **153 / 153** | **153 PASS (100%)** | **XUẤT SẮC** |

---

## 5.7. Kiểm thử 3 Nhóm Chức Năng Nâng Cấp Mới (17/17 PASS)

**Bảng 5.2: Bảng chi tiết 17 ca kiểm thử Module 8 (Upgraded Features Suite)**
| ID | Chức Năng | Điều Kiện | Input Dữ Liệu | Kết Quả Mong Đợi | Kết Quả Thực Tế | Status |
|:---:|---|---|---|---|---|:---:|
| **UG-01** | Xác thực 4 Roles | Tài khoản hoạt động | Admin, Manager, Tech, User credentials | Đăng nhập thành công, cấp token/cookie | Trả về 200 OK & User profile | **PASS** |
| **UG-02** | Danh sách thông báo | Admin đã đăng nhập | `GET /api/notifications?limit=5` | Trả về danh sách thông báo cá nhân | Trả về 5 thông báo mới nhất | **PASS** |
| **UG-03** | Phân trang thông báo | Gọi kèm limit | `GET /api/notifications?limit=5` | Meta chứa total, page, limit | Meta total > 0 chuẩn xác | **PASS** |
| **UG-04** | Đếm chưa đọc | User có thông báo | `GET /api/notifications/unread-count` | Trả về số lượng unreadCount $\ge 0$ | unreadCount = 26 | **PASS** |
| **UG-05** | Đánh dấu đã đọc tất cả | Admin thao tác | `PATCH /api/notifications/read-all` | Cập nhật `is_read = 1` toàn bộ | unreadCount về 0 thành công | **PASS** |
| **UG-06** | Quét cảnh báo hệ thống | Quyền Admin/Manager | `POST /api/notifications/scan-system-alerts` | Quét rủi ro và tạo cảnh báo tự động | Kích hoạt 105 cảnh báo thành công | **PASS** |
| **UG-07** | Chặn User quét cảnh báo | Quyền User thường | `POST /api/notifications/scan-system-alerts` | RBAC từ chối 403 Forbidden | HTTP 403 Forbidden chuẩn xác | **PASS** |
| **UG-08** | Lấy Timeline thiết bị | Thiết bị ID 1 tồn tại | `GET /api/devices/1/timeline` | Trả về mảng sự kiện tổng hợp | Trả về 20 sự kiện dòng thời gian | **PASS** |
| **UG-09** | Cấu trúc Timeline Event | Sự kiện hợp lệ | Trích xuất phần tử đầu tiên | Đủ eventType, title, timestamp, metadata | Khớp 100% định dạng chuẩn | **PASS** |
| **UG-10** | Phân trang Timeline | Truy vấn page & limit | `GET /api/devices/1/timeline?page=1&limit=3` | Trả về phân trang chuẩn | Trang 1 / 44 sự kiện | **PASS** |
| **UG-11** | Lọc Timeline theo loại | Loại sự kiện INCIDENT | `GET /api/devices/1/timeline?type=INCIDENT` | Chỉ trả về sự kiện sự cố | Lọc đúng 20 sự kiện INCIDENT | **PASS** |
| **UG-12** | Timeline thiết bị không tồn tại | Thiết bị ID 999999 | `GET /api/devices/999999/timeline` | Báo lỗi không tìm thấy | HTTP 404 Not Found | **PASS** |
| **UG-13** | Dashboard KPI Stats | Đã xác thực | `GET /api/dashboard/stats` | Trả về 9 chỉ số hiệu năng vận hành | Tổng TB: 50, Hoạt động: 36 | **PASS** |
| **UG-14** | Preview Báo cáo Kiểm kê | Quyền Quản lý | `GET /api/reports/device-inventory/preview` | Trả về bảng xem trước danh mục tài sản | Xem trước 50 bản ghi thiết bị | **PASS** |
| **UG-15** | Preview Báo cáo Bảo trì | Quyền Quản lý | `GET /api/reports/maintenance/preview` | Trả về bảng xem trước phiếu bảo trì | Xem trước 76 bản ghi sự cố | **PASS** |
| **UG-16** | Preview Báo cáo Chi phí | Quyền Quản lý | `GET /api/reports/maintenance-cost/preview` | Trả về bảng chi phí & linh kiện | Xem trước 39 bản ghi chi phí | **PASS** |
| **UG-17** | Xuất File Excel (.xlsx) | Quyền Quản lý | `GET /api/reports/device-inventory/export?format=xlsx` | Stream file Excel nhị phân chuẩn | Tải về file Excel 14.645 bytes | **PASS** |

---

## 5.8. Kiểm thử Nghiệm thu Người dùng (User Acceptance Testing - UAT)

**Bảng 5.3: Bảng kịch bản kiểm thử nghiệm thu người dùng (UAT Checklist mở rộng)**
| Mã UAT | Kịch Bản Nghiệp Vụ Người Dùng Thực Tế | Actor | Các Bước Thực Hiện | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
|:---:|---|:---:|---|---|---|:---:|
| **UAT-01** | Báo hỏng qua QR di động | `USER` | 1. Quét QR bằng Camera<br>2. Nhập mô tả lỗi & chụp ảnh<br>3. Bấm gửi yêu cầu | Tạo phiếu PENDING trong $< 30\text{s}$, nhận mã phiếu | Tạo phiếu thành công trong 22s | **PASS** |
| **UAT-02** | Phân công KTV & Cam kết SLA | `MANAGER` | 1. Mở danh sách sự cố<br>2. Chọn KTV phù hợp<br>3. Gắn SLA hạn chót 4h | Chuyển sang ASSIGNED, gửi thông báo KTV | Phân công thành công | **PASS** |
| **UAT-03** | KTV tiếp nhận & Xử lý hiện trường | `TECHNICIAN` | 1. Xem hàng đợi việc<br>2. Bấm Bắt đầu làm<br>3. Nhập biên bản & chi phí | Cập nhật IN_PROGRESS $\to$ COMPLETED | Hoàn tất sửa chữa mượt mà | **PASS** |
| **UAT-04** | Người dùng nghiệm thu 5 sao | `USER` | 1. Nhận thông báo hoàn tất<br>2. Kiểm tra máy thực tế<br>3. Đánh giá 5 sao & Đóng phiếu | Chuyển sang CLOSED, kích hoạt tính lại Health Score | Đóng phiếu thành công | **PASS** |
| **UAT-NEW-01**| Điều phối qua Notification Center | `ADMIN`, `MANAGER`| 1. User báo hỏng<br>2. Quản lý kiểm tra chuông thông báo<br>3. Bấm xem chi tiết | Badge đỏ hiển thị tức thì, mở đúng phiếu sự cố | Nhận thông báo tức thì | **PASS** |
| **UAT-NEW-02**| Tra cứu Dòng thời gian Thiết bị | `TECHNICIAN` | 1. Mở chi tiết thiết bị<br>2. Chọn tab History<br>3. Lọc sự kiện INCIDENT | Hiển thị đầy đủ mốc thời gian, chi phí, nguyên nhân | Hiển thị 20 mốc sự kiện chuẩn | **PASS** |
| **UAT-NEW-03**| Xem trước & Xuất Báo cáo Excel | `MANAGER` | 1. Mở phân hệ Báo cáo<br>2. Xem trước bảng dữ liệu<br>3. Bấm Xuất Excel (.xlsx) | Tải file Excel có định dạng tiêu đề tiếng Việt và VND | File Excel mở chuẩn xác | **PASS** |

---

## 5.9. Kiểm thử Đóng gói Production Build & Đánh giá Sẵn sàng Triển khai
- **Kết quả Production Build**: `npm run build` trong `frontend/` hoàn thành trong **11.61 giây**, 0 lỗi cú pháp, 0 cảnh báo, sinh Service Worker PWA tự động (`dist/sw.js`).
- **Đánh giá mức độ sẵn sàng triển khai Bổ sung (Additional Production Readiness Verification)**:
  - *Tính năng sẵn sàng (Functional Readiness)*: 153/153 ca kiểm thử tự động đạt 100%.
  - *Bảo mật sẵn sàng (Security Readiness)*: Đạt 24/24 tiêu chí an ninh OWASP, cờ HttpOnly Cookie, CORS Whitelist, Rate Limiting chống Brute-force.
  - *Hiệu năng sẵn sàng (Performance Readiness)*: Tải trang ban đầu $< 1.2\text{s}$, phản hồi API trung bình $< 50\text{ms}$.
  - *Cơ sở dữ liệu sẵn sàng (Database Readiness)*: TiDB Cloud Serverless kết nối ổn định, sao lưu tự động hàng ngày.
  - *Hạ tầng sẵn sàng (Deployment Readiness)*: Sẵn sàng vận hành phân tán trên Vercel Edge CDN và Render Web Service.
- **Điểm đánh giá sẵn sàng triển khai tổng thể**: **99 / 100 Điểm**.

---

# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 6.1. Kết quả đạt được của đồ án
1. Xây dựng thành công hệ thống thông tin quản lý tài sản và bảo trì thiết bị đại học chuẩn hóa, hiện đại cho Đại học UTT.
2. Tối ưu hóa trải nghiệm người dùng thông qua mã QR Code định danh, hỗ trợ báo hỏng di động chỉ trong 30 giây.
3. Hoàn thiện quy trình Lệnh công tác khép kín giữa 4 vai trò (User, Manager, Technician, Admin), gắn kết chặt chẽ với cam kết SLA và minh bạch hóa chi phí linh kiện.
4. Triển khai thành công **Bộ 4 Động Cơ Toán Học (Phase 1–4)**, giúp Nhà trường chuyển dịch từ bảo trì thụ động sang bảo trì dự báo thông minh.
5. Bổ sung hoàn thiện 3 Phân hệ nâng cao: **Notification Center**, **Device Activity Timeline** và **Advanced Dashboard & Reporting** xuất Excel chuyên nghiệp.
6. Vượt qua 100% trên toàn bộ **153 ca kiểm thử tự động thuộc 8 bộ test**, đảm bảo an ninh thông tin theo tiêu chuẩn quốc tế.

## 6.2. Hướng phát triển trong tương lai
- **Tích hợp cảm biến IoT (Internet of Things)**: Kết nối cảm biến dòng điện, nhiệt độ và độ rung tại các phòng máy chủ và phòng Lab AI để tự động đẩy dữ liệu đo lường thời gian thực vào động cơ Phase 1 & 2.
- **Ứng dụng Trí tuệ Nhân tạo (AI & Computer Vision)**: Sử dụng mô hình học sâu (*Deep Learning*) để tự động phân tích ảnh chụp sự cố từ camera điện thoại, nhận dạng loại hư hỏng và tự động đề xuất linh kiện thay thế tương ứng.
- **Thông báo đa kênh (Omnichannel Notifications)**: Mở rộng kênh gửi thông báo tự động qua Email SMTP và Telegram Bot cho Ban Quản trị và Kỹ thuật viên trực ban.

---

# PHỤ LỤC: MA TRẬN YÊU CẦU - CHỨC NĂNG - API - DATABASE

| Yêu Cầu | Chức Năng Triển Khai | API Endpoint Liên Quan | Bảng CSDL Tác Động |
|---|---|---|---|
| **FR-01** | Đăng ký & Đăng nhập | `POST /api/auth/register`, `POST /api/auth/login` | `users`, `roles`, `audit_logs` |
| **FR-05** | Quét QR Code | `GET /api/public/devices/qr/:token` | `devices`, `locations`, `device_types` |
| **FR-06** | Tạo phiếu báo hỏng | `POST /api/maintenance` | `maintenance_requests`, `attachments`, `notifications` |
| **FR-07** | Phân công KTV | `POST /api/maintenance/:id/assign` | `maintenance_requests`, `maintenance_histories`, `notifications` |
| **FR-08** | Xử lý Work Order | `POST /api/maintenance/:id/start`, `/complete` | `maintenance_requests`, `maintenance_parts`, `maintenance_histories` |
| **FR-09** | Nghiệm thu đóng phiếu| `POST /api/maintenance/:id/accept` | `maintenance_requests`, `maintenance_histories`, `notifications` |
| **FR-11** | Phase 1: Health Score | `GET /api/assets/:id/health` | `devices`, `maintenance_requests`, `maintenance_schedules` |
| **FR-12** | Phase 2: Failure Risk | `GET /api/devices/:id/risk` | `devices`, `maintenance_requests`, `maintenance_histories` |
| **FR-13** | Phase 3: Risk Matrix | `GET /api/analytics/risk-matrix` | `devices`, `device_types`, `departments` |
| **FR-14** | Phase 4: Simulation | `GET /api/devices/:id/simulation` | Thuần túy In-Memory (0% ghi CSDL) |
| **FR-16** | Notification Center | `GET /api/notifications`, `POST /api/notifications/scan-system-alerts` | `notifications`, `users`, `devices` |
| **FR-17** | Device Activity Timeline | `GET /api/devices/:id/timeline` | `devices`, `maintenance_requests`, `maintenance_work_orders`, `audit_logs` |
| **FR-18** | Advanced Reporting | `GET /api/reports/:type/preview`, `/export` | `devices`, `maintenance_requests`, `maintenance_work_orders`, `maintenance_parts` |

---

# ĐỐI CHIẾU BÁO CÁO VỚI SOURCE CODE THỰC TẾ

| Tiêu Chí Đối Soát | Kết Quả Đối Soát Từ Mã Nguồn & Database Thực Tế | Trạng Thái Xác Minh |
|---|---|:---:|
| **Ngôn ngữ & Framework** | Frontend: React 18 / Vite / TailwindCSS; Backend: Node.js / Express.js; Database: TiDB Cloud (MySQL 8.0). | **ĐÃ XÁC MINH 100%** |
| **Cơ cấu Phân quyền** | Đúng 4 Roles: `ADMIN`, `MANAGER`, `TECHNICIAN`, `USER`. | **ĐÃ XÁC MINH 100%** |
| **Cấu trúc Bảng CSDL** | Đúng 15 bảng nghiệp vụ thực tế trong TiDB Cloud (`devices`, `maintenance_requests`, `notifications`, `maintenance_work_orders`...). | **ĐÃ XÁC MINH 100%** |
| **Hệ thống REST API** | Toàn bộ 34 endpoints được ánh xạ chính xác với các Controller và Service thực tế. | **ĐÃ XÁC MINH 100%** |
| **Công thức Phase 1–4** | Khớp 100% công thức toán học và logic trong `assetHealthService`, `failureRiskService`, `priorityService`, `predictiveSimulationService`. | **ĐÃ XÁC MINH 100%** |
| **Số liệu Kiểm thử** | Khớp chính xác 153/153 test cases đã vượt qua thực tế trong 8 test suites. | **ĐÃ XÁC MINH 100%** |

---

# CHANGELOG — CHỨC NĂNG BỔ SUNG

| STT | Chức Năng Bổ Sung | Chương/Mục Được Bổ Sung | Frontend | Backend | API | Database | Test Suite |
|:---:|---|---|---|---|---|---|:---:|
| 1 | **Notification Center & System Alerts** | Mục 3.1.3 (FR-16), Mục 3.2.10, Mục 4.8.1, Mục 5.7, Mục 5.8 | `NotificationPage.jsx`, Header Bell Dropdown, `notificationService.js` | `notificationController.js`, `notificationService.js`, `notificationRepository.js` | `GET/PATCH /api/notifications`, `POST /api/notifications/scan-system-alerts` | Bảng `notifications` | Suite 8 (UG-01 $\to$ UG-07) |
| 2 | **Device Activity Timeline Aggregator** | Mục 3.1.3 (FR-17), Mục 3.2.11, Mục 4.8.2, Mục 5.7, Mục 5.8 | `DeviceActivityTimeline.jsx`, `DeviceDetailPage.jsx`, `deviceService.js` | `deviceController.js`, `deviceService.js`, `deviceRoutes.js` | `GET /api/devices/:id/timeline` | 5 Bảng (`devices`, `requests`, `histories`, `work_orders`, `audit_logs`) | Suite 8 (UG-08 $\to$ UG-12) |
| 3 | **Advanced Dashboard & 7 Reports** | Mục 3.1.3 (FR-18), Mục 3.2.12, Mục 4.8.3, Mục 5.7, Mục 5.8 | `ReportsPage.jsx`, `DashboardPage.jsx`, `reportService.js` | `reportController.js`, `reportService.js`, `reportRepository.js`, `dashboardService.js` | `GET /api/dashboard/stats`, `/charts`, `GET /api/reports/:type/preview`, `/export` | 8 Bảng CSDL nghiệp vụ | Suite 8 (UG-13 $\to$ UG-17) |

---

# BASELINE PRESERVATION CHECK

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
