/**
 * Test Suite: ĐỒNG BỘ TOÀN DIỆN NGHIỆP VỤ BÁO HỎNG & BẢO TRÌ (USER - ADMIN - MANAGER - TECHNICIAN)
 * Hệ thống AssetCare UTT
 */
const assert = require('assert');
const http = require('http');
const app = require('./src/app');
const { pool } = require('./src/config/db');

async function runMultiRoleSyncSuite() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log('\n========================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN ĐỒNG BỘ NGHIỆP VỤ BÁO HỎNG (4 ROLES)');
  console.log('========================================================================\n');

  // Helper login
  async function login(username, password = 'password123') {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200, `Login ${username} failed`);
    return {
      token: data.data?.token || data.token,
      user: data.data?.user || data.user,
      cookie: res.headers.get('set-cookie')?.split(';')[0] || '',
    };
  }

  // 1. Đăng nhập 4 Role và 2 user/tech khác nhau để kiểm tra IDOR
  console.log('▶ TEST 1: Xác thực tài khoản cho cả 4 Nhóm Vai Trò (ADMIN, MANAGER, TECHNICIANS, USERS)');
  const adminAuth = await login('admin');
  const managerAuth = await login('manager');
  const techNamAuth = await login('tech_nam');       // Technician 1 (ID: 4)
  const techHoangAuth = await login('tech_hoang');   // Technician 2 (ID: 5)
  const userHaAuth = await login('user_ha');         // User 1 (ID: 9)
  const userTuanAuth = await login('user_tuan');     // User 2 (ID: 10)

  assert.strictEqual(adminAuth.user.role, 'ADMIN');
  assert.strictEqual(managerAuth.user.role, 'MANAGER');
  assert.strictEqual(techNamAuth.user.role, 'TECHNICIAN');
  assert.strictEqual(techHoangAuth.user.role, 'TECHNICIAN');
  assert.strictEqual(userHaAuth.user.role, 'USER');
  assert.strictEqual(userTuanAuth.user.role, 'USER');
  console.log('  ✅ TEST 1 PASS: Đăng nhập thành công và cấp quyền chuẩn 4 Roles.\n');

  // 2. USER (user_ha) quét QR và tạo phiếu báo hỏng thiết bị 2
  console.log('▶ TEST 2: USER (user_ha) gửi phiếu báo hỏng thiết bị ID: 2 vào CSDL TiDB Cloud/MySQL');
  const testTitle = `Thiết bị phòng 302 bị mờ [Sync-Test ${Date.now()}]`;
  const payload = {
    deviceId: 2,
    title: testTitle,
    incidentType: 'HARDWARE',
    priority: 'URGENT',
    description: 'Khi bật thiết bị thì đèn chớp 3 lần rồi tự tắt, quạt kêu to bất thường.',
    contactPhone: '0912345678',
    contactEmail: 'thuha.gv@utt.edu.vn',
  };
  const createRes = await fetch(`${baseUrl}/api/maintenance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userHaAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(payload),
  });
  const createData = await createRes.json();
  assert.strictEqual(createRes.status, 201);
  assert.strictEqual(createData.success, true);
  const createdTicket = createData.data;
  assert.ok(createdTicket.id > 0);
  assert.strictEqual(createdTicket.device_id, 2);
  assert.strictEqual(createdTicket.reporter_id, userHaAuth.user.id);
  assert.strictEqual(createdTicket.status, 'PENDING');
  assert.strictEqual(createdTicket.priority, 'URGENT');
  assert.strictEqual(createdTicket.sla_hours, 4);
  console.log(`  ✅ TEST 2 PASS: Phiếu [${createdTicket.code}] ID [${createdTicket.id}] được ghi nhận thực tế trong CSDL với trạng thái PENDING.\n`);

  // 3. Kiểm tra Chống tạo trùng phiếu lặp lại (Idempotency)
  console.log('▶ TEST 3: Kiểm tra cơ chế chống tạo trùng phiếu khi User click nhiều lần');
  const dupeRes = await fetch(`${baseUrl}/api/maintenance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userHaAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(payload),
  });
  const dupeData = await dupeRes.json();
  assert.strictEqual(dupeData.data.id, createdTicket.id, 'Phải trả về phiếu hiện có thay vì tạo bản ghi rác trùng lặp');
  console.log(`  ✅ TEST 3 PASS: Hệ thống chặn tạo trùng thành công, trả về phiếu hiện hành [${dupeData.data.code}].\n`);

  // 4. ADMIN nhìn thấy ngay phiếu mới trên Dashboard & Maintenance List
  console.log('▶ TEST 4: ADMIN truy vấn danh sách phiếu và thấy ngay phiếu PENDING mới tạo');
  const adminListRes = await fetch(`${baseUrl}/api/maintenance?status=PENDING&limit=100`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  const adminListData = await adminListRes.json();
  assert.strictEqual(adminListRes.status, 200);
  const foundInAdmin = adminListData.data.find((item) => item.id === createdTicket.id);
  assert.ok(foundInAdmin, 'Admin phải nhìn thấy phiếu mới');
  assert.strictEqual(foundInAdmin.code, createdTicket.code);
  assert.strictEqual(foundInAdmin.status, 'PENDING');
  console.log(`  ✅ TEST 4 PASS: ADMIN đã lấy dữ liệu Real-time và thấy phiếu [${foundInAdmin.code}] của User.\n`);

  // 5. MANAGER nhìn thấy phiếu theo quyền quản lý
  console.log('▶ TEST 5: MANAGER truy vấn danh sách phiếu bảo trì');
  const managerListRes = await fetch(`${baseUrl}/api/maintenance?status=PENDING&limit=100`, {
    headers: { Authorization: `Bearer ${managerAuth.token}` },
  });
  const managerListData = await managerListRes.json();
  assert.strictEqual(managerListRes.status, 200);
  const foundInManager = managerListData.data.find((item) => item.id === createdTicket.id);
  assert.ok(foundInManager, 'Manager phải thấy phiếu trong danh sách');
  console.log(`  ✅ TEST 5 PASS: MANAGER đã thấy phiếu [${foundInManager.code}] trong danh sách.\n`);

  // 6. Kiểm tra RBAC & IDOR Bảo vệ
  console.log('▶ TEST 6: Kiểm tra bảo vệ RBAC & IDOR (User không được phân công, User khác không được xem)');
  // A. User thường cố tình tự phân công kỹ thuật viên -> 403 Forbidden
  const userAssignRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userHaAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ technicianId: techNamAuth.user.id }),
  });
  assert.strictEqual(userAssignRes.status, 403);

  // B. User khác (user_tuan) cố tình đọc chi tiết phiếu của user_ha -> 403 Forbidden
  const idorViewRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}`, {
    headers: { Authorization: `Bearer ${userTuanAuth.token}` },
  });
  assert.strictEqual(idorViewRes.status, 403);
  console.log('  ✅ TEST 6 PASS: Chặn triệt để User trái quyền phân công (403) và xem trộm phiếu của User khác (403).\n');

  // 7. ADMIN / MANAGER phân công Kỹ thuật viên (tech_nam)
  console.log('▶ TEST 7: ADMIN/MANAGER thực hiện phân công phiếu cho KTV tech_nam (ID: 4)');
  const assignRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      technicianId: techNamAuth.user.id,
      notes: 'Đồng chí Nam qua phòng 302 kiểm tra nguồn máy chiếu trong buổi sáng nay.',
    }),
  });
  const assignData = await assignRes.json();
  assert.strictEqual(assignRes.status, 200);
  assert.strictEqual(assignData.data.status, 'ASSIGNED');
  assert.strictEqual(assignData.data.technician_id, techNamAuth.user.id);
  console.log(`  ✅ TEST 7 PASS: Phiếu [${createdTicket.code}] đã chuyển sang ASSIGNED và giao cho KTV [${techNamAuth.user.username}].\n`);

  // 8. TECHNICIAN (tech_nam) nhìn thấy phiếu trong hàng đợi của mình
  console.log('▶ TEST 8: KTV (tech_nam) kiểm tra danh sách công việc được giao (assignedToMe)');
  const techQueueRes = await fetch(`${baseUrl}/api/maintenance?assignedToMe=true&limit=100`, {
    headers: { Authorization: `Bearer ${techNamAuth.token}` },
  });
  const techQueueData = await techQueueRes.json();
  assert.strictEqual(techQueueRes.status, 200);
  const foundInTech = techQueueData.data.find((item) => item.id === createdTicket.id);
  assert.ok(foundInTech, 'KTV Nam phải thấy phiếu được giao');
  assert.strictEqual(foundInTech.status, 'ASSIGNED');
  console.log(`  ✅ TEST 8 PASS: KTV Nam nhìn thấy phiếu [${foundInTech.code}] trong hàng đợi của mình.\n`);

  // 9. Kỹ thuật viên khác (tech_hoang) cố tình thao tác trên phiếu của tech_nam -> 403 Forbidden
  console.log('▶ TEST 9: KTV khác (tech_hoang) cố tình thao tác Bắt đầu/Hoàn thành phiếu của tech_nam');
  const techHoangStartRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techHoangAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ notes: 'Cố tình can thiệp' }),
  });
  assert.strictEqual(techHoangStartRes.status, 403);
  console.log('  ✅ TEST 9 PASS: IDOR Protection chặn KTV khác can thiệp công việc (403 Forbidden).\n');

  // 10. KTV tech_nam tiến hành Bắt đầu xử lý (IN_PROGRESS)
  console.log('▶ TEST 10: KTV tech_nam tiếp nhận tại hiện trường và Bắt đầu xử lý (startWork)');
  const startRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techNamAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ notes: 'Đã đến phòng 302, kiểm tra nguồn điện và mạch sấy bóng đèn.' }),
  });
  const startData = await startRes.json();
  assert.strictEqual(startRes.status, 200);
  assert.strictEqual(startData.data.status, 'IN_PROGRESS');
  console.log(`  ✅ TEST 10 PASS: Phiếu [${createdTicket.code}] đã chuyển sang IN_PROGRESS.\n`);

  // 11. KTV tech_nam chuyển sang Chờ linh kiện (WAITING_PART) và Tiếp tục (RESUME)
  console.log('▶ TEST 11: KTV tech_nam đánh dấu chờ linh kiện và tiếp tục xử lý');
  const waitRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/waiting-part`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techNamAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      notes: 'Cần thay thế bo nguồn phụ và tụ lọc 450V.',
      partsNeeded: 'Bo mạch nguồn DC-DC Panasonic PT-MZ680',
    }),
  });
  const waitData = await waitRes.json();
  assert.strictEqual(waitData.data.status, 'WAITING_PART');

  const resumeRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techNamAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ notes: 'Đã nhận bo mạch từ kho CSVC, tiến hành thay thế và hàn nối.' }),
  });
  const resumeData = await resumeRes.json();
  assert.strictEqual(resumeData.data.status, 'IN_PROGRESS');
  console.log(`  ✅ TEST 11 PASS: Quy trình WAITING_PART ➔ RESUME chuyển đổi trạng thái hoàn hảo.\n`);

  // 12. KTV tech_nam Hoàn thành sửa chữa (completeRequest)
  console.log('▶ TEST 12: KTV tech_nam Hoàn thành sửa chữa, nhập chi phí và gửi nghiệm thu');
  const completeRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techNamAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      rootCause: 'Tụ lọc nguồn bị phồng rò điện làm sụt áp khi khởi động bóng laser',
      resolution: 'Thay thế cụm tụ lọc và vệ sinh lưới lọc bụi tản nhiệt',
      actualCost: 350000,
      completionNote: 'Máy chiếu đã chiếu thử nghiệm 30 phút ổn định, độ sáng đạt chuẩn.',
      parts: [
        { partName: 'Tụ điện cao áp 450V 120uF', quantity: 2, unitPrice: 75000 },
        { partName: 'Bo lọc nguồn thứ cấp', quantity: 1, unitPrice: 200000 },
      ],
    }),
  });
  const completeData = await completeRes.json();
  assert.strictEqual(completeRes.status, 200);
  assert.strictEqual(completeData.data.status, 'COMPLETED');
  assert.strictEqual(Number(completeData.data.actual_cost), 350000);
  console.log(`  ✅ TEST 12 PASS: KTV hoàn thành sửa chữa thành công (COMPLETED, Chi phí: 350.000 đ).\n`);

  // 13. Tất cả các Role (ADMIN, MANAGER, USER) đều thấy trạng thái COMPLETED
  console.log('▶ TEST 13: Toàn bộ ADMIN, MANAGER và USER kiểm tra trạng thái COMPLETED đồng bộ');
  const [vAdmin, vManager, vUser] = await Promise.all([
    fetch(`${baseUrl}/api/maintenance/${createdTicket.id}`, { headers: { Authorization: `Bearer ${adminAuth.token}` } }).then((r) => r.json()),
    fetch(`${baseUrl}/api/maintenance/${createdTicket.id}`, { headers: { Authorization: `Bearer ${managerAuth.token}` } }).then((r) => r.json()),
    fetch(`${baseUrl}/api/maintenance/${createdTicket.id}`, { headers: { Authorization: `Bearer ${userHaAuth.token}` } }).then((r) => r.json()),
  ]);

  assert.strictEqual(vAdmin.data.status, 'COMPLETED');
  assert.strictEqual(vManager.data.status, 'COMPLETED');
  assert.strictEqual(vUser.data.status, 'COMPLETED');
  console.log('  ✅ TEST 13 PASS: ADMIN, MANAGER, USER đều đọc thấy dữ liệu mới nhất COMPLETED từ cùng 1 CSDL.\n');

  // 14. USER (user_ha) nghiệm thu và Đóng phiếu (acceptAndClose)
  console.log('▶ TEST 14: USER (user_ha) nghiệm thu ĐẠT và Đóng phiếu (CLOSED)');
  const acceptRes = await fetch(`${baseUrl}/api/maintenance/${createdTicket.id}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userHaAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      rating: 5,
      notes: 'Máy chiếu phòng 302 hoạt động rất sáng và êm. Cảm ơn anh Nam kỹ thuật!',
    }),
  });
  const acceptData = await acceptRes.json();
  assert.strictEqual(acceptRes.status, 200);
  assert.strictEqual(acceptData.data.status, 'CLOSED');
  console.log(`  ✅ TEST 14 PASS: Phiếu [${createdTicket.code}] đã được nghiệm thu và ĐÓNG HOÀN TẤT (CLOSED).\n`);

  // 15. Đồng bộ Lệnh Công Tác (Work Orders Module Sync)
  console.log('▶ TEST 15: Kiểm thử đồng bộ Lệnh công tác (Work Orders) giữa Admin & Technician');
  const createWoRes = await fetch(`${baseUrl}/api/work-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      deviceId: 1,
      title: 'Bảo trì định kỳ máy chiếu hội trường',
      type: 'PREVENTIVE',
      priority: 'HIGH',
      assignedTo: techNamAuth.user.id,
      estimatedCost: 500000,
    }),
  });
  const createWoData = await createWoRes.json();
  assert.strictEqual(createWoRes.status, 201);
  const woId = createWoData.data.id;

  // Tech Nam xem Work Order được giao
  const woNamRes = await fetch(`${baseUrl}/api/work-orders/${woId}`, {
    headers: { Authorization: `Bearer ${techNamAuth.token}` },
  });
  assert.strictEqual(woNamRes.status, 200);

  // Tech Hoang cố tình xem Work Order của Tech Nam -> 403 Forbidden
  const woHoangRes = await fetch(`${baseUrl}/api/work-orders/${woId}`, {
    headers: { Authorization: `Bearer ${techHoangAuth.token}` },
  });
  assert.strictEqual(woHoangRes.status, 403);

  // Tech Nam bắt đầu thực hiện Work Order (IN_PROGRESS)
  const startWoRes = await fetch(`${baseUrl}/api/work-orders/${woId}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techNamAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  assert.strictEqual(startWoRes.status, 200);

  // Tech Nam hoàn thành Work Order
  const completeWoRes = await fetch(`${baseUrl}/api/work-orders/${woId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${techNamAuth.token}`,
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      actualCost: 480000,
      resolution: 'Đã bảo dưỡng toàn bộ quạt tản nhiệt và thấu kính laser',
    }),
  });
  const completeWoData = await completeWoRes.json();
  assert.strictEqual(completeWoRes.status, 200);
  assert.strictEqual(completeWoData.data.status, 'COMPLETED');
  console.log(`  ✅ TEST 15 PASS: Lệnh công tác [${createWoData.data.work_order_code}] đồng bộ trạng thái COMPLETED cho toàn bộ Roles.\n`);

  console.log('========================================================================');
  console.log('🎉 TOÀN BỘ 15/15 BÀI KIỂM THỬ ĐỒNG BỘ NGHIỆP VỤ 4 ROLES ĐỀU ĐẠT 100%!');
  console.log('========================================================================\n');

  server.close();
  await pool.end();
}

runMultiRoleSyncSuite().catch((err) => {
  console.error('\n❌ LỖI KIỂM THỬ ĐỒNG BỘ:', err);
  process.exit(1);
});
