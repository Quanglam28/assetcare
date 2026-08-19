const express = require('express');
const healthController = require('../controllers/healthController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tất cả API yêu cầu đăng nhập
router.use(authenticate);

// 1. APIs đánh giá chi tiết theo từng thiết bị (Hỗ trợ cả alias /assets/:id và /devices/:id)
router.get('/assets/:id/health', (req, res, next) => healthController.getDeviceHealth(req, res, next));
router.get('/assets/:id/breakdown', (req, res, next) => healthController.getDeviceHealthBreakdown(req, res, next));
router.get('/assets/:id/risk', (req, res, next) => healthController.getDeviceRisk(req, res, next));
router.get('/assets/:id/risk/breakdown', (req, res, next) => healthController.getDeviceRiskBreakdown(req, res, next));

router.get('/devices/:id/health', (req, res, next) => healthController.getDeviceHealth(req, res, next));
router.get('/devices/:id/breakdown', (req, res, next) => healthController.getDeviceHealthBreakdown(req, res, next));
router.get('/devices/:id/risk', (req, res, next) => healthController.getDeviceRisk(req, res, next));
router.get('/devices/:id/risk/breakdown', (req, res, next) => healthController.getDeviceRiskBreakdown(req, res, next));
router.get('/devices/:id/recommendations', (req, res, next) => healthController.getDeviceRecommendations(req, res, next));
router.get('/devices/:id/health-history', (req, res, next) => healthController.getDeviceHealthHistory(req, res, next));

// 2. APIs phân tích tổng quan toàn hệ thống (Analytics)
router.get('/analytics/assets/at-risk', authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), (req, res, next) => healthController.getTopAtRiskAssets(req, res, next));
router.get('/analytics/assets/health-distribution', authorize('ADMIN', 'MANAGER'), (req, res, next) => healthController.getHealthDistribution(req, res, next));
router.get('/analytics/maintenance-risk', authorize('ADMIN', 'MANAGER'), (req, res, next) => healthController.getMaintenanceRiskSummary(req, res, next));

// 3. Batch recalculation (Chỉ Admin & Manager)
router.post('/admin/asset-health/recalculate', authorize('ADMIN', 'MANAGER'), (req, res, next) => healthController.recalculateAllAssets(req, res, next));

module.exports = router;
