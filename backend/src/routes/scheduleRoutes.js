const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validatorMiddleware');
const {
  createScheduleSchema,
  updateScheduleSchema,
  executeScheduleSchema,
} = require('../validators/scheduleValidator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

// 1. Thống kê cảnh báo Dashboard (Upcoming, Due, Overdue, Completed)
router.get('/stats', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), scheduleController.getAlertStats);

// 2. Lấy danh sách lịch bảo dưỡng
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), scheduleController.getSchedules);

// 3. Chi tiết lịch bảo dưỡng
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), scheduleController.getScheduleById);

// 4. Tạo kế hoạch bảo trì định kỳ mới (ADMIN, MANAGER)
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createScheduleSchema), scheduleController.createSchedule);

// 5. Cập nhật kế hoạch bảo trì (ADMIN, MANAGER)
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(updateScheduleSchema), scheduleController.updateSchedule);

// 6. Thực hiện bảo dưỡng định kỳ (ADMIN, MANAGER, TECHNICIAN)
router.post('/:id/execute', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), validate(executeScheduleSchema), scheduleController.executeSchedule);

// 7. Xóa kế hoạch bảo dưỡng (ADMIN, MANAGER)
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), scheduleController.deleteSchedule);

module.exports = router;
