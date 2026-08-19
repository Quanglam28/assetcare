-- =================================================================================
-- HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ TRONG TRƯỜNG ĐẠI HỌC (QR CODE)
-- SEED DATA: Dữ liệu mẫu khởi tạo hoàn chỉnh
-- DATABASE NAME: asset_maintenance_system
-- =================================================================================

USE asset_maintenance_system;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. NẠP DỮ LIỆU BẢNG ROLES (4 Roles)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE roles;
INSERT INTO roles (id, code, name, description) VALUES
(1, 'ADMIN', 'Quản trị viên hệ thống', 'Toàn quyền cấu hình, quản lý người dùng, danh mục và báo cáo tổng hợp'),
(2, 'MANAGER', 'Quản lý tài sản & bảo trì', 'Quản lý danh mục thiết bị, tiếp nhận sự cố, phân công KTV và theo dõi lịch bảo dưỡng'),
(3, 'TECHNICIAN', 'Kỹ thuật viên', 'Tiếp nhận ticket, xử lý sự cố, ghi nhận nguyên nhân, giải pháp, linh kiện và chi phí'),
(4, 'USER', 'Người dùng (Giảng viên / Sinh viên)', 'Quét QR xem thông tin thiết bị, báo hỏng, theo dõi tiến độ và nghiệm thu kết quả');

-- -----------------------------------------------------------------------------
-- 2. NẠP DỮ LIỆU BẢNG DEPARTMENTS (5 Khoa / Phòng ban)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE departments;
INSERT INTO departments (id, code, name, phone, email, description) VALUES
(1, 'CNTT', 'Khoa Công nghệ Thông tin', '024-3868-0001', 'fit@university.edu.vn', 'Quản lý các phòng Lab máy tính và đào tạo ngành CNTT'),
(2, 'DTVT', 'Khoa Điện tử - Viễn thông', '024-3868-0002', 'feee@university.edu.vn', 'Quản lý các phòng thí nghiệm điện tử, IoT và viễn thông'),
(3, 'QTTB', 'Phòng Quản trị & Cơ sở vật chất', '024-3868-0003', 'facility@university.edu.vn', 'Đơn vị trực tiếp quản lý tài sản, cơ sở hạ tầng toàn trường'),
(4, 'DT', 'Phòng Đào tạo', '024-3868-0004', 'academic@university.edu.vn', 'Quản lý giảng đường, lịch học và phòng học lý thuyết'),
(5, 'TTTV', 'Trung tâm Thư viện & Học liệu', '024-3868-0005', 'library@university.edu.vn', 'Quản lý hệ thống máy tính tra cứu và phòng đọc tự học');

