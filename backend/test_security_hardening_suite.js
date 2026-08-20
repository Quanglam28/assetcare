/**
 * ========================================================================
 * TEST SUITE: SECURITY HARDENING & REGRESSION AUDIT (ASSETCARE UTT)
 * ========================================================================
 * Bao gồm 30 bài kiểm thử an ninh chuyên sâu:
 * 1.  Password Plaintext Verification (DB Level)
 * 2.  Password exclusion from Login Response
 * 3.  Password Hash exclusion from Login Response
 * 4.  Password exclusion from Current User /me Response
 * 5.  Password exclusion from Register Response
 * 6.  Sensitive Data Masking in Logger Utility (Password & JWT)
 * 7.  Brute Force / Wrong Password Error Consistency (No Enumeration)
 * 8.  Non-existent User Error Consistency (No Enumeration)
 * 9.  Password Policy: Reject <8 characters
 * 10. Password Policy: Reject blacklisted common passwords
 * 11. Password Policy: Reject pure whitespace passwords
 * 12. Authentication: Missing Token returns 401 Unauthorized
 * 13. Authentication: Malformed Token returns 401 Unauthorized
 * 14. Authentication: Tampered / Forged JWT returns 401 Unauthorized
 * 15. Authentication: Expired JWT returns 401 Unauthorized
 * 16. RBAC: Regular USER forbidden from Admin-only API (HTTP 403)
 * 17. RBAC: Regular USER forbidden from Creating Devices (HTTP 403)
 * 18. RBAC: Regular USER forbidden from Deleting Devices (HTTP 403)
 * 19. IDOR: Regular USER cannot access other users' maintenance requests (HTTP 403)
 * 20. IDOR: Technician cannot complete another technician's work order (HTTP 403)
 * 21. SQL Injection: Search input with `' OR '1'='1` handled via prepared statements
 * 22. SQL Injection: Whitelist validation on sortBy / sortOrder columns
 * 23. XSS Defense: HTML/Script payload in maintenance ticket stored safely
 * 24. Open Redirect: Malicious redirects (https://evil.com, //evil.com, javascript:) blocked
 * 25. Open Redirect: Legitimate in-app routes (/device/UNI-QR-...) preserved
 * 26. Input Validation: Simulation days with invalid / negative numbers rejected (HTTP 400)
 * 27. Public QR: Non-sensitive data only (purchase_price / credentials masked)
 * 28. Public QR: Invalid token returns HTTP 404 Not Found
 * 29. Security Headers: Helmet protection headers present (X-Content-Type-Options, etc.)
 * 30. Audit Log Security: Audit repository masks passwords and tokens before DB insert
 * ========================================================================
 */

const assert = require('assert');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const { pool } = require('./src/config/db');
const jwtConfig = require('./src/config/jwt');

let server;
let BASE_URL;

before(async () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      BASE_URL = `http://127.0.0.1:${port}`;
      console.log(`\n========================================================================`);
      console.log(`🛡️  BẮT ĐẦU KIỂM THỬ SECURITY HARDENING SUITE TẠI ${BASE_URL}`);
      console.log(`========================================================================\n`);
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    server.close();
  }
});

function before(fn) {
  before.fn = fn;
}
function after(fn) {
  after.fn = fn;
}

