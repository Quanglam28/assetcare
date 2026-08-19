const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validatorMiddleware');
const {
  createMaintenanceSchema,
  assignTechnicianSchema,
  startWorkSchema,
  waitingPartSchema,
  resumeWorkSchema,
  completeRequestSchema,
  acceptRequestSchema,
  reopenRequestSchema,
} = require('../validators/maintenanceValidator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Tất cả endpoints đều yêu cầu xác thực JWT
router.use(authenticate);

// 1. Tạo phiếu báo sự cố mới (USER, MANAGER, ADMIN, TECHNICIAN)
router.post('/', validate(createMaintenanceSchema), maintenanceController.createRequest);

// 2. Lấy danh sách phiếu sự cố do chính người dùng hiện tại báo
router.get('/my', maintenanceController.getMyRequests);

// 3. Số liệu thống kê Dashboard Kỹ thuật viên (TECHNICIAN, ADMIN, MANAGER)
router.get('/technician/stats', authorize(ROLES.TECHNICIAN, ROLES.ADMIN, ROLES.MANAGER), maintenanceController.getTechnicianStats);

// 4. Danh sách Kỹ thuật viên khả dụng để phân công (ADMIN, MANAGER)
router.get('/meta/technicians', authorize(ROLES.ADMIN, ROLES.MANAGER), maintenanceController.getActiveTechnicians);

// 5. Lấy toàn bộ danh sách phiếu bảo trì (ADMIN, MANAGER, TECHNICIAN)
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), maintenanceController.getRequests);

// 6. Lấy chi tiết một phiếu bảo trì (Reporter, Technician, Manager, Admin)
router.get('/:id', maintenanceController.getRequestById);

// 7. Manager/Admin phân công Kỹ thuật viên (ADMIN, MANAGER)
router.post('/:id/assign', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(assignTechnicianSchema), maintenanceController.assignTechnician);

// 8. KTV bắt đầu xử lý phiếu (TECHNICIAN, ADMIN, MANAGER)
router.post('/:id/start', authorize(ROLES.TECHNICIAN, ROLES.ADMIN, ROLES.MANAGER), validate(startWorkSchema), maintenanceController.startWork);

// 9. KTV đánh dấu chờ linh kiện (TECHNICIAN, ADMIN, MANAGER)
router.post('/:id/waiting-part', authorize(ROLES.TECHNICIAN, ROLES.ADMIN, ROLES.MANAGER), validate(waitingPartSchema), maintenanceController.markWaitingPart);

// 10. KTV tiếp tục xử lý (TECHNICIAN, ADMIN, MANAGER)
router.post('/:id/resume', authorize(ROLES.TECHNICIAN, ROLES.ADMIN, ROLES.MANAGER), validate(resumeWorkSchema), maintenanceController.resumeWork);

// 11. KTV hoàn thành sửa chữa (TECHNICIAN, ADMIN, MANAGER)
router.post('/:id/complete', authorize(ROLES.TECHNICIAN, ROLES.ADMIN, ROLES.MANAGER), validate(completeRequestSchema), maintenanceController.completeRequest);

// 12. MODULE 8: Người dùng nghiệm thu "ĐÃ KHẮC PHỤC" & Đóng phiếu (USER, MANAGER, ADMIN)
router.post('/:id/accept', validate(acceptRequestSchema), maintenanceController.acceptAndClose);
router.post('/:id/close', validate(acceptRequestSchema), maintenanceController.acceptAndClose);

// 13. MODULE 8: Người dùng nghiệm thu "CHƯA KHẮC PHỤC" & Yêu cầu xử lý lại (USER, MANAGER, ADMIN)
router.post('/:id/reopen', validate(reopenRequestSchema), maintenanceController.rejectAndReopen);

module.exports = router;
