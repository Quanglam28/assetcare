/**
 * Định dạng tiền tệ VNĐ
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

/**
 * Định dạng ngày giờ chuẩn Việt Nam (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Định dạng ngày date-only an toàn tuyệt đối với mọi timezone (DD/MM/YYYY)
 * Không sử dụng new Date("YYYY-MM-DD") để tránh bị lùi 1 ngày tại các timezone âm (UTC-4, UTC-7).
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '-';
  if (typeof dateString === 'string') {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }
  if (dateString instanceof Date && !isNaN(dateString.getTime())) {
    const day = String(dateString.getDate()).padStart(2, '0');
    const month = String(dateString.getMonth() + 1).padStart(2, '0');
    const year = dateString.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

/**
 * Định dạng ngày chuẩn Việt Nam (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  if (typeof dateString === 'string') {
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Tính ngày bảo trì tiếp theo xem trước với cơ chế Month Clamping (EOM Clamping)
 * Chống tràn tháng: 31/01 + 1 tháng -> 28/02, 31/01 + 3 tháng -> 30/04
 * Định dạng trả về: DD/MM/YYYY
 */
export const calculateNextRunDateClamped = (baseDate, frequency, customDays = 30) => {
  if (!baseDate) return 'N/A';
  let year, month, day;

  if (typeof baseDate === 'string') {
    const match = baseDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    }
  }

  if (!year) {
    const d = (baseDate instanceof Date && !isNaN(baseDate.getTime())) ? baseDate : new Date();
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
  }

  const freq = (frequency || 'QUARTERLY').toUpperCase();

  if (freq === 'CUSTOM') {
    const d = new Date(Date.UTC(year, month - 1, day + (parseInt(customDays, 10) || 30)));
    const yStr = String(d.getUTCFullYear()).padStart(4, '0');
    const mStr = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dStr = String(d.getUTCDate()).padStart(2, '0');
    return `${dStr}/${mStr}/${yStr}`;
  }

  let monthsToAdd = 3;
  if (freq === 'MONTHLY') monthsToAdd = 1;
  else if (freq === 'QUARTERLY') monthsToAdd = 3;
  else if (freq === 'SEMI_ANNUALLY' || freq === 'SEMIANNUAL') monthsToAdd = 6;
  else if (freq === 'ANNUALLY' || freq === 'YEARLY') monthsToAdd = 12;

  const totalMonths = (year * 12 + (month - 1)) + monthsToAdd;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;

  // Số ngày tối đa của tháng đích trong UTC
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  const yStr = String(targetYear).padStart(4, '0');
  const mStr = String(targetMonth).padStart(2, '0');
  const dStr = String(targetDay).padStart(2, '0');
  return `${dStr}/${mStr}/${yStr}`;
};

