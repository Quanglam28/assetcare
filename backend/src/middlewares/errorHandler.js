const { HTTP_CODES } = require('../constants/httpCodes');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Middleware bắt lỗi tập trung (Global Error Handler)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Đã có lỗi xảy ra từ phía máy chủ';
  let errors = err.errors || null;

  // Lỗi Joi Validation
  if (err.isJoi) {
    statusCode = HTTP_CODES.BAD_REQUEST;
    message = 'Dữ liệu đầu vào không hợp lệ';
    errors = err.details.map((item) => ({
      field: item.path.join('.'),
      message: item.message,
    }));
  }

  // Lỗi cú pháp JSON body không hợp lệ
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_CODES.BAD_REQUEST;
    message = 'Cấu trúc JSON trong Request Body không hợp lệ';
  }

  // Lỗi MySQL Duplicate Key (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = HTTP_CODES.CONFLICT;
    message = 'Dữ liệu đã tồn tại trong hệ thống (trùng lặp mã định danh, email hoặc username)';
  }

  // Lỗi MySQL Foreign Key Constraint (ER_NO_REFERENCED_ROW_2)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = HTTP_CODES.BAD_REQUEST;
    message = 'Dữ liệu liên kết không tồn tại (Khóa ngoại không hợp lệ)';
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_CODES.UNAUTHORIZED;
    message = 'Token xác thực không hợp lệ';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_CODES.UNAUTHORIZED;
    message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
  }

  // Ghi log chi tiết nếu là lỗi server (500)
  if (statusCode >= 500) {
    logger.error(`[Unhandled Server Error] ${req.method} ${req.originalUrl}:`, err);
    // Bảo vệ an ninh: Không trả raw SQL error message hoặc stack trace cho client
    if (process.env.NODE_ENV === 'production' || !err.statusCode) {
      message = 'Đã có lỗi xảy ra từ hệ thống máy chủ. Vui lòng liên hệ quản trị viên hoặc thử lại sau.';
    }
  } else {
    logger.warn(`[Client Error] ${req.method} ${req.originalUrl} (${statusCode}): ${message}`);
  }

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors,
  });
};

/**
 * Middleware bắt route 404
 */
const notFoundHandler = (req, res, next) => {
  return ApiResponse.error(res, {
    statusCode: HTTP_CODES.NOT_FOUND,
    message: `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
