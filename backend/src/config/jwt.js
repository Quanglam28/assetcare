const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  secret: process.env.JWT_SECRET || 'super_secure_university_asset_jwt_secret_key_2026_antigravity!',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
