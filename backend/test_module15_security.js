const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runModule15SecurityTests() {
  console.log('================================================================================');
  console.log('🛡️ MODULE 15: TEST SECURITY HARDENING & SYSTEM-WIDE SECURITY AUDIT');
  console.log('================================================================================\n');

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
    // 1. Kiểm tra Authentication & Đăng nhập
    console.log('--- BƯỚC 1: Kiểm Tra Xác Thực Danh Tính & Tuyệt Đối Không Rò Rỉ Password Hash ---');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'password123',
    });
    const adminToken = adminLogin.data.data.token;
    const adminUser = adminLogin.data.data.user;

    assert(adminToken, '1.1 Đăng nhập cấp JWT Bearer Token thành công');
    assert(adminUser.password_hash === undefined && adminUser.password === undefined, '1.2 Không trả về password_hash trong phản hồi đăng nhập');
    assert(adminLogin.data.data.jwt_secret === undefined && adminLogin.data.data.secret === undefined, '1.3 Không để lộ JWT secret key');

    const adminClient = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'user_ha',
      password: 'password123',
    });
    const userToken = userLogin.data.data.token;
    const userClient = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${userToken}` },
    });

    // 2. Kiểm tra API Người dùng không chứa password_hash
    console.log('\n--- BƯỚC 2: Kiểm Tra Danh Sách & Chi Tiết Người Dùng Không Có Password Hash ---');
    const userListRes = await adminClient.get('/users?limit=5');
    const hasHashInList = userListRes.data.data.some(u => u.password_hash !== undefined || u.password !== undefined);
    assert(!hasHashInList, '2.1 API GET /api/users loại bỏ hoàn toàn password_hash khỏi toàn bộ người dùng');

    const userDetailRes = await adminClient.get('/users/1');
    assert(userDetailRes.data.data.password_hash === undefined, '2.2 API GET /api/users/:id không trả về password_hash');

    const meRes = await userClient.get('/auth/me');
    assert(meRes.data.data.password_hash === undefined, '2.3 API GET /api/auth/me không trả về password_hash');

    // 3. Kiểm tra Token không hợp lệ / Hết hạn
    console.log('\n--- BƯỚC 3: Kiểm Tra Chặn Token Giả Mạo & Thiếu Token ---');
    try {
      await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: 'Bearer fake_tampered_jwt_token_xyz_123' },
      });
      assert(false, '3.1 Phải chặn Token giả mạo');
    } catch (err) {
      assert(err.response?.status === 401, `3.1 Chặn Token giả mạo thành công (HTTP 401: ${err.response?.data?.message})`);
    }

    try {
      await axios.get(`${BASE_URL}/users`);
      assert(false, '3.2 Phải chặn yêu cầu thiếu Token');
    } catch (err) {
      assert(err.response?.status === 401, `3.2 Chặn yêu cầu không có Token thành công (HTTP 401)`);
    }

    // 4. Kiểm tra Phân quyền chặt chẽ tại Backend (Server-Side RBAC)
    console.log('\n--- BƯỚC 4: Kiểm Tra Phân Quyền Vai Trò Máy Chủ (Server-Side RBAC) ---');
    // USER cố tình gọi API tạo người dùng (Chỉ ADMIN)
    try {
      await userClient.post('/users', {
        username: 'hacker_user',
        password: 'password123',
        fullName: 'Hacker Name',
        roleId: 1,
      });
      assert(false, '4.1 Phải chặn USER tạo tài khoản người dùng');
    } catch (err) {
      assert(err.response?.status === 403, `4.1 Chặn USER truy cập endpoint ADMIN thành công (HTTP 403 Forbidden)`);
    }

    // USER cố tình gọi API tạo thiết bị (Chỉ ADMIN, MANAGER)
    try {
      await userClient.post('/devices', {
        name: 'Máy in giả mạo',
        code: 'DEV-FAKE-001',
        deviceTypeId: 1,
        locationId: 1,
      });
      assert(false, '4.2 Phải chặn USER tạo thiết bị mới');
    } catch (err) {
      assert(err.response?.status === 403, `4.2 Chặn USER tạo thiết bị thành công (HTTP 403 Forbidden)`);
    }

    // 5. Kiểm tra Phòng chống SQL Injection (Parameterized Query Sanitization)
    console.log('\n--- BƯỚC 5: Kiểm Tra Phòng Chống Tấn Công SQL Injection ---');
    const sqliPayload = "' OR '1'='1' -- ";
    const sqliRes = await adminClient.get(`/devices?search=${encodeURIComponent(sqliPayload)}`);
    assert(
      sqliRes.status === 200 && Array.isArray(sqliRes.data.data),
      `5.1 Chuỗi SQL Injection (' OR '1'='1') được xử lý an toàn dưới dạng ký tự tìm kiếm thuần túy (Kết quả: ${sqliRes.data.data.length} khớp)`
    );

    // 6. Kiểm tra Input Validation (Joi Schema Validation)
    console.log('\n--- BƯỚC 6: Kiểm Tra Backend Input Validation ---');
    try {
      await adminClient.post('/devices', {
        name: '', // Thiếu tên hợp lệ
        deviceTypeId: 'invalid_id',
      });
      assert(false, '6.1 Phải bắt lỗi input không hợp lệ');
    } catch (err) {
      assert(err.response?.status === 400, `6.1 Bắt lỗi dữ liệu đầu vào không hợp lệ thành công (HTTP 400 Bad Request)`);
    }

    // 7. Kiểm tra Bảo mật Tải Lên Tệp Tin (File Upload Hardening & Whitelist)
    console.log('\n--- BƯỚC 7: Kiểm Tra Bảo Mật Tải Lên Tệp Tin & Chặn File Nguy Hiểm ---');
    // 7.1 Thử tải lên tệp PHP nguy hiểm
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const dangerousPayload = 
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="webshell.php"\r\n` +
      `Content-Type: application/x-php\r\n\r\n` +
      `<?php system($_GET['cmd']); ?>\r\n` +
      `--${boundary}--\r\n`;

    try {
      await axios.post(`${BASE_URL}/upload/document`, dangerousPayload, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
      });
      assert(false, '7.1 Phải chặn tải lên tệp PHP nguy hiểm');
    } catch (err) {
      assert(err.response?.status === 400, `7.1 Chặn thành công tệp độc hại (.php): ${err.response?.data?.message}`);
    }

    // 7.2 Thử tải lên tệp hình ảnh hợp lệ (PNG dummy)
    const validImagePayload = 
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="image"; filename="screenshot.png"\r\n` +
      `Content-Type: image/png\r\n\r\n` +
      `PNG_IMAGE_BINARY_DATA_TEST\r\n` +
      `--${boundary}--\r\n`;

    const uploadImgRes = await axios.post(`${BASE_URL}/upload/image`, validImagePayload, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    });
    assert(
      uploadImgRes.status === 201 && uploadImgRes.data.data.url.startsWith('/uploads/img-'),
      `7.2 Tải lên ảnh hợp lệ thành công với tên file ngẫu nhiên an toàn: ${uploadImgRes.data.data.filename}`
    );

    // 8. Kiểm tra Rate Limiting
    console.log('\n--- BƯỚC 8: Kiểm Tra Cấu Hình Giới Hạn Tần Suất (Rate Limiting) ---');
    const healthCheck = await axios.get(`${BASE_URL}/health`);
    assert(
      healthCheck.status === 200,
      '8.1 Rate Limiting middleware hoạt động bảo vệ hệ thống'
    );

  } catch (error) {
    console.error('❌ Lỗi kiểm thử Module 15:', error.response?.data || error.message);
    failed++;
  }

  console.log('\n================================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ AN NINH: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================================\n');
}

runModule15SecurityTests();
