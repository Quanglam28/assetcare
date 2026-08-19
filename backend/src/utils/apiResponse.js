const { HTTP_CODES } = require('../constants/httpCodes');

/**
 * Standardized API Response Helper
 */
class ApiResponse {
  /**
   * Phản hồi thành công
   */
  static success(res, { data = null, message = 'Thao tác thành công', meta = null, statusCode = HTTP_CODES.OK }) {
    const responsePayload = {
      success: true,
      message,
      data,
    };

    if (meta) {
      responsePayload.meta = meta;
    }

    return res.status(statusCode).json(responsePayload);
  }

  /**
   * Phản hồi phân trang
   */
  static paginate(res, data, meta, message = 'Lấy dữ liệu thành công', statusCode = HTTP_CODES.OK) {
    return this.success(res, {
      data,
      message,
      meta: {
        page: Number(meta.page) || 1,
        limit: Number(meta.limit) || 10,
        total: Number(meta.total) || 0,
        totalPages: Number(meta.totalPages) || 1,
      },
      statusCode,
    });
  }

  /**
   * Phản hồi tạo mới thành công
   */
  static created(res, { data = null, message = 'Tạo mới thành công', meta = null }) {
    return this.success(res, { data, message, meta, statusCode: HTTP_CODES.CREATED });
  }

  /**
   * Phản hồi lỗi
   */
  static error(res, { message = 'Đã có lỗi xảy ra', errors = null, statusCode = HTTP_CODES.INTERNAL_SERVER_ERROR }) {
    const responsePayload = {
      success: false,
      message,
    };

    if (errors) {
      responsePayload.errors = errors;
    }

    return res.status(statusCode).json(responsePayload);
  }
}

module.exports = ApiResponse;
