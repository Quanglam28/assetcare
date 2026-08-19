const rateLimit = require('express-rate-limit');

/**
 * Giới hạn tần suất đăng nhập (Chống Brute-force & Credential Stuffing)
 * Tối đa 15 lần thử trong 1 phút cho mỗi địa chỉ IP
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 15,             // 15 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.',
  },
});

/**
 * Giới hạn tần suất chung cho toàn bộ REST API
 * Tối đa 500 requests trong 1 phút cho mỗi địa chỉ IP
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Hệ thống phát hiện tần suất gửi yêu cầu quá nhanh. Vui lòng thử lại sau giây lát.',
  },
});

/**
 * Giới hạn tần suất tra cứu công khai qua QR Code
 * Tối đa 60 lượt quét trong 1 phút cho mỗi địa chỉ IP
 */
const publicScanRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Tần suất quét QR quá nhanh. Vui lòng thử lại sau ít phút.',
  },
});

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  publicScanRateLimiter,
};
