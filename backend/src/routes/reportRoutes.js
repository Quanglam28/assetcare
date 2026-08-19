const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN));

// 1. Xem trước bảng dữ liệu báo cáo
router.get('/:type/preview', reportController.previewReport);

// 2. Xuất tải file Excel (.xlsx) hoặc CSV
router.get('/:type/export', reportController.exportReport);

module.exports = router;
