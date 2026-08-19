const Joi = require('joi');

const createDeviceSchema = Joi.object({
  code: Joi.string().trim().max(50).required().messages({
    'string.empty': 'Mã thiết bị không được để trống',
    'any.required': 'Mã thiết bị là bắt buộc',
  }),
  name: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Tên thiết bị không được để trống',
    'any.required': 'Tên thiết bị là bắt buộc',
  }),
  deviceTypeId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn loại thiết bị',
  }),
  locationId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn địa điểm / phòng đặt thiết bị',
  }),
  departmentId: Joi.number().integer().positive().allow(null).optional(),
  supplierId: Joi.number().integer().positive().allow(null).optional(),
  model: Joi.string().trim().allow('', null).optional(),
  serialNumber: Joi.string().trim().allow('', null).optional(),
  purchaseDate: Joi.date().iso().allow(null, '').optional(),
  purchasePrice: Joi.number().min(0).default(0),
  warrantyStart: Joi.date().iso().allow(null, '').optional(),
  warrantyEnd: Joi.date().iso().allow(null, '').optional(),
  status: Joi.string().valid('ACTIVE', 'MAINTENANCE', 'BROKEN', 'RETIRED').default('ACTIVE'),
  description: Joi.string().trim().allow('', null).optional(),
  qrToken: Joi.string().trim().allow('', null).optional(),
});

const updateDeviceSchema = Joi.object({
  name: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Tên thiết bị không được để trống',
    'any.required': 'Tên thiết bị là bắt buộc',
  }),
  deviceTypeId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn loại thiết bị',
  }),
  locationId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn địa điểm / phòng đặt thiết bị',
  }),
  departmentId: Joi.number().integer().positive().allow(null).optional(),
  supplierId: Joi.number().integer().positive().allow(null).optional(),
  model: Joi.string().trim().allow('', null).optional(),
  serialNumber: Joi.string().trim().allow('', null).optional(),
  purchaseDate: Joi.date().iso().allow(null, '').optional(),
  purchasePrice: Joi.number().min(0).optional(),
  warrantyStart: Joi.date().iso().allow(null, '').optional(),
  warrantyEnd: Joi.date().iso().allow(null, '').optional(),
  status: Joi.string().valid('ACTIVE', 'MAINTENANCE', 'BROKEN', 'RETIRED').optional(),
  description: Joi.string().trim().allow('', null).optional(),
});

const updateDeviceStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'MAINTENANCE', 'BROKEN', 'RETIRED').required().messages({
    'any.only': 'Trạng thái chỉ có thể là ACTIVE, MAINTENANCE, BROKEN hoặc RETIRED',
    'any.required': 'Trạng thái thiết bị là bắt buộc',
  }),
});

module.exports = {
  createDeviceSchema,
  updateDeviceSchema,
  updateDeviceStatusSchema,
};
