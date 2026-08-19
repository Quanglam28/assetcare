const express = require('express');
const deviceController = require('../controllers/deviceController');

const router = express.Router();

/**
 * Endpoint công khai phục vụ quét mã QR bằng Camera điện thoại hoặc QR Scanner bên ngoài
 * GET /api/public/devices/qr/:token
 * Không yêu cầu đăng nhập (Public access)
 * Chỉ trả về các thông tin cơ bản, không lộ thông tin tài chính/nhạy cảm
 */
router.get('/devices/qr/:token', deviceController.getPublicDeviceByQr);
router.get('/devices/:token', deviceController.getPublicDeviceByQr);

module.exports = router;
