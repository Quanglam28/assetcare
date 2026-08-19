const assert = require('assert');

async function testE2EHealthApis() {
  console.log('========================================================================');
  console.log('🚀 KIỂM THỬ E2E TOÀN BỘ HTTP REST APIs ASSET HEALTH & PREDICTIVE RISK');
  console.log('========================================================================\n');

  // 1. Đăng nhập lấy JWT Admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginData.data?.token || loginData.token);
  const token = loginData.data?.token || loginData.token;
  console.log('✅ 1. Đăng nhập Admin thành công (JWT Token verified)');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. GET /api/devices/1/health
  const healthRes = await fetch('http://localhost:5000/api/devices/1/health', { headers });
  const healthJson = await healthRes.json();
  assert.strictEqual(healthRes.status, 200);
  assert.ok(healthJson.success);
  assert.ok(typeof healthJson.data?.healthScore === 'number');
  assert.ok(healthJson.data?.dataCompleteness >= 50);
  console.log(`✅ 2. GET /api/devices/1/health [200 OK] -> Score: ${healthJson.data.healthScore}, Status: ${healthJson.data.healthStatus}, Completeness: ${healthJson.data.dataCompleteness}%`);

  // 3. GET /api/devices/1/risk
  const riskRes = await fetch('http://localhost:5000/api/devices/1/risk', { headers });
  const riskJson = await riskRes.json();
  assert.strictEqual(riskRes.status, 200);
  assert.ok(riskJson.success);
  assert.ok(typeof riskJson.data?.riskScore === 'number');
  assert.ok(riskJson.data?.explainableReasons?.length > 0);
  console.log(`✅ 3. GET /api/devices/1/risk [200 OK] -> Risk: ${riskJson.data.riskScore}%, Level: ${riskJson.data.riskLevel}, Reasons count: ${riskJson.data.explainableReasons.length}`);

  // 4. GET /api/devices/1/recommendations
  const recRes = await fetch('http://localhost:5000/api/devices/1/recommendations', { headers });
  const recJson = await recRes.json();
  assert.strictEqual(recRes.status, 200);
  assert.ok(recJson.success);
  assert.ok(recJson.data?.recommendation?.action);
  console.log(`✅ 4. GET /api/devices/1/recommendations [200 OK] -> Action: ${recJson.data.recommendation.action}, Replacement: ${recJson.data.replacementIndicator}`);

  // 5. GET /api/devices/1/health-history
  const histRes = await fetch('http://localhost:5000/api/devices/1/health-history?days=90', { headers });
  const histJson = await histRes.json();
  assert.strictEqual(histRes.status, 200);
  assert.ok(histJson.success);
  assert.ok(Array.isArray(histJson.data));
  console.log(`✅ 5. GET /api/devices/1/health-history [200 OK] -> Snapshots count: ${histJson.data.length}`);

  // 6. GET /api/analytics/assets/at-risk
  const atRiskRes = await fetch('http://localhost:5000/api/analytics/assets/at-risk?limit=5', { headers });
  const atRiskJson = await atRiskRes.json();
  assert.strictEqual(atRiskRes.status, 200);
  assert.ok(atRiskJson.success);
  assert.ok(Array.isArray(atRiskJson.data));
  console.log(`✅ 6. GET /api/analytics/assets/at-risk [200 OK] -> Top at-risk count: ${atRiskJson.data.length}`);

  // 7. GET /api/analytics/assets/health-distribution
  const distRes = await fetch('http://localhost:5000/api/analytics/assets/health-distribution', { headers });
  const distJson = await distRes.json();
  assert.strictEqual(distRes.status, 200);
  assert.ok(distJson.success);
  assert.ok(distJson.data?.totalAssessed > 0);
  console.log(`✅ 7. GET /api/analytics/assets/health-distribution [200 OK] -> GOOD: ${distJson.data.goodCount}, FAIR: ${distJson.data.fairCount}, WARN: ${distJson.data.warningCount}, CRITICAL: ${distJson.data.criticalCount}`);

  // 8. GET /api/analytics/maintenance-risk
  const sumRes = await fetch('http://localhost:5000/api/analytics/maintenance-risk', { headers });
  const sumJson = await sumRes.json();
  assert.strictEqual(sumRes.status, 200);
  assert.ok(sumJson.success);
  console.log(`✅ 8. GET /api/analytics/maintenance-risk [200 OK] -> High Risk Assets: ${sumJson.data.highRiskCount}, Consider Replacement: ${sumJson.data.considerReplacementCount}`);

  // 9. POST /api/admin/asset-health/recalculate
  const recalcRes = await fetch('http://localhost:5000/api/admin/asset-health/recalculate', {
    method: 'POST',
    headers,
  });
  const recalcJson = await recalcRes.json();
  assert.strictEqual(recalcRes.status, 200);
  assert.ok(recalcJson.success);
  console.log(`✅ 9. POST /api/admin/asset-health/recalculate [200 OK] -> Recalculated ${recalcJson.data.totalProcessed}/${recalcJson.data.totalAssets} devices`);

  // 10. GET /api/devices with Health & Risk filters
  const filterDevRes = await fetch('http://localhost:5000/api/devices?healthStatus=GOOD&riskLevel=VERY_LOW', { headers });
  const filterDevJson = await filterDevRes.json();
  assert.strictEqual(filterDevRes.status, 200);
  assert.ok(filterDevJson.success);
  console.log(`✅ 10. GET /api/devices?healthStatus=GOOD&riskLevel=VERY_LOW [200 OK] -> Filtered count: ${filterDevJson.data.length}`);

  console.log('\n========================================================================');
  console.log('🎉 TOÀN BỘ 10/10 REST API ENDPOINTS ĐÃ HOẠT ĐỘNG HOÀN HẢO 100%!');
  console.log('========================================================================\n');
}

testE2EHealthApis().catch(err => {
  console.error('Lỗi E2E API:', err);
  process.exit(1);
});
