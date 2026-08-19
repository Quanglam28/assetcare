const QRCode = require('qrcode');

/**
 * Utility tạo và xử lý mã QR Code cho thiết bị đại học
 */
class QrCodeUtil {
  /**
   * Tạo chuỗi Token QR định danh duy nhất cho thiết bị
   * Định dạng chuẩn: UNI-QR-2026-<DEVICE_CODE>
   */
  static generateDeviceToken(deviceCode) {
    const cleanCode = (deviceCode || '').toString().trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    return `UNI-QR-2026-${cleanCode || randomHex}`;
  }

  /**
   * Tạo Data URL dạng Base64 PNG
   */
  static async generateDataURL(text, options = {}) {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 300,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    };
    return QRCode.toDataURL(text, { ...defaultOptions, ...options });
  }

  /**
   * Tạo Buffer ảnh QR
   */
  static async generateBuffer(text, options = {}) {
    return QRCode.toBuffer(text, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      width: 350,
      ...options,
    });
  }
}

module.exports = QrCodeUtil;
