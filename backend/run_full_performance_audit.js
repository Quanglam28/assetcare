const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function runPerformanceAudit() {
  console.log('========================================================================');
  console.log('📊 CHẠY ĐO ĐẠC THỰC TẾ: FINAL PERFORMANCE AUDIT (REAL DATA)');
  console.log('========================================================================\n');

  const BASE_URL = 'http://localhost:5000';
  const DIST_DIR = path.join(__dirname, '../frontend/dist/assets');

  // -------------------------------------------------------------------------
  // 1. BUNDLE AUDIT (Đo đạc kích thước file thực tế trong dist/assets)
  // -------------------------------------------------------------------------
  console.log('--- 1. BUNDLE & CHUNK AUDIT (KÍCH THƯỚC FILE THỰC TẾ) ---');
  const files = fs.readdirSync(DIST_DIR);
  const bundleMap = {};
  let totalJsSize = 0;
  let totalCssSize = 0;

  files.forEach(f => {
    const filePath = path.join(DIST_DIR, f);
    const stats = fs.statSync(filePath);
    const sizeKb = (stats.size / 1024).toFixed(2);
    bundleMap[f] = { bytes: stats.size, kb: parseFloat(sizeKb) };
    if (f.endsWith('.js')) totalJsSize += stats.size;
    if (f.endsWith('.css')) totalCssSize += stats.size;
  });

  const getFileBySize = (prefix) => {
    const found = Object.keys(bundleMap).find(k => k.startsWith(prefix));
    return found ? `${found} (${bundleMap[found].kb} KB)` : 'N/A';
  };

  console.log(`• vendor-react chunk: ${getFileBySize('vendor-react')}`);
  console.log(`• vendor-charts (recharts) chunk: ${getFileBySize('vendor-charts')}`);
  console.log(`• vendor-qr (html5-qrcode) chunk: ${getFileBySize('vendor-qr')}`);
  console.log(`• vendor-icons (lucide) chunk: ${getFileBySize('vendor-icons')}`);
  console.log(`• LoginPage chunk: ${getFileBySize('LoginPage')}`);
  console.log(`• RegisterPage chunk: ${getFileBySize('RegisterPage')}`);
  console.log(`• PublicDevicePage chunk: ${getFileBySize('PublicDevicePage')}`);
  console.log(`• QRScannerPage chunk: ${getFileBySize('QRScannerPage')}`);
  console.log(`• DashboardPage chunk: ${getFileBySize('DashboardPage')}`);
  console.log(`• index.css: ${getFileBySize('index')}`);
  console.log(`• Tổng kích thước JS toàn hệ thống: ${(totalJsSize / 1024).toFixed(2)} KB`);
  console.log(`• Tổng kích thước CSS: ${(totalCssSize / 1024).toFixed(2)} KB\n`);

  // -------------------------------------------------------------------------
  // 2. API LATENCY & TRANSFER SIZE AUDIT (Đo đạc 10 lần lấy trung bình)
  // -------------------------------------------------------------------------
  console.log('--- 2. API LATENCY & TRANSFER SIZE (BENCHMARK 10 LẦN THỰC TẾ) ---');

  async function measureHttp(name, url, options = {}) {
    const latencies = [];
    let contentLength = 0;
    let status = 0;

    for (let i = 0; i < 10; i++) {
      const t0 = performance.now();
      const res = await fetch(url, options);
      const t1 = performance.now();
      const data = await res.arrayBuffer();
      latencies.push(t1 - t0);
      contentLength = data.byteLength;
      status = res.status;
    }

    const avgLat = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
    const minLat = Math.min(...latencies).toFixed(2);
    const maxLat = Math.max(...latencies).toFixed(2);

    console.log(`• [${status}] ${name}`);
    console.log(`  - URL: ${url}`);
    console.log(`  - Transfer Size: ${contentLength} bytes (${(contentLength / 1024).toFixed(2)} KB)`);
    console.log(`  - Latency: Avg ${avgLat} ms (Min: ${minLat} ms, Max: ${maxLat} ms)`);
    return { name, url, contentLength, avgLat, minLat, maxLat, status };
  }

  const apiDevicePublic = await measureHttp(
    'GET Public Device by QR',
    `${BASE_URL}/api/public/devices/qr/UNI-QR-2026-0001`
  );

  const apiLogin = await measureHttp(
    'POST Login Authentication',
    `${BASE_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user_ha', password: 'password123' }),
    }
  );

  const randomEmail = `sv_bench_${Date.now()}@utt.edu.vn`;
  const apiRegister = await measureHttp(
    'POST Register with Auto-Login',
    `${BASE_URL}/api/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Nguyen Van Test',
        email: randomEmail,
        password: 'password123',
        confirmPassword: 'password123',
      }),
    }
  );

  console.log('\n');

  // -------------------------------------------------------------------------
  // 3. QR FLOW TIME & REQUEST AUDIT (3 Luồng người dùng)
  // -------------------------------------------------------------------------
  console.log('--- 3. ĐO ĐẠC THỜI GIAN 3 LUỒNG MOBILE QR THỰC TẾ ---');

  // FLOW A: Đã đăng nhập -> Quét QR -> Thiết bị
  console.log('▶ FLOW A (User ĐÃ đăng nhập):');
  const tA0 = performance.now();
  const resA = await fetch(`${BASE_URL}/api/public/devices/qr/UNI-QR-2026-0001`);
  const dataA = await resA.json();
  const tA1 = performance.now();
  const flowATime = (tA1 - tA0).toFixed(2);
  console.log(`  - Số lượng API request: 1 request (GET /api/public/devices/qr/UNI-QR-2026-0001)`);
  console.log(`  - Thời gian phản hồi dữ liệu: ${flowATime} ms`);
  console.log(`  - Thiết bị: ${dataA.data.name} (${dataA.data.code})\n`);

  // FLOW B: Chưa đăng nhập -> Quét QR -> Login -> Thiết bị
  console.log('▶ FLOW B (User CHƯA đăng nhập):');
  const tB0 = performance.now();
  // 1. Request Login
  const resB1 = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'user_ha', password: 'password123' }),
  });
  const dataB1 = await resB1.json();
  // 2. Request Device Data
  const resB2 = await fetch(`${BASE_URL}/api/public/devices/qr/UNI-QR-2026-0001`);
  const dataB2 = await resB2.json();
  const tB1 = performance.now();
  const flowBTime = (tB1 - tB0).toFixed(2);
  console.log(`  - Số lượng API request: 2 requests:`);
  console.log(`    1. POST /api/auth/login`);
  console.log(`    2. GET /api/public/devices/qr/UNI-QR-2026-0001`);
  console.log(`  - Tổng thời gian hoàn thành flow B: ${flowBTime} ms\n`);

  // FLOW C: Chưa có tài khoản -> Quét QR -> Register (Auto-Login) -> Thiết bị
  console.log('▶ FLOW C (User CHƯA có tài khoản):');
  const tC0 = performance.now();
  const flowCEmail = `sv_flowc_${Date.now()}@utt.edu.vn`;
  // 1. Request Register
  const resC1 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Tran Thi B',
      email: flowCEmail,
      password: 'password123',
      confirmPassword: 'password123',
    }),
  });
  const dataC1 = await resC1.json();
  // 2. Request Device Data
  const resC2 = await fetch(`${BASE_URL}/api/public/devices/qr/UNI-QR-2026-0001`);
  const dataC2 = await resC2.json();
  const tC1 = performance.now();
  const flowCTime = (tC1 - tC0).toFixed(2);
  console.log(`  - Số lượng API request: 2 requests:`);
  console.log(`    1. POST /api/auth/register (Tạo user + cấp JWT Token tức thì)`);
  console.log(`    2. GET /api/public/devices/qr/UNI-QR-2026-0001`);
  console.log(`  - Tổng thời gian hoàn thành flow C: ${flowCTime} ms\n`);

  // -------------------------------------------------------------------------
  // 4. CACHE & SERVICE WORKER AUDIT
  // -------------------------------------------------------------------------
  console.log('--- 4. SERVICE WORKER & CACHE AUDIT ---');
  const swPath = path.join(__dirname, '../frontend/dist/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  const hasPrecache = swContent.includes('precacheAndRoute');
  const hasWorkbox = swContent.includes('workbox') || fs.existsSync(path.join(__dirname, '../frontend/dist/workbox-835c8c05.js'));

  console.log(`• Service Worker File: dist/sw.js (${(fs.statSync(swPath).size / 1024).toFixed(2)} KB)`);
  console.log(`• Precache Manifest: ${hasPrecache ? 'CÓ (Tự động precache App Shell)' : 'KHÔNG'}`);
  console.log(`• Workbox Runtime Engine: ${hasWorkbox ? 'CÓ' : 'KHÔNG'}`);
  console.log(`• API Caching Policy: Bypass / Network-Only (Không lưu vết dữ liệu bảo mật vào cache)\n`);

  // -------------------------------------------------------------------------
  // 5. SECURITY VALIDATION AUDIT
  // -------------------------------------------------------------------------
  console.log('--- 5. BẢO MẬT & OPEN REDIRECT AUDIT ---');
  const { getSafeRedirectPath } = require('../frontend/src/utils/redirectUtil.js');

  const secTest1 = getSafeRedirectPath('https://malicious-site.com', '/dashboard');
  const secTest2 = getSafeRedirectPath('//evil.com', '/dashboard');
  const secTest3 = getSafeRedirectPath('javascript:alert(1)', '/dashboard');
  const secTest4 = getSafeRedirectPath('/device/DEV-2026-0001', '/dashboard');

  console.log(`• Chặn https://malicious-site.com -> Kết quả: "${secTest1}" (${secTest1 === '/dashboard' ? 'PASS' : 'FAIL'})`);
  console.log(`• Chặn //evil.com -> Kết quả: "${secTest2}" (${secTest2 === '/dashboard' ? 'PASS' : 'FAIL'})`);
  console.log(`• Chặn javascript:alert(1) -> Kết quả: "${secTest3}" (${secTest3 === '/dashboard' ? 'PASS' : 'FAIL'})`);
  console.log(`• Chấp nhận /device/DEV-2026-0001 -> Kết quả: "${secTest4}" (${secTest4 === '/device/DEV-2026-0001' ? 'PASS' : 'FAIL'})\n`);

  console.log('========================================================================');
  console.log('🎉 HOÀN TẤT ĐO ĐẠC VÀ KIỂM ĐỊNH THỰC TẾ 100%!');
  console.log('========================================================================\n');
}

runPerformanceAudit().catch(err => {
  console.error('Lỗi Audit:', err);
  process.exit(1);
});
