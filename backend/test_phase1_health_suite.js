const assert = require('assert');
const assetHealthService = require('./src/services/assetHealthService');
const config = require('./src/config/healthScoreConfig');

async function runPhase1HealthTests() {
  console.log('========================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN PHASE 1 — ASSET HEALTH SCORE ENGINE');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: New Asset (Thiết bị mới đưa vào sử dụng <= 1 năm)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 1: New Asset (Tuổi đời <= 1 năm)');
  const newDate = new Date();
  newDate.setMonth(newDate.getMonth() - 2); // 2 tháng tuổi
  const newAgeRes = assetHealthService._calcAgeScore(newDate.toISOString());
  assert.strictEqual(newAgeRes.score, 100, 'Thiết bị mới phải đạt 100 điểm AgeScore');
  assert.strictEqual(newAgeRes.isAvailable, true);
  console.log(`  ✅ TEST 1 PASS: Thiết bị 2 tháng tuổi đạt ${newAgeRes.score} điểm (${newAgeRes.ageText}).\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Old Asset (Thiết bị cũ > 5 năm)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 2: Old Asset (Tuổi đời > 5 năm)');
  const oldDate = new Date();
  oldDate.setFullYear(oldDate.getFullYear() - 6); // 6 năm tuổi
  const oldAgeRes = assetHealthService._calcAgeScore(oldDate.toISOString());
  assert.strictEqual(oldAgeRes.score, 25, 'Thiết bị > 5 năm phải có AgeScore = 25');
  console.log(`  ✅ TEST 2 PASS: Thiết bị 6 năm tuổi đạt ${oldAgeRes.score} điểm (${oldAgeRes.ageText}).\n`);

  // -------------------------------------------------------------------------
  // TEST 3: No Failure (0 sự cố hỏng hóc)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 3: No Failure (0 sự cố)');
  const zeroFailureScore = assetHealthService._calcFailureScore(0);
  assert.strictEqual(zeroFailureScore, 100, '0 sự cố phải đạt 100 điểm FailureScore');
  console.log(`  ✅ TEST 3 PASS: 0 sự cố đạt ${zeroFailureScore} điểm.\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Many Failures (Nhiều sự cố hỏng hóc >= 5)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 4: Many Failures (>= 5 sự cố hỏng)');
  const manyFailureScore = assetHealthService._calcFailureScore(6);
  assert.strictEqual(manyFailureScore, 20, '>= 5 sự cố phải đạt mức thấp 20 điểm');
  console.log(`  ✅ TEST 4 PASS: 6 sự cố đạt ${manyFailureScore} điểm.\n`);

  // -------------------------------------------------------------------------
  // TEST 5: High Repair Cost (Chi phí sửa chữa >= 60% nguyên giá)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 5: High Repair Cost (Chi phí sửa >= 60% giá mua)');
  const purchasePrice = 10000000; // 10 triệu
  const repairCost = 7000000;    // 7 triệu (70%)
  const costRes = assetHealthService._calcRepairCostScore(repairCost, purchasePrice);
  assert.strictEqual(costRes.score, 20, 'Tỷ lệ sửa 70% phải đạt 20 điểm');
  assert.strictEqual(costRes.ratio, 0.7);
  console.log(`  ✅ TEST 5 PASS: Tỷ lệ sửa chữa ${(costRes.ratio * 100).toFixed(0)}% đạt ${costRes.score} điểm.\n`);

  // -------------------------------------------------------------------------
  // TEST 6: Maintenance Overdue (Quá hạn bảo trì > 60 ngày)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 6: Maintenance Overdue (Quá hạn > 60 ngày)');
  const maintRes = assetHealthService._calcMaintenanceScore(75, 1, 1);
  assert.strictEqual(maintRes.score, 20, 'Quá hạn > 60 ngày phải đạt 20 điểm');
  console.log(`  ✅ TEST 6 PASS: Quá hạn 75 ngày đạt ${maintRes.score} điểm (${maintRes.note}).\n`);

  // -------------------------------------------------------------------------
  // TEST 7: No Warranty (Hết hạn bảo hành hoặc không có)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 7: No Warranty / Expired');
  const noWarrRes = assetHealthService._calcWarrantyScore(null);
  assert.strictEqual(noWarrRes.isAvailable, false);
  const expiredDate = new Date();
  expiredDate.setFullYear(expiredDate.getFullYear() - 2);
  const expiredWarrRes = assetHealthService._calcWarrantyScore(expiredDate.toISOString());
  assert.strictEqual(expiredWarrRes.score, 40, 'Hết hạn bảo hành phải đạt 40 điểm');
  console.log(`  ✅ TEST 7 PASS: Hết hạn bảo hành đạt ${expiredWarrRes.score} điểm.\n`);

  // -------------------------------------------------------------------------
  // TEST 8: Missing Data / INSUFFICIENT_DATA Handling
  // -------------------------------------------------------------------------
  console.log('▶ TEST 8: Missing Data Handling (Không crash, tính completeness)');
  const completeness = await assetHealthService.getDataCompleteness(1);
  assert.ok(completeness.completenessText.includes('factors'));
  assert.ok(completeness.completenessPercentage >= 0 && completeness.completenessPercentage <= 100);
  console.log(`  ✅ TEST 8 PASS: Data Completeness thiết bị 1: ${completeness.completenessText} (${completeness.completenessPercentage}%).\n`);

  // -------------------------------------------------------------------------
  // TEST 9: Division by Zero Safety (Giá mua = 0 hoặc null)
  // -------------------------------------------------------------------------
  console.log('▶ TEST 9: Division by Zero Safety');
  const zeroPriceCost = assetHealthService._calcRepairCostScore(1000000, 0);
  assert.ok(!isNaN(zeroPriceCost.score), 'Không được ra NaN khi giá mua = 0');
  assert.strictEqual(zeroPriceCost.isAvailable, false);
  console.log(`  ✅ TEST 9 PASS: Giá mua = 0 an toàn không lỗi chia 0, điểm = ${zeroPriceCost.score}.\n`);

  // -------------------------------------------------------------------------
  // TEST 10: Null Values Safety & Real DB Calculation
  // -------------------------------------------------------------------------
  console.log('▶ TEST 10: Null Values Safety & Real DB Health Calculation');
  const healthRes = await assetHealthService.calculateHealthScore(1);
  assert.ok(healthRes.healthScore >= 0 && healthRes.healthScore <= 100, 'Health score phải trong khoảng 0-100');
  assert.ok(!isNaN(healthRes.healthScore), 'Health score không được là NaN');
  assert.ok(['GOOD', 'FAIR', 'WARNING', 'CRITICAL', 'INSUFFICIENT_DATA'].includes(healthRes.status));
  assert.strictEqual(typeof healthRes.breakdown, 'object');
  assert.ok(healthRes.breakdown.ageScore >= 0);
  assert.ok(healthRes.breakdown.failureScore >= 0);
  assert.ok(healthRes.breakdown.maintenanceScore >= 0);
  assert.ok(healthRes.breakdown.repairCostScore >= 0);
  assert.ok(healthRes.breakdown.downtimeScore >= 0);
  assert.ok(healthRes.breakdown.warrantyScore >= 0);
  console.log(`  ✅ TEST 10 PASS: Thiết bị 1 tính toán thành công: Health Score = ${healthRes.healthScore}/100 [${healthRes.status}] (${healthRes.dataCompleteness}).\n`);

  // -------------------------------------------------------------------------
  // TEST 11: E2E REST API: GET /api/assets/1/health & GET /api/devices/1/health
  // -------------------------------------------------------------------------
  console.log('▶ TEST 11: Kiểm thử E2E HTTP Endpoints');
  const BASE_URL = 'http://localhost:5000';
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;

  const apiAssetRes = await fetch(`${BASE_URL}/api/assets/1/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const apiAssetData = await apiAssetRes.json();
  assert.strictEqual(apiAssetRes.status, 200);
  assert.strictEqual(apiAssetData.data.assetId, 1);
  assert.ok(apiAssetData.data.breakdown);

  const apiBreakdownRes = await fetch(`${BASE_URL}/api/assets/1/breakdown`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const apiBreakdownData = await apiBreakdownRes.json();
  assert.strictEqual(apiBreakdownRes.status, 200);
  assert.ok(apiBreakdownData.data.breakdown);

  console.log('  ✅ TEST 11 PASS: GET /api/assets/1/health và GET /api/assets/1/breakdown trả về chuẩn Phase 1 JSON.\n');

  console.log('========================================================================');
  console.log('🎉 TOÀN BỘ 11/11 BÀI KIỂM THỬ PHASE 1 ASSET HEALTH SCORE ENGINE ĐẠT 100%!');
  console.log('========================================================================\n');
}

runPhase1HealthTests().catch(err => {
  console.error('❌ Lỗi Test:', err);
  process.exit(1);
});
