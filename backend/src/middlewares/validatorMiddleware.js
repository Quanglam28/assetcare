const { BadRequestError } = require('../utils/appError');

/**
 * Middleware validate schema Joi cho body, query hoặc params
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return next(new BadRequestError('Dữ liệu không hợp lệ', details));
    }

    // Gán lại dữ liệu đã sanitize
    req[source] = value;
    next();
  };
};

module.exports = { validate };
