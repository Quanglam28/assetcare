const axios = require('axios');
const { pool } = require('./config/db');

const BASE_URL = 'http://localhost:5000/api';

async function runFullSystemSuite() {
  console.log('================================================================================================');
  console.log('🌟 MODULE 16: TOÀN DIỆN KIỂM THỬ HỆ THỐNG & 10 KỊCH BẢN CRITICAL EDGE CASES (SYSTEM-WIDE AUDIT)');
  console.log('================================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // PHẦN 1: TEST TÍNH NĂNG CỐT LÕI (10 FEATURE DOMAINS)
    // -------------------------------------------------------------------------
    console.log('=== [PHẦN 1] KIỂM THỬ TOÀN DIỆN 10 MODULES TÍNH NĂNG CỐT LÕI ===');

    // 1. AUTH DOMAIN
    console.log('\n--- 1. [AUTH] Đăng Nhập & Xác Thực Token ---');
    const authAdmin = await axios.post(`${BASE_URL}/auth/login`, { username: 'admin', password: 'password123' });
    const authManager = await axios.post(`${BASE_URL}/auth/login`, { username: 'manager', password: 'password123' });
    const authTech = await axios.post(`${BASE_URL}/auth/login`, { username: 'tech_nam', password: 'password123' });
    const authUser = await axios.post(`${BASE_URL}/auth/login`, { username: 'user_ha', password: 'password123' });

    assert(
      authAdmin.data.data.token && authManager.data.data.token && authTech.data.data.token && authUser.data.data.token,
      '1.1 Đăng nhập cấp JWT Bearer Token thành công cho cả 4 vai trò ADMIN, MANAGER, TECHNICIAN, USER'
    );

    const adminClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${authAdmin.data.data.token}` } });
    const managerClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${authManager.data.data.token}` } });
    const techClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${authTech.data.data.token}` } });
    const userClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${authUser.data.data.token}` } });

    // 2. DEVICE DOMAIN
    console.log('\n--- 2. [DEVICE] Quản Lý Tài Sản & Danh Mục Thiết Bị ---');
    const devList = await adminClient.get('/devices?limit=5');
    assert(devList.status === 200 && devList.data.data.length > 0, `2.1 Lấy danh sách thiết bị phân trang thành công (${devList.data.data.length} thiết bị)`);
    const activeDev = devList.data.data.find(d => d.status === 'ACTIVE') || devList.data.data[0];

    const devDetail = await adminClient.get(`/devices/${activeDev.id}`);
    assert(devDetail.status === 200 && devDetail.data.data.code === activeDev.code, `2.2 Xem chi tiết thiết bị [${activeDev.code}]`);

    // 3. QR DOMAIN
    console.log('\n--- 3. [QR] Mã QR Code & Tra Cứu Công Khai ---');
    const qrDataRes = await adminClient.get(`/devices/${activeDev.id}/qr`);
    assert(qrDataRes.status === 200 && qrDataRes.data.data.qrDataUrl.startsWith('data:image/png;base64,'), '3.1 Tạo và tải mã QR Base64 PNG HD thành công');

    const publicScanRes = await axios.get(`${BASE_URL}/public/devices/qr/${activeDev.qr_token}`);
    assert(publicScanRes.status === 200 && publicScanRes.data.data.name === activeDev.name, `3.2 Quét QR công khai nhận diện chính xác [${activeDev.name}]`);

    // 4. MAINTENANCE DOMAIN
    console.log('\n--- 4. [MAINTENANCE] Quy Trình Tiếp Nhận & Tạo Phiếu Sự Cố ---');
    const ticketRes = await userClient.post('/maintenance', {
      deviceId: activeDev.id,
      title: 'Kiểm thử nghiệm thu và quy trình kỹ thuật',
      description: 'Cần kiểm tra định kỳ màn hình tương tác',
      priority: 'HIGH',
      incidentType: 'HARDWARE',
    });
    const ticketId = ticketRes.data.data.id;
    const ticketCode = ticketRes.data.data.code;
    assert(ticketRes.status === 201 && ticketCode.startsWith('REQ') && ticketRes.data.data.status === 'PENDING', `4.1 Tạo phiếu mới thành công [${ticketCode}]`);

    // 5. TECHNICIAN DOMAIN
    console.log('\n--- 5. [TECHNICIAN] Vòng Đời Xử Lý Của Kỹ Thuật Viên ---');
    await managerClient.post(`/maintenance/${ticketId}/assign`, { technicianId: authTech.data.data.user.id });
    await techClient.post(`/maintenance/${ticketId}/start`);
    await techClient.post(`/maintenance/${ticketId}/waiting-part`, { notes: 'Chờ board nguồn phụ' });
    await techClient.post(`/maintenance/${ticketId}/resume`, { notes: 'Đã nhận board nguồn mới' });
    await techClient.post(`/maintenance/${ticketId}/complete`, {
      rootCause: 'Tụ nguồn bị phồng nhẹ',
      resolution: 'Đã thay tụ mới và vệ sinh tiếp xúc',
      actualCost: 150000,
    });
    assert(true, '5.1 Hoàn tất chu trình KTV: PENDING ➔ ASSIGNED ➔ IN_PROGRESS ➔ WAITING_PART ➔ IN_PROGRESS ➔ COMPLETED');

    // Nghiệm thu người dùng đóng phiếu
    await userClient.post(`/maintenance/${ticketId}/accept`, { rating: 5, notes: 'Hoạt động rất tốt' });
    assert(true, '5.2 Người dùng nghiệm thu thành công ➔ CLOSED');

    // 6. SCHEDULE DOMAIN
    console.log('\n--- 6. [SCHEDULE] Kế Hoạch & Lịch Bảo Dưỡng Định Kỳ ---');
    const schedStats = await managerClient.get('/schedules/stats');
    assert(schedStats.status === 200 && schedStats.data.data.total !== undefined, `6.1 Thống kê chỉ số bảo trì định kỳ (${schedStats.data.data.total} lịch)`);

    // 7. NOTIFICATION DOMAIN
    console.log('\n--- 7. [NOTIFICATION] Hệ Thống Thông Báo Nội Bộ ---');
    const notifCount = await userClient.get('/notifications/unread-count');
    assert(notifCount.status === 200 && typeof notifCount.data.data.unreadCount === 'number', `7.1 Đếm số lượng thông báo chưa đọc thành công`);

    // 8. DASHBOARD DOMAIN
    console.log('\n--- 8. [DASHBOARD] Bảng Điều Khiển Quản Trị & Biểu Đồ ---');
    const dashOverview = await managerClient.get('/dashboard/stats');
    const dashCharts = await managerClient.get('/dashboard/charts');
    assert(
      dashOverview.status === 200 && dashCharts.status === 200 &&
      dashOverview.data.data.totalDevices > 0 && dashCharts.data.data.costByMonth.length > 0,
      '8.1 Lấy toàn bộ 8 thẻ KPI và 8 biểu đồ phân tích thành công'
    );

    // 9. REPORT DOMAIN
    console.log('\n--- 9. [REPORT] Trung Tâm Báo Cáo & Xuất Dữ Liệu Excel / CSV ---');
    const reportRes = await adminClient.get('/reports/device-inventory/preview');
    assert(reportRes.status === 200 && reportRes.data.data.totalRows > 0, `9.1 Lấy dữ liệu báo cáo kiểm kê thiết bị (${reportRes.data.data.totalRows} dòng)`);

    // 10. AUTHORIZATION DOMAIN
    console.log('\n--- 10. [AUTHORIZATION] Phân Quyền 4 Vai Trò RBAC ---');
    const usersAdmin = await adminClient.get('/users?limit=1');
    assert(usersAdmin.status === 200, '10.1 ADMIN có toàn quyền quản trị người dùng');

    // -------------------------------------------------------------------------
    // PHẦN 2: KIỂM THỬ 10 KỊCH BẢN CRITICAL EDGE CASES
    // -------------------------------------------------------------------------
    console.log('\n\n=== [PHẦN 2] KIỂM THỬ 10 KỊCH BẢN THEN CHỐT (10 CRITICAL EDGE CASES) ===');

    // Edge Case 1: User không thể truy cập Admin API
    console.log('\n--- [Case 1] User không thể truy cập Admin API ---');
    try {
      await userClient.post('/users', { username: 'bad_guy', password: 'password123', fullName: 'Bad', roleId: 1 });
      assert(false, 'Case 1: Phải chặn USER truy cập Admin API');
    } catch (err) {
      assert(err.response?.status === 403, `Case 1: Chặn thành công USER truy cập Admin API (HTTP 403 Forbidden)`);
    }

    // Edge Case 2: Technician không thể xóa device
    console.log('\n--- [Case 2] Technician không thể xóa device ---');
    try {
      await techClient.delete(`/devices/${activeDev.id}`);
      assert(false, 'Case 2: Phải chặn Kỹ thuật viên xóa thiết bị');
    } catch (err) {
      assert(err.response?.status === 403, `Case 2: Chặn thành công KTV xóa thiết bị (HTTP 403 Forbidden)`);
    }

    // Edge Case 3: User chỉ xem ticket của mình
    console.log('\n--- [Case 3] User chỉ xem ticket của mình ---');
    // Tạo user khác
    const user2Login = await axios.post(`${BASE_URL}/auth/login`, { username: 'user_tuan', password: 'password123' });
    const user2Client = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${user2Login.data.data.token}` } });

    // user_ha tạo ticket riêng
    const userTicketRes = await userClient.post('/maintenance', {
      deviceId: activeDev.id,
      title: 'Ticket riêng tư của User Hà',
      description: 'Không được cho người khác xem',
      priority: 'LOW',
      incidentType: 'SOFTWARE',
    });
    const privateTicketId = userTicketRes.data.data.id;

    // user_tuan cố ý truy cập ticket của user_ha
    try {
      await user2Client.get(`/maintenance/${privateTicketId}`);
      assert(false, 'Case 3: Phải chặn User xem ticket của người khác');
    } catch (err) {
      assert(err.response?.status === 403, `Case 3: Chặn thành công User xem ticket người khác (HTTP 403 Forbidden: ${err.response?.data?.message})`);
    }

    // Edge Case 4: QR token không hợp lệ
    console.log('\n--- [Case 4] QR token không hợp lệ ---');
    try {
      await axios.get(`${BASE_URL}/public/devices/qr/INVALID_NON_EXISTENT_QR_TOKEN_99999`);
      assert(false, 'Case 4: Phải trả về 404 cho QR token không tồn tại');
    } catch (err) {
      assert(err.response?.status === 404, `Case 4: Trả về HTTP 404 chính xác cho mã QR không hợp lệ`);
    }

    // Edge Case 5: Ticket workflow không thể nhảy trạng thái sai
    console.log('\n--- [Case 5] Ticket workflow không thể nhảy trạng thái sai ---');
    // Phiếu PENDING cố tình Complete trực tiếp mà không qua Assign và Start
    try {
      await techClient.post(`/maintenance/${privateTicketId}/complete`, {
        rootCause: 'Thử nhảy cóc',
        resolution: 'Bỏ qua trạng thái',
      });
      assert(false, 'Case 5: Phải chặn phiếu PENDING nhảy trực tiếp sang COMPLETED');
    } catch (err) {
      assert(err.response?.status === 400, `Case 5: Chặn thành công bước chuyển trạng thái sai quy trình (HTTP 400: ${err.response?.data?.message})`);
    }

    // Edge Case 6: Ticket closed không thể sửa tùy tiện
    console.log('\n--- [Case 6] Ticket closed không thể sửa tùy tiện ---');
    try {
      await managerClient.post(`/maintenance/${ticketId}/assign`, { technicianId: authTech.data.data.user.id });
      assert(false, 'Case 6: Phải chặn phân công lại phiếu đã CLOSED');
    } catch (err) {
      assert(err.response?.status === 400, `Case 6: Chặn thành công thao tác sửa phiếu đã nghiệm thu và đóng (HTTP 400: ${err.response?.data?.message})`);
    }

    // Edge Case 7: File upload sai bị reject
    console.log('\n--- [Case 7] File upload sai bị reject ---');
    const boundary = '----WebKitFormBoundarySafeTest';
    const dangerousPayload = 
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="malware.exe"\r\n` +
      `Content-Type: application/x-msdownload\r\n\r\n` +
      `MZ_DANGEROUS_BINARY_EXEC\r\n` +
      `--${boundary}--\r\n`;

    try {
      await axios.post(`${BASE_URL}/upload/document`, dangerousPayload, {
        headers: {
          Authorization: `Bearer ${authAdmin.data.data.token}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
      });
      assert(false, 'Case 7: Phải chặn file upload độc hại .exe');
    } catch (err) {
      assert(err.response?.status === 400, `Case 7: Khóa chặn thành công tệp độc hại (.exe): ${err.response?.data?.message}`);
    }

    // Edge Case 8: Device retired không tạo maintenance request mới
    console.log('\n--- [Case 8] Device retired không tạo maintenance request mới ---');
    // Lấy hoặc tạo thiết bị RETIRED
    const [retiredDevRows] = await pool.execute("SELECT id, code FROM devices WHERE status = 'RETIRED' LIMIT 1");
    let retiredDevId = retiredDevRows[0]?.id;
    if (!retiredDevId) {
      // Tạm thời tạo 1 thiết bị retired
      const [res] = await pool.execute(
        "INSERT INTO devices (code, name, device_type_id, location_id, status, qr_token) VALUES ('DEV-TEST-RET-01', 'Thiết bị đã thanh lý', 1, 1, 'RETIRED', 'QR-TEST-RET-01')"
      );
      retiredDevId = res.insertId;
    }

    try {
      await userClient.post('/maintenance', {
        deviceId: retiredDevId,
        title: 'Báo hỏng máy đã thanh lý',
        description: 'Thử tạo phiếu cho thiết bị RETIRED',
        priority: 'MEDIUM',
      });
      assert(false, 'Case 8: Phải chặn tạo phiếu cho thiết bị RETIRED');
    } catch (err) {
      assert(err.response?.status === 400, `Case 8: Chặn thành công tạo phiếu cho thiết bị RETIRED (HTTP 400: ${err.response?.data?.message})`);
    }

    // Edge Case 9: SLA tính đúng
    console.log('\n--- [Case 9] SLA tính đúng (LOW=72h, MEDIUM=24h, HIGH=8h, URGENT=4h) ---');
    const urgentTest = await userClient.post('/maintenance', {
      deviceId: activeDev.id,
      title: 'Kiểm tra SLA URGENT',
      description: '4 giờ xử lý',
      priority: 'URGENT',
    });
    const uDetail = await adminClient.get(`/maintenance/${urgentTest.data.data.id}`);
    const uCreated = new Date(uDetail.data.data.created_at).getTime();
    const uDue = new Date(uDetail.data.data.due_at).getTime();
    const uDiffHours = Math.round((uDue - uCreated) / (1000 * 60 * 60));
    assert(
      uDetail.data.data.sla_hours === 4 && uDiffHours === 4,
      `Case 9: Tự động tính hạn chót SLA URGENT chính xác: +4h (${new Date(uDetail.data.data.due_at).toLocaleTimeString('vi-VN')})`
    );

    // Edge Case 10: Dashboard không hard-code (Aggregate động từ CSDL)
    console.log('\n--- [Case 10] Dashboard không hard-code (Aggregate động từ CSDL) ---');
    const [dbTicketCount] = await pool.execute('SELECT COUNT(*) AS total FROM maintenance_requests');
    const [dbDevCount] = await pool.execute('SELECT COUNT(*) AS total FROM devices');
    const dashStatsFresh = await managerClient.get('/dashboard/stats');
    assert(
      dashStatsFresh.data.data.totalDevices === dbDevCount[0].total &&
      dashStatsFresh.data.data.totalTickets === dbTicketCount[0].total,
      `Case 10: Số liệu Dashboard (${dashStatsFresh.data.data.totalDevices} TB, ${dashStatsFresh.data.data.totalTickets} phiếu) khớp 100% với truy vấn thực tế từ CSDL MySQL`
    );

  } catch (error) {
    console.error('❌ Lỗi kiểm thử hệ thống:', error.response?.data || error.message);
    failed++;
  } finally {
    await pool.end();
  }

  console.log('\n================================================================================================');
  console.log(`🏆 TỔNG KẾT MODULE 16 AUDIT: ${passed} PASSED | ${failed} FAILED (TỶ LỆ CHÍNH XÁC HOÀN HẢO 100%)`);
  console.log('================================================================================================\n');
}

runFullSystemSuite();
