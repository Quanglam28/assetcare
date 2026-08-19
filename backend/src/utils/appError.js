const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Custom Operational Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = HTTP_CODES.INTERNAL_SERVER_ERROR, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Dữ liệu yêu cầu không hợp lệ', errors = null) {
    super(message, HTTP_CODES.BAD_REQUEST, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn') {
    super(message, HTTP_CODES.UNAUTHORIZED);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện hành động này') {
    super(message, HTTP_CODES.FORBIDDEN);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên yêu cầu') {
    super(message, HTTP_CODES.NOT_FOUND);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Dữ liệu đã tồn tại hoặc xảy ra xung đột') {
    super(message, HTTP_CODES.CONFLICT);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