-- -----------------------------------------------------------------------------
-- 3. NẠP DỮ LIỆU BẢNG USERS (1 Admin, 2 Managers, 3 Technicians, 5 Users = 11 Users)
-- Mật khẩu mặc định của tất cả tài khoản: "password123" (đã băm bằng bcrypt 10 rounds)
-- Hash: $2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO
-- -----------------------------------------------------------------------------
TRUNCATE TABLE users;
INSERT INTO users (id, role_id, department_id, username, password_hash, full_name, email, phone, avatar_url, status) VALUES
-- 1 Admin: Phạm Quang Lâm
(1, 1, 3, 'admin', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Phạm Quang Lâm (Admin)', 'phamquanglam.admin@utt.edu.vn', '0901234567', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),

-- 2 Managers: Tống Quang Trung & Dư Thị Kim Thu
(2, 2, 3, 'manager', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Tống Quang Trung (Manager)', 'tongquangtrung.manager@utt.edu.vn', '0912345678', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),
(11, 2, 1, 'manager_thu', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Dư Thị Kim Thu (Manager Khoa CNTT)', 'duthikimthu.cs@utt.edu.vn', '0903456789', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),

-- 3 Technicians: Vũ Hải Vịnh, Lê Minh Hoàng, Phạm Minh Đức
(3, 3, 3, 'tech_nam', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Vũ Hải Vịnh (KTV Trưởng)', 'vuhai.vinh.tech@utt.edu.vn', '0923456789', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),
(4, 3, 3, 'tech_hoang', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Lê Minh Hoàng (KTV Điện lạnh & Máy chiếu)', 'hoang.lm@utt.edu.vn', '0934567890', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),
(5, 3, 3, 'tech_duc', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Phạm Minh Đức (KTV Mạng & Hạ tầng)', 'duc.pm@utt.edu.vn', '0935678901', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),

-- 5 Users (Giảng viên, Cán bộ, Sinh viên UTT)
(6, 4, 1, 'user_ha', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'TS. Lê Thu Hà (Giảng viên CNTT)', 'ha.lt@utt.edu.vn', '0945678901', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),
(7, 4, 2, 'user_tuan', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'ThS. Nguyễn Văn Tuấn (Giảng viên ĐTVT)', 'tuan.nv@utt.edu.vn', '0956789012', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),
(8, 4, 4, 'user_mai', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Lê Thị Mai (Chuyên viên Phòng Đào tạo)', 'mai.lt@utt.edu.vn', '0967890123', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),
(9, 4, 1, 'user_anh', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Phạm Tuấn Anh (Sinh viên K73 CNTT)', 'anh.pt@student.utt.edu.vn', '0978901234', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE'),
(10, 4, 2, 'user_linh', '$2a$10$YdjSi2GnybBUR1GT3r3uC.dHBzDeCCHX50zREMuQr71mouzM1AvBO', 'Hoàng Thùy Linh (Sinh viên K74 ĐTVT)', 'linh.ht@student.utt.edu.vn', '0989012345', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80', 'ACTIVE');

-- -----------------------------------------------------------------------------
-- 4. NẠP DỮ LIỆU BẢNG BUILDINGS (3 Tòa nhà - Trường ĐH Công nghệ GTVT)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE buildings;
INSERT INTO buildings (id, code, name, address, total_floors, description) VALUES
(1, 'H1', 'Tòa Nhà H1 - Khu Giảng Đường & Hội Trường Lớn', 'Cơ sở Triều Khúc: 54 Triều Khúc, Thanh Xuân, Hà Nội', 7, 'Tòa nhà văn phòng hành chính, ban giám hiệu và hội trường trung tâm'),
(2, 'H2', 'Tòa Nhà H2 - Khu Giảng Đường Thực Hành & Lab CNTT', 'Khuôn viên trung tâm thực hành công nghệ UTT', 5, 'Khu phòng học lý thuyết và hệ thống phòng máy tính Lab CNTT'),
(3, 'H3', 'Tòa Nhà H3 - Trung Tâm Thông Tin Thư Viện & Điều Hành', 'Khu liên hợp thư viện số và trung tâm dữ liệu UTT', 6, 'Khu phòng Server DC, thư viện số và trung tâm nghiên cứu');

-- -----------------------------------------------------------------------------
-- 5. NẠP DỮ LIỆU BẢNG LOCATIONS (10 Địa điểm / Phòng học)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE locations;
INSERT INTO locations (id, building_id, code, room_name, floor, type, description) VALUES
(1, 1, 'A1-101', 'Phòng Tiếp Dân & Văn Thư', 1, 'OFFICE', 'Phòng tiếp nhận công văn và hồ sơ hành chính'),
(2, 1, 'A1-201', 'Phòng Hội Đồng Trường', 2, 'MEETING_ROOM', 'Phòng họp hội đồng cao cấp trang bị âm thanh, máy chiếu'),
(3, 1, 'A1-301', 'Văn Phòng Quản Trị Thiết Bị', 3, 'OFFICE', 'Văn phòng làm việc phòng Cơ sở vật chất'),
(4, 2, 'B2-101', 'Hội Trường Giảng Đường Lớn', 1, 'CLASSROOM', 'Hội trường 300 chỗ phục vụ hội thảo và học phần chung'),
(5, 2, 'B2-201', 'Phòng Học Lý Thuyết 201', 2, 'CLASSROOM', 'Phòng học lý thuyết 100 sinh viên'),
(6, 2, 'B2-301', 'Phòng Học Lý Thuyết 301', 3, 'CLASSROOM', 'Phòng học lý thuyết 120 sinh viên'),
(7, 3, 'C3-101', 'Phòng Trung Tâm Máy Chủ (Server Room)', 1, 'SERVER_ROOM', 'Phòng đặt hệ thống máy chủ mạng nội bộ và tủ Rack'),
(8, 3, 'C3-201', 'Phòng Lab Viễn Thông & IoT', 2, 'LABORATORY', 'Phòng thực hành điện tử viễn thông'),
(9, 3, 'C3-401', 'Phòng Lab Máy Tính CNTT 01', 4, 'LABORATORY', 'Phòng Lab 45 máy tính để bàn cho sinh viên CNTT'),
(10, 3, 'C3-402', 'Phòng Lab Máy Tính CNTT 02', 4, 'LABORATORY', 'Phòng Lab 45 máy tính để bàn cho sinh viên CNTT');

-- -----------------------------------------------------------------------------
-- 6. NẠP DỮ LIỆU BẢNG DEVICE_TYPES (10 Loại thiết bị)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE device_types;
INSERT INTO device_types (id, code, name, category, maintenance_interval_days, description) VALUES
(1, 'PC_DESKTOP', 'Máy tính để bàn (PC)', 'IT_EQUIPMENT', 90, 'Máy tính PC dùng cho phòng Lab hoặc văn phòng'),
(2, 'PROJECTOR', 'Máy chiếu văn phòng & giảng đường', 'OFFICE_EQUIPMENT', 60, 'Máy chiếu độ sáng cao giảng đường'),
(3, 'AIR_CONDITIONER', 'Điều hòa không khí', 'ELECTRICAL', 90, 'Điều hòa 18000 - 24000 BTU trong phòng học và phòng làm việc'),
(4, 'NETWORK_SWITCH', 'Thiết bị chuyển mạch Switch', 'NETWORK', 180, 'Switch mạng Core/Access quản lý kết nối LAN/WAN'),
(5, 'ROUTER_WIFI', 'Bộ định tuyến Wifi Access Point', 'NETWORK', 120, 'Bộ phát Wifi tốc độ cao phủ sóng khuôn viên'),
(6, 'PRINTER_LASER', 'Máy in Laser đa năng', 'OFFICE_EQUIPMENT', 60, 'Máy in, scan, photocopy phục vụ in ấn tài liệu'),
(7, 'INTERACTIVE_BOARD', 'Màn hình tương tác thông minh', 'IT_EQUIPMENT', 90, 'Màn hình cảm ứng 75 inch cho phòng hội đồng và phòng Lab'),
(8, 'UPS_POWER', 'Bộ lưu điện UPS công suất lớn', 'ELECTRICAL', 90, 'Bộ lưu điện dự phòng cho Server và phòng Lab'),
(9, 'SOUND_SYSTEM', 'Hệ thống âm thanh & Micro giảng đường', 'OFFICE_EQUIPMENT', 90, 'Amply, mixer, loa và micro không dây giảng đường'),
(10, 'LAB_OSCILLOSCOPE', 'Máy hiện sóng & Thiết bị đo chuyên dụng', 'LAB_EQUIPMENT', 180, 'Thiết bị đo xung và tín hiệu viễn thông phòng Lab');

-- -----------------------------------------------------------------------------
-- 7. NẠP DỮ LIỆU BẢNG SUPPLIERS (5 Nhà cung cấp)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE suppliers;
INSERT INTO suppliers (id, code, name, contact_person, phone, email, address, tax_code, description) VALUES
(1, 'SUP-DELL', 'Công ty Cổ phần Dell Technologies Việt Nam', 'Nguyễn Minh Quân', '024-3772-8888', 'contact@dell.vn', 'Tầng 12, Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội', '0101234567', 'Cung cấp máy chủ Server, máy trạm Workstation và máy tính OptiPlex chính hãng'),
(2, 'SUP-PANASONIC', 'Công ty TNHH Panasonic Appliances Việt Nam', 'Lê Hải Yến', '024-3974-9999', 'service@panasonic.vn', 'Khu CN Thăng Long, Đông Anh, Hà Nội', '0107654321', 'Cung cấp máy chiếu LCD độ phân giải cao và điều hòa thương mại'),
(3, 'SUP-CISCO', 'Đại lý Phân phối Hạ tầng Mạng Cisco VN', 'Vũ Đức Thịnh', '024-3855-6666', 'sales@cisconet.vn', 'Tòa nhà FPT Cầu Giấy, Duy Tân, Hà Nội', '0109988776', 'Cung cấp Switch mạng, Router và Access Point doanh nghiệp'),
(4, 'SUP-DAIKIN', 'Công ty Cổ phần Daikin Air Conditioning VN', 'Hoàng Bảo Long', '024-3833-2222', 'info@daikin.com.vn', 'Tầng 8, Tòa nhà Lotte Center, Ba Đình, Hà Nội', '0103344556', 'Cung cấp và bảo trì hệ thống điều hòa Inverter trung tâm'),
(5, 'SUP-PHONGVU', 'Công ty Cổ phần Thương mại Dịch vụ Phong Vũ', 'Trịnh Bích Ngọc', '024-3795-1111', 'b2b@phongvu.vn', 'Số 1 Thái Hà, Đống Đa, Hà Nội', '0105566778', 'Cung cấp linh kiện máy tính, máy in văn phòng, UPS và phụ kiện');

-- -----------------------------------------------------------------------------
-- 8. NẠP DỮ LIỆU BẢNG DEVICES (32 Thiết bị chi tiết với mã QR định danh duy nhất)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE devices;
INSERT INTO devices (id, code, name, device_type_id, location_id, department_id, supplier_id, model, serial_number, purchase_date, purchase_price, warranty_start, warranty_end, status, description, qr_token) VALUES
-- Dãy PC Lab 01 (C3-401)
(1, 'DEV-2026-0001', 'Máy tính Dell OptiPlex 7090 #01', 1, 9, 1, 1, 'OptiPlex 7090 MT', 'SN-DELL-883901', '2023-08-15', 18500000.00, '2023-08-15', '2026-08-15', 'ACTIVE', 'Máy thực hành số 01 dãy A phòng Lab C3-401 (i7-11700, 16GB RAM, 512GB SSD)', 'UNI-QR-2026-0001'),
(2, 'DEV-2026-0002', 'Máy tính Dell OptiPlex 7090 #02', 1, 9, 1, 1, 'OptiPlex 7090 MT', 'SN-DELL-883902', '2023-08-15', 18500000.00, '2023-08-15', '2026-08-15', 'BROKEN', 'Máy thực hành số 02 dãy A phòng Lab C3-401 - Bị lỗi sập nguồn liên tục', 'UNI-QR-2026-0002'),
(3, 'DEV-2026-0003', 'Máy tính Dell OptiPlex 7090 #03', 1, 9, 1, 1, 'OptiPlex 7090 MT', 'SN-DELL-883903', '2023-08-15', 18500000.00, '2023-08-15', '2026-08-15', 'ACTIVE', 'Máy thực hành số 03 dãy A phòng Lab C3-401', 'UNI-QR-2026-0003'),
(4, 'DEV-2026-0004', 'Máy tính Dell OptiPlex 7090 #04', 1, 9, 1, 1, 'OptiPlex 7090 MT', 'SN-DELL-883904', '2023-08-15', 18500000.00, '2023-08-15', '2026-08-15', 'ACTIVE', 'Máy thực hành số 04 dãy A phòng Lab C3-401', 'UNI-QR-2026-0004'),
(5, 'DEV-2026-0005', 'Máy tính Dell OptiPlex 7090 #05', 1, 9, 1, 1, 'OptiPlex 7090 MT', 'SN-DELL-883905', '2023-08-15', 18500000.00, '2023-08-15', '2026-08-15', 'ACTIVE', 'Máy thực hành số 05 dãy B phòng Lab C3-401', 'UNI-QR-2026-0005'),

-- Dãy PC Lab 02 (C3-402)
(6, 'DEV-2026-0006', 'Máy tính Dell OptiPlex 7080 #01', 1, 10, 1, 1, 'OptiPlex 7080 SFF', 'SN-DELL-772101', '2022-09-10', 16800000.00, '2022-09-10', '2025-09-10', 'ACTIVE', 'Máy giáo viên giảng dạy phòng Lab C3-402', 'UNI-QR-2026-0006'),
(7, 'DEV-2026-0007', 'Máy tính Dell OptiPlex 7080 #02', 1, 10, 1, 1, 'OptiPlex 7080 SFF', 'SN-DELL-772102', '2022-09-10', 16800000.00, '2022-09-10', '2025-09-10', 'ACTIVE', 'Máy thực hành số 01 phòng Lab C3-402', 'UNI-QR-2026-0007'),
(8, 'DEV-2026-0008', 'Máy tính Dell OptiPlex 7080 #03', 1, 10, 1, 1, 'OptiPlex 7080 SFF', 'SN-DELL-772103', '2022-09-10', 16800000.00, '2022-09-10', '2025-09-10', 'MAINTENANCE', 'Đang tháo lắp vệ sinh và nâng cấp RAM 16GB', 'UNI-QR-2026-0008'),

-- Máy chiếu tại các phòng học & Hội đồng
(9, 'DEV-2026-0009', 'Máy chiếu Panasonic PT-LB385 #301', 2, 6, 4, 2, 'PT-LB385 LCD', 'SN-PANA-440191', '2022-10-10', 16200000.00, '2022-10-10', '2025-10-10', 'MAINTENANCE', 'Máy chiếu phòng B2-301 - Đang chờ thay bóng đèn 240W', 'UNI-QR-2026-0009'),
(10, 'DEV-2026-0010', 'Máy chiếu Panasonic PT-LB385 #201', 2, 5, 4, 2, 'PT-LB385 LCD', 'SN-PANA-440192', '2022-10-10', 16200000.00, '2022-10-10', '2025-10-10', 'ACTIVE', 'Máy chiếu phòng học lý thuyết B2-201', 'UNI-QR-2026-0010'),
(11, 'DEV-2026-0011', 'Máy chiếu Panasonic Laser PT-MZ880', 2, 4, 4, 2, 'PT-MZ880 Solid Shine', 'SN-PANA-991201', '2023-05-20', 85000000.00, '2023-05-20', '2026-05-20', 'ACTIVE', 'Máy chiếu công suất lớn 8500 Lumens Hội trường B2-101', 'UNI-QR-2026-0011'),
(12, 'DEV-2026-0012', 'Màn hình tương tác thông minh ViewSonic 75"', 7, 2, 3, 5, 'IFP7550-3 ViewBoard', 'SN-VS-771920', '2023-11-15', 58000000.00, '2023-11-15', '2026-11-15', 'ACTIVE', 'Màn hình cảm ứng đa điểm Phòng Hội đồng A1-201', 'UNI-QR-2026-0012'),

-- Điều hòa không khí
(13, 'DEV-2026-0013', 'Điều hòa Daikin Inverter 24000BTU B2-301L', 3, 6, 4, 4, 'FTKQ60SVMV', 'SN-DAIK-992111', '2023-01-20', 22000000.00, '2023-01-20', '2026-01-20', 'ACTIVE', 'Điều hòa treo tường bên trái phòng B2-301', 'UNI-QR-2026-0013'),
(14, 'DEV-2026-0014', 'Điều hòa Daikin Inverter 24000BTU B2-301R', 3, 6, 4, 4, 'FTKQ60SVMV', 'SN-DAIK-992112', '2023-01-20', 22000000.00, '2023-01-20', '2026-01-20', 'ACTIVE', 'Điều hòa treo tường bên phải phòng B2-301', 'UNI-QR-2026-0014'),
(15, 'DEV-2026-0015', 'Điều hòa Daikin Inverter 24000BTU B2-201', 3, 5, 4, 4, 'FTKQ60SVMV', 'SN-DAIK-992113', '2023-01-20', 22000000.00, '2023-01-20', '2026-01-20', 'ACTIVE', 'Điều hòa phòng B2-201', 'UNI-QR-2026-0015'),
(16, 'DEV-2026-0016', 'Điều hòa Daikin Cassette Âm trần A1-201', 3, 2, 3, 4, 'FCF100CVM', 'SN-DAIK-550181', '2022-04-12', 38500000.00, '2022-04-12', '2025-04-12', 'ACTIVE', 'Điều hòa âm trần 4 hướng thổi Phòng Hội đồng', 'UNI-QR-2026-0016'),

-- Hạ tầng Mạng & Server (C3-101, C3-401, C3-402)
(17, 'DEV-2026-0017', 'Cisco Catalyst 3850 Core Switch 48-Port', 4, 7, 3, 3, 'WS-C3850-48T-L', 'SN-CISCO-880011', '2022-05-18', 95000000.00, '2022-05-18', '2027-05-18', 'ACTIVE', 'Switch Core trung tâm tầng 1 nhà C3 (Server Room)', 'UNI-QR-2026-0017'),
(18, 'DEV-2026-0018', 'Cisco Catalyst 2960X 48-Port Gig PoE+ #01', 4, 9, 1, 3, 'WS-C2960X-48FPS-L', 'SN-CISCO-110291', '2022-05-18', 45000000.00, '2022-05-18', '2027-05-18', 'ACTIVE', 'Switch phân phối cho 45 máy Lab C3-401', 'UNI-QR-2026-0018'),
(19, 'DEV-2026-0019', 'Cisco Catalyst 2960X 48-Port Gig PoE+ #02', 4, 10, 1, 3, 'WS-C2960X-48FPS-L', 'SN-CISCO-110292', '2022-05-18', 45000000.00, '2022-05-18', '2027-05-18', 'ACTIVE', 'Switch phân phối cho 45 máy Lab C3-402', 'UNI-QR-2026-0019'),
(20, 'DEV-2026-0020', 'Cisco Catalyst 2960 24-Port Tòa A1', 4, 3, 3, 3, 'WS-C2960-24TC-L', 'SN-CISCO-220199', '2019-03-10', 25000000.00, '2019-03-10', '2024-03-10', 'RETIRED', 'Switch cũ đã hết khấu hao và thay thế mới', 'UNI-QR-2026-0020'),
(21, 'DEV-2026-0021', 'Cisco Catalyst Access Point Wifi 6 #A1', 5, 1, 3, 3, 'C9115AXI-E', 'SN-CISCO-998811', '2023-06-01', 14500000.00, '2023-06-01', '2028-06-01', 'ACTIVE', 'Bộ phát Wifi hành lang tầng 1 nhà A1', 'UNI-QR-2026-0021'),
(22, 'DEV-2026-0022', 'Cisco Catalyst Access Point Wifi 6 #B2', 5, 4, 4, 3, 'C9115AXI-E', 'SN-CISCO-998812', '2023-06-01', 14500000.00, '2023-06-01', '2028-06-01', 'ACTIVE', 'Bộ phát Wifi Hội trường B2', 'UNI-QR-2026-0022'),

-- Bộ lưu điện UPS & Nguồn
(23, 'DEV-2026-0023', 'Bộ lưu điện APC Smart-UPS 5000VA Online', 8, 7, 3, 5, 'SURTD5000XLI', 'SN-APC-554411', '2022-08-10', 52000000.00, '2022-08-10', '2025-08-10', 'ACTIVE', 'UPS bảo vệ hệ thống Server tủ Rack chính', 'UNI-QR-2026-0023'),
(24, 'DEV-2026-0024', 'Bộ lưu điện Santak 2000VA Phòng Lab C3-401', 8, 9, 1, 5, 'Blazer 2000 Pro', 'SN-SAN-221190', '2021-04-15', 7800000.00, '2021-04-15', '2024-04-15', 'BROKEN', 'Bình ắc quy bị chai phồng, không tích được điện', 'UNI-QR-2026-0024'),

-- Máy in & Thiết bị văn phòng
(25, 'DEV-2026-0025', 'Máy in Canon Laser đa năng LBP226dw #A1-101', 6, 1, 3, 5, 'imageCLASS LBP226dw', 'SN-CAN-771120', '2023-02-14', 9200000.00, '2023-02-14', '2025-02-14', 'ACTIVE', 'Máy in văn thư tiếp dân nhà A1', 'UNI-QR-2026-0025'),
(26, 'DEV-2026-0026', 'Máy in Canon Laser đa năng LBP226dw #A1-301', 6, 3, 3, 5, 'imageCLASS LBP226dw', 'SN-CAN-771121', '2023-02-14', 9200000.00, '2023-02-14', '2025-02-14', 'ACTIVE', 'Máy in phòng Quản trị thiết bị', 'UNI-QR-2026-0026'),
(27, 'DEV-2026-0027', 'Máy in HP LaserJet Pro M404dn Cũ', 6, 3, 3, 5, 'M404dn', 'SN-HP-332190', '2018-05-10', 6500000.00, '2018-05-10', '2020-05-10', 'RETIRED', 'Hỏng trục cuốn giấy và cụm sấy, đã thanh lý', 'UNI-QR-2026-0027'),

-- Hệ thống Âm thanh & Thiết bị đo Lab Viễn thông
(28, 'DEV-2026-0028', 'Bộ Âm thanh Hội trường TOA & Micro Shure', 9, 4, 4, 5, 'TOA A-2240 / Shure BLX288', 'SN-TOA-119920', '2022-12-05', 36000000.00, '2022-12-05', '2024-12-05', 'ACTIVE', 'Hệ thống âm thanh khuếch đại và micro Hội trường B2-101', 'UNI-QR-2026-0028'),
(29, 'DEV-2026-0029', 'Máy hiện sóng số Tektronix TBS1102B-EDU #01', 10, 8, 2, 5, 'TBS1102B-EDU 100MHz', 'SN-TEK-881901', '2023-04-10', 17500000.00, '2023-04-10', '2026-04-10', 'ACTIVE', 'Máy hiện sóng đo tín hiệu phòng Lab C3-201', 'UNI-QR-2026-0029'),
(30, 'DEV-2026-0030', 'Máy hiện sóng số Tektronix TBS1102B-EDU #02', 10, 8, 2, 5, 'TBS1102B-EDU 100MHz', 'SN-TEK-881902', '2023-04-10', 17500000.00, '2023-04-10', '2026-04-10', 'ACTIVE', 'Máy hiện sóng đo tín hiệu phòng Lab C3-201', 'UNI-QR-2026-0030'),
(31, 'DEV-2026-0031', 'Máy phát hàm tín hiệu RIGOL DG1022Z', 10, 8, 2, 5, 'DG1022Z 25MHz', 'SN-RIG-330192', '2023-04-10', 12800000.00, '2023-04-10', '2026-04-10', 'ACTIVE', 'Máy tạo hàm dạng sóng sin/vuông phòng Lab C3-201', 'UNI-QR-2026-0031'),
(32, 'DEV-2026-0032', 'Máy chiếu Epson EB-X06 Phòng 201', 2, 5, 4, 5, 'EB-X06 3600lm', 'SN-EPS-991203', '2021-08-19', 11500000.00, '2021-08-19', '2023-08-19', 'ACTIVE', 'Máy chiếu phụ phòng học B2-201', 'UNI-QR-2026-0032');

-- -----------------------------------------------------------------------------
-- 9. NẠP DỮ LIỆU BẢNG MAINTENANCE_REQUESTS (Phiếu yêu cầu sự cố / Tickets)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE maintenance_requests;
INSERT INTO maintenance_requests (id, code, device_id, reporter_id, technician_id, title, description, priority, status, created_at, assigned_at, started_at, completed_at, closed_at, estimated_cost, actual_cost, resolution, root_cause, updated_at) VALUES
-- Ticket 1: Đang sửa (IN_PROGRESS)
(1, 'REQ-2026-0001', 2, 6, 3, 'Máy tính Lab 401 không lên nguồn', 'Khi ấn nút nguồn, quạt thùng máy quay ngắt quãng, đèn LED đỏ nhấp nháy 3 lần, màn hình không nhận tín hiệu.', 'HIGH', 'IN_PROGRESS', '2026-08-16 08:30:00', '2026-08-16 09:15:00', '2026-08-16 10:00:00', NULL, NULL, 500000.00, 450000.00, 'Thay bộ nguồn Cooler Master 500W và làm sạch khe cắm RAM', 'Hỏng bộ nguồn máy tính (PSU) do quá áp và chân cắm RAM bị bám bụi oxy hóa', '2026-08-16 10:30:00'),

-- Ticket 2: Đã phân công (ASSIGNED)
(2, 'REQ-2026-0002', 9, 6, 4, 'Máy chiếu mờ và nháy tắt sau 5 phút', 'Máy chiếu lớp B2-301 bị mờ nhạt màu, phát tiếng kêu rè rè ở quạt và tự động tắt bóng sau khi bật được khoảng 5 phút.', 'URGENT', 'ASSIGNED', '2026-08-17 14:00:00', '2026-08-17 14:45:00', NULL, NULL, NULL, 1200000.00, 0.00, NULL, NULL, '2026-08-17 14:45:00'),

-- Ticket 3: Đã nghiệm thu & đóng (CLOSED)
(3, 'REQ-2026-0003', 1, 9, 3, 'Bàn phím và chuột máy Lab 01 bị kẹt phím', 'Phím cách (Space) và nút click chuột trái phản hồi kém, khó thao tác lập trình.', 'LOW', 'CLOSED', '2026-08-10 09:00:00', '2026-08-10 10:00:00', '2026-08-10 14:00:00', '2026-08-10 15:30:00', '2026-08-11 08:00:00', 300000.00, 250000.00, 'Thay mới bộ combo phím chuột Fuhlen Pro có dây', 'Bàn phím bị kẹt bụi bẩn lâu ngày, switch chuột bị mòn tiếp điểm', '2026-08-11 08:00:00'),

-- Ticket 4: Mới tạo, chờ duyệt (PENDING)
(4, 'REQ-2026-0004', 24, 7, NULL, 'Bộ lưu điện UPS phòng 401 không giữ được điện', 'Khi mất điện đột ngột trong giờ thực hành, UPS tắt ngay lập tức làm máy tính bị tắt đột ngột.', 'MEDIUM', 'PENDING', '2026-08-18 09:30:00', NULL, NULL, NULL, NULL, 800000.00, 0.00, NULL, NULL, '2026-08-18 09:30:00'),

-- Ticket 5: Đang chờ linh kiện (WAITING_PART)
(5, 'REQ-2026-0005', 8, 6, 3, 'Nâng cấp thanh RAM 16GB máy giáo viên Lab 402', 'Máy chạy chậm khi mở đồng thời Android Studio và máy ảo mô phỏng.', 'MEDIUM', 'WAITING_PART', '2026-08-15 11:00:00', '2026-08-15 13:30:00', '2026-08-15 15:00:00', NULL, NULL, 900000.00, 850000.00, 'Đã tháo máy kiểm tra, đang chờ phòng QTTB xuất thanh RAM DDR4 16GB Kingston', 'Cấu hình 8GB RAM không đủ dung lượng chạy phần mềm chuyên ngành', '2026-08-16 09:00:00'),

-- Ticket 6: Hoàn thành, chờ user nghiệm thu (COMPLETED)
(6, 'REQ-2026-0006', 13, 8, 4, 'Điều hòa phòng B2-301 chảy nước ngưng', 'Ống thoát nước điều hòa bên trái bị nghẹt khiến nước rỏ xuống sàn phòng học.', 'MEDIUM', 'COMPLETED', '2026-08-14 08:00:00', '2026-08-14 08:30:00', '2026-08-14 09:00:00', '2026-08-14 11:00:00', NULL, 200000.00, 150000.00, 'Thông tắc đường ống thoát nước ngưng và vệ sinh máng hứng nước', 'Bụi bẩn và rêu đóng cặn làm tắc đường ống thoát nước mềm', '2026-08-14 11:00:00'),

-- Ticket 7: Yêu cầu xử lý lại (REOPENED)
(7, 'REQ-2026-0007', 28, 8, 4, 'Micro không dây Hội trường B2-101 bị rè và mất sóng', 'Micro số 1 phát tiếng rít chói tai và thường xuyên chập chờn khi di chuyển về phía cuối hội trường.', 'HIGH', 'REOPENED', '2026-08-12 10:00:00', '2026-08-12 11:00:00', '2026-08-12 14:00:00', '2026-08-13 09:00:00', NULL, 400000.00, 350000.00, 'Đã thay anten thu sóng nhưng chất lượng âm thanh vẫn chưa đạt yêu cầu của khoa', 'Hỏng mạch thu phát tần số UHF trên đầu micro cầm tay', '2026-08-14 08:30:00'),

-- Ticket 8: Sự cố mạng (ASSIGNED)
(8, 'REQ-2026-0008', 18, 6, 5, 'Cổng mạng Gigabit 1-12 phòng Lab C3-401 mất kết nối', 'Nửa dãy máy tính bên trái phòng Lab không nhận địa chỉ IP từ DHCP Server.', 'URGENT', 'ASSIGNED', '2026-08-18 07:30:00', '2026-08-18 08:00:00', NULL, NULL, NULL, 600000.00, 0.00, NULL, NULL, '2026-08-18 08:00:00'),

-- Ticket 9: Máy in văn thư kẹt giấy (PENDING)
(9, 'REQ-2026-0009', 25, 8, NULL, 'Máy in phòng Tiếp Dân A1-101 báo lỗi kẹt giấy liên tục', 'Cứ cho giấy vào khay in là máy báo Error Paper Jam, không kéo giấy được.', 'LOW', 'PENDING', '2026-08-18 10:15:00', NULL, NULL, NULL, NULL, 300000.00, 0.00, NULL, NULL, '2026-08-18 10:15:00'),

-- Ticket 10: Bảo dưỡng máy hiện sóng (CLOSED)
(10, 'REQ-2026-0010', 29, 7, 3, 'Hiệu chuẩn que đo và căn chỉnh điện áp máy hiện sóng', 'Đo tín hiệu sóng vuông 1kHz bị méo biên độ và sai số 15%.', 'LOW', 'CLOSED', '2026-08-01 08:00:00', '2026-08-01 09:00:00', '2026-08-01 10:00:00', '2026-08-01 15:00:00', '2026-08-02 08:00:00', 150000.00, 150000.00, 'Căn chỉnh tụ bù trên que đo Probe 10X và hiệu chuẩn lại offset máy', 'Sai lệch tụ vi chỉnh que đo sau thời gian dài sử dụng', '2026-08-02 08:00:00');

-- -----------------------------------------------------------------------------
-- 10. NẠP DỮ LIỆU BẢNG MAINTENANCE_HISTORIES (Nhật ký xử lý chi tiết)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE maintenance_histories;
INSERT INTO maintenance_histories (id, request_id, actor_id, from_status, to_status, action, notes, cost, created_at) VALUES
-- Lịch sử Ticket 1
(1, 1, 6, NULL, 'PENDING', 'TẠO YÊU CẦU', 'Giảng viên Lê Thu Hà quét mã QR báo hỏng máy tính', 0.00, '2026-08-16 08:30:00'),
(2, 1, 2, 'PENDING', 'ASSIGNED', 'TIẾP NHẬN & PHÂN CÔNG', 'Manager Trần Quản Lý duyệt và chỉ định KTV Nguyễn Văn Nam', 0.00, '2026-08-16 09:15:00'),
(3, 1, 3, 'ASSIGNED', 'IN_PROGRESS', 'BẮT ĐẦU XỬ LÝ', 'KTV Nam kiểm tra nguồn, phát hiện tụ điện nguồn bị phồng và cháy cầu chì', 450000.00, '2026-08-16 10:00:00'),

-- Lịch sử Ticket 3
(4, 3, 9, NULL, 'PENDING', 'TẠO YÊU CẦU', 'Sinh viên Phạm Tuấn Anh quét QR báo hỏng bàn phím', 0.00, '2026-08-10 09:00:00'),
(5, 3, 2, 'PENDING', 'ASSIGNED', 'PHÂN CÔNG', 'Phân công KTV Nam xử lý', 0.00, '2026-08-10 10:00:00'),
(6, 3, 3, 'ASSIGNED', 'IN_PROGRESS', 'TIẾP NHẬN', 'KTV Nam mang thiết bị thay thế đến phòng máy', 0.00, '2026-08-10 14:00:00'),
(7, 3, 3, 'IN_PROGRESS', 'COMPLETED', 'HOÀN THÀNH', 'Đã thay mới bộ combo bàn phím chuột Fuhlen và test tín hiệu tốt', 250000.00, '2026-08-10 15:30:00'),
(8, 3, 9, 'COMPLETED', 'CLOSED', 'NGHIỆM THU & ĐÓNG TICKET', 'Người dùng nghiệm thu hài lòng và đánh giá 5 sao', 0.00, '2026-08-11 08:00:00'),

-- Lịch sử Ticket 5
(9, 5, 6, NULL, 'PENDING', 'TẠO YÊU CẦU', 'Giảng viên gửi yêu cầu nâng cấp RAM', 0.00, '2026-08-15 11:00:00'),
(10, 5, 2, 'PENDING', 'ASSIGNED', 'PHÂN CÔNG', 'Manager duyệt cấp linh kiện và phân công KTV Nam', 0.00, '2026-08-15 13:30:00'),
(11, 5, 3, 'ASSIGNED', 'IN_PROGRESS', 'BẮT ĐẦU XỬ LÝ', 'Đã tháo máy kiểm tra khe cắm RAM', 0.00, '2026-08-15 15:00:00'),
(12, 5, 3, 'IN_PROGRESS', 'WAITING_PART', 'CHỜ LINH KIỆN', 'Chờ kho xuất kho thanh RAM DDR4 16GB', 850000.00, '2026-08-16 09:00:00'),

-- Lịch sử Ticket 7 (REOPENED)
(13, 7, 8, NULL, 'PENDING', 'TẠO YÊU CẦU', 'Cán bộ báo hỏng micro phòng hội trường', 0.00, '2026-08-12 10:00:00'),
(14, 7, 2, 'PENDING', 'ASSIGNED', 'PHÂN CÔNG', 'Manager chỉ định KTV Hoàng', 0.00, '2026-08-12 11:00:00'),
(15, 7, 4, 'ASSIGNED', 'IN_PROGRESS', 'XỬ LÝ', 'KTV Hoàng thay anten', 350000.00, '2026-08-12 14:00:00'),
(16, 7, 4, 'IN_PROGRESS', 'COMPLETED', 'BÁO XONG', 'KTV báo đã thay anten', 0.00, '2026-08-13 09:00:00'),
(17, 7, 8, 'COMPLETED', 'REOPENED', 'TỪ CHỐI NGHIỆM THU', 'Âm thanh micro vẫn bị sôi và rè khi bật âm lượng lớn, yêu cầu KTV thay đầu thu micro khác', 0.00, '2026-08-14 08:30:00');

-- -----------------------------------------------------------------------------
-- 11. NẠP DỮ LIỆU BẢNG MAINTENANCE_PARTS (Linh kiện thay thế)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE maintenance_parts;
INSERT INTO maintenance_parts (id, request_id, part_name, part_code, quantity, unit_price, replaced_at) VALUES
(1, 1, 'Bộ nguồn máy tính Cooler Master Elite 500W V3', 'PSU-CM-500W', 1, 450000.00, '2026-08-16 10:30:00'),
(2, 3, 'Bộ bàn phím chuột có dây Fuhlen L102 / L411', 'KB-MS-FUHLEN', 1, 250000.00, '2026-08-10 15:00:00'),
(3, 5, 'Thanh RAM máy tính Desktop Kingston Fury 16GB DDR4 3200MHz', 'RAM-DDR4-16GB-KS', 1, 850000.00, '2026-08-16 09:30:00'),
(4, 7, 'Cụm củ micro không dây cao cấp Shure Beta58A', 'MIC-HEAD-SHURE', 1, 350000.00, '2026-08-12 14:30:00');

-- -----------------------------------------------------------------------------
-- 12. NẠP DỮ LIỆU BẢNG MAINTENANCE_SCHEDULES (Lịch bảo dưỡng định kỳ)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE maintenance_schedules;
INSERT INTO maintenance_schedules (id, device_id, title, frequency, scheduled_date, next_run_date, last_performed_at, assigned_technician_id, status, notes) VALUES
(1, 13, 'Bảo dưỡng vệ sinh lưới lọc và nạp gas bổ sung điều hòa phòng B2-301', 'QUARTERLY', '2026-09-01', '2026-12-01', '2026-06-01 09:00:00', 4, 'SCHEDULED', 'Bảo dưỡng trước thềm khai giảng năm học mới'),
(2, 17, 'Kiểm tra nhiệt độ tải, vệ sinh quạt tản nhiệt và sao lưu cấu hình Switch Core C3', 'MONTHLY', '2026-08-30', '2026-09-30', '2026-07-30 16:00:00', 5, 'SCHEDULED', 'Định kỳ kiểm tra nhật ký log hệ thống mạng'),
(3, 11, 'Vệ sinh thấu kính quang học và quạt hút gió máy chiếu Laser Hội trường B2', 'SEMI_ANNUALLY', '2026-09-15', '2027-03-15', '2026-03-15 14:00:00', 4, 'SCHEDULED', 'Kiểm tra độ suy giảm quang thông và cân chỉnh màu sắc');

-- -----------------------------------------------------------------------------
-- 13. NẠP DỮ LIỆU BẢNG NOTIFICATIONS (Thông báo)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE notifications;
INSERT INTO notifications (id, user_id, title, message, type, entity_type, entity_id, is_read) VALUES
(1, 3, 'Bạn có ticket mới được phân công', 'Quản lý vừa phân công bạn xử lý sự cố REQ-2026-0001: Máy tính Lab 401 không lên nguồn.', 'WARNING', 'MAINTENANCE_REQUEST', 1, 0),
(2, 4, 'Bạn có ticket mới được phân công', 'Quản lý vừa phân công bạn xử lý sự cố REQ-2026-0002: Máy chiếu mờ và nháy tắt sau 5 phút.', 'URGENT', 'MAINTENANCE_REQUEST', 2, 0),
(3, 6, 'Yêu cầu của bạn đang được xử lý', 'Kỹ thuật viên Nguyễn Văn Nam đã tiếp nhận và bắt đầu xử lý phiếu REQ-2026-0001.', 'INFO', 'MAINTENANCE_REQUEST', 1, 1),
(4, 2, 'Có sự cố mới được báo cáo', 'Giảng viên vừa gửi báo hỏng thiết bị DEV-2026-0024 (Bộ lưu điện UPS C3-401).', 'WARNING', 'MAINTENANCE_REQUEST', 4, 0);

-- -----------------------------------------------------------------------------
-- 14. NẠP DỮ LIỆU BẢNG ATTACHMENTS (Tệp đính kèm)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE attachments;
INSERT INTO attachments (id, entity_type, entity_id, file_name, file_path, file_type, file_size, uploaded_by) VALUES
(1, 'MAINTENANCE_REQUEST', 1, 'hien-trang-may-tinh-c3-401.jpg', '/uploads/requests/req-0001-initial.jpg', 'image/jpeg', 1048576, 6),
(2, 'MAINTENANCE_REQUEST', 2, 'may-chieu-mo-b2-301.jpg', '/uploads/requests/req-0002-initial.jpg', 'image/jpeg', 2097152, 6);

SET FOREIGN_KEY_CHECKS = 1;
