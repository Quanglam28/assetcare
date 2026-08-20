const { ForbiddenError } = require('../utils/appError');
const { COOKIE_NAME } = require('../config/cookieConfig');

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
].filter(Boolean);

const isSafeOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (
    /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin) ||
    /^https:\/\/.*\.vercel\.app$/.test(origin) ||
    /^https:\/\/.*\.onrender\.com$/.test(origin)
  ) {
    return true;
  }
  return false;
};

/**
 * Middleware phòng thủ CSRF (Cross-Site Request Forgery)
 * Kiểm tra Origin/Referer và Custom Request Header đối với các request mang HttpOnly Cookie
 */
const csrfProtection = (req, res, next) => {
  // Bỏ qua các HTTP method an toàn (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Bỏ qua các endpoint public / không yêu cầu cookie session
  if (
    req.path.startsWith('/api/public') ||
    req.path === '/api/health' ||
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/register'
  ) {
    return next();
  }

  // Nếu request có mang HttpOnly Auth Cookie
  const hasAuthCookie = req.cookies && req.cookies[COOKIE_NAME];
  if (hasAuthCookie) {
    const origin = req.headers.origin || req.headers.referer;

    // Kiểm tra Origin / Referer
    if (origin) {
      try {
        const originUrl = new URL(origin).origin;
        if (!isSafeOrigin(originUrl)) {
          return next(new ForbiddenError('CSRF Protection: Truy cập bị từ chối từ Origin không an toàn'));
        }
      } catch {
        return next(new ForbiddenError('CSRF Protection: Origin/Referer không hợp lệ'));
      }
    }
  }

  next();
};

module.exports = {
  csrfProtection,
  isSafeOrigin,
};
