const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validatorMiddleware');
const { loginSchema, changePasswordSchema, registerSchema } = require('../validators/authValidator');

const router = express.Router();

// 1. Đăng nhập
router.post('/login', validate(loginSchema), authController.login);

// 2. Đăng ký
router.post('/register', validate(registerSchema), authController.register);

// 3. Đăng xuất
router.post('/logout', authenticate, authController.logout);

// 3. Lấy thông tin tài khoản hiện tại
router.get('/me', authenticate, authController.getCurrentUser);

// 4. Đổi mật khẩu
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
