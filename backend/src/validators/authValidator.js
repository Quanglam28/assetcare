const Joi = require('joi');

/**
 * Schema kiểm tra dữ liệu đăng nhập
 */
const loginSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    'string.empty': 'Tên đăng nhập hoặc Email không được để trống',
    'any.required': 'Tên đăng nhập hoặc Email là bắt buộc',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
});

/**
 * Schema kiểm tra dữ liệu đổi mật khẩu
 */
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Mật khẩu hiện tại không được để trống',
    'any.required': 'Mật khẩu hiện tại là bắt buộc',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'Mật khẩu mới không được để trống',
    'string.min': 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Xác nhận mật khẩu mới không trùng khớp',
    'string.empty': 'Vui lòng xác nhận mật khẩu mới',
    'any.required': 'Xác nhận mật khẩu mới là bắt buộc',
  }),
});

/**
 * Schema kiểm tra dữ liệu đăng ký người dùng mới
 */
const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Họ và tên không được để trống',
    'string.min': 'Họ và tên tối thiểu 2 ký tự',
    'any.required': 'Họ và tên là bắt buộc',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'string.empty': 'Email không được để trống',
    'any.required': 'Email là bắt buộc',
  }),
  username: Joi.string().alphanum().min(3).max(50).optional().allow('', null),
  password: Joi.string().min(6).max(100).required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'string.min': 'Mật khẩu tối thiểu 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Xác nhận mật khẩu không trùng khớp',
    'string.empty': 'Vui lòng xác nhận lại mật khẩu',
    'any.required': 'Xác nhận mật khẩu là bắt buộc',
  }),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  registerSchema,
};
