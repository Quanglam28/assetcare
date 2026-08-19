const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asset_maintenance_system',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+07:00',
  dateStrings: true,
});

async function seedDemoData() {
  console.log('================================================================================================');
  console.log('🌱 MODULE 18: TẠO DỮ LIỆU DEMO CHUẨN MÔI TRƯỜNG ĐẠI HỌC VIỆT NAM (REALISTIC DEMO DATASET)');
  console.log('================================================================================================\n');

  const connection = await pool.getConnection();

  try {
    // 0. Đảm bảo 3 bảng asset_health_scores, asset_risk_assessments, asset_health_history đã tồn tại
    const { runMigration } = require('./scripts/migrate_asset_health');
    await runMigration();

    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. Dọn dẹp dữ liệu cũ
    console.log('--- 1. Xóa sạch dữ liệu cũ để chuẩn hóa dữ liệu demo mới ---');
    const tables = [
      'asset_health_history',
      'asset_risk_assessments',
      'asset_health_scores',
      'attachments',
      'notifications',
      'maintenance_parts',
      'maintenance_histories',
      'maintenance_schedules',
      'maintenance_requests',
      'devices',
      'suppliers',
      'device_types',
      'users',
      'locations',
      'buildings',
      'departments',
      'roles',
    ];

    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE \`${table}\`;`);
    }

    // 2. Tạo Roles
    console.log('--- 2. Tạo Danh Mục Vai Trò (Roles) ---');
    await connection.query(`
      INSERT INTO roles (id, code, name, description) VALUES
      (1, 'ADMIN', 'Quản trị viên hệ thống', 'Toàn quyền quản trị hệ thống, danh mục, tài khoản và cấu hình'),
      (2, 'MANAGER', 'Ban Quản trị & Điều phối tài sản', 'Quản lý tài sản phòng ban, phê duyệt và giao việc kỹ thuật viên, xem báo cáo'),
      (3, 'TECHNICIAN', 'Kỹ thuật viên bảo trì', 'Tiếp nhận sự cố, sửa chữa, thay linh kiện, cập nhật tiến độ kỹ thuật'),
      (4, 'USER', 'Giảng viên & Người sử dụng', 'Quét mã QR, xem thông tin tài sản, gửi báo hỏng và nghiệm thu thiết bị');
    `);

    // 3. Tạo Departments
    console.log('--- 3. Tạo Danh Mục Khoa / Phòng Ban (Departments) ---');
    await connection.query(`
      INSERT INTO departments (id, code, name, description) VALUES
      (1, 'PHONG_QTCSVC', 'Phòng Quản trị Cơ sở Vật chất & Thiết bị', 'Đơn vị phụ trách quản lý, kiểm kê và bảo trì toàn bộ tài sản nhà trường'),
      (2, 'KHOA_CNTT', 'Khoa Công nghệ Thông tin & Trí tuệ Nhân tạo', 'Quản lý hệ thống máy tính Lab, phòng thực hành mạng và phần mềm'),
      (3, 'KHOA_DDT', 'Khoa Điện - Điện tử & Tự động hóa', 'Quản lý xưởng thực hành vi điều khiển, PLC và đo lường'),
      (4, 'TT_TTTV', 'Trung tâm Thông tin - Thư viện số', 'Quản lý phòng đọc, hệ thống tra cứu và cơ sở dữ liệu số'),
      (5, 'PHONG_QLDT', 'Phòng Quản lý Đào tạo & Khảo thí', 'Quản lý phòng máy thi trắc nghiệm và phòng học đa phương tiện');
    `);

    // 4. Tạo 3 Buildings (Trường Đại học Công nghệ Giao thông Vận tải - UTT)
    console.log('--- 4. Tạo 3 Tòa Nhà Đại Học Công Nghệ GTVT (Buildings) ---');
    await connection.query(`
      INSERT INTO buildings (id, code, name, description) VALUES
      (1, 'NHA-H1', 'Tòa Nhà H1 - Khu Giảng Đường & Hội Trường Lớn (Cơ sở Triều Khúc - UTT)', 'Tòa nhà giảng đường lý thuyết 5 tầng gồm các hội trường lớn và phòng học trung tâm'),
      (2, 'NHA-H2', 'Tòa Nhà H2 - Khu Giảng Đường Thực Hành & Phòng Lab CNTT', 'Tòa nhà kỹ thuật 6 tầng gồm hệ thống phòng máy tính Lab, phòng thực hành IoT và AI'),
      (3, 'NHA-H3', 'Tòa Nhà H3 - Trung Tâm Thông Tin Thư Viện & Nhà Điều Hành UTT', 'Tòa nhà điều hành 7 tầng gồm trung tâm dữ liệu Server DC, thư viện số và văn phòng');
    `);

    // 5. Tạo 10 Locations
    console.log('--- 5. Tạo 10 Vị Trí / Phòng Học (Locations) ---');
    await connection.query(`
      INSERT INTO locations (id, building_id, code, room_name, floor, type, description) VALUES
      (1, 1, 'LOC-H101', 'Hội trường Lớn H101 (250 chỗ)', 1, 'HALL', 'Hội trường phục vụ hội thảo, lễ khai giảng và đại học đại chúng'),
      (2, 1, 'LOC-H202', 'Phòng học Đa phương tiện H202', 2, 'CLASSROOM', 'Phòng học thông minh trang bị màn hình tương tác và camera bài giảng'),
      (3, 1, 'LOC-H305', 'Phòng Hội thảo Quốc tế H305', 3, 'MEETING_ROOM', 'Phòng hội thảo chuyên đề cao cấp trang bị hệ thống âm thanh vòm'),
      (4, 2, 'LOC-H101B', 'Xưởng Thực hành Điện - Tự Động Hóa H101', 1, 'LAB', 'Phòng thực hành trang bị biến tần, động cơ và tủ điều khiển PLC'),
      (5, 2, 'LOC-H204', 'Phòng Lab Máy tính Chuyên dụng H204', 2, 'LAB', 'Phòng Lab 45 máy tính All-in-One cấu hình cao phục vụ lập trình'),
      (6, 2, 'LOC-H205', 'Phòng Lab Trí tuệ Nhân tạo AI & Robot H205', 2, 'LAB', 'Phòng nghiên cứu Machine Learning trang bị GPU Workstation'),
      (7, 2, 'LOC-H301', 'Phòng Thí nghiệm Mạng & An toàn Thông tin H301', 3, 'LAB', 'Phòng thực hành Cisco Router, Switch và an ninh mạng'),
      (8, 3, 'LOC-H101C', 'Thư viện Số & Không gian Tự học H101', 1, 'OFFICE', 'Khu vực tra cứu tài liệu số và phòng đọc yên tĩnh cho sinh viên'),
      (9, 3, 'LOC-H201', 'Phòng Họp Hội đồng Trường H201', 2, 'MEETING_ROOM', 'Phòng họp ban giám hiệu trang bị màn hình LED siêu nét và họp trực tuyến'),
      (10, 3, 'LOC-H302', 'Trung tâm Dữ liệu & Server Data Center H302', 3, 'SERVER_ROOM', 'Phòng máy chủ trung tâm máy lạnh chính xác và sàn nâng kỹ thuật');
    `);

    // 6. Tạo 10 Device Types
    console.log('--- 6. Tạo 10 Loại Thiết Bị (Device Types) ---');
    await connection.query(`
      INSERT INTO device_types (id, code, name, category, maintenance_interval_days, description) VALUES
      (1, 'DT-PROJECTOR', 'Máy chiếu Laser & Siêu nét', 'EQUIPMENT', 90, 'Máy chiếu độ sáng cao 4500-6000 Lumens cho giảng đường'),
      (2, 'DT-PC-AIO', 'Máy vi tính All-in-One', 'IT', 60, 'Máy vi tính liền màn hình chuyên dụng cho bàn giảng viên'),
      (3, 'DT-PC-WORKSTATION', 'Máy trạm Workstation Đồ họa & AI', 'IT', 90, 'Máy trạm cấu hình cao GPU rời phục vụ thực hành AI và thiết kế'),
      (4, 'DT-AC-INVERTER', 'Điều hòa Không khí Âm trần Inverter', 'ELECTRONIC', 90, 'Điều hòa 24.000 - 36.000 BTU làm mát phòng học và giảng đường'),
      (5, 'DT-TOUCH-SCREEN', 'Màn hình Tương tác Thông minh 86"', 'EQUIPMENT', 120, 'Màn hình cảm ứng đa điểm 4K viết vẽ kỹ thuật số'),
      (6, 'DT-CORE-SWITCH', 'Thiết bị Chuyển mạch Core Switch Layer 3', 'NETWORK', 180, 'Switch quản lý mạng Gigabit 48 Port hỗ trợ PoE+'),
      (7, 'DT-WIFI-AP', 'Bộ phát Wifi Doanh nghiệp Wifi 6', 'NETWORK', 90, 'Access Point gắn trần phủ sóng băng thông rộng'),
      (8, 'DT-PRINTER-LASER', 'Máy in Laser Đa chức năng', 'OFFICE', 60, 'Máy in mạng, photocopy, scan tốc độ cao 35 trang/phút'),
      (9, 'DT-UPS-ONLINE', 'Bộ lưu điện UPS Online 6kVA - 10kVA', 'ELECTRONIC', 90, 'Nguồn điện dự phòng liên tục cho Server và thiết bị mạng'),
      (10, 'DT-SOUND-AMP', 'Hệ thống Âm ly & Loa Trợ giảng', 'AUDIO_VISUAL', 90, 'Bộ tăng âm và micro không dây UHF chống hú giảng đường');
    `);

    // 7. Tạo 5 Suppliers
    console.log('--- 7. Tạo 5 Nhà Cung Cấp Uy Tín (Suppliers) ---');
    await connection.query(`
      INSERT INTO suppliers (id, code, name, contact_person, email, phone, address) VALUES
      (1, 'SUP-FPT', 'Công ty TNHH Hệ thống Thông tin FPT (FPT IS)', 'Ông Hoàng Quốc Bảo', 'contact@fpt-is.com.vn', '02473007300', 'Tòa nhà FPT Cầu Giấy, Phố Duy Tân, Hà Nội'),
      (2, 'SUP-PHONGVU', 'Công ty Cổ phần Thương mại Dịch vụ Phong Vũ', 'Bà Vũ Minh Ngọc', 'b2b@phongvu.vn', '18006867', 'Tòa nhà Phong Vũ, 264 Nguyễn Thị Minh Khai, Q.3, TP.HCM'),
      (3, 'SUP-VIETTEL', 'Tổng Công ty Giải pháp Doanh nghiệp Viettel (Viettel Solutions)', 'Ông Đặng Đức Cường', 'support@viettelsolutions.vn', '18008000', 'Tòa nhà Viettel, Số 1 Trần Hữu Dực, Nam Từ Liêm, Hà Nội'),
      (4, 'SUP-SAOMAI', 'Công ty Cổ phần Tập đoàn Công nghệ Sao Mai', 'Ông Trần Anh Tuấn', 'info@saomaigroup.vn', '02838345678', 'Số 52 Đặng Dung, Phường Tân Định, Quận 1, TP.HCM'),
      (5, 'SUP-DAIKIN', 'Công ty Cổ phần Daikin Air Conditioning Vietnam', 'Bà Lê Thảo Trang', 'service@daikin.com.vn', '18006777', 'Tầng 12, Tòa nhà Nam Á, 201-203 Cách Mạng Tháng 8, Q.3, TP.HCM');
    `);

    // 8. Tạo Users & Technicians (Password: "password123")
    console.log('--- 8. Tạo Người Dùng & Kỹ Thuật Viên (Users & Technicians) ---');
    const passwordHash = await bcrypt.hash('password123', 10);

    const userSeed = [
      // 1 Admin: Phạm Quang Lâm
      [1, 1, 1, 'admin', passwordHash, 'Phạm Quang Lâm', 'phamquanglam.admin@utt.edu.vn', '0901234567', 'ACTIVE'],
      // 2 Managers: Tống Quang Trung & Dư Thị Kim Thu
      [2, 2, 1, 'manager', passwordHash, 'Tống Quang Trung', 'tongquangtrung.manager@utt.edu.vn', '0902345678', 'ACTIVE'],
      [3, 2, 2, 'manager_thu', passwordHash, 'Dư Thị Kim Thu', 'duthikimthu.cs@utt.edu.vn', '0903456789', 'ACTIVE'],
      // 5 Technicians: Vũ Hải Vịnh, Lê Huy Hoàng, Trần Minh Đức...
      [4, 3, 1, 'tech_nam', passwordHash, 'Vũ Hải Vịnh', 'vuhai.vinh.tech@utt.edu.vn', '0912345671', 'ACTIVE'],
      [5, 3, 1, 'tech_hoang', passwordHash, 'KTV. Lê Huy Hoàng', 'huyhoang.tech@utt.edu.vn', '0912345672', 'ACTIVE'],
      [6, 3, 1, 'tech_duc', passwordHash, 'KTV. Trần Minh Đức', 'minhduc.tech@utt.edu.vn', '0912345673', 'ACTIVE'],
      [7, 3, 1, 'tech_quang', passwordHash, 'KTV. Đỗ Nhật Quang', 'nhatquang.tech@utt.edu.vn', '0912345674', 'ACTIVE'],
      [8, 3, 1, 'tech_linh', passwordHash, 'KTV. Hoàng Khánh Linh', 'khanhlinh.tech@utt.edu.vn', '0912345675', 'ACTIVE'],
      // 7 Regular Users (Giảng viên / Sinh viên / Chuyên viên UTT)
      [9, 4, 2, 'user_ha', passwordHash, 'TS. Nguyễn Thu Hà', 'thuha.gv@utt.edu.vn', '0981122334', 'ACTIVE'],
      [10, 4, 2, 'user_tuan', passwordHash, 'ThS. Lê Minh Tuấn', 'minhtuan.gv@utt.edu.vn', '0982233445', 'ACTIVE'],
      [11, 4, 3, 'user_mai', passwordHash, 'Cô Hoàng Tuyết Mai', 'tuyetmai.ddt@utt.edu.vn', '0983344556', 'ACTIVE'],
      [12, 4, 3, 'user_anh', passwordHash, 'ThS. Đỗ Đức Anh', 'ducanh.ddt@utt.edu.vn', '0984455667', 'ACTIVE'],
      [13, 4, 4, 'user_linh', passwordHash, 'ThS. Vũ Thùy Linh', 'thuylinh.tttv@utt.edu.vn', '0985566778', 'ACTIVE'],
      [14, 4, 5, 'user_thang', passwordHash, 'ThS. Phạm Quang Thắng', 'quangthang.qldt@utt.edu.vn', '0986677889', 'ACTIVE'],
      [15, 4, 5, 'user_hoa', passwordHash, 'Chuyên viên Trần Thanh Hoa', 'thanhhoa.qldt@utt.edu.vn', '0987788990', 'ACTIVE'],
    ];

    for (const u of userSeed) {
      await connection.query(`
        INSERT INTO users (id, role_id, department_id, username, password_hash, full_name, email, phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, u);
    }


    // 9. Tạo 50 Devices
    console.log('--- 9. Tạo 50 Thiết Bị Đa Dạng Kèm Mã QR HD (Devices) ---');
    const rawDevices = [
      // 1-10: Máy chiếu Laser & Tương tác (Nhà A & C)
      { code: 'DEV-2026-0001', name: 'Máy chiếu Laser Panasonic PT-MZ680', model: 'PT-MZ680', serial: 'PAN-MZ680-001', typeId: 1, locId: 1, supId: 4, deptId: 1, pDate: '2023-08-15', price: 65000000, wEnd: '2026-08-15', status: 'ACTIVE' },
      { code: 'DEV-2026-0002', name: 'Màn hình tương tác thông minh ViewSonic 86"', model: 'IFP8650-3', serial: 'VS-IFP86-002', typeId: 5, locId: 2, supId: 4, deptId: 2, pDate: '2024-01-10', price: 82000000, wEnd: '2027-01-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0003', name: 'Máy chiếu Laser Epson EB-L630U', model: 'EB-L630U', serial: 'EPS-L630-003', typeId: 1, locId: 3, supId: 4, deptId: 1, pDate: '2023-11-20', price: 58000000, wEnd: '2026-11-20', status: 'ACTIVE' },
      { code: 'DEV-2026-0004', name: 'Màn hình tương tác Maxhub 86 inch 4K', model: 'V6 Transcend 86', serial: 'MAX-V6-86-004', typeId: 5, locId: 9, supId: 4, deptId: 1, pDate: '2024-03-05', price: 95000000, wEnd: '2027-03-05', status: 'ACTIVE' },
      { code: 'DEV-2026-0005', name: 'Máy chiếu gần Sony VPL-FHZ75', model: 'VPL-FHZ75', serial: 'SNY-FHZ75-005', typeId: 1, locId: 2, supId: 4, deptId: 2, pDate: '2022-09-10', price: 52000000, wEnd: '2025-09-10', status: 'MAINTENANCE' },
      { code: 'DEV-2026-0006', name: 'Máy chiếu Sony VPL-DX221 Cũ', model: 'VPL-DX221', serial: 'SNY-DX221-006', typeId: 1, locId: 1, supId: 4, deptId: 1, pDate: '2019-04-12', price: 14000000, wEnd: '2021-04-12', status: 'RETIRED' },
      { code: 'DEV-2026-0007', name: 'Máy chiếu BenQ Laser LU930', model: 'LU930', serial: 'BNQ-LU930-007', typeId: 1, locId: 8, supId: 4, deptId: 4, pDate: '2023-05-18', price: 48000000, wEnd: '2026-05-18', status: 'ACTIVE' },
      { code: 'DEV-2026-0008', name: 'Màn hình tương tác thông minh Samsung Flip Pro', model: 'WM85B', serial: 'SAM-WM85B-008', typeId: 5, locId: 3, supId: 4, deptId: 1, pDate: '2024-02-15', price: 89000000, wEnd: '2027-02-15', status: 'ACTIVE' },
      { code: 'DEV-2026-0009', name: 'Máy chiếu Epson EB-2250U', model: 'EB-2250U', serial: 'EPS-2250-009', typeId: 1, locId: 4, supId: 4, deptId: 3, pDate: '2021-07-25', price: 32000000, wEnd: '2023-07-25', status: 'BROKEN' },
      { code: 'DEV-2026-0010', name: 'Máy chiếu Optoma X400+ Giảng đường', model: 'X400+', serial: 'OPT-X400-010', typeId: 1, locId: 5, supId: 4, deptId: 2, pDate: '2020-03-10', price: 16500000, wEnd: '2022-03-10', status: 'ACTIVE' },

      // 11-20: Máy vi tính All-in-One & Workstation (Nhà B & C)
      { code: 'DEV-2026-0011', name: 'Máy tính All-in-One Dell OptiPlex 7410 24"', model: 'OptiPlex 7410', serial: 'DELL-AIO-011', typeId: 2, locId: 2, supId: 2, deptId: 2, pDate: '2023-09-01', price: 26500000, wEnd: '2026-09-01', status: 'ACTIVE' },
      { code: 'DEV-2026-0012', name: 'Máy tính All-in-One HP EliteOne 800 G9 27"', model: 'EliteOne 800 G9', serial: 'HP-AIO-012', typeId: 2, locId: 3, supId: 2, deptId: 1, pDate: '2023-10-12', price: 31000000, wEnd: '2026-10-12', status: 'ACTIVE' },
      { code: 'DEV-2026-0013', name: 'Máy trạm Workstation Dell Precision 3660 AI (GPU RTX 4080)', model: 'Precision 3660', serial: 'DELL-WS-013', typeId: 3, locId: 6, supId: 1, deptId: 2, pDate: '2024-02-10', price: 78000000, wEnd: '2027-02-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0014', name: 'Máy trạm HP Z4 G5 Workstation AI & Robotics', model: 'HP Z4 G5', serial: 'HP-Z4-014', typeId: 3, locId: 6, supId: 1, deptId: 2, pDate: '2024-03-15', price: 85000000, wEnd: '2027-03-15', status: 'ACTIVE' },
      { code: 'DEV-2026-0015', name: 'Máy tính All-in-One Asus ExpertCenter E5 24"', model: 'E5402WVA', serial: 'ASUS-AIO-015', typeId: 2, locId: 5, supId: 2, deptId: 2, pDate: '2023-04-18', price: 21500000, wEnd: '2025-04-18', status: 'ACTIVE' },
      { code: 'DEV-2026-0016', name: 'Máy tính All-in-One Lenovo ThinkCentre neo 50a', model: 'Neo 50a Gen 4', serial: 'LNV-AIO-016', typeId: 2, locId: 8, supId: 2, deptId: 4, pDate: '2023-06-20', price: 19500000, wEnd: '2025-06-20', status: 'ACTIVE' },
      { code: 'DEV-2026-0017', name: 'Máy trạm Lenovo ThinkStation P3 Tower Deep Learning', model: 'P3 Tower', serial: 'LNV-P3-017', typeId: 3, locId: 6, supId: 1, deptId: 2, pDate: '2024-04-02', price: 72000000, wEnd: '2027-04-02', status: 'ACTIVE' },
      { code: 'DEV-2026-0018', name: 'Máy tính để bàn HP ProDesk 400 G7 Lab 01', model: 'ProDesk 400 G7', serial: 'HP-400-018', typeId: 2, locId: 5, supId: 2, deptId: 2, pDate: '2021-08-10', price: 15500000, wEnd: '2023-08-10', status: 'BROKEN' },
      { code: 'DEV-2026-0019', name: 'Máy tính để bàn HP ProDesk 400 G7 Lab 02', model: 'ProDesk 400 G7', serial: 'HP-400-019', typeId: 2, locId: 5, supId: 2, deptId: 2, pDate: '2021-08-10', price: 15500000, wEnd: '2023-08-10', status: 'MAINTENANCE' },
      { code: 'DEV-2026-0020', name: 'Máy tính để bàn Dell Vostro 3670 Cũ Hỏng Nguồn', model: 'Vostro 3670', serial: 'DELL-VOS-020', typeId: 2, locId: 5, supId: 2, deptId: 2, pDate: '2018-05-10', price: 11000000, wEnd: '2020-05-10', status: 'RETIRED' },

      // 21-30: Thiết bị Mạng, Core Switch, Wifi 6 & Router (Nhà B & C)
      { code: 'DEV-2026-0021', name: 'Switch Core Cisco Catalyst 9300 48 Port PoE+', model: 'C9300-48P', serial: 'CSC-9300-021', typeId: 6, locId: 10, supId: 1, deptId: 1, pDate: '2023-01-15', price: 145000000, wEnd: '2028-01-15', status: 'ACTIVE' },
      { code: 'DEV-2026-0022', name: 'Bộ định tuyến Router Cisco ISR 4331 Gigabit', model: 'ISR 4331/K9', serial: 'CSC-ISR-022', typeId: 6, locId: 10, supId: 1, deptId: 1, pDate: '2022-12-10', price: 92000000, wEnd: '2027-12-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0023', name: 'Bộ phát Wifi 6 Cisco Catalyst 9120AXI Tầng 1', model: 'C9120AXI-E', serial: 'CSC-9120-023', typeId: 7, locId: 1, supId: 1, deptId: 1, pDate: '2023-04-10', price: 18500000, wEnd: '2026-04-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0024', name: 'Bộ phát Wifi 6 Aruba AP-515 Giảng đường B', model: 'AP-515 (RW)', serial: 'ARU-515-024', typeId: 7, locId: 5, supId: 3, deptId: 2, pDate: '2023-05-12', price: 16800000, wEnd: '2026-05-12', status: 'ACTIVE' },
      { code: 'DEV-2026-0025', name: 'Switch Access Cisco Catalyst 2960X 24 Port Lab Mạng', model: 'WS-C2960X-24TS-L', serial: 'CSC-2960-025', typeId: 6, locId: 7, supId: 1, deptId: 2, pDate: '2022-06-15', price: 38000000, wEnd: '2025-06-15', status: 'ACTIVE' },
      { code: 'DEV-2026-0026', name: 'Tường lửa Firewall Fortinet FortiGate 100F', model: 'FG-100F', serial: 'FTN-100F-026', typeId: 6, locId: 10, supId: 1, deptId: 1, pDate: '2023-07-20', price: 110000000, wEnd: '2026-07-20', status: 'ACTIVE' },
      { code: 'DEV-2026-0027', name: 'Bộ phát Wifi 6 Ruijie RG-AP820-L Thư viện', model: 'RG-AP820-L(V2)', serial: 'RUJ-820-027', typeId: 7, locId: 8, supId: 3, deptId: 4, pDate: '2023-08-05', price: 12500000, wEnd: '2026-08-05', status: 'ACTIVE' },
      { code: 'DEV-2026-0028', name: 'Switch PoE TP-Link T1600G-28PS Hỏng Cổng 1-8', model: 'T1600G-28PS', serial: 'TPL-1600-028', typeId: 6, locId: 4, supId: 2, deptId: 3, pDate: '2021-02-18', price: 8500000, wEnd: '2023-02-18', status: 'BROKEN' },
      { code: 'DEV-2026-0029', name: 'Switch D-Link DGS-1024D Cũ', model: 'DGS-1024D', serial: 'DLK-1024-029', typeId: 6, locId: 4, supId: 2, deptId: 3, pDate: '2017-06-10', price: 3200000, wEnd: '2019-06-10', status: 'RETIRED' },
      { code: 'DEV-2026-0030', name: 'Bộ lưu điện UPS Online APC Smart-UPS 10kVA Data Center', model: 'SURT10000XLI', serial: 'APC-10K-030', typeId: 9, locId: 10, supId: 1, deptId: 1, pDate: '2023-03-20', price: 168000000, wEnd: '2026-03-20', status: 'ACTIVE' },

      // 31-40: Hệ thống Điều hòa Âm trần Inverter (Toàn trường)
      { code: 'DEV-2026-0031', name: 'Điều hòa Âm trần Daikin Inverter 36000BTU Hội trường A101', model: 'FCFC100DVM', serial: 'DKN-36K-031', typeId: 4, locId: 1, supId: 5, deptId: 1, pDate: '2023-04-05', price: 42000000, wEnd: '2026-04-05', status: 'ACTIVE' },
      { code: 'DEV-2026-0032', name: 'Điều hòa Âm trần Daikin Inverter 24000BTU Phòng A202', model: 'FCFC71DVM', serial: 'DKN-24K-032', typeId: 4, locId: 2, supId: 5, deptId: 1, pDate: '2023-04-05', price: 31500000, wEnd: '2026-04-05', status: 'ACTIVE' },
      { code: 'DEV-2026-0033', name: 'Điều hòa Âm trần Daikin Inverter 36000BTU Phòng Hội thảo A305', model: 'FCFC100DVM', serial: 'DKN-36K-033', typeId: 4, locId: 3, supId: 5, deptId: 1, pDate: '2023-04-05', price: 42000000, wEnd: '2026-04-05', status: 'ACTIVE' },
      { code: 'DEV-2026-0034', name: 'Điều hòa Tủ đứng Panasonic 50000BTU Lab B204', model: 'C50FFH', serial: 'PAN-50K-034', typeId: 4, locId: 5, supId: 5, deptId: 2, pDate: '2022-10-15', price: 56000000, wEnd: '2025-10-15', status: 'MAINTENANCE' },
      { code: 'DEV-2026-0035', name: 'Điều hòa Âm trần Daikin Inverter 36000BTU Lab AI B205', model: 'FCFC100DVM', serial: 'DKN-36K-035', typeId: 4, locId: 6, supId: 5, deptId: 2, pDate: '2024-01-20', price: 42500000, wEnd: '2027-01-20', status: 'ACTIVE' },
      { code: 'DEV-2026-0036', name: 'Điều hòa Chính xác Emerson Liebert Data Center C302', model: 'Liebert PEX', serial: 'EMR-PEX-036', typeId: 4, locId: 10, supId: 1, deptId: 1, pDate: '2023-02-15', price: 245000000, wEnd: '2026-02-15', status: 'ACTIVE' },
      { code: 'DEV-2026-0037', name: 'Điều hòa Âm trần Daikin Inverter 24000BTU Phòng Họp C201', model: 'FCFC71DVM', serial: 'DKN-24K-037', typeId: 4, locId: 9, supId: 5, deptId: 1, pDate: '2023-04-10', price: 31500000, wEnd: '2026-04-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0038', name: 'Điều hòa Treo tường Panasonic 18000BTU Xưởng B101', model: 'CU/CS-N18XKH-8', serial: 'PAN-18K-038', typeId: 4, locId: 4, supId: 5, deptId: 3, pDate: '2021-06-12', price: 18500000, wEnd: '2023-06-12', status: 'BROKEN' },
      { code: 'DEV-2026-0039', name: 'Điều hòa Treo tường LG 12000BTU Cũ Hỏng Lốc', model: 'V10API1', serial: 'LG-12K-039', typeId: 4, locId: 8, supId: 5, deptId: 4, pDate: '2018-03-10', price: 9200000, wEnd: '2020-03-10', status: 'RETIRED' },
      { code: 'DEV-2026-0040', name: 'Điều hòa Âm trần Casper Inverter 36000BTU Thư viện C101', model: 'CC-36TL22', serial: 'CAS-36K-040', typeId: 4, locId: 8, supId: 5, deptId: 4, pDate: '2023-05-15', price: 34000000, wEnd: '2026-05-15', status: 'ACTIVE' },

      // 41-50: Máy in Laser, Hệ thống Âm thanh & Bộ lưu điện UPS
      { code: 'DEV-2026-0041', name: 'Máy in Laser Đa năng Canon imageRUNNER 2625i', model: 'iR 2625i', serial: 'CAN-2625-041', typeId: 8, locId: 9, supId: 2, deptId: 1, pDate: '2023-07-15', price: 48000000, wEnd: '2026-07-15', status: 'ACTIVE' },
      { code: 'DEV-2026-0042', name: 'Máy in Laser Màu HP Color LaserJet Enterprise M555dn', model: 'M555dn', serial: 'HP-M555-042', typeId: 8, locId: 8, supId: 2, deptId: 4, pDate: '2023-09-20', price: 32500000, wEnd: '2026-09-20', status: 'ACTIVE' },
      { code: 'DEV-2026-0043', name: 'Hệ thống Âm thanh Hội trường Yamaha EMX7 & Loa CBR15', model: 'Yamaha EMX7', serial: 'YMH-EMX7-043', typeId: 10, locId: 1, supId: 4, deptId: 1, pDate: '2023-03-10', price: 54000000, wEnd: '2026-03-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0044', name: 'Bộ Micro Không dây Cao cấp Shure BLX288/PG58', model: 'BLX288/PG58', serial: 'SHR-PG58-044', typeId: 10, locId: 3, supId: 4, deptId: 1, pDate: '2023-05-15', price: 16500000, wEnd: '2025-05-15', status: 'MAINTENANCE' },
      { code: 'DEV-2026-0045', name: 'Bộ tăng âm TOA A-2240 Loa Giảng đường A202', model: 'TOA A-2240', serial: 'TOA-2240-045', typeId: 10, locId: 2, supId: 4, deptId: 1, pDate: '2022-11-10', price: 8200000, wEnd: '2024-11-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0046', name: 'Bộ lưu điện UPS Online Santak C6KS 6kVA Phòng Mạng B301', model: 'Castle C6KS', serial: 'STK-6K-046', typeId: 9, locId: 7, supId: 1, deptId: 2, pDate: '2023-06-18', price: 36000000, wEnd: '2026-06-18', status: 'ACTIVE' },
      { code: 'DEV-2026-0047', name: 'Máy in Đa năng HP LaserJet Pro MFP M428fdw', model: 'M428fdw', serial: 'HP-M428-047', typeId: 8, locId: 2, supId: 2, deptId: 2, pDate: '2022-08-15', price: 14500000, wEnd: '2024-08-15', status: 'BROKEN' },
      { code: 'DEV-2026-0048', name: 'Bộ lưu điện UPS Offline Santak TG500 Bàn Giảng viên', model: 'TG500', serial: 'STK-500-048', typeId: 9, locId: 2, supId: 2, deptId: 1, pDate: '2023-01-10', price: 1250000, wEnd: '2025-01-10', status: 'ACTIVE' },
      { code: 'DEV-2026-0049', name: 'Bộ Micro Cổ ngỗng Bosch CCS 900 Hội đồng', model: 'CCS 900 Ultro', serial: 'BSH-900-049', typeId: 10, locId: 9, supId: 4, deptId: 1, pDate: '2023-04-12', price: 42000000, wEnd: '2026-04-12', status: 'ACTIVE' },
      { code: 'DEV-2026-0050', name: 'Máy in Brother HL-L2321D Cũ Hỏng Trống Từ', model: 'HL-L2321D', serial: 'BTH-2321-050', typeId: 8, locId: 4, supId: 2, deptId: 3, pDate: '2020-05-15', price: 3200000, wEnd: '2022-05-15', status: 'MAINTENANCE' },
    ];

    for (let i = 0; i < rawDevices.length; i++) {
      const d = rawDevices[i];
      const qrToken = `UNI-QR-2026-${String(i + 1).padStart(4, '0')}`;
      await connection.query(`
        INSERT INTO devices (
          id, code, name, device_type_id, location_id, department_id, supplier_id, 
          model, serial_number, purchase_date, purchase_price, warranty_end, status, qr_token, description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        i + 1, d.code, d.name, d.typeId, d.locId, d.deptId, d.supId, 
        d.model, d.serial, d.pDate, d.price, d.wEnd, d.status, qrToken, 
        `Tài sản kiểm kê định kỳ năm 2026 - ${d.name}`
      ]);
    }

    // 10. Tạo 30 Maintenance Requests
    console.log('--- 10. Tạo 30 Phiếu Báo Sự Cố & Vòng Đời Bảo Trì Thực Tế (Maintenance Requests) ---');
    const requests = [
      // 1-4: PENDING (Mới tạo, chờ phân công)
      { code: 'REQ00001', devId: 9, repId: 11, techId: null, title: 'Máy chiếu nhấp nháy đèn Lamp đỏ, không lên nguồn', desc: 'Bật nguồn máy chiếu kêu tít tít 3 tiếng rồi tự tắt, đèn báo Lamp nhấp nháy đỏ liên tục.', priority: 'URGENT', status: 'PENDING', slaHours: 4, daysAgo: 0.1 },
      { code: 'REQ00002', devId: 18, repId: 9, techId: null, title: 'PC số 05 Lab H204 không khởi động được, quạt CPU kêu to', desc: 'Màn hình không hiển thị tín hiệu No Signal, bàn phím không sáng đèn NumLock.', priority: 'HIGH', status: 'PENDING', slaHours: 8, daysAgo: 0.2 },
      { code: 'REQ00003', devId: 28, repId: 12, techId: null, title: 'Switch mạng xưởng H101B mất tín hiệu toàn bộ cổng 1 đến 8', desc: 'Các máy thực hành vi điều khiển không kết nối được vào mạng LAN nội bộ.', priority: 'HIGH', status: 'PENDING', slaHours: 8, daysAgo: 0.3 },
      { code: 'REQ00004', devId: 47, repId: 10, techId: null, title: 'Máy in HP kẹt giấy liên tục và báo lỗi E03', desc: 'Mỗi lần in đều kéo giấy bị lệch và kẹt ở khay sấy, có tiếng kêu cọt kẹt.', priority: 'MEDIUM', status: 'PENDING', slaHours: 24, daysAgo: 0.5 },

      // 5-8: ASSIGNED (Đã phân công KTV)
      { code: 'REQ00005', devId: 5, repId: 9, techId: 4, title: 'Máy chiếu H202 mờ hình ảnh và ngả màu vàng', desc: 'Hình ảnh trình chiếu bài giảng bị nhòe nét, màu sắc bị ám vàng nặng cần cân chỉnh thấu kính.', priority: 'HIGH', status: 'ASSIGNED', slaHours: 8, daysAgo: 0.4 },
      { code: 'REQ00006', devId: 38, repId: 12, techId: 7, title: 'Điều hòa xưởng H101B chảy nước xuống sàn và không mát', desc: 'Cục lạnh đóng tuyết dày ở dàn tản nhiệt, nước tràn máng hứng chảy xuống khu vực máy móc.', priority: 'URGENT', status: 'ASSIGNED', slaHours: 4, daysAgo: 0.2 },
      { code: 'REQ00007', devId: 50, repId: 11, techId: 5, title: 'Máy in văn phòng in ra vệt đen dọc toàn bộ trang giấy', desc: 'Trang in có 3 đường sọc đen lớn chạy dọc mép trái, nghi hỏng trống từ hoặc gạt mực.', priority: 'LOW', status: 'ASSIGNED', slaHours: 72, daysAgo: 1.0 },
      { code: 'REQ00008', devId: 44, repId: 10, techId: 8, title: 'Micro không dây Shure mất sóng chập chờn khi di chuyển', desc: 'Micro chỉ hoạt động khi đứng sát bàn điều khiển, đi cách 5m là mất tiếng hoàn toàn.', priority: 'MEDIUM', status: 'ASSIGNED', slaHours: 24, daysAgo: 0.8 },

      // 9-14: IN_PROGRESS (KTV đang xử lý tại hiện trường)
      { code: 'REQ00009', devId: 34, repId: 10, techId: 7, title: 'Điều hòa Lab H204 kêu rung mạnh ở dàn nóng ngoài trời', desc: 'KTV Quang đang tháo kiểm tra cánh quạt và chân đế cao su giảm chấn.', priority: 'HIGH', status: 'IN_PROGRESS', slaHours: 8, daysAgo: 0.3 },
      { code: 'REQ00010', devId: 19, repId: 9, techId: 5, title: 'PC 12 Lab H204 lỗi màn hình xanh dump memory liên tục', desc: 'KTV Hoàng đang chạy MemTest86 kiểm tra thanh RAM DDR4 16GB.', priority: 'MEDIUM', status: 'IN_PROGRESS', slaHours: 24, daysAgo: 0.6 },
      { code: 'REQ00011', devId: 2, repId: 9, techId: 4, title: 'Màn hình tương tác H202 bị liệt cảm ứng góc dưới bên phải', desc: 'KTV Vịnh đang căn chỉnh lại cảm biến hồng ngoại khung viền màn hình cảm ứng.', priority: 'HIGH', status: 'IN_PROGRESS', slaHours: 8, daysAgo: 0.5 },
      { code: 'REQ00012', devId: 25, repId: 10, techId: 6, title: 'Switch Cisco Lab H301 nóng bất thường và quạt tản nhiệt không quay', desc: 'KTV Đức đang đo kiểm tra nguồn cấp cho cụm quạt tản nhiệt của switch.', priority: 'URGENT', status: 'IN_PROGRESS', slaHours: 4, daysAgo: 0.2 },
      { code: 'REQ00013', devId: 45, repId: 9, techId: 8, title: 'Âm ly phòng H202 có tiếng ù rè lớn 50Hz khi cắm mic', desc: 'KTV Linh đang xử lý tiếp địa mass và thay cáp tín hiệu bọc kim chống nhiễu.', priority: 'LOW', status: 'IN_PROGRESS', slaHours: 72, daysAgo: 1.5 },
      { code: 'REQ00014', devId: 7, repId: 13, techId: 4, title: 'Máy chiếu Thư viện không nhận tín hiệu qua cổng HDMI 2', desc: 'KTV Vịnh đang kiểm tra chân tiếp xúc bo mạch giao tiếp HDMI phụ.', priority: 'MEDIUM', status: 'IN_PROGRESS', slaHours: 24, daysAgo: 0.9 },

      // 15-17: WAITING_PART (Chờ linh kiện thay thế)
      { code: 'REQ00015', devId: 1, repId: 9, techId: 4, title: 'Máy chiếu Hội trường H101 báo lỗi lọc bụi quang học và hỏng quạt thổi', desc: 'Đã đặt hàng cụm quạt tản nhiệt chính hãng Panasonic, dự kiến nhận hàng trong 48h.', priority: 'HIGH', status: 'WAITING_PART', slaHours: 8, daysAgo: 1.2 },
      { code: 'REQ00016', devId: 36, repId: 1, techId: 7, title: 'Điều hòa chính xác Data Center H302 báo áp suất gas thấp', desc: 'Cần thay van tiết lưu điện tử và nạp bổ sung môi chất lạnh R410A chuyên dụng.', priority: 'URGENT', status: 'WAITING_PART', slaHours: 4, daysAgo: 0.8 },
      { code: 'REQ00017', devId: 42, repId: 13, techId: 5, title: 'Máy in màu HP Thư viện hỏng cụm Drum màu vàng và khay sấy', desc: 'Đang chờ Phòng Quản trị phê duyệt xuất kho cụm Drum chính hãng HP.', priority: 'MEDIUM', status: 'WAITING_PART', slaHours: 24, daysAgo: 1.5 },

      // 18-21: COMPLETED (KTV đã sửa xong, chờ User nghiệm thu)
      { code: 'REQ00018', devId: 13, repId: 10, techId: 6, title: 'Máy trạm AI Dell Precision 3660 bị lỗi driver CUDA và màn hình giật', desc: 'KTV Đức đã gỡ sạch driver cũ, cài đặt CUDA Toolkit 12.2 và test render 3D ổn định.', priority: 'HIGH', status: 'COMPLETED', slaHours: 8, daysAgo: 1.0, cost: 0 },
      { code: 'REQ00019', devId: 32, repId: 9, techId: 7, title: 'Điều hòa phòng H202 có mùi ẩm mốc và gió yếu', desc: 'KTV Quang đã vệ sinh xịt rửa lưới lọc, tra dầu bạc đạn quạt lồng sóc và khử khuẩn than hoạt tính.', priority: 'MEDIUM', status: 'COMPLETED', slaHours: 24, daysAgo: 2.0, cost: 250000 },
      { code: 'REQ00020', devId: 23, repId: 9, techId: 6, title: 'Bộ phát Wifi 6 Cisco Hội trường H1 mất nguồn PoE', desc: 'KTV Đức đã bấm lại đầu mạng RJ45 chuẩn Cat6 đúc và đổi port cấp nguồn PoE+ 30W ổn định.', priority: 'HIGH', status: 'COMPLETED', slaHours: 8, daysAgo: 1.5, cost: 50000 },
      { code: 'REQ00021', devId: 41, repId: 15, techId: 5, title: 'Máy in phòng Ban Giám hiệu H201 hết mực đen', desc: 'KTV Hoàng đã nạp mực hộp chính hãng Canon NPG-84 và vệ sinh gương quét scan.', priority: 'LOW', status: 'COMPLETED', slaHours: 72, daysAgo: 3.0, cost: 450000 },

      // 22-28: CLOSED (Đã nghiệm thu thành công và đóng phiếu)
      { code: 'REQ00022', devId: 3, repId: 10, techId: 4, title: 'Máy chiếu H305 bị trôi lệch hình ảnh thang cân chỉnh Keystone', desc: 'KTV Vịnh đã căn chỉnh lại giá treo trần, siết ốc định vị và khóa cố định ống kính.', priority: 'MEDIUM', status: 'CLOSED', slaHours: 24, daysAgo: 10.0, cost: 100000 },
      { code: 'REQ00023', devId: 11, repId: 9, techId: 5, title: 'Máy tính All-in-One H202 bị nhiễm virus nhảy tab trình duyệt', desc: 'KTV Hoàng đã quét diệt mã độc bằng Kaspersky Endpoint, dọn dẹp startup và update Windows.', priority: 'HIGH', status: 'CLOSED', slaHours: 8, daysAgo: 15.0, cost: 0 },
      { code: 'REQ00024', devId: 21, repId: 1, techId: 6, title: 'Core Switch Cisco 9300 cảnh báo lỗi module quang SFP+ Uplink', desc: 'KTV Đức đã thay thế module quang 10G Cisco SFP-10G-SR mới và vệ sinh đầu nối sợi quang LC.', priority: 'URGENT', status: 'CLOSED', slaHours: 4, daysAgo: 20.0, cost: 1800000 },
      { code: 'REQ00025', devId: 31, repId: 9, techId: 7, title: 'Điều hòa Hội trường H101 không nhận tín hiệu điều khiển từ xa', desc: 'KTV Quang đã thay mắt nhận hồng ngoại trên bo mạch cục lạnh và thay pin remote mới.', priority: 'MEDIUM', status: 'CLOSED', slaHours: 24, daysAgo: 25.0, cost: 350000 },
      { code: 'REQ00026', devId: 43, repId: 9, techId: 8, title: 'Hệ thống loa Yamaha Hội trường H101 bị rè kênh trái', desc: 'KTV Linh đã thay dây loa chuyên dụng Sommer Cable và cân chỉnh lại Gain trên bàn Mixer.', priority: 'HIGH', status: 'CLOSED', slaHours: 8, daysAgo: 35.0, cost: 650000 },
      { code: 'REQ00027', devId: 30, repId: 1, techId: 6, title: 'Bộ lưu điện UPS 10kVA Server cảnh báo ắc quy yếu (Battery Low)', desc: 'KTV Đức phối hợp nhà cung cấp FPT thay trọn bộ 16 bình ắc quy kín khí Yuasa 12V-9Ah.', priority: 'URGENT', status: 'CLOSED', slaHours: 4, daysAgo: 45.0, cost: 8500000 },
      { code: 'REQ00028', devId: 4, repId: 15, techId: 4, title: 'Màn hình Maxhub phòng họp H201 không bật được camera tích hợp', desc: 'KTV Vịnh đã cập nhật Firmware Android 11 mới nhất cho màn hình và cấp lại quyền Camera.', priority: 'LOW', status: 'CLOSED', slaHours: 72, daysAgo: 60.0, cost: 0 },

      // 29-30: REOPENED (Người dùng nghiệm thu chưa đạt, yêu cầu xử lý lại)
      { code: 'REQ00029', devId: 48, repId: 9, techId: 6, title: 'UPS bàn giảng viên H202 cắm điện vẫn kêu tít liên tục', desc: 'Người dùng phản hồi sau khi KTV sửa xong thì cắm điện tải lớn vẫn kêu tít tít báo lỗi quá tải.', priority: 'MEDIUM', status: 'REOPENED', slaHours: 24, daysAgo: 2.5 },
      { code: 'REQ00030', devId: 10, repId: 10, techId: 4, title: 'Máy chiếu Optoma Lab H204 hình ảnh bị chớp giật', desc: 'KTV đã thay dây VGA nhưng khi chuyển sang cổng HDMI vẫn bị chớp tắt 5 giây 1 lần.', priority: 'HIGH', status: 'REOPENED', slaHours: 8, daysAgo: 1.8 },
    ];

    for (let i = 0; i < requests.length; i++) {
      const r = requests[i];
      const createdTime = new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000);
      const dueTime = new Date(createdTime.getTime() + r.slaHours * 60 * 60 * 1000);

      let assignedTime = null;
      let startedTime = null;
      let completedTime = null;
      let closedTime = null;

      if (['ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'COMPLETED', 'CLOSED', 'REOPENED'].includes(r.status)) {
        assignedTime = new Date(createdTime.getTime() + 10 * 60 * 1000);
      }
      if (['IN_PROGRESS', 'WAITING_PART', 'COMPLETED', 'CLOSED', 'REOPENED'].includes(r.status)) {
        startedTime = new Date(createdTime.getTime() + 25 * 60 * 1000);
      }
      if (['COMPLETED', 'CLOSED'].includes(r.status)) {
        completedTime = new Date(startedTime.getTime() + 2 * 60 * 60 * 1000);
      }
      if (r.status === 'CLOSED') {
        closedTime = new Date(completedTime.getTime() + 30 * 60 * 1000);
      }

      await connection.query(`
        INSERT INTO maintenance_requests (
          id, code, device_id, reporter_id, technician_id, title, description, priority, 
          sla_hours, due_at, status, created_at, assigned_at, started_at, completed_at, closed_at, 
          actual_cost, resolution, root_cause, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        i + 1,
        r.code,
        r.devId,
        r.repId,
        r.techId,
        r.title,
        r.desc,
        r.priority,
        r.slaHours,
        dueTime.toISOString().slice(0, 19).replace('T', ' '),
        r.status,
        createdTime.toISOString().slice(0, 19).replace('T', ' '),
        assignedTime ? assignedTime.toISOString().slice(0, 19).replace('T', ' ') : null,
        startedTime ? startedTime.toISOString().slice(0, 19).replace('T', ' ') : null,
        completedTime ? completedTime.toISOString().slice(0, 19).replace('T', ' ') : null,
        closedTime ? closedTime.toISOString().slice(0, 19).replace('T', ' ') : null,
        r.cost || 0,
        ['COMPLETED', 'CLOSED'].includes(r.status) ? 'Đã kiểm tra, thay thế linh kiện lỗi và hiệu chỉnh hoạt động đạt chuẩn kỹ thuật' : null,
        ['COMPLETED', 'CLOSED'].includes(r.status) ? 'Do hao mòn linh kiện tự nhiên hoặc sự cố nguồn điện chập chờn' : null,
        createdTime.toISOString().slice(0, 19).replace('T', ' '),
      ]);
    }

    // 11. Tạo 20+ Maintenance Histories
    console.log('--- 11. Tạo Nhật Ký Lịch Sử Bảo Trì Chi Tiết (Maintenance Histories) ---');
       // 12. Tạo 10 Maintenance Schedules (Đủ UPCOMING, DUE, OVERDUE, COMPLETED)
    console.log('--- 12. Tạo 10 Lịch Bảo Trì Định Kỳ (Maintenance Schedules) ---');
    const schedules = [
      // UPCOMING (Sắp tới trong 7 - 30 ngày)
      { id: 1, devId: 1, title: 'Bảo dưỡng định kỳ Máy chiếu Hội trường H101', freq: 'QUARTERLY', sDate: '2026-09-05', nextDate: '2026-12-05', techId: 4, notes: 'Vệ sinh lưới lọc bụi, đo độ suy hao bóng đèn laser', status: 'SCHEDULED' },
      { id: 2, devId: 2, title: 'Kiểm tra bảo dưỡng Màn hình tương tác H202', freq: 'SEMI_ANNUALLY', sDate: '2026-09-15', nextDate: '2027-03-15', techId: 4, notes: 'Cân chỉnh cảm biến hồng ngoại, vệ sinh bề mặt kính cường lực', status: 'SCHEDULED' },
      { id: 3, devId: 13, title: 'Bảo trì máy trạm AI Lab H205', freq: 'MONTHLY', sDate: '2026-08-30', nextDate: '2026-09-30', techId: 6, notes: 'Thổi bụi quạt tản nhiệt GPU RTX 4080, kiểm tra keo tản nhiệt CPU', status: 'SCHEDULED' },
      { id: 4, devId: 21, title: 'Kiểm tra bảo trì Core Switch Cisco Data Center', freq: 'ANNUALLY', sDate: '2026-10-01', nextDate: '2027-10-01', techId: 6, notes: 'Sao lưu cấu hình Config, kiểm tra nhật ký Log Syslog và nguồn dự phòng', status: 'SCHEDULED' },

      // DUE (Đến hạn hôm nay)
      { id: 5, devId: 31, title: 'Bảo dưỡng định kỳ Điều hòa 36000BTU Hội trường H101', freq: 'QUARTERLY', sDate: '2026-08-19', nextDate: '2026-11-19', techId: 7, notes: 'Xịt rửa dàn nóng ngoài trời, thông tắc đường ống thoát nước thải', status: 'SCHEDULED' },
      { id: 6, devId: 41, title: 'Bảo dưỡng và vệ sinh máy in Canon iR 2625i', freq: 'MONTHLY', sDate: '2026-08-19', nextDate: '2026-09-19', techId: 5, notes: 'Lau gương laser scan, vệ sinh cụm cuốn giấy ADF', status: 'SCHEDULED' },

      // OVERDUE (Quá hạn 5 - 15 ngày trước)
      { id: 7, devId: 30, title: 'Bảo dưỡng định kỳ Bộ lưu điện UPS 10kVA Data Center', freq: 'SEMI_ANNUALLY', sDate: '2026-08-05', nextDate: '2027-02-05', techId: 6, notes: 'Đo nội trở ắc quy, kiểm tra bo mạch nghịch lưu Inverter', status: 'SCHEDULED' },
      { id: 8, devId: 36, title: 'Bảo dưỡng Điều hòa chính xác Liebert Data Center', freq: 'QUARTERLY', sDate: '2026-08-01', nextDate: '2026-11-01', techId: 7, notes: 'Kiểm tra máy nén Scroll và cảm biến nhiệt ẩm', status: 'SCHEDULED' },

      // COMPLETED (Đã hoàn tất bảo dưỡng)
      { id: 9, devId: 33, title: 'Bảo dưỡng điều hòa phòng Hội thảo Quốc tế H305', freq: 'QUARTERLY', sDate: '2026-07-20', nextDate: '2026-10-20', techId: 7, notes: 'Đã hoàn tất xịt rửa và nạp bổ sung 200g gas R410A', status: 'COMPLETED' },
      { id: 10, devId: 43, title: 'Bảo dưỡng hệ thống âm thanh Yamaha Hội trường H1', freq: 'QUARTERLY', sDate: '2026-07-15', nextDate: '2026-10-15', techId: 8, notes: 'Đã hoàn tất bôi trơn fader mixer và cân chỉnh phân tần loa', status: 'COMPLETED' },
    ];

    for (const s of schedules) {
      await connection.query(`
        INSERT INTO maintenance_schedules (id, device_id, title, frequency, scheduled_date, next_run_date, assigned_technician_id, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() - INTERVAL 10 DAY, NOW());
      `, [s.id, s.devId, s.title, s.freq, s.sDate, s.nextDate, s.techId, s.status, s.notes]);
    }

    // 13. Tạo 30 Notifications (Đủ User, Technician, Manager, Admin)
    console.log('--- 13. Tạo 30 Thông Báo Đa Vai Trò (Notifications) ---');
    const notifs = [
      // Cho Admin & Managers (Quản lý)
      { uid: 1, title: '⚠️ Sự cố KHẨN CẤP: [REQ00001]', msg: 'Máy chiếu Laser Hội trường H101 gặp sự cố nghiêm trọng cần điều phối KTV xử lý gấp.', type: 'URGENT', refType: 'MAINTENANCE_REQUEST', refId: 1, isRead: 0 },
      { uid: 2, title: '⚠️ Sự cố KHẨN CẤP: [REQ00001]', msg: 'Máy chiếu Laser Hội trường H101 gặp sự cố nghiêm trọng cần điều phối KTV xử lý gấp.', type: 'URGENT', refType: 'MAINTENANCE_REQUEST', refId: 1, isRead: 0 },
      { uid: 2, title: '🔔 Phiếu yêu cầu mới: [REQ00002]', msg: 'TS. Nguyễn Thu Hà vừa gửi phiếu báo hỏng máy tính Lab H204.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 2, isRead: 1 },
      { uid: 2, title: '🔔 Phiếu yêu cầu mới: [REQ00003]', msg: 'ThS. Đỗ Đức Anh vừa báo hỏng Switch mạng xưởng H101B.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 3, isRead: 1 },
      { uid: 2, title: '⏰ Cảnh báo Lịch bảo dưỡng QUÁ HẠN', msg: 'Lịch bảo dưỡng UPS 10kVA Data Center đã quá hạn 14 ngày. Vui lòng đôn đốc kỹ thuật viên thực hiện.', type: 'WARNING', refType: 'MAINTENANCE_SCHEDULE', refId: 7, isRead: 0 },
      { uid: 1, title: '⏰ Cảnh báo Lịch bảo dưỡng ĐẾN HẠN HÔM NAY', msg: 'Hôm nay đến hạn bảo dưỡng định kỳ Điều hòa 36000BTU Hội trường H101.', type: 'INFO', refType: 'MAINTENANCE_SCHEDULE', refId: 5, isRead: 0 },
      { uid: 2, title: '🎉 Phiếu [REQ00024] đã đóng hoàn tất', msg: 'Sự cố Core Switch Cisco 9300 đã được nghiệm thu 5 sao xuất sắc.', type: 'SUCCESS', refType: 'MAINTENANCE_REQUEST', refId: 24, isRead: 1 },

      // Cho Kỹ thuật viên (Technicians)
      { uid: 4, title: '📋 Bạn được phân công xử lý phiếu [REQ00005]', msg: 'Ban Quản lý đã giao cho bạn xử lý máy chiếu mờ tại phòng H202.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 5, isRead: 0 },
      { uid: 7, title: '⚠️ Phiếu KHẨN CẤP được giao: [REQ00006]', msg: 'Điều hòa xưởng H101B chảy nước xuống thiết bị điện, cần đến hiện trường xử lý ngay.', type: 'URGENT', refType: 'MAINTENANCE_REQUEST', refId: 6, isRead: 0 },
      { uid: 5, title: '📋 Bạn được phân công xử lý phiếu [REQ00007]', msg: 'Xử lý máy in in sọc đen tại phòng thực hành H101B.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 7, isRead: 1 },
      { uid: 8, title: '📋 Bạn được phân công xử lý phiếu [REQ00008]', msg: 'Kiểm tra micro không dây Shure tại phòng H305.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 8, isRead: 0 },
      { uid: 6, title: '⚠️ Phiếu KHẨN CẤP: [REQ00012]', msg: 'Switch Cisco Lab H301 nóng quá nhiệt, cần kiểm tra quạt tản nhiệt gấp.', type: 'URGENT', refType: 'MAINTENANCE_REQUEST', refId: 12, isRead: 0 },
      { uid: 6, title: '⏰ Nhắc nhở Lịch bảo trì sắp đến hạn', msg: 'Lịch bảo trì máy trạm AI Lab H205 dự kiến thực hiện trong 11 ngày tới.', type: 'INFO', refType: 'MAINTENANCE_SCHEDULE', refId: 3, isRead: 1 },
      { uid: 7, title: '⏰ Lịch bảo dưỡng đến hạn hôm nay: Điều hòa H101', msg: 'Vui lòng nhận vật tư và đến Hội trường H101 thực hiện bảo dưỡng.', type: 'WARNING', refType: 'MAINTENANCE_SCHEDULE', refId: 5, isRead: 0 },

      // Cho Giảng viên & Người sử dụng (Users)
      { uid: 9, title: '✅ Thiết bị [REQ00019] đã sửa xong - Mời nghiệm thu', msg: 'KTV Quang đã sửa xong điều hòa phòng H202. Vui lòng kiểm tra và bấm xác nhận nghiệm thu.', type: 'SUCCESS', refType: 'MAINTENANCE_REQUEST', refId: 19, isRead: 0 },
      { uid: 10, title: '✅ Thiết bị [REQ00018] đã sửa xong - Mời nghiệm thu', msg: 'KTV Đức đã sửa xong máy trạm AI Dell Precision 3660. Vui lòng kiểm tra và bấm nghiệm thu.', type: 'SUCCESS', refType: 'MAINTENANCE_REQUEST', refId: 18, isRead: 0 },
      { uid: 9, title: '✅ Thiết bị [REQ00020] đã sửa xong - Mời nghiệm thu', msg: 'KTV Đức đã sửa xong bộ phát Wifi 6 Cisco. Vui lòng bấm xác nhận nghiệm thu.', type: 'SUCCESS', refType: 'MAINTENANCE_REQUEST', refId: 20, isRead: 0 },
      { uid: 15, title: '✅ Thiết bị [REQ00021] đã sửa xong - Mời nghiệm thu', msg: 'KTV Hoàng đã nạp mực máy in Canon H201 xong. Vui lòng kiểm tra bản in mẫu.', type: 'SUCCESS', refType: 'MAINTENANCE_REQUEST', refId: 21, isRead: 1 },
      { uid: 9, title: '📌 Phiếu [REQ00005] đã có KTV tiếp nhận', msg: 'Kỹ thuật viên Vũ Hải Vịnh đã tiếp nhận phiếu báo sự cố máy chiếu H202 của bạn.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 5, isRead: 1 },
      { uid: 12, title: '📌 Phiếu [REQ00006] đã có KTV tiếp nhận', msg: 'Kỹ thuật viên Đỗ Nhật Quang đang trên đường tới xưởng H101B để kiểm tra điều hòa.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 6, isRead: 1 },
      { uid: 9, title: '🎉 Cảm ơn bạn đã nghiệm thu phiếu [REQ00023]', msg: 'Phiếu yêu cầu bảo trì đã đóng hoàn tất. Chúc bạn có giờ giảng dạy hiệu quả!', type: 'SUCCESS', refType: 'MAINTENANCE_REQUEST', refId: 23, isRead: 1 },
      { uid: 10, title: '🎉 Cảm ơn bạn đã nghiệm thu phiếu [REQ00022]', msg: 'Phiếu yêu cầu bảo trì máy chiếu H305 đã đóng hoàn tất.', type: 'SUCCESS', refType: 'MAINTENANCE_REQUEST', refId: 22, isRead: 1 },
      { uid: 11, title: '📌 Phiếu [REQ00001] đã được gửi thành công', msg: 'Phiếu báo hỏng máy chiếu H101 của bạn đã được chuyển tới Ban Quản lý tài sản.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 1, isRead: 1 },
      { uid: 9, title: '📌 Phiếu [REQ00002] đã được gửi thành công', msg: 'Phiếu báo hỏng PC Lab H204 đã được lưu vào hệ thống.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 2, isRead: 1 },
      { uid: 13, title: '📌 Phiếu [REQ00014] KTV đang xử lý', msg: 'KTV Vịnh đang tiến hành kiểm tra cổng HDMI máy chiếu Thư viện.', type: 'INFO', refType: 'MAINTENANCE_REQUEST', refId: 14, isRead: 1 },
      { uid: 9, title: '⚠️ Yêu cầu xử lý lại phiếu [REQ00029] đã được ghi nhận', msg: 'Phản hồi UPS chưa được khắc phục đã được chuyển tới Kỹ thuật viên để kiểm tra lại.', type: 'WARNING', refType: 'MAINTENANCE_REQUEST', refId: 29, isRead: 0 },
      { uid: 10, title: '⚠️ Yêu cầu xử lý lại phiếu [REQ00030] đã được ghi nhận', msg: 'Phản hồi máy chiếu Optoma chớp giật đã được tiếp nhận.', type: 'WARNING', refType: 'MAINTENANCE_REQUEST', refId: 30, isRead: 0 },
      { uid: 1, title: '📊 Báo cáo kiểm kê tài sản tháng 8 sẵn sàng', msg: 'Hệ thống đã tổng hợp xong báo cáo kiểm kê thiết bị và chi phí sửa chữa định kỳ.', type: 'INFO', refType: 'REPORT', refId: 1, isRead: 1 },
      { uid: 2, title: '📊 Báo cáo kiểm kê tài sản tháng 8 sẵn sàng', msg: 'Hệ thống đã tổng hợp xong báo cáo kiểm kê thiết bị và chi phí sửa chữa định kỳ.', type: 'INFO', refType: 'REPORT', refId: 1, isRead: 1 },
      { uid: 3, title: '📊 Thống kê thiết bị Khoa CNTT', msg: 'Có 18 thiết bị hoạt động tốt, 2 thiết bị đang chờ linh kiện tại Khoa CNTT.', type: 'INFO', refType: 'REPORT', refId: 2, isRead: 1 },
    ];

    for (let i = 0; i < notifs.length; i++) {
      const n = notifs[i];
      await connection.query(`
        INSERT INTO notifications (id, user_id, title, message, type, entity_type, entity_id, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW() - INTERVAL ? HOUR);
      `, [i + 1, n.uid, n.title, n.msg, n.type, n.refType, n.refId, n.isRead, (30 - i) * 3]);
    }

    // -------------------------------------------------------------------------
    // 12. Khởi tạo dữ liệu Động cơ Asset Health Score & Predictive Failure Risk
    // -------------------------------------------------------------------------
    console.log('🔄 Đang tính toán điểm Sức Khỏe & Nguy Cơ Rủi Ro cho 50 thiết bị...');
    const assetRiskService = require('./services/assetRiskService');
    const healthRepository = require('./repositories/healthRepository');

    for (let dId = 1; dId <= 50; dId++) {
      const riskData = await assetRiskService.assessDeviceRisk(dId);

      // Tạo chuỗi snapshot lịch sử 6 mốc thời gian (90d, 60d, 45d, 30d, 15d, 0d)
      const baseHealth = riskData.healthScore;
      const baseRisk = riskData.riskScore;

      const intervals = [
        { daysAgo: 90, hDelta: 8, rDelta: -10 },
        { daysAgo: 60, hDelta: 6, rDelta: -7 },
        { daysAgo: 45, hDelta: 4, rDelta: -5 },
        { daysAgo: 30, hDelta: 2, rDelta: -3 },
        { daysAgo: 15, hDelta: 1, rDelta: -1 },
        { daysAgo: 0, hDelta: 0, rDelta: 0 },
      ];

      for (const inv of intervals) {
        const snapDate = new Date(Date.now() - inv.daysAgo * 86400000).toISOString().split('T')[0];
        const hScore = Math.max(10, Math.min(100, baseHealth + inv.hDelta));
        const rScore = Math.max(0, Math.min(100, baseRisk + inv.rDelta));

        await healthRepository.insertHistorySnapshot({
          deviceId: dId,
          healthScore: hScore,
          riskScore: rScore,
          healthStatus: hScore >= 80 ? 'GOOD' : hScore >= 60 ? 'FAIR' : hScore >= 40 ? 'WARNING' : 'CRITICAL',
          riskLevel: rScore > 80 ? 'CRITICAL' : rScore > 60 ? 'HIGH' : rScore > 40 ? 'MEDIUM' : rScore > 20 ? 'LOW' : 'VERY_LOW',
          totalRepairCost: riskData.metrics.totalRepairCost,
          incidentCount: riskData.metrics.failuresLast90d,
          downtimeHours: riskData.metrics.downtimeHours,
          snapshotDate: snapDate,
        });
      }
    }
    console.log('✅ Đã nạp thành công 50 bản ghi Health & Risk kèm 300 snapshots lịch sử!');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\n================================================================================================');
    console.log('✅ ĐÃ NẠP THÀNH CÔNG BỘ DỮ LIỆU DEMO ĐẠI HỌC CÔNG NGHỆ GTVT (UTT) HOÀN HẢO 100%:');
    console.log('   * 3 Tòa nhà (Tòa H1, Tòa H2, Tòa H3 - Cơ sở Triều Khúc)');
    console.log('   * 10 Vị trí phòng học, Lab CNTT & Giảng đường thực tế');
    console.log('   * 10 Loại thiết bị (Máy chiếu, AIO, Workstation, Điều hòa, Switch, UPS...)');
    console.log('   * 5 Nhà cung cấp chính hãng (FPT, Phong Vũ, Viettel, Sao Mai, Daikin)');
    console.log('   * 50 Thiết bị chuẩn hóa (Phân tích sức khỏe & nguy cơ sự cố)');
    console.log('   * 15 Tài khoản (Phạm Quang Lâm, Tống Quang Trung, Dư Thị Kim Thu, Vũ Hải Vịnh...)');
    console.log('   * 30 Phiếu bảo trì (Đủ PENDING, ASSIGNED, IN_PROGRESS, WAITING_PART, COMPLETED, CLOSED, REOPENED)');
    console.log('   * 21 Bản ghi nhật ký lịch sử kỹ thuật & chi phí linh kiện');
    console.log('   * 10 Lịch bảo trì định kỳ (UPCOMING, DUE, OVERDUE, COMPLETED)');
    console.log('   * 30 Thông báo Real-time đa vai trò');
    console.log('   * 300 Snapshots diễn biến sức khỏe & rủi ro theo thời gian');
    console.log('================================================================================================\n');

  } catch (error) {
    console.error('❌ Lỗi khi nạp dữ liệu Demo:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedDemoData();
