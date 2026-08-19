const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

// 1. Thống kê 8 thẻ KPI tổng quan
router.get('/stats', dashboardController.getOverviewStats);

// 2. Dữ liệu 8 biểu đồ phân tích chuyên sâu
router.get('/charts', dashboardController.getAllCharts);

// 3. Số liệu phân tích cam kết tuân thủ SLA
router.get('/sla', dashboardController.getSlaStats);

// 4. Danh mục options cho bộ lọc đa chiều
router.get('/meta/filters', dashboardController.getFilterOptions);

module.exports = router;
