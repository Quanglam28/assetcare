const assert = require('assert');
const fs = require('fs');
const path = require('path');
const simService = require('./src/services/predictiveSimulationService');
const simConfig = require('./src/config/simulationConfig');
const { pool } = require('./src/config/db');

async function runPhase4Tests() {
  console.log('========================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ 27/27 TEST CASES PHASE 4 — PREDICTIVE SIMULATION');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: 7-day simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 1: 7-Day Simulation');
  const sim7 = await simService.compareCurrentVsProjected(1, 7);
  assert.strictEqual(sim7.simulationPeriodDays, 7);
  assert.ok(sim7.scenarios.NO_MAINTENANCE.delta.health <= 0, 'Sức khỏe 7 ngày phải giảm hoặc giữ nguyên');
  console.log(`  ✅ TEST 1 PASS: Mô phỏng 7 ngày: Health ${sim7.current.healthScore} -> ${sim7.scenarios.NO_MAINTENANCE.projected.healthScore} (${sim7.scenarios.NO_MAINTENANCE.delta.health}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 2: 14-day simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 2: 14-Day Simulation');
  const sim14 = await simService.compareCurrentVsProjected(1, 14);
  assert.strictEqual(sim14.simulationPeriodDays, 14);
  assert.ok(Math.abs(sim14.scenarios.NO_MAINTENANCE.delta.health) >= Math.abs(sim7.scenarios.NO_MAINTENANCE.delta.health), '14 ngày suy giảm phải >= 7 ngày');
  console.log(`  ✅ TEST 2 PASS: Mô phỏng 14 ngày: Health ${sim14.current.healthScore} -> ${sim14.scenarios.NO_MAINTENANCE.projected.healthScore} (${sim14.scenarios.NO_MAINTENANCE.delta.health}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 3: 30-day simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 3: 30-Day Simulation (Default Period)');
  const sim30 = await simService.compareCurrentVsProjected(1, 30);
  assert.strictEqual(sim30.simulationPeriodDays, 30);
  assert.ok(sim30.scenarios.NO_MAINTENANCE.projected.failureRisk >= sim30.current.failureRisk);
  console.log(`  ✅ TEST 3 PASS: Mô phỏng 30 ngày: Risk ${sim30.current.failureRisk}% -> ${sim30.scenarios.NO_MAINTENANCE.projected.failureRisk}% (+${sim30.scenarios.NO_MAINTENANCE.delta.risk}%).\n`);

  // -------------------------------------------------------------------------
  // TEST 4: 60-day simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 4: 60-Day Simulation');
  const sim60 = await simService.compareCurrentVsProjected(1, 60);
  assert.strictEqual(sim60.simulationPeriodDays, 60);
  assert.ok(sim60.scenarios.NO_MAINTENANCE.delta.priority >= sim30.scenarios.NO_MAINTENANCE.delta.priority);
  console.log(`  ✅ TEST 4 PASS: Mô phỏng 60 ngày: Priority ${sim60.current.priorityScore} -> ${sim60.scenarios.NO_MAINTENANCE.projected.priorityScore} (+${sim60.scenarios.NO_MAINTENANCE.delta.priority}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 5: 90-day simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 5: 90-Day Simulation');
  const sim90 = await simService.compareCurrentVsProjected(1, 90);
  assert.strictEqual(sim90.simulationPeriodDays, 90);
  assert.ok(sim90.scenarios.NO_MAINTENANCE.projected.healthScore <= sim60.scenarios.NO_MAINTENANCE.projected.healthScore);
  console.log(`  ✅ TEST 5 PASS: Mô phỏng 90 ngày: Health ${sim90.current.healthScore} -> ${sim90.scenarios.NO_MAINTENANCE.projected.healthScore} (${sim90.scenarios.NO_MAINTENANCE.delta.health}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 6: Deterministic Guarantee (100 iterations return exact same result)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 6: Deterministic Guarantee (100 Iterations)');
  const firstRun = await simService.compareCurrentVsProjected(1, 30);
  for (let i = 0; i < 100; i++) {
    const nextRun = await simService.compareCurrentVsProjected(1, 30);
    assert.strictEqual(nextRun.scenarios.NO_MAINTENANCE.projected.healthScore, firstRun.scenarios.NO_MAINTENANCE.projected.healthScore);
    assert.strictEqual(nextRun.scenarios.NO_MAINTENANCE.projected.failureRisk, firstRun.scenarios.NO_MAINTENANCE.projected.failureRisk);
    assert.strictEqual(nextRun.scenarios.NO_MAINTENANCE.projected.priorityScore, firstRun.scenarios.NO_MAINTENANCE.projected.priorityScore);
  }
  console.log('  ✅ TEST 6 PASS: 100/100 lần chạy trả về kết quả tất định đồng nhất 100%.\n');

  // -------------------------------------------------------------------------
  // TEST 7: No Math.random in codebase
  // -------------------------------------------------------------------------
  console.log('▶ TEST 7: No Math.random Check');
  const serviceCode = fs.readFileSync(path.join(__dirname, 'src/services/predictiveSimulationService.js'), 'utf8');
  assert.ok(!serviceCode.includes('Math.random'), 'Service không được chứa Math.random()');
  console.log('  ✅ TEST 7 PASS: Kiểm tra tĩnh mã nguồn: 0 lời gọi Math.random().\n');

  // -------------------------------------------------------------------------
  // TEST 8: Health Projection Formula & Bounds Clamping (5 <= H <= 100)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 8: Health Projection Formula & Clamping');
  const hProjLow = simService.simulateHealthScore(20, { overdueDays: 120, ageYears: 8, trendType: 'INCREASING_STRONG' }, 90);
  assert.ok(hProjLow.score >= 5, 'Điểm sàn sức khỏe tối thiểu là 5');
  const hProjHigh = simService.simulateHealthScore(98, { overdueDays: 0, ageYears: 0.2, trendType: 'STABLE' }, 7);
  assert.ok(hProjHigh.score <= 100, 'Điểm trần sức khỏe tối đa là 100');
  console.log(`  ✅ TEST 8 PASS: Điểm sức khỏe luôn giới hạn chuẩn trong [5, 100] (Thực tế: ${hProjLow.score} và ${hProjHigh.score}).\n`);

  // -------------------------------------------------------------------------
  // TEST 9: Risk Projection Formula & Bounds Clamping (5 <= R <= 100)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 9: Risk Projection Formula & Clamping');
  const rProjHigh = simService.simulateFailureRisk(85, { failures30d: 5, overdueDays: 90 }, 90);
  assert.ok(rProjHigh.score <= 100, 'Điểm trần rủi ro tối đa là 100');
  assert.ok(rProjHigh.score >= 85, 'Rủi ro 90 ngày phải tăng');
  console.log(`  ✅ TEST 9 PASS: Điểm rủi ro luôn giới hạn chuẩn trong [5, 100] (Thực tế: ${rProjHigh.score}%).\n`);

  // -------------------------------------------------------------------------
  // TEST 10: Priority Projection Formula (Reuses Phase 3 Weights)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 10: Priority Projection Formula');
  const pProj = simService.simulatePriorityScore(80, { business_criticality: 'CRITICAL', purchase_price: 150000000 }, { downtimeHours30d: 50 }, 30);
  assert.ok(pProj.score >= 75, `Thiết bị CRITICAL rủi ro 80 phải có Priority >= 75 (thực tế: ${pProj.score})`);
  console.log(`  ✅ TEST 10 PASS: Điểm ưu tiên dự kiến: ${pProj.score}/100 [${pProj.status}].\n`);

  // -------------------------------------------------------------------------
  // TEST 11: Scenario A: NO_MAINTENANCE (Risk increases, Health drops)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 11: Scenario A: NO_MAINTENANCE');
  const noMaint = sim30.scenarios.NO_MAINTENANCE;
  assert.ok(noMaint.delta.health <= 0, 'Sức khỏe phải suy giảm');
  assert.ok(noMaint.delta.risk >= 0, 'Rủi ro sự cố phải tăng');
  console.log(`  ✅ TEST 11 PASS: Kịch bản Trì hoãn: Health giảm ${noMaint.delta.health}đ, Risk tăng +${noMaint.delta.risk}đ.\n`);

  // -------------------------------------------------------------------------
  // TEST 12: Scenario B: MAINTAIN_NOW (Benefit of Maintenance)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 12: Scenario B: MAINTAIN_NOW');
  const maintain = sim30.scenarios.MAINTAIN_NOW;
  assert.ok(maintain.projected.healthScore >= sim30.current.healthScore, 'Bảo trì ngay phải phục hồi sức khỏe');
  assert.ok(maintain.projected.failureRisk <= sim30.current.failureRisk, 'Bảo trì ngay phải giảm rủi ro');
  assert.ok(maintain.projected.priorityScore <= sim30.current.priorityScore, 'Bảo trì ngay phải hạ điểm ưu tiên');
  console.log(`  ✅ TEST 12 PASS: Kịch bản Bảo trì ngay: Health tăng +${maintain.delta.health}đ, Risk giảm ${maintain.delta.risk}đ, Priority giảm ${maintain.delta.priority}đ.\n`);

  // -------------------------------------------------------------------------
  // TEST 13: Delta Calculation (Exact Arithmetic)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 13: Delta Calculation');
  assert.strictEqual(noMaint.delta.health, noMaint.projected.healthScore - sim30.current.healthScore);
  assert.strictEqual(noMaint.delta.risk, noMaint.projected.failureRisk - sim30.current.failureRisk);
  assert.strictEqual(noMaint.delta.priority, noMaint.projected.priorityScore - sim30.current.priorityScore);
  console.log('  ✅ TEST 13 PASS: Độ lệch Delta tính toán số học chuẩn xác 100%.\n');

  // -------------------------------------------------------------------------
  // TEST 14: Status Transition Formatting
  // -------------------------------------------------------------------------
  console.log('▶ TEST 14: Status Transition Formatting');
  assert.ok(noMaint.statusChange.health.includes('➔'));
  assert.ok(noMaint.statusChange.risk.includes('➔'));
  assert.ok(noMaint.statusChange.priority.includes('➔'));
  console.log(`  ✅ TEST 14 PASS: Chuyển bậc trạng thái: [${noMaint.statusChange.priority}].\n`);

  // -------------------------------------------------------------------------
  // TEST 15: Missing Data Safe Fallback
  // -------------------------------------------------------------------------
  console.log('▶ TEST 15: Missing Metrics Safe Fallback');
  const hEmpty = simService.simulateHealthScore(80, {}, 30);
  const rEmpty = simService.simulateFailureRisk(40, {}, 30);
  assert.ok(hEmpty.score > 0 && hEmpty.score <= 100);
  assert.ok(rEmpty.score > 0 && rEmpty.score <= 100);
  console.log(`  ✅ TEST 15 PASS: Missing metrics xử lý an toàn: Health = ${hEmpty.score}đ, Risk = ${rEmpty.score}%.\n`);

  // -------------------------------------------------------------------------
  // TEST 16: NULL Values Handling
  // -------------------------------------------------------------------------
  console.log('▶ TEST 16: NULL Values Handling');
  const hNull = simService.simulateHealthScore(null, { overdueDays: null, ageYears: null }, null);
  assert.strictEqual(hNull.score > 0, true);
  console.log(`  ✅ TEST 16 PASS: NULL inputs fallback mượt mà: Health = ${hNull.score}đ.\n`);

  // -------------------------------------------------------------------------
  // TEST 17: Purchase Price Zero Safety
  // -------------------------------------------------------------------------
  console.log('▶ TEST 17: Purchase Price Zero Safety');
  const pZero = simService.simulatePriorityScore(50, { purchase_price: 0, business_criticality: 'LOW' }, {}, 30);
  assert.ok(pZero.score > 0 && pZero.score <= 100);
  console.log(`  ✅ TEST 17 PASS: Nguyên giá = 0 không gây lỗi chia 0 (Priority: ${pZero.score}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 18: Old Asset Acceleration (Age > 5 years degrades faster)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 18: Old Asset Acceleration');
  const hNew = simService.simulateHealthScore(80, { ageYears: 0.5 }, 60);
  const hOld = simService.simulateHealthScore(80, { ageYears: 8.0 }, 60);
  assert.ok(hOld.score < hNew.score, 'Máy cũ (>5 năm) phải suy giảm nhanh hơn máy mới');
  console.log(`  ✅ TEST 18 PASS: Máy 8 năm (${hOld.score}đ) suy giảm nhanh hơn máy 0.5 năm (${hNew.score}đ).\n`);

  // -------------------------------------------------------------------------
  // TEST 19: New Asset Resilience
  // -------------------------------------------------------------------------
  console.log('▶ TEST 19: New Asset Resilience');
  const ageMultNew = simService._getAgeMultiplier(0.5);
  const ageMultOld = simService._getAgeMultiplier(7.0);
  assert.ok(ageMultNew < ageMultOld);
  console.log(`  ✅ TEST 19 PASS: Hệ số tuổi máy mới: ${ageMultNew}x vs máy cũ: ${ageMultOld}x.\n`);

  // -------------------------------------------------------------------------
  // TEST 20: High Risk Asset Simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 20: High Risk Asset Surge');
  const rSurge = simService.simulateFailureRisk(75, { failures30d: 4, overdueDays: 45 }, 30);
  assert.ok(rSurge.score >= 85, 'Thiết bị nhiều sự cố + quá hạn phải bùng nổ rủi ro');
  console.log(`  ✅ TEST 20 PASS: Thiết bị nguy cơ cao bùng nổ lên: ${rSurge.score}% [${rSurge.status}].\n`);

  // -------------------------------------------------------------------------
  // TEST 21: Low Risk Asset Simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 21: Low Risk Asset Stability');
  const rStable = simService.simulateFailureRisk(15, { failures30d: 0, overdueDays: 0 }, 14);
  assert.ok(rStable.score <= 25, 'Thiết bị ổn định chỉ tăng rất nhẹ');
  console.log(`  ✅ TEST 21 PASS: Thiết bị ổn định duy trì rủi ro thấp: ${rStable.score}% [${rStable.status}].\n`);

  // -------------------------------------------------------------------------
  // TEST 22: REST API: GET /api/devices/1/simulation?days=30
  // -------------------------------------------------------------------------
  console.log('▶ TEST 22: REST API GET Simulation');
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

  const simGetRes = await fetch(`${BASE_URL}/api/devices/1/simulation?days=30`, {
    headers: authHeaders,
  });
  const simGetJson = await simGetRes.json();
  assert.strictEqual(simGetRes.status, 200);
  assert.strictEqual(simGetJson.data.deviceId, 1);
  assert.ok(simGetJson.data.scenarios.NO_MAINTENANCE);
  assert.ok(simGetJson.data.scenarios.MAINTAIN_NOW);
  console.log('  ✅ TEST 22 PASS: GET /api/devices/1/simulation?days=30 trả về HTTP 200 OK với đầy đủ 2 kịch bản.\n');

  // -------------------------------------------------------------------------
  // TEST 23: REST API: POST /api/devices/1/simulation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 23: REST API POST Simulation');
  const simPostRes = await fetch(`${BASE_URL}/api/devices/1/simulation`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ days: 60, scenario: 'MAINTAIN_NOW' }),
  });
  const simPostJson = await simPostRes.json();
  assert.strictEqual(simPostRes.status, 200);
  assert.strictEqual(simPostJson.data.selectedScenario, 'MAINTAIN_NOW');
  console.log('  ✅ TEST 23 PASS: POST /api/devices/1/simulation kịch bản MAINTAIN_NOW trả về HTTP 200 OK.\n');

  // -------------------------------------------------------------------------
  // TEST 24: REST API: Top Degrading & Predictive Alerts
  // -------------------------------------------------------------------------
  console.log('▶ TEST 24: REST API Top Degrading & Alerts');
  const [topRes, alertRes] = await Promise.all([
    fetch(`${BASE_URL}/api/analytics/predictive/top-degrading?days=30&limit=5`, { headers: authHeaders }),
    fetch(`${BASE_URL}/api/analytics/predictive/alerts?days=30`, { headers: authHeaders }),
  ]);
  const topJson = await topRes.json();
  const alertJson = await alertRes.json();
  assert.strictEqual(topRes.status, 200);
  assert.strictEqual(alertRes.status, 200);
  assert.ok(Array.isArray(topJson.data));
  assert.ok(typeof alertJson.data.criticalTransitionCount === 'number');
  console.log(`  ✅ TEST 24 PASS: Top Degrading (${topJson.data.length} thiết bị) & Cảnh báo (${alertJson.data.criticalTransitionCount} nguy cấp) trả về chuẩn HTTP 200 OK.\n`);

  // -------------------------------------------------------------------------
  // TEST 25: Authorization Protection (401 without Token)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 25: Authorization Protection');
  const unauthRes = await fetch(`${BASE_URL}/api/devices/1/simulation?days=30`);
  assert.strictEqual(unauthRes.status, 401);
  console.log('  ✅ TEST 25 PASS: Chặn truy cập trái phép không có Token (HTTP 401 Unauthorized).\n');

  // -------------------------------------------------------------------------
  // TEST 26: Full Database Real Device Integration
  // -------------------------------------------------------------------------
  console.log('▶ TEST 26: Real Database Query & Simulation Integration');
  const [devices] = await pool.query("SELECT id, name, code FROM devices LIMIT 1");
  assert.ok(devices.length > 0);
  const realSim = await simService.compareCurrentVsProjected(devices[0].id, 30);
  assert.strictEqual(realSim.deviceCode, devices[0].code);
  console.log(`  ✅ TEST 26 PASS: Mô phỏng thành công thiết bị thực từ DB [${realSim.deviceName}] (${realSim.deviceCode}).\n`);

  // -------------------------------------------------------------------------
  // TEST 27: Zero DB Pollution (No modification on real metric tables)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 27: Zero Database Pollution Verification');
  const [hScoresBefore] = await pool.query("SELECT COUNT(*) as cnt FROM asset_health_scores");
  const [rScoresBefore] = await pool.query("SELECT COUNT(*) as cnt FROM failure_risk_scores");
  const [pScoresBefore] = await pool.query("SELECT COUNT(*) as cnt FROM priority_scores");

  // Chạy 5 lần mô phỏng
  await simService.compareCurrentVsProjected(1, 7);
  await simService.compareCurrentVsProjected(1, 14);
  await simService.compareCurrentVsProjected(1, 30);
  await simService.compareCurrentVsProjected(1, 60);
  await simService.compareCurrentVsProjected(1, 90);

  const [hScoresAfter] = await pool.query("SELECT COUNT(*) as cnt FROM asset_health_scores");
  const [rScoresAfter] = await pool.query("SELECT COUNT(*) as cnt FROM failure_risk_scores");
  const [pScoresAfter] = await pool.query("SELECT COUNT(*) as cnt FROM priority_scores");

  assert.strictEqual(hScoresBefore[0].cnt, hScoresAfter[0].cnt);
  assert.strictEqual(rScoresBefore[0].cnt, rScoresAfter[0].cnt);
  assert.strictEqual(pScoresBefore[0].cnt, pScoresAfter[0].cnt);
  console.log('  ✅ TEST 27 PASS: Quá trình mô phỏng hoàn toàn Real-time In-Memory, không làm ô nhiễm DB.\n');

  console.log('========================================================================');
  console.log('🎉 TOÀN BỘ 27/27 BÀI KIỂM THỬ PHASE 4 ĐẠT 100% HOÀN HẢO!');
  console.log('========================================================================\n');
  await pool.end();
}

runPhase4Tests().catch((err) => {
  console.error('❌ Lỗi Test Phase 4:', err);
  process.exit(1);
});
