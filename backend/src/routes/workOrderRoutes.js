const express = require('express');
const workOrderController = require('../controllers/workOrderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Yêu cầu xác thực đăng nhập
router.use(authenticate);

// 1. Xem danh sách & thống kê
router.get('/', (req, res, next) => workOrderController.getAll(req, res, next));
router.get('/stats', (req, res, next) => workOrderController.getStats(req, res, next));
router.get('/:id', (req, res, next) => workOrderController.getById(req, res, next));

// 2. Tạo lệnh công tác (Admin, Manager, Technician)
router.post('/', authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), (req, res, next) => workOrderController.create(req, res, next));

// 3. Quy trình thực hiện (Assign, Start, Complete, Cancel)
router.post('/:id/assign', authorize('ADMIN', 'MANAGER'), (req, res, next) => workOrderController.assign(req, res, next));
router.post('/:id/start', authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), (req, res, next) => workOrderController.start(req, res, next));
router.post('/:id/complete', authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), (req, res, next) => workOrderController.complete(req, res, next));
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), (req, res, next) => workOrderController.cancel(req, res, next));

module.exports = router;
