const Joi = require('joi');

const buildingSchema = Joi.object({
  code: Joi.string().trim().max(20).required().messages({
    'string.empty': 'Mã tòa nhà không được để trống',
    'any.required': 'Mã tòa nhà là bắt buộc',
  }),
  name: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Tên tòa nhà không được để trống',
    'any.required': 'Tên tòa nhà là bắt buộc',
  }),
  address: Joi.string().trim().allow('', null).optional(),
  totalFloors: Joi.number().integer().min(1).max(100).default(1),
  description: Joi.string().trim().allow('', null).optional(),
});

const locationSchema = Joi.object({
  buildingId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn tòa nhà',
  }),
  code: Joi.string().trim().max(50).required().messages({
    'string.empty': 'Mã phòng/địa điểm không được để trống',
    'any.required': 'Mã phòng/địa điểm là bắt buộc',
  }),
  roomName: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Tên phòng không được để trống',
    'any.required': 'Tên phòng là bắt buộc',
  }),
  floor: Joi.number().integer().min(1).max(100).default(1),
  type: Joi.string().valid('CLASSROOM', 'LAB', 'OFFICE', 'SERVER_ROOM', 'WAREHOUSE', 'OTHER').default('CLASSROOM'),
  description: Joi.string().trim().allow('', null).optional(),
});

const departmentSchema = Joi.object({
  code: Joi.string().trim().max(50).required().messages({
    'string.empty': 'Mã khoa/phòng ban không được để trống',
    'any.required': 'Mã khoa/phòng ban là bắt buộc',
  }),
  name: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Tên khoa/phòng ban không được để trống',
    'any.required': 'Tên khoa/phòng ban là bắt buộc',
  }),
  phone: Joi.string().trim().allow('', null).pattern(/^[0-9+() -]{8,20}$/).optional().messages({
    'string.pattern.base': 'Số điện thoại không đúng định dạng',
  }),
  email: Joi.string().email().trim().allow('', null).optional().messages({
    'string.email': 'Email không đúng định dạng',
  }),
  description: Joi.string().trim().allow('', null).optional(),
});

const deviceTypeSchema = Joi.object({
  code: Joi.string().trim().max(50).required().messages({
    'string.empty': 'Mã loại thiết bị không được để trống',
    'any.required': 'Mã loại thiết bị là bắt buộc',
  }),
  name: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Tên loại thiết bị không được để trống',
    'any.required': 'Tên loại thiết bị là bắt buộc',
  }),
  category: Joi.string().valid('IT_EQUIPMENT', 'LAB_EQUIPMENT', 'FACILITY', 'OFFICE_EQUIPMENT', 'OTHER').default('OTHER'),
  maintenanceIntervalDays: Joi.number().integer().min(1).max(3650).default(90),
  description: Joi.string().trim().allow('', null).optional(),
});

const supplierSchema = Joi.object({
  code: Joi.string().trim().max(50).required().messages({
    'string.empty': 'Mã nhà cung cấp không được để trống',
    'any.required': 'Mã nhà cung cấp là bắt buộc',
  }),
  name: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Tên nhà cung cấp không được để trống',
    'any.required': 'Tên nhà cung cấp là bắt buộc',
  }),
  contactPerson: Joi.string().trim().allow('', null).optional(),
  phone: Joi.string().trim().allow('', null).pattern(/^[0-9+() -]{8,20}$/).optional().messages({
    'string.pattern.base': 'Số điện thoại không đúng định dạng',
  }),
  email: Joi.string().email().trim().allow('', null).optional().messages({
    'string.email': 'Email không đúng định dạng',
  }),
  address: Joi.string().trim().allow('', null).optional(),
  taxCode: Joi.string().trim().allow('', null).optional(),
  description: Joi.string().trim().allow('', null).optional(),
});

module.exports = {
  buildingSchema,
  locationSchema,
  departmentSchema,
  deviceTypeSchema,
  supplierSchema,
};
