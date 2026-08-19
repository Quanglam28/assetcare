const assert = require('assert');
const failureRiskService = require('./src/services/failureRiskService');
const config = require('./src/config/failureRiskConfig');

async function runPhase2RiskTests() {
  console.log('========================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ 20/20 TEST CASES PHASE 2 — FAILURE RISK SCORE ENGINE');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: 0 Failures trong 30 ngày
  // -------------------------------------------------------------------------
  console.log('▶ TEST 1: 0 Failures (30d)');
  const res1 = failureRiskService._calcRecentFailureScore(0);
  assert.strictEqual(res1.score, 10, '0 sự cố phải đạt mức thấp 10 điểm');
  console.log(`  ✅ TEST 1 PASS: 0 sự cố đạt ${res1.score} điểm (${res1.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 2: 1 Failure trong 30 ngày
  // -------------------------------------------------------------------------
  console.log('▶ TEST 2: 1 Failure (30d)');
  const res2 = failureRiskService._calcRecentFailureScore(1);
  assert.strictEqual(res2.score, 30, '1 sự cố phải đạt mức 30 điểm');
  console.log(`  ✅ TEST 2 PASS: 1 sự cố đạt ${res2.score} điểm (${res2.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 3: >= 4 Failures trong 30 ngày
  // -------------------------------------------------------------------------
  console.log('▶ TEST 3: >= 4 Failures (30d)');
  const res3 = failureRiskService._calcRecentFailureScore(4);
  assert.strictEqual(res3.score, 95, '>= 4 sự cố phải đạt mức rất cao 95 điểm');
  console.log(`  ✅ TEST 3 PASS: 4 sự cố đạt ${res3.score} điểm (${res3.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Increasing Failure Trend (Tăng từ 1 lên 4 sự cố = +300%)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 4: Increasing Failure Trend (1 -> 4 sự cố)');
  const res4 = failureRiskService._calcFailureTrendScore(4, 1);
  assert.strictEqual(res4.deltaPercent, 300);
  assert.strictEqual(res4.score, 90, 'Tăng +300% phải đạt mức 90 điểm');
  console.log(`  ✅ TEST 4 PASS: Tăng +${res4.deltaPercent}% đạt ${res4.score} điểm (${res4.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 5: Decreasing Failure Trend (Giảm từ 4 xuống 1 sự cố = -75%)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 5: Decreasing Failure Trend (4 -> 1 sự cố)');
  const res5 = failureRiskService._calcFailureTrendScore(1, 4);
  assert.strictEqual(res5.deltaPercent, -75);
  assert.strictEqual(res5.score, 10, 'Giảm -75% phải đạt mức thấp 10 điểm');
  console.log(`  ✅ TEST 5 PASS: Giảm ${res5.deltaPercent}% đạt ${res5.score} điểm (${res5.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 6: Stable Failure Trend (2 -> 2 sự cố = 0%)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 6: Stable Failure Trend (2 -> 2 sự cố)');
  const res6 = failureRiskService._calcFailureTrendScore(2, 2);
  assert.strictEqual(res6.deltaPercent, 0);
  assert.strictEqual(res6.score, 40, 'Ổn định phải đạt mức 40 điểm');
  console.log(`  ✅ TEST 6 PASS: Ổn định đạt ${res6.score} điểm (${res6.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 7: Maintenance Overdue (Quá hạn 25 ngày)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 7: Maintenance Overdue (25 ngày)');
  const res7 = failureRiskService._calcMaintenanceOverdueScore(25, 1, 1);
  assert.strictEqual(res7.score, 60, 'Quá hạn <= 30 ngày phải đạt 60 điểm');
  console.log(`  ✅ TEST 7 PASS: Quá hạn 25 ngày đạt ${res7.score} điểm (${res7.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 8: Repair Cost Increasing (Tăng từ 1tr lên 3tr = +200%)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 8: Repair Cost Increasing (1tr -> 3tr)');
  const res8 = failureRiskService._calcRepairCostTrendScore(3000000, 1000000);
  assert.strictEqual(res8.deltaPercent, 200);
  assert.strictEqual(res8.score, 95, 'Chi phí tăng +200% phải đạt 95 điểm');
  console.log(`  ✅ TEST 8 PASS: Chi phí tăng +${res8.deltaPercent}% đạt ${res8.score} điểm (${res8.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 9: Repair Cost Decreasing (Giảm từ 4tr xuống 1tr = -75%)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 9: Repair Cost Decreasing (4tr -> 1tr)');
  const res9 = failureRiskService._calcRepairCostTrendScore(1000000, 4000000);
  assert.strictEqual(res9.deltaPercent, -75);
  assert.strictEqual(res9.score, 20, 'Chi phí giảm phải đạt 20 điểm');
  console.log(`  ✅ TEST 9 PASS: Chi phí giảm ${res9.deltaPercent}% đạt ${res9.score} điểm (${res9.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 10: Downtime Increasing (Tăng từ 4h lên 16h = +300%)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 10: Downtime Increasing (4h -> 16h)');
  const res10 = failureRiskService._calcDowntimeTrendScore(16, 4);
  assert.strictEqual(res10.deltaPercent, 300);
  assert.strictEqual(res10.score, 85, 'Downtime tăng >50% phải đạt 85 điểm');
  console.log(`  ✅ TEST 10 PASS: Downtime tăng +${res10.deltaPercent}% đạt ${res10.score} điểm (${res10.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 11: Downtime Decreasing (Giảm từ 20h xuống 2h = -90%)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 11: Downtime Decreasing (20h -> 2h)');
  const res11 = failureRiskService._calcDowntimeTrendScore(2, 20);
  assert.strictEqual(res11.deltaPercent, -90);
  assert.strictEqual(res11.score, 15, 'Downtime giảm phải đạt 15 điểm');
  console.log(`  ✅ TEST 11 PASS: Downtime giảm ${res11.deltaPercent}% đạt ${res11.score} điểm (${res11.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 12: Old Asset (> 5 năm tuổi)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 12: Old Asset (> 5 năm)');
  const oldDate = new Date();
  oldDate.setFullYear(oldDate.getFullYear() - 6);
  const res12 = failureRiskService._calcAgeRiskScore(oldDate.toISOString());
  assert.strictEqual(res12.score, 90, 'Thiết bị > 5 năm phải có AgeRisk = 90');
  console.log(`  ✅ TEST 12 PASS: Thiết bị 6 năm tuổi đạt ${res12.score} điểm (${res12.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 13: New Asset (<= 1 năm tuổi)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 13: New Asset (<= 1 năm)');
  const newDate = new Date();
  newDate.setMonth(newDate.getMonth() - 3);
  const res13 = failureRiskService._calcAgeRiskScore(newDate.toISOString());
  assert.strictEqual(res13.score, 10, 'Thiết bị mới phải có AgeRisk = 10');
  console.log(`  ✅ TEST 13 PASS: Thiết bị 3 tháng tuổi đạt ${res13.score} điểm (${res13.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 14: Missing Data / Completeness
  // -------------------------------------------------------------------------
  console.log('▶ TEST 14: Missing Data & Completeness');
  const comp = await failureRiskService.getRiskDataCompleteness(1);
  assert.ok(comp.completenessText.includes('factors'));
  assert.ok(comp.completenessPercentage >= 0 && comp.completenessPercentage <= 100);
  console.log(`  ✅ TEST 14 PASS: Data Completeness: ${comp.completenessText} (${comp.completenessPercentage}%).\n`);

  // -------------------------------------------------------------------------
  // TEST 15: Division by Zero Safety (Previous = 0)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 15: Division by Zero Safety');
  const divZero1 = failureRiskService._calcFailureTrendScore(0, 0);
  assert.ok(!isNaN(divZero1.score));
  const divZero2 = failureRiskService._calcRepairCostTrendScore(0, 0);
  assert.ok(!isNaN(divZero2.score));
  const divZero3 = failureRiskService._calcDowntimeTrendScore(0, 0);
  assert.ok(!isNaN(divZero3.score));
  console.log(`  ✅ TEST 15 PASS: Cả 3 hàm trend đều an toàn tuyệt đối khi previous = 0 (Score: ${divZero1.score}, ${divZero2.score}, ${divZero3.score}).\n`);

  // -------------------------------------------------------------------------
  // TEST 16: No Historical Data (0 sự cố, 0 chi phí, 0 downtime)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 16: No Historical Data');
  const noHistTrend = failureRiskService._calcFailureTrendScore(0, 0);
  assert.strictEqual(noHistTrend.deltaPercent, 0);
  assert.strictEqual(noHistTrend.score, 40);
  console.log(`  ✅ TEST 16 PASS: Thiết bị chưa có lịch sử trả về trạng thái chuẩn (${noHistTrend.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 17: Null Dates Handling
  // -------------------------------------------------------------------------
  console.log('▶ TEST 17: Null Dates Handling');
  const nullAge = failureRiskService._calcAgeRiskScore(null, null);
  assert.strictEqual(nullAge.isAvailable, false);
  assert.ok(!isNaN(nullAge.score));
  console.log(`  ✅ TEST 17 PASS: Null date được xử lý an toàn: score = ${nullAge.score}.\n`);

  // -------------------------------------------------------------------------
  // TEST 18: Future Maintenance Date (Chưa tới hạn)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 18: Future Maintenance Date');
  const futureMaint = failureRiskService._calcMaintenanceOverdueScore(0, 0, 1);
  assert.strictEqual(futureMaint.score, 10, 'Chưa tới hạn phải có điểm rủi ro thấp = 10');
  console.log(`  ✅ TEST 18 PASS: Lịch bảo dưỡng tương lai đạt ${futureMaint.score} điểm (${futureMaint.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 19: Very Large Repair Cost
  // -------------------------------------------------------------------------
  console.log('▶ TEST 19: Very Large Repair Cost (100.000.000 đ)');
  const largeCost = failureRiskService._calcRepairCostTrendScore(100000000, 0);
  assert.strictEqual(largeCost.score, 95, 'Chi phí cực lớn phải đạt 95 điểm rủi ro');
  console.log(`  ✅ TEST 19 PASS: Chi phí 100 triệu đạt ${largeCost.score} điểm (${largeCost.label}).\n`);

  // -------------------------------------------------------------------------
  // TEST 20: E2E REST APIs: GET /api/devices/1/risk & GET /api/devices/1/risk/breakdown
  // -------------------------------------------------------------------------
  console.log('▶ TEST 20: E2E REST API Endpoints');
  const BASE_URL = 'http://localhost:5000';
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;

  const apiRiskRes = await fetch(`${BASE_URL}/api/devices/1/risk`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const apiRiskData = await apiRiskRes.json();
  assert.strictEqual(apiRiskRes.status, 200);
  assert.strictEqual(apiRiskData.data.deviceId, 1);
  assert.ok(apiRiskData.data.riskScore >= 0 && apiRiskData.data.riskScore <= 100);
  assert.ok(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(apiRiskData.data.status));
  assert.strictEqual(typeof apiRiskData.data.breakdown, 'object');
  assert.ok(Array.isArray(apiRiskData.data.explainableReasons));

  const apiBreakdownRes = await fetch(`${BASE_URL}/api/devices/1/risk/breakdown`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const apiBreakdownData = await apiBreakdownRes.json();
  assert.strictEqual(apiBreakdownRes.status, 200);
  assert.ok(apiBreakdownData.data.breakdown);

  console.log(`  ✅ TEST 20 PASS: GET /api/devices/1/risk trả về HTTP 200 OK: Risk Score = ${apiRiskData.data.riskScore}/100 [${apiRiskData.data.status}] kèm ${apiRiskData.data.explainableReasons.length} giải thích định lượng.\n`);

  console.log('========================================================================');
  console.log('🎉 TOÀN BỘ 20/20 BÀI KIỂM THỬ PHASE 2 FAILURE RISK SCORE ENGINE ĐẠT 100%!');
  console.log('========================================================================\n');
}

runPhase2RiskTests().catch(err => {
  console.error('❌ Lỗi Test:', err);
  process.exit(1);
});
