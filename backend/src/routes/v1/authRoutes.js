const express = require('express');
const Joi = require('joi');
const authController = require('../../controllers/authController');
const { authenticate } = require('../../middlewares/authMiddleware');
const { validate } = require('../../middlewares/validatorMiddleware');

const router = express.Router();

// Schema validate đăng nhập
const loginSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    'string.empty': 'Tên đăng nhập không được để trống',
    'any.required': 'Tên đăng nhập là trường bắt buộc',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Mật khẩu là trường bắt buộc',
  }),
});

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
