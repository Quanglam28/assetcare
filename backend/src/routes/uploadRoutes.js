const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { uploadSingle, uploadImageOnly, uploadArray } = require('../middlewares/uploadMiddleware');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

/**
 * Tải lên hình ảnh đơn lẻ (Ảnh sự cố, Avatar...)
 * POST /api/upload/image
 */
router.post('/image', authenticate, uploadImageOnly('image'), (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Vui lòng chọn tệp hình ảnh để tải lên',
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Tải lên hình ảnh thành công',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    },
  });
});

/**
 * Tải lên tệp tài liệu / chứng từ đính kèm (PDF, Ảnh)
 * POST /api/upload/document
 */
router.post('/document', authenticate, uploadSingle('file'), (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Vui lòng chọn tệp tài liệu để tải lên',
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return ApiResponse.success(res, {
    statusCode: 201,
    message: 'Tải lên tệp tài liệu thành công',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
    },
  });
});

module.exports = router;
