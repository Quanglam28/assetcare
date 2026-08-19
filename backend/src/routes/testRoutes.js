const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// 1. Endpoint công khai (Public)
router.get('/public', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Truy cập endpoint công khai thành công',
    data: { access: 'PUBLIC' },
  });
});

// 2. Endpoint yêu cầu bất kỳ tài khoản đã đăng nhập (Protected)
router.get('/protected', authenticate, (req, res) => {
  return ApiResponse.success(res, {
    message: `Xin chào ${req.user.fullName}, bạn đã truy cập thành công endpoint được bảo vệ!`,
    data: { user: req.user },
  });
});

// 3. Endpoint chỉ dành cho ADMIN
router.get('/admin-only', authenticate, authorize(ROLES.ADMIN), (req, res) => {
  return ApiResponse.success(res, {
    message: 'Truy cập thành công vào khu vực Quản trị tối cao (Chỉ ADMIN)',
    data: { role: req.user.role, allowed: [ROLES.ADMIN] },
  });
});

// 4. Endpoint dành cho ADMIN và MANAGER
router.get('/manager-or-admin', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), (req, res) => {
  return ApiResponse.success(res, {
    message: 'Truy cập thành công vào khu vực Điều phối & Quản lý tài sản (ADMIN, MANAGER)',
    data: { role: req.user.role, allowed: [ROLES.ADMIN, ROLES.MANAGER] },
  });
});

// 5. Endpoint dành riêng cho TECHNICIAN
router.get('/technician-only', authenticate, authorize(ROLES.TECHNICIAN), (req, res) => {
  return ApiResponse.success(res, {
    message: 'Truy cập thành công vào khu vực Xử lý sự cố Kỹ thuật viên (Chỉ TECHNICIAN)',
    data: { role: req.user.role, allowed: [ROLES.TECHNICIAN] },
  });
});

module.exports = router;
