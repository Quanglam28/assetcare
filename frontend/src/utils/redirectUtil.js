/**
 * Utility xác thực & làm sạch đường dẫn redirect an toàn
 * Bảo vệ chống Open Redirect Attack (e.g. redirect=https://evil.com, //evil.com, javascript:...)
 */
export const getSafeRedirectPath = (redirectUrl, defaultPath = '/dashboard') => {
  if (!redirectUrl || typeof redirectUrl !== 'string') {
    return defaultPath;
  }

  let decodedUrl = redirectUrl.trim();
  // Decode multiple layers if encoded
  for (let i = 0; i < 3; i++) {
    try {
      const nextDecoded = decodeURIComponent(decodedUrl).trim();
      if (nextDecoded === decodedUrl) break;
      decodedUrl = nextDecoded;
    } catch {
      break;
    }
  }

  // Remove whitespace and control characters
  decodedUrl = decodedUrl.replace(/[\r\n\t]/g, '').trim();

  // 1. Phải bắt đầu bằng '/'
  // 2. Không được bắt đầu bằng '//', '/\', '/@', '\'
  // 3. Không được chứa dấu gạch chéo ngược '\'
  // 4. Không được chứa '://'
  // 5. Không được chứa scheme (javascript:, data:, vbscript:, http:, https:, etc.)
  if (
    decodedUrl.startsWith('/') &&
    !decodedUrl.startsWith('//') &&
    !decodedUrl.startsWith('/\\') &&
    !decodedUrl.startsWith('/@') &&
    !decodedUrl.includes('\\') &&
    !decodedUrl.includes('://') &&
    !/^\s*(https?|ftp|file|javascript|data|vbscript):/i.test(decodedUrl)
  ) {
    return decodedUrl;
  }

  return defaultPath;
};

/**
 * Lưu target redirect vào sessionStorage để bảo lưu an toàn khi qua nhiều bước (Login -> Register -> Verify)
 */
export const savePendingRedirect = (path) => {
  const safePath = getSafeRedirectPath(path, '');
  if (safePath) {
    try {
      sessionStorage.setItem('pending_redirect_url', safePath);
    } catch {
      // Bỏ qua lỗi storage
    }
  }
};

/**
 * Lấy và xóa pending redirect từ sessionStorage
 */
export const consumePendingRedirect = (defaultPath = '/dashboard') => {
  try {
    const saved = sessionStorage.getItem('pending_redirect_url');
    if (saved) {
      sessionStorage.removeItem('pending_redirect_url');
      return getSafeRedirectPath(saved, defaultPath);
    }
  } catch {
    // Bỏ qua lỗi storage
  }
  return defaultPath;
};
