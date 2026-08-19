const express = require('express');
const priorityController = require('../controllers/priorityController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Yêu cầu xác thực token
router.use(authenticate);

// 1. API tính điểm ưu tiên theo từng thiết bị
router.get('/devices/:id/priority', (req, res, next) => priorityController.getDevicePriority(req, res, next));
router.get('/devices/:id/priority/breakdown', (req, res, next) => priorityController.getDevicePriorityBreakdown(req, res, next));
router.get('/assets/:id/priority', (req, res, next) => priorityController.getDevicePriority(req, res, next));
router.get('/assets/:id/priority/breakdown', (req, res, next) => priorityController.getDevicePriorityBreakdown(req, res, next));

// 2. Phân tích ma trận rủi ro & Top ưu tiên
router.get('/analytics/assets/top-priority', (req, res, next) => priorityController.getTopPriorityDevices(req, res, next));
router.get('/analytics/risk-matrix', (req, res, next) => priorityController.getRiskMatrix(req, res, next));

// 3. Admin Recalculate
router.post('/admin/priority/recalculate', authorize('ADMIN', 'MANAGER'), (req, res, next) => priorityController.recalculateAll(req, res, next));

module.exports = router;
