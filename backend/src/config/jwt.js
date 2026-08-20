const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const secret = process.env.JWT_SECRET || (isProduction
  ? process.env.JWT_SECRET_KEY || 'utt_assetcare_prod_jwt_super_secret_key_2026_secure_random_signature_string!'
  : 'super_secure_university_asset_jwt_secret_key_2026_antigravity!');

module.exports = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256',
};
