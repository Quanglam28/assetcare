/**
 * Logger Utility with Automatic Sensitive Data Masking (Chống rò rỉ mật khẩu và Token)
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'oldpassword',
  'newpassword',
  'password_hash',
  'token',
  'jwt_secret',
  'jwtsecret',
  'secret',
  'authorization',
]);

/**
 * Đệ quy khử dữ liệu nhạy cảm trước khi ghi log
 */
function sanitize(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    // Ẩn chuỗi JWT token Bearer
    if (data.startsWith('Bearer eyJ')) {
      return 'Bearer [MASKED_JWT_TOKEN]';
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object') {
    const cleanObj = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        cleanObj[key] = '[PROTECTED_SENSITIVE_DATA]';
      } else if (typeof val === 'object' && val !== null) {
        cleanObj[key] = sanitize(val);
      } else {
        cleanObj[key] = val;
      }
    }
    return cleanObj;
  }
  return data;
}

const logger = {
  info: (msg, meta = '') => {
    const safeMeta = meta ? JSON.stringify(sanitize(meta)) : '';
    console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toISOString()} - ${msg}`, safeMeta);
  },
  success: (msg, meta = '') => {
    const safeMeta = meta ? JSON.stringify(sanitize(meta)) : '';
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString()} - ${msg}`, safeMeta);
  },
  warn: (msg, meta = '') => {
    const safeMeta = meta ? JSON.stringify(sanitize(meta)) : '';
    console.warn(`\x1b[33m[WARN]\x1b[0m ${new Date().toISOString()} - ${msg}`, safeMeta);
  },
  error: (msg, error = '') => {
    if (error instanceof Error) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()} - ${msg}`, error.message);
    } else {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()} - ${msg}`, sanitize(error));
    }
  },
};

module.exports = logger;
