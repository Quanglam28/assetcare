/**
 * Cấu hình bảo mật HttpOnly Cookie cho JWT Access Token (AssetCare)
 */
const isProduction = process.env.NODE_ENV === 'production';

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày tương ứng với thời hạn JWT
  path: '/',
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
});

module.exports = {
  getAuthCookieOptions,
  getClearCookieOptions,
  COOKIE_NAME: 'access_token',
};
