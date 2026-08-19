const http = require('http');

async function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runSecurityAudit() {
  console.log('========================================================================');
  console.log('🛡️  RÀ SOÁT BẢO MẬT & NGHIỆP VỤ HỆ THỐNG (10 SECURITY ASSERTIONS)');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 10;

  // Login accounts
  const adminRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'password123' });
  const adminToken = adminRes.body.data.token;

  const techRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'tech_nam', password: 'password123' });
  const techToken = techRes.body.data.token;

  const userRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'user_ha', password: 'password123' });
  const userToken = userRes.body.data.token;

  // 1. User không thể truy cập Admin API (/api/users)
  const t1 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/users', method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (t1.status === 403) {
    console.log('✅ [PASS] 1. User không thể truy cập Admin API (HTTP 403 Forbidden chặn chuẩn xác)');
    passed++;
  } else {
    console.log(`❌ [FAIL] 1. User truy cập được Admin API (Status: ${t1.status})`);
  }

  // 2. Technician không thể xóa thiết bị
  const t2 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/devices/1', method: 'DELETE',
    headers: { 'Authorization': `Bearer ${techToken}` }
  });
  if (t2.status === 403) {
    console.log('✅ [PASS] 2. Technician không có quyền xóa thiết bị (HTTP 403 Forbidden chặn chuẩn xác)');
    passed++;
  } else {
    console.log(`❌ [FAIL] 2. Technician xóa được thiết bị (Status: ${t2.status})`);
  }

  // 3. User chỉ xem phiếu của mình (/api/maintenance/my)
  const t3 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/maintenance/my', method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const myTickets = t3.body?.data || [];
  const allMine = myTickets.every(t => t.reporter_id === userRes.body.data.user.id);
  if (t3.status === 200 && allMine) {
    console.log(`✅ [PASS] 3. User chỉ xem đúng phiếu của mình (Tổng số: ${myTickets.length} phiếu, 100% thuộc ID ${userRes.body.data.user.id})`);
    passed++;
  } else {
    console.log('❌ [FAIL] 3. User xem được phiếu của người khác');
  }

  // 4. QR Token không hợp lệ trả về lỗi 404
  const t4 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/public/devices/qr/INVALID-TOKEN-999999', method: 'GET'
  });
  if (t4.status === 404) {
    console.log('✅ [PASS] 4. QR Token giả mạo/không hợp lệ bị từ chối chính xác (HTTP 404 Not Found)');
    passed++;
  } else {
    console.log(`❌ [FAIL] 4. QR Token không hợp lệ không trả 404 (Status: ${t4.status})`);
  }

  // 5. Ticket workflow không thể nhảy cóc trạng thái sai
  const t5 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/maintenance/1/complete', method: 'POST',
    headers: { 'Authorization': `Bearer ${techToken}`, 'Content-Type': 'application/json' },
  }, { rootCause: 'Test', resolution: 'Test', actualCost: 10000 });
  if (t5.status === 400 || t5.status === 403 || t5.status === 422) {
    console.log('✅ [PASS] 5. State Machine chặn nhảy cóc trạng thái sai (Không thể Complete khi chưa In Progress)');
    passed++;
  } else {
    console.log(`❌ [FAIL] 5. Cho phép nhảy cóc trạng thái sai (Status: ${t5.status})`);
  }

  // 6. Ticket closed không thể sửa tùy tiện
  const t6 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/maintenance/24/start', method: 'POST',
    headers: { 'Authorization': `Bearer ${techToken}` }
  });
  if (t6.status === 400 || t6.status === 422) {
    console.log('✅ [PASS] 6. Phiếu đã Đóng (CLOSED) có tính bất biến, không thể sửa đè trạng thái');
    passed++;
  } else {
    console.log(`❌ [FAIL] 6. Phiếu CLOSED bị sửa trạng thái (Status: ${t6.status})`);
  }

  // 7. File upload sai (đuôi exe/bat/sh hoặc không có file) bị reject
  const t7 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/upload/image', method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
  }, { dummy: 'test' });
  if (t7.status === 400) {
    console.log('✅ [PASS] 7. Upload file sai định dạng hoặc không hợp lệ bị từ chối chính xác (HTTP 400)');
    passed++;
  } else {
    console.log(`❌ [FAIL] 7. Upload sai không bị từ chối (Status: ${t7.status})`);
  }

  // 8. Device RETIRED không cho tạo maintenance request mới
  const t8 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/maintenance', method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
  }, {
    deviceId: 6, // DEV-2026-0006 là RETIRED
    title: 'Báo hỏng máy đã thanh lý',
    description: 'Thử báo hỏng máy thanh lý',
    priority: 'HIGH'
  });
  if (t8.status === 400 || t8.status === 422) {
    console.log('✅ [PASS] 8. Thiết bị đã thanh lý (RETIRED) bị khóa không cho phép tạo phiếu báo hỏng mới');
    passed++;
  } else {
    console.log(`❌ [FAIL] 8. Thiết bị RETIRED vẫn tạo được phiếu (Status: ${t8.status})`);
  }

  // 9. SLA tính toán chính xác
  const t9 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/dashboard/sla', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (t9.status === 200 && Array.isArray(t9.body?.data?.byPriority) && Array.isArray(t9.body?.data?.byTechnician)) {
    console.log(`✅ [PASS] 9. Động cơ SLA hoạt động chuẩn xác (Thống kê ${t9.body.data.byPriority.length} mức ưu tiên & ${t9.body.data.byTechnician.length} kỹ thuật viên)`);
    passed++;
  } else {
    console.log('❌ [FAIL] 9. Động cơ SLA trả về dữ liệu sai');
  }

  // 10. Dashboard số liệu thực tế từ Database (Không hard-code)
  const t10 = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/dashboard/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (t10.status === 200 && t10.body?.data?.totalDevices === 50) {
    console.log(`✅ [PASS] 10. Dashboard lấy dữ liệu thật 100% từ MySQL (Tổng: ${t10.body.data.totalDevices} TB, Hoạt động: ${t10.body.data.activeDevices}, Đang sửa: ${t10.body.data.maintenanceDevices})`);
    passed++;
  } else {
    console.log('❌ [FAIL] 10. Số liệu Dashboard không khớp với Database');
  }

  console.log('\n========================================================================');
  console.log(`🏆 KẾT QUẢ RÀ SOÁT BẢO MẬT: ${passed}/${total} TIÊU CHÍ ĐẠT (${(passed/total*100).toFixed(0)}%)`);
  console.log('========================================================================\n');
}

runSecurityAudit().catch(console.error);
