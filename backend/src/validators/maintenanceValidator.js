const Joi = require('joi');

const createMaintenanceSchema = Joi.object({
  deviceId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn thiết bị gặp sự cố',
    'number.base': 'ID thiết bị không hợp lệ',
  }),
  title: Joi.string().trim().min(3).max(200).required().messages({
    'string.empty': 'Tiêu đề sự cố không được để trống',
    'string.min': 'Tiêu đề sự cố cần tối thiểu 3 ký tự',
    'any.required': 'Tiêu đề sự cố là bắt buộc',
  }),
  description: Joi.string().trim().min(5).required().messages({
    'string.empty': 'Mô tả chi tiết sự cố không được để trống',
    'string.min': 'Mô tả sự cố cần tối thiểu 5 ký tự để KTV nắm bắt thông tin',
    'any.required': 'Mô tả chi tiết sự cố là bắt buộc',
  }),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
  incidentType: Joi.string().valid('HARDWARE', 'SOFTWARE', 'NETWORK', 'POWER_ELECTRICITY', 'OTHER').default('OTHER'),
  contactPhone: Joi.string().trim().allow('', null).optional(),
  contactEmail: Joi.string().email().trim().allow('', null).optional(),
  imageUrl: Joi.string().trim().allow('', null).optional(),
});

const assignTechnicianSchema = Joi.object({
  technicianId: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn kỹ thuật viên để phân công',
    'number.base': 'ID kỹ thuật viên không hợp lệ',
  }),
  notes: Joi.string().trim().allow('', null).optional(),
});

const startWorkSchema = Joi.object({
  notes: Joi.string().trim().allow('', null).optional(),
});

const waitingPartSchema = Joi.object({
  notes: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Vui lòng ghi rõ lý do chờ linh kiện',
    'string.min': 'Lý do chờ linh kiện cần tối thiểu 3 ký tự',
    'any.required': 'Lý do chờ linh kiện là bắt buộc',
  }),
  partsNeeded: Joi.string().trim().allow('', null).optional(),
});

const resumeWorkSchema = Joi.object({
  notes: Joi.string().trim().allow('', null).optional(),
});

const completeRequestSchema = Joi.object({
  rootCause: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Vui lòng nhập nguyên nhân gây hỏng hóc (Root Cause)',
    'string.min': 'Nguyên nhân hỏng hóc cần tối thiểu 3 ký tự',
    'any.required': 'Nguyên nhân gây sự cố là bắt buộc',
  }),
  resolution: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Vui lòng nhập biện pháp/kết quả sửa chữa (Resolution)',
    'string.min': 'Biện pháp khắc phục cần tối thiểu 3 ký tự',
    'any.required': 'Biện pháp sửa chữa là bắt buộc',
  }),
  actualCost: Joi.number().min(0).default(0).messages({
    'number.min': 'Chi phí thực tế không được nhỏ hơn 0',
  }),
  completionNote: Joi.string().trim().allow('', null).optional(),
  parts: Joi.array().items(
    Joi.object({
      partName: Joi.string().trim().required().messages({
        'any.required': 'Tên linh kiện thay thế không được để trống',
      }),
      partCode: Joi.string().trim().allow('', null).optional(),
      quantity: Joi.number().integer().positive().default(1),
      unitPrice: Joi.number().min(0).default(0),
    })
  ).default([]),
});

const acceptRequestSchema = Joi.object({
  notes: Joi.string().trim().allow('', null).optional(),
  rating: Joi.number().integer().min(1).max(5).default(5),
});

const reopenRequestSchema = Joi.object({
  reason: Joi.string().trim().min(5).required().messages({
    'string.empty': 'Vui lòng nêu rõ lý do sự cố chưa được khắc phục',
    'string.min': 'Lý do yêu cầu xử lý lại cần tối thiểu 5 ký tự',
    'any.required': 'Lý do sự cố chưa được khắc phục là bắt buộc',
  }),
});

module.exports = {
  createMaintenanceSchema,
  assignTechnicianSchema,
  startWorkSchema,
  waitingPartSchema,
  resumeWorkSchema,
  completeRequestSchema,
  acceptRequestSchema,
  closeRequestSchema: acceptRequestSchema,
  reopenRequestSchema,
};
