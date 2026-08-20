const Joi = require('joi');

// Danh sách mật khẩu quá phổ biến / dễ đoán bị cấm
const BLACKLISTED_PASSWORDS = [
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'qwerty1234',
  '11111111',
  'admin1234',
  'welcome123',
];

/**
 * Custom validator kiểm tra độ mạnh mật khẩu (8+ ký tự, có chữ và số, không khoảng trắng thuần)
 */
const passwordComplexityRule = (value, helpers) => {
  if (/^\s+$/.test(value)) {
    return helpers.message('Mật khẩu không được chỉ chứa toàn khoảng trắng');
  }
  if (BLACKLISTED_PASSWORDS.includes(value.toLowerCase())) {
    return helpers.message('Mật khẩu quá phổ biến và dễ đoán. Vui lòng chọn mật khẩu an toàn hơn');
  }
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
    return helpers.message('Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số');
  }
  return value;
};

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
  newPassword: Joi.string()
    .min(8)
    .max(100)
    .custom(passwordComplexityRule, 'Password Complexity Validation')
    .required()
    .messages({
      'string.empty': 'Mật khẩu mới không được để trống',
      'string.min': 'Mật khẩu mới phải có độ dài tối thiểu 8 ký tự',
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
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'string.empty': 'Email không được để trống',
    'any.required': 'Email là bắt buộc',
  }),
  username: Joi.string().trim().pattern(/^[a-zA-Z0-9_]{3,50}$/).optional().allow('', null),
  password: Joi.string()
    .min(8)
    .max(100)
    .custom(passwordComplexityRule, 'Password Complexity Validation')
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu tối thiểu 8 ký tự',
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
  BLACKLISTED_PASSWORDS,
};
