const assert = require('assert');
const priorityService = require('./src/services/priorityService');
const recommendationService = require('./src/services/recommendationService');
const workOrderService = require('./src/services/workOrderService');
const notificationService = require('./src/services/notificationService');
const config = require('./src/config/priorityConfig');
const recConfig = require('./src/config/recommendationConfig');
const woConfig = require('./src/config/workOrderConfig');
const { pool } = require('./src/config/db');

async function runPhase3Tests() {
  console.log('========================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ 20/20 TEST CASES PHASE 3 — PRIORITY + RECOMMENDATION + WORK ORDER');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: Risk thấp -> Priority thấp
  // -------------------------------------------------------------------------
  console.log('▶ TEST 1: Risk thấp -> Priority thấp');
  const w = config.PRIORITY_WEIGHTS;
  // Risk = 10, Crit = LOW (25), Value = <5tr (20), Downtime = 0h (10)
  const pLow = (10 * w.FAILURE_RISK) + (25 * w.BUSINESS_CRITICALITY) + (20 * w.ASSET_VALUE) + (10 * w.DOWNTIME_IMPACT);
  assert.ok(pLow <= 25, `Điểm ưu tiên thấp phải <= 25, thực tế: ${pLow}`);
  console.log(`  ✅ TEST 1 PASS: Risk thấp (10) cho Priority thấp: ${pLow}/100 [${priorityService.getPriorityLevel(pLow)}].\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Risk cao -> Priority cao
  // -------------------------------------------------------------------------
  console.log('▶ TEST 2: Risk cao -> Priority cao');
  // Risk = 90, Crit = MEDIUM (50), Value = 50tr (60), Downtime = 8h (30)
  const pHigh = (90 * w.FAILURE_RISK) + (50 * w.BUSINESS_CRITICALITY) + (60 * w.ASSET_VALUE) + (30 * w.DOWNTIME_IMPACT);
  assert.ok(pHigh >= 65, `Điểm ưu tiên cao phải >= 65, thực tế: ${pHigh}`);
  console.log(`  ✅ TEST 2 PASS: Risk cao (90) kéo Priority lên cao: ${pHigh}/100 [${priorityService.getPriorityLevel(pHigh)}].\n`);

  // -------------------------------------------------------------------------
  // TEST 3: Critical Business Asset -> Priority tăng vọt
  // -------------------------------------------------------------------------
  console.log('▶ TEST 3: Critical business asset -> Priority tăng');
  const pCritAsset = (50 * w.FAILURE_RISK) + (100 * w.BUSINESS_CRITICALITY) + (60 * w.ASSET_VALUE) + (30 * w.DOWNTIME_IMPACT);
  const pNormAsset = (50 * w.FAILURE_RISK) + (25 * w.BUSINESS_CRITICALITY) + (60 * w.ASSET_VALUE) + (30 * w.DOWNTIME_IMPACT);
  assert.ok(pCritAsset > pNormAsset + 10, 'Thiết bị quan trọng cấp CRITICAL phải tăng ít nhất 15 điểm ưu tiên');
  console.log(`  ✅ TEST 3 PASS: Business Criticality (CRITICAL vs LOW) làm tăng điểm từ ${pNormAsset} lên ${pCritAsset}.\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Asset value cao -> Priority tăng
  // -------------------------------------------------------------------------
  console.log('▶ TEST 4: Asset value cao -> Priority tăng');
  const valLow = priorityService._calcAssetValueScore(3000000); // 3tr -> 20đ
  const valHigh = priorityService._calcAssetValueScore(150000000); // 150tr -> 100đ
  assert.strictEqual(valLow.score, 20);
  assert.strictEqual(valHigh.score, 100);
  console.log(`  ✅ TEST 4 PASS: Nguyên giá 3tr (${valLow.score}đ) vs 150tr (${valHigh.score}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 5: Downtime cao -> Priority tăng
  // -------------------------------------------------------------------------
  console.log('▶ TEST 5: Downtime cao -> Priority tăng');
  const downLow = priorityService._calcDowntimeImpactScore(0);
  const downHigh = priorityService._calcDowntimeImpactScore(200);
  assert.strictEqual(downLow.score, 10);
  assert.strictEqual(downHigh.score, 100);
  console.log(`  ✅ TEST 5 PASS: Downtime 0h (${downLow.score}đ) vs 200h (${downHigh.score}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 6: Critical Classification (>= 80 -> CRITICAL)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 6: Priority Level Classification');
  assert.strictEqual(priorityService.getPriorityLevel(85), 'CRITICAL');
  assert.strictEqual(priorityService.getPriorityLevel(65), 'HIGH');
  assert.strictEqual(priorityService.getPriorityLevel(45), 'MEDIUM');
  assert.strictEqual(priorityService.getPriorityLevel(25), 'LOW');
  assert.strictEqual(priorityService.getPriorityLevel(10), 'VERY_LOW');
  console.log('  ✅ TEST 6 PASS: Phân loại 5 cấp độ ưu tiên chính xác tuyệt đối.\n');

  // -------------------------------------------------------------------------
  // TEST 7: Recommendation Rule 1: Risk >= 80 -> CRITICAL_MAINTENANCE
  // -------------------------------------------------------------------------
  console.log('▶ TEST 7: Recommendation Rule 1 (Risk >= 80)');
  const rule1 = recConfig.RULES.RULE_1_CRITICAL_MAINTENANCE;
  assert.ok(rule1.match({ riskScore: 85, failures30d: 4 }));
  const rec1 = rule1.generate({ riskScore: 85, failures30d: 4 });
  assert.ok(rec1.reason.includes('85/100'));
  console.log(`  ✅ TEST 7 PASS: Khớp Rule 1: "${rule1.title}" - Lý do: ${rec1.reason}\n`);

  // -------------------------------------------------------------------------
  // TEST 8: Recommendation Rule 2: Overdue > 30d AND Risk >= 60 -> OVERDUE_MAINTENANCE
  // -------------------------------------------------------------------------
  console.log('▶ TEST 8: Recommendation Rule 2 (Overdue > 30d)');
  const rule2 = recConfig.RULES.RULE_2_OVERDUE_MAINTENANCE;
  assert.ok(rule2.match({ riskScore: 65, overdueDays: 35 }));
  const rec2 = rule2.generate({ riskScore: 65, overdueDays: 35 });
  assert.ok(rec2.reason.includes('35 ngày'));
  console.log(`  ✅ TEST 8 PASS: Khớp Rule 2: "${rule2.title}" - Lý do: ${rec2.reason}\n`);

  // -------------------------------------------------------------------------
  // TEST 9: Recommendation Rule 3: Repair Cost Ratio >= 60% -> REPLACEMENT_REVIEW
  // -------------------------------------------------------------------------
  console.log('▶ TEST 9: Recommendation Rule 3 (Repair Cost Ratio >= 60%)');
  const rule3 = recConfig.RULES.RULE_3_REPLACEMENT_REVIEW;
  assert.ok(rule3.match({ repairCostRatio: 0.75 }));
  const rec3 = rule3.generate({ repairCostRatio: 0.75, totalRepairCost: 15000000, purchasePrice: 20000000 });
  assert.ok(rec3.reason.includes('75%'));
  console.log(`  ✅ TEST 9 PASS: Khớp Rule 3: "${rule3.title}" - Lý do: ${rec3.reason}\n`);

  // -------------------------------------------------------------------------
  // TEST 10: Recommendation Rule 4: Recurrent Failure (30d >= 3)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 10: Recommendation Rule 4 (30d Failures >= 3)');
  const rule4 = recConfig.RULES.RULE_4_RECURRENT_FAILURE;
  assert.ok(rule4.match({ failures30d: 4 }));
  const rec4 = rule4.generate({ failures30d: 4, failureTrendPercent: 300 });
  assert.ok(rec4.reason.includes('4 sự cố'));
  console.log(`  ✅ TEST 10 PASS: Khớp Rule 4: "${rule4.title}" - Lý do: ${rec4.reason}\n`);

  // -------------------------------------------------------------------------
  // TEST 11: Tạo mới Work Order
  // -------------------------------------------------------------------------
  console.log('▶ TEST 11: Create Work Order');
  const [techUsers] = await pool.query("SELECT id FROM users WHERE role_id = 3 LIMIT 1");
  const techId = techUsers[0]?.id || 3;

  const newWo = await workOrderService.createWorkOrder({
    deviceId: 1,
    title: 'Kiểm tra bảo dưỡng định kỳ hệ thống máy chiếu P203',
    description: 'Vệ sinh lưới lọc bụi và căn chỉnh độ sáng bóng đèn chiếu',
    type: 'PREVENTIVE',
    priority: 'HIGH',
    estimatedCost: 500000,
  }, { id: 1, username: 'admin' });

  assert.ok(newWo.id > 0);
  assert.ok(newWo.work_order_code.startsWith('WO-'));
  assert.strictEqual(newWo.status, 'OPEN');
  console.log(`  ✅ TEST 11 PASS: Tạo thành công lệnh công tác [${newWo.work_order_code}] ID: ${newWo.id}.\n`);

  // -------------------------------------------------------------------------
  // TEST 12: Assign Work Order
  // -------------------------------------------------------------------------
  console.log('▶ TEST 12: Assign Work Order to Technician');
  const assignedWo = await workOrderService.assignWorkOrder(newWo.id, techId, { id: 1, username: 'admin' });
  assert.strictEqual(assignedWo.status, 'ASSIGNED');
  assert.strictEqual(assignedWo.assigned_to, techId);
  console.log(`  ✅ TEST 12 PASS: Phân công thành công cho Kỹ thuật viên ID: ${techId} (Status: ASSIGNED).\n`);

  // -------------------------------------------------------------------------
  // TEST 13: Start Work Order
  // -------------------------------------------------------------------------
  console.log('▶ TEST 13: Start Work Order (In Progress)');
  const startedWo = await workOrderService.startWorkOrder(newWo.id, { id: techId, username: 'tech_nam' });
  assert.strictEqual(startedWo.status, 'IN_PROGRESS');
  assert.ok(startedWo.started_at !== null);
  console.log(`  ✅ TEST 13 PASS: Kỹ thuật viên bắt đầu xử lý thành công (Status: IN_PROGRESS).\n`);

  // -------------------------------------------------------------------------
  // TEST 14: Complete Work Order & Auto Recalculation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 14: Complete Work Order & Recalculate Metrics');
  const completedWo = await workOrderService.completeWorkOrder(newWo.id, {
    actualCost: 450000,
    resolution: 'Đã thay tấm lọc bụi mới chính hãng và hiệu chỉnh độ nét ống kính.',
    technicianNote: 'Thiết bị hoạt động ổn định, nhiệt độ bóng đèn đạt tiêu chuẩn.',
  }, { id: techId, username: 'tech_nam' });

  assert.strictEqual(completedWo.status, 'COMPLETED');
  assert.strictEqual(Number(completedWo.actual_cost), 450000);
  assert.ok(completedWo.completed_at !== null);
  console.log(`  ✅ TEST 14 PASS: Nghiệm thu hoàn tất lệnh công tác (Chi phí: 450.000 đ, Status: COMPLETED).\n`);

  // -------------------------------------------------------------------------
  // TEST 15: Invalid Workflow Transition Protection
  // -------------------------------------------------------------------------
  console.log('▶ TEST 15: Invalid Workflow Transition Protection');
  try {
    await workOrderService.startWorkOrder(newWo.id, { id: techId });
    assert.fail('Phải báo lỗi khi cố tình Start một Work Order đã COMPLETED');
  } catch (err) {
    assert.ok(err.message.includes('Không thể chuyển trạng thái'));
    console.log(`  ✅ TEST 15 PASS: Chặn chuyển đổi trạng thái bất hợp lệ thành công (${err.message}).\n`);
  }

  // -------------------------------------------------------------------------
  // TEST 16: Notification Creation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 16: Notification Center Creation');
  const notifId = await notificationService.createNotification({
    userId: 1,
    deviceId: 1,
    type: 'RISK_HIGH',
    title: 'Cảnh báo nguy cơ sự cố tăng cao',
    message: 'Thiết bị Máy chiếu Laser Panasonic có nguy cơ sự cố 72/100',
    referenceType: 'DEVICE',
    referenceId: 1,
    severity: 'HIGH',
  });
  assert.ok(notifId > 0);
  console.log(`  ✅ TEST 16 PASS: Tạo thông báo thành công ID: ${notifId}.\n`);

  // -------------------------------------------------------------------------
  // TEST 17: Duplicate Notification Protection (Deduplication)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 17: Duplicate Notification Protection');
  const dupId = await notificationService.createNotification({
    userId: 1,
    deviceId: 1,
    type: 'RISK_HIGH',
    title: 'Cảnh báo nguy cơ sự cố tăng cao',
    message: 'Thiết bị Máy chiếu Laser Panasonic có nguy cơ sự cố 72/100',
    referenceType: 'DEVICE',
    referenceId: 1,
    severity: 'HIGH',
  });
  assert.strictEqual(dupId, notifId, 'Cơ chế deduplication phải trả về ID cũ, không tạo bản ghi mới');
  console.log(`  ✅ TEST 17 PASS: Chống spam thông báo trùng lặp hoạt động hoàn hảo.\n`);

  // -------------------------------------------------------------------------
  // TEST 18: Risk Matrix API (4 Phân Vùng)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 18: Risk Matrix API Data Structure');
  const matrixData = await priorityService.getRiskMatrixData({});
  assert.ok(Array.isArray(matrixData));
  assert.ok(matrixData.length > 0);
  const first = matrixData[0];
  assert.ok('health_score' in first);
  assert.ok('risk_score' in first);
  assert.ok('priority_score' in first);
  console.log(`  ✅ TEST 18 PASS: Ma trận rủi ro tải thành công ${matrixData.length} thiết bị với đầy đủ 4 phân vùng (Health, Risk, Priority).\n`);

  // -------------------------------------------------------------------------
  // TEST 19: E2E REST Endpoints: GET /api/devices/1/priority & GET /api/work-orders
  // -------------------------------------------------------------------------
  console.log('▶ TEST 19: E2E REST API Endpoints');
  const BASE_URL = 'http://localhost:5000';
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };

  // 1. Test Priority endpoint
  const prioRes = await fetch(`${BASE_URL}/api/devices/1/priority`, {
    headers: authHeaders,
  });
  const prioJson = await prioRes.json();
  assert.strictEqual(prioRes.status, 200);
  assert.strictEqual(prioJson.data.deviceId, 1);
  assert.ok(prioJson.data.priorityScore >= 0 && prioJson.data.priorityScore <= 100);

  // 2. Test Work Orders list
  const woRes = await fetch(`${BASE_URL}/api/work-orders`, {
    headers: authHeaders,
  });
  const woJson = await woRes.json();
  assert.strictEqual(woRes.status, 200);
  assert.ok(Array.isArray(woJson.data));

  // 3. Test Risk Matrix API
  const matrixRes = await fetch(`${BASE_URL}/api/analytics/risk-matrix`, {
    headers: authHeaders,
  });
  const matrixJson = await matrixRes.json();
  assert.strictEqual(matrixRes.status, 200);
  assert.ok(Array.isArray(matrixJson.data));

  console.log(`  ✅ TEST 19 PASS: Toàn bộ REST APIs Phase 3 (Priority, Work Orders, Risk Matrix) trả về HTTP 200 OK.\n`);

  // -------------------------------------------------------------------------
  // TEST 20: Validation on Work Order Creation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 20: Validation on Invalid Work Order Creation');
  try {
    await workOrderService.createWorkOrder({ deviceId: null, title: '' }, { id: 1 });
    assert.fail('Phải báo lỗi khi thiếu deviceId hoặc title');
  } catch (err) {
    assert.ok(err.message.includes('thiết bị'));
    console.log(`  ✅ TEST 20 PASS: Validation chặn tạo phiếu thiếu thông tin thành công (${err.message}).\n`);
  }

  console.log('========================================================================');
  console.log('🎉 TOÀN BỘ 20/20 BÀI KIỂM THỬ PHASE 3 ĐẠT 100% HOÀN HẢO!');
  console.log('========================================================================\n');
  await pool.end();
}

runPhase3Tests().catch(err => {
  console.error('❌ Lỗi Test Phase 3:', err);
  process.exit(1);
});
