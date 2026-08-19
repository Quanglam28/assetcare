const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validatorMiddleware');
const {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  resetPasswordSchema,
} = require('../validators/userValidator');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// Tất cả API User Management đều yêu cầu đăng nhập
router.use(authenticate);

// 1. Lấy dữ liệu danh mục Roles và Departments phục vụ Form tạo/sửa
router.get('/meta/master-data', authorize(ROLES.ADMIN, ROLES.MANAGER), userController.getMasterData);

// 2. Lấy danh sách người dùng kèm phân trang, tìm kiếm, lọc
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER), userController.getUsers);

// 3. Lấy chi tiết một người dùng
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), userController.getUserById);

// 4. Tạo người dùng mới (Chỉ ADMIN)
router.post('/', authorize(ROLES.ADMIN), validate(createUserSchema), userController.createUser);

// 5. Cập nhật thông tin người dùng (Chỉ ADMIN)
router.put('/:id', authorize(ROLES.ADMIN), validate(updateUserSchema), userController.updateUser);

// 6. Khóa / Mở khóa trạng thái người dùng (Chỉ ADMIN)
router.patch('/:id/status', authorize(ROLES.ADMIN), validate(updateStatusSchema), userController.updateStatus);

// 7. Đặt lại mật khẩu người dùng (Chỉ ADMIN)
router.patch('/:id/reset-password', authorize(ROLES.ADMIN), validate(resetPasswordSchema), userController.resetPassword);

module.exports = router;
