const express = require('express');
const deviceController = require('../controllers/deviceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validatorMiddleware');
const {
  createDeviceSchema,
  updateDeviceSchema,
  updateDeviceStatusSchema,
} = require('../validators/deviceValidator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// 1. Quét mã QR token - Cho phép mọi người dùng đã đăng nhập tra cứu nhanh
router.get('/qr/:token', authenticate, deviceController.getDeviceByQrToken);

// 2. Lấy dữ liệu master data phục vụ Form/Filter
router.get('/meta/master-data', authenticate, deviceController.getMasterData);

// 3. Lấy danh sách thiết bị (Phân trang, tìm kiếm, lọc, sắp xếp)
router.get('/', authenticate, deviceController.getDevices);

// 4. Lấy chi tiết thiết bị & lịch sử bảo trì
router.get('/:id', authenticate, deviceController.getDeviceById);

// 4.1. Phân tích tình trạng sức khỏe thiết bị & Tính điểm Asset Health Score 0-100 (MODULE 14)
router.get('/:id/health-analytics', authenticate, deviceController.getAssetHealthAnalytics);

// 4.2. Lấy mã QR Code và đường dẫn quét URL cho thiết bị (ADMIN, MANAGER)
router.get('/:id/qr', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), deviceController.getDeviceQr);

// 5. Thêm mới thiết bị (ADMIN, MANAGER)
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), validate(createDeviceSchema), deviceController.createDevice);

// 6. Cập nhật thông tin thiết bị (ADMIN, MANAGER)
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), validate(updateDeviceSchema), deviceController.updateDevice);

// 7. Cập nhật trạng thái thiết bị (ADMIN, MANAGER, TECHNICIAN)
router.patch('/:id/status', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), validate(updateDeviceStatusSchema), deviceController.updateDeviceStatus);

// 8. Xóa hoặc thanh lý RETIRED thiết bị (ADMIN, MANAGER)
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), deviceController.deleteDevice);

module.exports = router;
