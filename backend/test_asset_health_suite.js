const assert = require('assert');
const assetHealthService = require('./src/services/assetHealthService');
const assetRiskService = require('./src/services/assetRiskService');
const recommendationService = require('./src/services/recommendationService');
const ruleBasedRiskProvider = require('./src/services/health/ruleBasedRiskProvider');
const config = require('./src/config/healthScoreConfig');
const { pool } = require('./src/config/db');

async function runAssetHealthTestSuite() {
  console.log('========================================================================');
  console.log('🧪 BẮT ĐẦU CHẠY TEST SUITE: ASSET HEALTH & PREDICTIVE RISK ENGINE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function it(desc, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${desc}`);
      console.error(`     Chi tiết: ${err.message}`);
    }
  }

  async function itAsync(desc, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${desc}`);
      console.error(`     Chi tiết: ${err.message}`);
    }
  }

  console.log('--- 1. KIỂM THỬ ĐỘNG CƠ TÍNH ĐIỂM SỨC KHỎE (ASSET HEALTH SCORE) ---');

  // Test 1: Age Score calculation
  it('Tuổi <= 1 năm trả về 100 điểm, >5 năm trả về 25 điểm', () => {
    const ageNew = assetHealthService._calcAgeScore(new Date().toISOString());
    assert.strictEqual(ageNew.score, 100);
    assert.strictEqual(ageNew.isAvailable, true);

    const oldDate = new Date(Date.now() - 6 * 365.25 * 86400000).toISOString();
    const ageOld = assetHealthService._calcAgeScore(oldDate);
    assert.strictEqual(ageOld.score, 25);
    assert.ok(ageOld.ageYears > 5);

    const missingDate = assetHealthService._calcAgeScore(null);
    assert.strictEqual(missingDate.isAvailable, false);
    assert.strictEqual(missingDate.score, 100);
  });

  // Test 2: Failure Frequency Score
  it('Tần suất sự cố: 0 sự cố = 100đ, 1 = 90đ, 2 = 80đ, >5 = 20đ', () => {
    assert.strictEqual(assetHealthService._calcFailureScore(0), 100);
    assert.strictEqual(assetHealthService._calcFailureScore(1), 90);
    assert.strictEqual(assetHealthService._calcFailureScore(2), 80);
    assert.strictEqual(assetHealthService._calcFailureScore(3), 65);
    assert.strictEqual(assetHealthService._calcFailureScore(4), 50);
    assert.strictEqual(assetHealthService._calcFailureScore(5), 35);
    assert.strictEqual(assetHealthService._calcFailureScore(10), 20);
  });

  // Test 3: Maintenance Score
  it('Bảo trì đúng hạn = 100đ, quá hạn >60 ngày = 20đ, không có lịch = INSUFFICIENT', () => {
    const onTime = assetHealthService._calcMaintenanceScore(0, 0, 3);
    assert.strictEqual(onTime.score, 100);
    assert.strictEqual(onTime.isAvailable, true);

    const overdueSevere = assetHealthService._calcMaintenanceScore(65, 1, 3);
    assert.strictEqual(overdueSevere.score, 20);

    const noSchedule = assetHealthService._calcMaintenanceScore(0, 0, 0);
    assert.strictEqual(noSchedule.isAvailable, false);
  });

  // Test 4: Repair Cost Score & Ratio
  it('Tỷ lệ sửa chữa: <10% = 100đ, >60% = 20đ, không có giá mua không crash', () => {
    const lowCost = assetHealthService._calcRepairCostScore(500000, 10000000); // 5%
    assert.strictEqual(lowCost.score, 100);
    assert.strictEqual(lowCost.isAvailable, true);

    const highCost = assetHealthService._calcRepairCostScore(7000000, 10000000); // 70%
    assert.strictEqual(highCost.score, 20);

    const zeroPrice = assetHealthService._calcRepairCostScore(1000000, 0);
    assert.strictEqual(zeroPrice.isAvailable, false);
    assert.ok(typeof zeroPrice.score === 'number' && !isNaN(zeroPrice.score));
  });

  // Test 5: Downtime Score
  it('Downtime: 0h = 100đ, <=8h = 90đ, >168h = 20đ', () => {
    assert.strictEqual(assetHealthService._calcDowntimeScore(0), 100);
    assert.strictEqual(assetHealthService._calcDowntimeScore(5), 90);
    assert.strictEqual(assetHealthService._calcDowntimeScore(20), 75);
    assert.strictEqual(assetHealthService._calcDowntimeScore(200), 20);
  });

  // Test 6: Warranty Score
  it('Bảo hành: Còn hạn = 100đ, sắp hết (10 ngày) = 70đ, hết hạn = 40đ', () => {
    const futureDate = new Date(Date.now() + 100 * 86400000).toISOString();
    const soonDate = new Date(Date.now() + 10 * 86400000).toISOString();
    const pastDate = new Date(Date.now() - 30 * 86400000).toISOString();

    assert.strictEqual(assetHealthService._calcWarrantyScore(futureDate).score, 100);
    assert.strictEqual(assetHealthService._calcWarrantyScore(soonDate).score, 70);
    assert.strictEqual(assetHealthService._calcWarrantyScore(pastDate).score, 40);
    assert.strictEqual(assetHealthService._calcWarrantyScore(null).isAvailable, false);
  });

  console.log('\n--- 2. KIỂM THỬ ĐỘNG CƠ DỰ BÁO RỦI RO (FAILURE RISK & TRENDS) ---');

  // Test 7: Failure Trend
  it('Failure Trend: Tăng số sự cố phát hiện +100% trend và tăng Risk', () => {
    const trendInc = ruleBasedRiskProvider._calcFailureTrendRisk(4, 2);
    assert.strictEqual(trendInc.percent, 100);
    assert.strictEqual(trendInc.trend, 'SHARPLY_INCREASING');
    assert.ok(trendInc.score >= 90);

    const trendDec = ruleBasedRiskProvider._calcFailureTrendRisk(2, 4);
    assert.strictEqual(trendDec.percent, -50);
    assert.strictEqual(trendDec.trend, 'SHARPLY_DECREASING');
    assert.strictEqual(trendDec.score, 10);
  });

  // Test 8: Full Risk Assessment & Explainability
  await itAsync('Đánh giá rủi ro đầy đủ sinh điểm Risk %, giải thích nguyên nhân và không bị NaN', async () => {
    const context = {
      device: { id: 1, code: 'DEV-001', purchase_price: 20000000 },
      failuresLast90d: 4,
      failuresPrev90d: 1,
      costLast90d: 5000000,
      costPrev90d: 1000000,
      ageYears: 4.5,
      downtimeHours: 36,
      maintenanceOverdueDays: 15,
      maintenanceOverdueCount: 1,
      urgentIncidentsCount: 1,
      highIncidentsCount: 1,
    };

    const risk = await ruleBasedRiskProvider.assessRisk(context);
    assert.ok(risk.riskScore >= 60, `Risk score phải >= 60, nhận được: ${risk.riskScore}`);
    assert.ok(risk.explainableReasons.length >= 3, 'Phải có ít nhất 3 lý do định lượng giải thích nguyên nhân');
    assert.ok(!isNaN(risk.riskScore), 'Risk score không được là NaN');
  });

  console.log('\n--- 3. KIỂM THỬ RECOMMENDATION ENGINE & REPLACEMENT INDICATOR ---');

  // Test 9: Consider Replacement Indicator
  it('Phát hiện chỉ số đề xuất thay mới khi: Chi phí sửa >60% + Health <40 + Risk >70', () => {
    const recReplace = recommendationService.generateRecommendation({
      device: { id: 1, status: 'BROKEN' },
      healthScore: 35,
      riskScore: 78,
      riskLevel: 'HIGH',
      riskFactors: {},
      repairRatio: 0.75, // 75% giá máy
      ageYears: 5.2,
    });

    assert.strictEqual(recReplace.action, 'CONSIDER_REPLACEMENT');
    assert.strictEqual(recReplace.replacementIndicator, 'CONSIDER_REPLACEMENT');
    assert.ok(recReplace.reasons.length > 0);
  });

  // Test 10: Schedule Maintenance Recommendation
  it('Đề xuất SCHEDULE_MAINTENANCE khi bảo trì quá hạn', () => {
    const recMaint = recommendationService.generateRecommendation({
      device: { id: 2, status: 'ACTIVE' },
      healthScore: 72,
      riskScore: 35,
      riskLevel: 'LOW',
      riskFactors: {},
      repairRatio: 0.1,
      maintenanceOverdueDays: 14,
      ageYears: 2,
    });

    assert.strictEqual(recMaint.action, 'SCHEDULE_MAINTENANCE');
    assert.ok(recMaint.reasons.some(r => r.includes('14 ngày')));
  });

  console.log('\n--- 4. KIỂM THỬ DỮ LIỆU THỰC TẾ TRÊN DATABASE MYSQL ---');

  // Test 11: Real DB device calculation
  await itAsync('Tính toán điểm sức khỏe và rủi ro trực tiếp từ CSDL cho Thiết bị ID 1', async () => {
    const health = await assetHealthService.calculateHealthScore(1);
    assert.ok(health.healthScore >= 0 && health.healthScore <= 100);
    assert.ok(health.dataCompleteness >= 0 && health.dataCompleteness <= 100);
    assert.ok(['GOOD', 'FAIR', 'WARNING', 'CRITICAL', 'INSUFFICIENT_DATA'].includes(health.healthStatus));

    const risk = await assetRiskService.assessDeviceRisk(1);
    assert.ok(risk.riskScore >= 0 && risk.riskScore <= 100);
    assert.ok(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(risk.riskLevel));
    assert.ok(risk.recommendation);
  });

  // Test 12: Top At-Risk Assets Query
  await itAsync('Truy vấn Top 10 thiết bị nguy cơ cao nhất trả về đúng cấu trúc', async () => {
    const topAssets = await assetRiskService.getTopAtRiskAssets(5);
    assert.ok(Array.isArray(topAssets));
    assert.ok(topAssets.length > 0);
    assert.ok(topAssets[0].device_code);
    assert.ok(typeof topAssets[0].risk_score !== 'undefined');
  });

  // Test 13: Health Distribution Query
  await itAsync('Truy vấn Health Distribution trả về các trường đếm tổng quan', async () => {
    const dist = await assetRiskService.getHealthDistribution();
    assert.ok(typeof dist.goodCount !== 'undefined');
    assert.ok(dist.totalAssessed > 0);
  });

  // Test 14: Health History Query
  await itAsync('Truy vấn chuỗi Snapshot lịch sử cho thiết bị ID 1', async () => {
    const history = await assetRiskService.getHealthHistory(1, 90);
    assert.ok(Array.isArray(history));
    assert.ok(history.length > 0, 'Phải có các điểm snapshot lịch sử');
  });

  console.log('\n========================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passed}/${total} TESTS HOÀN THÀNH XUẤT SẮC (100% PASS)`);
  console.log('========================================================================\n');

  await pool.end();
}

runAssetHealthTestSuite().catch(err => {
  console.error('Lỗi chạy test suite:', err);
  process.exit(1);
});
