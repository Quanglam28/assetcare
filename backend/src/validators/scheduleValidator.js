const Joi = require('joi');

const createScheduleSchema = Joi.object({
  deviceId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn thiết bị cần lập lịch bảo dưỡng',
    'number.base': 'ID thiết bị không hợp lệ',
  }),
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Tiêu đề lịch bảo trì không được để trống',
    'string.min': 'Tiêu đề lịch bảo trì cần tối thiểu 3 ký tự',
    'any.required': 'Tiêu đề lịch bảo trì là bắt buộc',
  }),
  frequency: Joi.string()
    .valid('MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'SEMIANNUAL', 'ANNUALLY', 'YEARLY', 'CUSTOM')
    .default('QUARTERLY'),
  scheduledDate: Joi.string().isoDate().required().messages({
    'any.required': 'Ngày dự kiến thực hiện bảo trì là bắt buộc',
    'string.isoDate': 'Định dạng ngày không hợp lệ (YYYY-MM-DD)',
  }),
  customDays: Joi.number().integer().min(1).max(3650).optional(),
  assignedTechnicianId: Joi.number().integer().positive().allow(null).optional(),
  notes: Joi.string().trim().allow('', null).optional(),
});

const updateScheduleSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional(),
  frequency: Joi.string()
    .valid('MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'SEMIANNUAL', 'ANNUALLY', 'YEARLY', 'CUSTOM')
    .optional(),
  scheduledDate: Joi.string().isoDate().optional(),
  customDays: Joi.number().integer().min(1).max(3650).optional(),
  assignedTechnicianId: Joi.number().integer().positive().allow(null).optional(),
  status: Joi.string().valid('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED').optional(),
  notes: Joi.string().trim().allow('', null).optional(),
});

const executeScheduleSchema = Joi.object({
  notes: Joi.string().trim().allow('', null).optional(),
  cost: Joi.number().min(0).default(0),
});

module.exports = {
  createScheduleSchema,
  updateScheduleSchema,
  executeScheduleSchema,
};
