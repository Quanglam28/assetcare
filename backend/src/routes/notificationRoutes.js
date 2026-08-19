const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

// 1. Lấy danh sách thông báo của người dùng
router.get('/', notificationController.getMyNotifications);

// 2. Lấy số lượng thông báo chưa đọc
router.get('/unread-count', notificationController.getUnreadCount);

// 3. Đánh dấu 1 thông báo là đã đọc
router.patch('/:id/read', notificationController.markAsRead);

// 4. Đánh dấu toàn bộ là đã đọc
router.patch('/read-all', notificationController.markAllAsRead);

// 5. Xóa 1 thông báo
router.delete('/:id', notificationController.deleteNotification);

// 6. Quét và đồng bộ cảnh báo hệ thống (ADMIN, MANAGER)
router.post('/scan-system-alerts', authorize(ROLES.ADMIN, ROLES.MANAGER), notificationController.scanSystemAlerts);

module.exports = router;
