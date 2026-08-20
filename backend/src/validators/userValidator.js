const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().pattern(/^[a-zA-Z0-9_.]{3,50}$/).trim().required().messages({
    'string.empty': 'Tên đăng nhập không được để trống',
    'string.pattern.base': 'Tên đăng nhập từ 3-50 ký tự, chỉ gồm chữ, số, gạch dưới (_) hoặc chấm (.)',
    'any.required': 'Tên đăng nhập là bắt buộc',
  }),
  email: Joi.string().email().trim().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Địa chỉ email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().min(8).max(100).required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'string.min': 'Mật khẩu phải có độ dài tối thiểu 8 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Họ và tên không được để trống',
    'any.required': 'Họ và tên là bắt buộc',
  }),
  phone: Joi.string().trim().allow('', null).pattern(/^[0-9+() -]{8,20}$/).messages({
    'string.pattern.base': 'Số điện thoại không đúng định dạng',
  }),
  roleId: Joi.number().integer().positive().required().messages({
    'number.base': 'Vai trò (roleId) phải là số nguyên',
    'any.required': 'Vui lòng chọn vai trò cho người dùng',
  }),
  departmentId: Joi.number().integer().positive().allow(null).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').default('ACTIVE'),
  avatarUrl: Joi.string().uri().allow('', null).optional(),
});

const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Họ và tên không được để trống',
    'any.required': 'Họ và tên là bắt buộc',
  }),
  email: Joi.string().email().trim().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Địa chỉ email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  phone: Joi.string().trim().allow('', null).pattern(/^[0-9+() -]{8,20}$/).messages({
    'string.pattern.base': 'Số điện thoại không đúng định dạng',
  }),
  roleId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn vai trò cho người dùng',
  }),
  departmentId: Joi.number().integer().positive().allow(null).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').required().messages({
    'any.required': 'Vui lòng chọn trạng thái tài khoản',
  }),
  avatarUrl: Joi.string().uri().allow('', null).optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').required().messages({
    'any.only': 'Trạng thái chỉ có thể là ACTIVE, INACTIVE hoặc SUSPENDED',
    'any.required': 'Trạng thái tài khoản là bắt buộc',
  }),
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(100).optional().messages({
    'string.min': 'Mật khẩu mới tối thiểu 8 ký tự',
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  resetPasswordSchema,
};
