const bcrypt = require('bcryptjs');

/**
 * Utility băm và kiểm tra mật khẩu
 */
class PasswordUtil {
  /**
   * Băm mật khẩu
   */
  static async hash(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  }

  /**
   * So sánh mật khẩu
   */
  static async compare(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = PasswordUtil;