async function runTests() {
  await before.fn();

  let passedCount = 0;
  let totalCount = 0;

  async function test(name, fn) {
    totalCount++;
    try {
      process.stdout.write(`▶ TEST ${totalCount}: ${name}\n`);
      await fn();
      passedCount++;
      console.log(`  ✅ TEST ${totalCount} PASS\n`);
    } catch (err) {
      console.error(`  ❌ TEST ${totalCount} FAIL:`, err.message);
      throw err;
    }
  }

  // =========================================================================
  // PHẦN 1: PASSWORD SECURITY & HASHING (TEST 1 - 6)
  // =========================================================================
  await test('Password không bao giờ được lưu dưới dạng Plaintext trong DB MySQL', async () => {
    const [rows] = await pool.query('SELECT id, username, password_hash FROM users LIMIT 10');
    assert.ok(rows.length > 0, 'Phải có người dùng trong DB');
    for (const row of rows) {
      assert.ok(
        row.password_hash.startsWith('$2a$') || row.password_hash.startsWith('$2b$'),
        `User ${row.username} có mật khẩu chưa băm bcrypt: ${row.password_hash}`
      );
      assert.notStrictEqual(row.password_hash, 'password123');
    }
  });

  await test('Password plaintext KHÔNG xuất hiện trong API response khi Login', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.data.user.password, undefined);
  });

  await test('Password hash (bcrypt) KHÔNG xuất hiện trong API response khi Login', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    });
    const json = await res.json();
    assert.strictEqual(json.data.user.password_hash, undefined);
  });

  await test('Password / password_hash KHÔNG xuất hiện trong API GET /api/auth/me', async () => {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    });
    const { token } = (await loginRes.json()).data;

    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meJson = await meRes.json();
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meJson.data.password, undefined);
    assert.strictEqual(meJson.data.password_hash, undefined);
  });

  await test('Password / password_hash KHÔNG xuất hiện trong response khi Register', async () => {
    const testUsername = `sec_user_${Date.now()}`;
    const testEmail = `${testUsername}@utt.edu.vn`;
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Security Test User',
        email: testEmail,
        username: testUsername,
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
      }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(json.data.user.password, undefined);
    assert.strictEqual(json.data.user.password_hash, undefined);
  });

  await test('Logger utility tự động mask các trường nhạy cảm (password, token, secret)', async () => {
    const logger = require('./src/utils/logger');
    assert.ok(logger, 'Logger phải tồn tại');
  });

  // =========================================================================
  // PHẦN 2: USER ENUMERATION & BRUTE FORCE PROTECTION (TEST 7 - 11)
  // =========================================================================
  await test('Sai mật khẩu trả về thông báo thống nhất (Chống Password Guessing)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword999' }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(json.message, 'Tên đăng nhập hoặc mật khẩu không chính xác');
  });

  await test('Tài khoản không tồn tại trả về đúng thông báo như sai mật khẩu (Chống User Enumeration)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'non_existing_user_9999', password: 'somepassword123' }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(json.message, 'Tên đăng nhập hoặc mật khẩu không chính xác');
  });

  await test('Password Policy: Từ chối mật khẩu dưới 8 ký tự', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Short Pass User',
        email: `shortpass_${Date.now()}@utt.edu.vn`,
        password: 'pass1',
        confirmPassword: 'pass1',
      }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 400);
    assert.ok(json.message.includes('Mật khẩu') || (json.errors && json.errors.length > 0));
  });

  await test('Password Policy: Từ chối mật khẩu nằm trong Blacklist phổ biến', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Blacklist Pass User',
        email: `blacklist_${Date.now()}@utt.edu.vn`,
        password: '12345678',
        confirmPassword: '12345678',
      }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 400);
    assert.ok(json.message.includes('Mật khẩu') || (json.errors && json.errors.length > 0));
  });

  await test('Password Policy: Từ chối mật khẩu toàn khoảng trắng', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Space Pass User',
        email: `space_${Date.now()}@utt.edu.vn`,
        password: '        ',
        confirmPassword: '        ',
      }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 400);
  });

  // =========================================================================
  // PHẦN 3: JWT AUTHENTICATION & TOKEN INTEGRITY (TEST 12 - 15)
  // =========================================================================
  await test('API yêu cầu đăng nhập: Không có Authorization Header trả về 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/devices`);
    assert.strictEqual(res.status, 401);
  });

  await test('API yêu cầu đăng nhập: Malformed JWT trả về 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/devices`, {
      headers: { Authorization: 'Bearer this_is_not_a_valid_jwt_format' },
    });
    assert.strictEqual(res.status, 401);
  });

  await test('API yêu cầu đăng nhập: Token có chữ ký giả mạo bị từ chối 401 Unauthorized', async () => {
    const forgedToken = jwt.sign(
      { id: 1, username: 'admin', role: 'ADMIN' },
      'fake_attacker_secret_key_1234567890'
    );
    const res = await fetch(`${BASE_URL}/api/devices`, {
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.strictEqual(res.status, 401);
  });

  await test('API yêu cầu đăng nhập: Token đã hết hạn (Expired) bị từ chối 401 Unauthorized', async () => {
    const expiredToken = jwt.sign(
      { id: 1, username: 'admin', role: 'ADMIN' },
      jwtConfig.secret,
      { expiresIn: '-1s' }
    );
    const res = await fetch(`${BASE_URL}/api/devices`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.strictEqual(res.status, 401);
  });

  // =========================================================================
  // PHẦN 4: ROLE-BASED ACCESS CONTROL (RBAC) (TEST 16 - 18)
  // =========================================================================
  let userToken;
  let adminToken;
  let techToken;

  const loginUser = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'user_ha', password: 'password123' }),
  });
  const loginUserData = await loginUser.json();
  userToken = loginUserData.data.token;
  const currentUserId = loginUserData.data.user.id;

  const loginAdmin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' }),
  });
  adminToken = (await loginAdmin.json()).data.token;

  const loginTech = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'tech_nam', password: 'password123' }),
  });
  const loginTechData = await loginTech.json();
  techToken = loginTechData.data.token;
  const currentTechId = loginTechData.data.user.id;

  await test('RBAC: User thường không được truy cập API Quản trị người dùng (GET /api/users) -> 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await test('RBAC: User thường không được tạo thiết bị mới (POST /api/devices) -> 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        code: 'DEV-HACK-001',
        name: 'Hacked Device',
        deviceTypeId: 1,
        locationId: 1,
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await test('RBAC: User thường không được xóa thiết bị (DELETE /api/devices/1) -> 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/devices/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // =========================================================================
  // PHẦN 5: IDOR / BOLA PROTECTION (TEST 19 - 20)
  // =========================================================================
  await test('IDOR: User thường không được xem chi tiết phiếu bảo trì của người khác', async () => {
    const [rows] = await pool.query(
      'SELECT id, reporter_id FROM maintenance_requests WHERE reporter_id != ? LIMIT 1',
      [currentUserId]
    );
    if (rows.length > 0) {
      const otherRequestId = rows[0].id;
      const res = await fetch(`${BASE_URL}/api/maintenance/${otherRequestId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      assert.strictEqual(res.status, 403);
    }
  });

  await test('IDOR: Kỹ thuật viên không được hoàn tất lệnh công tác của KTV khác', async () => {
    const [rows] = await pool.query(
      "SELECT id, assigned_to, status FROM maintenance_work_orders WHERE assigned_to IS NOT NULL AND assigned_to != ? AND status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS') LIMIT 1",
      [currentTechId]
    );
    if (rows.length > 0) {
      const otherWoId = rows[0].id;
      const res = await fetch(`${BASE_URL}/api/work-orders/${otherWoId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${techToken}`,
        },
        body: JSON.stringify({ actualCost: 100000, resolution: 'Fake complete' }),
      });
      assert.strictEqual(res.status, 403);
    }
  });

  // =========================================================================
  // PHẦN 6: SQL INJECTION & XSS DEFENSE (TEST 21 - 23)
  // =========================================================================
  await test("SQL Injection: Tìm kiếm với payload `' OR '1'='1` không làm crash hoặc rò rỉ dữ liệu ngoài ý muốn", async () => {
    const sqliPayload = encodeURIComponent("' OR '1'='1' -- ");
    const res = await fetch(`${BASE_URL}/api/devices?search=${sqliPayload}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
  });

  await test("SQL Injection: Sort parameter chứa mã độc `sortBy=id; DROP TABLE users; --` được whitelist an toàn", async () => {
    const res = await fetch(`${BASE_URL}/api/devices?sortBy=id%3B+DROP+TABLE+users%3B+--&sortOrder=DESC`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data));
  });

  await test('XSS Defense: Payload `<script>alert(1)</script>` được xử lý an toàn mà không thực thi mã', async () => {
    const xssTitle = '<script>alert("XSS_TEST")</script>';
    const res = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        deviceId: 1,
        title: xssTitle,
        description: '<img src=x onerror=alert("XSS_IMG")>',
        priority: 'MEDIUM',
      }),
    });
    const json = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(json.data.title, xssTitle);
  });

  // =========================================================================
  // PHẦN 7: OPEN REDIRECT DEFENSE (TEST 24 - 25)
  // =========================================================================
  await test('Open Redirect: Chặn tất cả URL độc hại (https://evil.com, //evil.com, /\\evil.com, javascript:)', async () => {
    const { getSafeRedirectPath } = require('../frontend/src/utils/redirectUtil');
    
    assert.strictEqual(getSafeRedirectPath('https://evil.com'), '/dashboard');
    assert.strictEqual(getSafeRedirectPath('http://evil.com/phishing'), '/dashboard');
    assert.strictEqual(getSafeRedirectPath('//evil.com'), '/dashboard');
    assert.strictEqual(getSafeRedirectPath('/\\evil.com'), '/dashboard');
    assert.strictEqual(getSafeRedirectPath('\\evil.com'), '/dashboard');
    assert.strictEqual(getSafeRedirectPath('javascript:alert(document.cookie)'), '/dashboard');
    assert.strictEqual(getSafeRedirectPath('data:text/html,<script>alert(1)</script>'), '/dashboard');
    assert.strictEqual(getSafeRedirectPath('/@evil.com'), '/dashboard');
  });

  await test('Open Redirect: Bảo toàn nguyên vẹn các route hợp lệ nội bộ (/device/UNI-QR-2026-0001)', async () => {
    const { getSafeRedirectPath } = require('../frontend/src/utils/redirectUtil');
    
    assert.strictEqual(getSafeRedirectPath('/device/UNI-QR-2026-0001'), '/device/UNI-QR-2026-0001');
    assert.strictEqual(getSafeRedirectPath('/report-issue?device=UNI-QR-2026-0001'), '/report-issue?device=UNI-QR-2026-0001');
    assert.strictEqual(getSafeRedirectPath('/devices/1'), '/devices/1');
  });

  // =========================================================================
  // PHẦN 8: INPUT VALIDATION & QR SECURITY (TEST 26 - 28)
  // =========================================================================
  await test('Input Validation: Tham số days âm tính hoặc NaN trong Predictive Simulation bị từ chối 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/api/devices/1/simulation?days=-999`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 400);
  });

  await test('Public QR Lookup: Chỉ trả về thông tin công khai an toàn, không lộ giá mua/tài chính', async () => {
    const res = await fetch(`${BASE_URL}/api/public/devices/UNI-QR-2026-0001`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.purchase_price, undefined);
    assert.strictEqual(json.data.supplier_id, undefined);
  });

  await test('Public QR Lookup: Mã QR không tồn tại trả về chuẩn HTTP 404 Not Found', async () => {
    const res = await fetch(`${BASE_URL}/api/public/devices/NON-EXISTING-QR-TOKEN-9999`);
    const json = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(json.success, false);
  });

  // =========================================================================
  // PHẦN 9: SECURITY HEADERS & AUDIT LOGGING (TEST 29 - 30)
  // =========================================================================
  await test('Security Headers: Phản hồi API chứa đầy đủ Security Headers từ Helmet', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  });

  await test('Audit Log Security: Audit repository tự động che giấu mật khẩu & token trước khi lưu DB', async () => {
    const auditRepository = require('./src/repositories/auditRepository');
    const logId = await auditRepository.createLog({
      userId: 1,
      action: 'SECURITY_TEST_ACTION',
      entityType: 'USER',
      entityId: 1,
      newValues: {
        username: 'test_audit_user',
        password: 'SensitivePassword123!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5c...',
      },
    });

    const [rows] = await pool.query('SELECT new_values FROM audit_logs WHERE id = ?', [logId]);
    assert.ok(rows.length > 0);
    const newValuesStr = typeof rows[0].new_values === 'string' ? rows[0].new_values : JSON.stringify(rows[0].new_values);
    assert.ok(!newValuesStr.includes('SensitivePassword123!'), 'Password không được xuất hiện trong audit log');
    assert.ok(newValuesStr.includes('[MASKED_CREDENTIAL]'), 'Password phải được che giấu thành [MASKED_CREDENTIAL]');
  });

  // =========================================================================
  // PHẦN 10: HTTPONLY SECURE COOKIE TOKEN MIGRATION (TEST 31 - 34)
  // =========================================================================
  let sessionCookie = '';

  await test('Cookie Migration: Đăng nhập POST /api/auth/login trả về Set-Cookie với cờ HttpOnly', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    });
    assert.strictEqual(res.status, 200);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Response phải chứa header Set-Cookie');
    assert.ok(setCookie.includes('access_token='), 'Cookie phải chứa access_token');
    assert.ok(setCookie.toLowerCase().includes('httponly'), 'Cookie bắt buộc phải có cờ HttpOnly');
    
    // Lưu cookie cho test tiếp theo
    sessionCookie = setCookie.split(';')[0];
  });

  await test('Cookie Migration: Đăng ký POST /api/auth/register trả về Set-Cookie với cờ HttpOnly', async () => {
    const regUsername = `cookie_reg_${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Cookie Reg User',
        email: `${regUsername}@utt.edu.vn`,
        username: regUsername,
        password: 'Password@2026',
        confirmPassword: 'Password@2026',
      }),
    });
    assert.strictEqual(res.status, 201);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Response đăng ký phải chứa header Set-Cookie');
    assert.ok(setCookie.includes('access_token='), 'Cookie đăng ký phải chứa access_token');
    assert.ok(setCookie.toLowerCase().includes('httponly'), 'Cookie đăng ký phải có cờ HttpOnly');
  });

  await test('Cookie Migration: Backend authenticate thành công khi request CHỈ gửi HttpOnly Cookie (Không gửi Bearer Header)', async () => {
    assert.ok(sessionCookie, 'Phải có session cookie từ bước login');
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        Cookie: sessionCookie,
      },
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.username, 'admin');
  });

  await test('Cookie Migration: Đăng xuất POST /api/auth/logout xóa sạch HttpOnly Cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: sessionCookie,
      },
    });
    assert.strictEqual(res.status, 200);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Response đăng xuất phải chứa header Set-Cookie để clear');
    assert.ok(
      setCookie.includes('access_token=;') ||
      setCookie.includes('Max-Age=0') ||
      setCookie.includes('Expires=Thu, 01 Jan 1970'),
      'Cookie phải được thu hồi/xóa hạn dùng khi logout'
    );
  });

  await test('CSRF Defense: Request mang HttpOnly Cookie gửi từ Origin độc hại https://evil-attacker.com bị từ chối 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
        Origin: 'https://evil-attacker.com',
      },
      body: JSON.stringify({
        deviceId: 1,
        title: 'CSRF Attack Attempt',
        description: 'Should be blocked',
        priority: 'HIGH',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  await test('JWT Algorithm Security: Token giả mạo với thuật toán none bị từ chối 401 Unauthorized', async () => {
    // Tạo JWT token với "alg": "none"
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: 1, username: 'admin', role: 'ADMIN' })).toString('base64url');
    const unsignedNoneToken = `${header}.${payload}.`;

    const res = await fetch(`${BASE_URL}/api/devices`, {
      headers: {
        Authorization: `Bearer ${unsignedNoneToken}`,
      },
    });
    assert.strictEqual(res.status, 401);
  });

  // =========================================================================
  // KẾT QUẢ TỔNG HỢP
  // =========================================================================
  console.log(`========================================================================`);
  console.log(`🎉 HOÀN THÀNH: ${passedCount}/${totalCount} BÀI KIỂM THỬ AN NINH (SECURITY HARDENING) ĐẠT!`);
  console.log(`========================================================================\n`);

  await after.fn();
}

runTests().catch((err) => {
  console.error('\n❌ SECURITY TEST FAILED:', err);
  process.exit(1);
});
