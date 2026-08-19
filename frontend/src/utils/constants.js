/**
 * Vai trò người dùng (Roles)
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TECHNICIAN: 'TECHNICIAN',
  USER: 'USER',
};

export const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý tài sản',
  TECHNICIAN: 'Kỹ thuật viên',
  USER: 'Người dùng / GV',
};

export const ROLE_COLORS = {
  ADMIN: 'purple',
  MANAGER: 'primary',
  TECHNICIAN: 'warning',
  USER: 'secondary',
};

/**
 * Trạng thái tài khoản người dùng
 */
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
};

export const STATUS_LABELS = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Chưa kích hoạt',
  SUSPENDED: 'Tạm khóa',
};

export const STATUS_COLORS = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'danger',
};

/**
 * Trạng thái thiết bị
 */
export const DEVICE_STATUS = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  BROKEN: 'BROKEN',
  RETIRED: 'RETIRED',
};

export const DEVICE_STATUS_CONFIG = {
  ACTIVE: { label: 'Hoạt động tốt', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  MAINTENANCE: { label: 'Đang bảo dưỡng', color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  BROKEN: { label: 'Hỏng hóc', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  RETIRED: { label: 'Đã thanh lý', color: 'slate', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
};

/**
 * Trạng thái yêu cầu bảo trì (Tickets)
 */
export const MAINTENANCE_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_PART: 'WAITING_PART',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
};

export const MAINTENANCE_STATUS_CONFIG = {
  PENDING: { label: 'Chờ tiếp nhận', color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  ASSIGNED: { label: 'Đã phân công', color: 'sky', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  IN_PROGRESS: { label: 'Đang xử lý', color: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  WAITING_PART: { label: 'Chờ linh kiện', color: 'orange', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'indigo', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  CLOSED: { label: 'Đã nghiệm thu (Đóng)', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REOPENED: { label: 'Yêu cầu làm lại', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
};

/**
 * Mức độ ưu tiên
 */
export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'Thấp', bg: 'bg-slate-100 text-slate-700' },
  MEDIUM: { label: 'Trung bình', bg: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'Cao', bg: 'bg-amber-100 text-amber-800' },
  URGENT: { label: 'Khẩn cấp', bg: 'bg-rose-100 text-rose-800 font-semibold' },
};

/**
 * MODULE 9: Chu kỳ bảo trì định kỳ (Frequencies)
 */
export const SCHEDULE_FREQUENCY_CONFIG = {
  MONTHLY: { label: 'Hàng tháng (30 ngày)', days: 30 },
  QUARTERLY: { label: 'Hàng quý (90 ngày)', days: 90 },
  SEMI_ANNUALLY: { label: 'Nửa năm (180 ngày)', days: 180 },
  SEMIANNUAL: { label: 'Nửa năm (180 ngày)', days: 180 },
  ANNUALLY: { label: 'Hàng năm (365 ngày)', days: 365 },
  YEARLY: { label: 'Hàng năm (365 ngày)', days: 365 },
  CUSTOM: { label: 'Tùy chỉnh số ngày', days: 0 },
};

/**
 * MODULE 9: Phân loại cảnh báo hạn bảo trì định kỳ (Alert Statuses)
 */
export const SCHEDULE_ALERT_CONFIG = {
  OVERDUE: { label: 'Đã quá hạn', bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-600' },
  DUE: { label: 'Đến hạn hôm nay', bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-600' },
  UPCOMING: { label: 'Sắp đến hạn', bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-600' },
  COMPLETED: { label: 'Đã bảo dưỡng xong', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-600' },
};

/**
 * Phân loại Điểm Sức Khỏe Thiết Bị (Asset Health Status)
 */
export const HEALTH_STATUS_CONFIG = {
  GOOD: { label: 'TỐT (80-100)', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
  FAIR: { label: 'KHÁ / TRUNG BÌNH (60-79)', color: 'yellow', bg: 'bg-yellow-50 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' },
  WARNING: { label: 'CẦN LƯU Ý (40-59)', color: 'amber', bg: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  CRITICAL: { label: 'NGHIÊM TRỌNG (<40)', color: 'rose', bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  INSUFFICIENT_DATA: { label: 'CHƯA ĐỦ DỮ LIỆU', color: 'slate', bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
};

/**
 * Phân loại Mức Độ Rủi Ro Sự Cố (Failure Risk Level)
 */
export const RISK_LEVEL_CONFIG = {
  VERY_LOW: { label: 'RẤT THẤP', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', badge: '🟢 Rất thấp' },
  LOW: { label: 'THẤP', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', badge: '🟢 Thấp' },
  MEDIUM: { label: 'TRUNG BÌNH', color: 'yellow', bg: 'bg-yellow-50 text-yellow-800 border-yellow-300', badge: '🟡 Trung bình' },
  HIGH: { label: 'CAO', color: 'orange', bg: 'bg-orange-50 text-orange-800 border-orange-300', badge: '🟠 Cao' },
  CRITICAL: { label: 'NGUY CẤP', color: 'rose', bg: 'bg-rose-50 text-rose-800 border-rose-300', badge: '🔴 Nguy cấp' },
  UNKNOWN: { label: 'CHƯA XÁC ĐỊNH', color: 'slate', bg: 'bg-slate-100 text-slate-700 border-slate-300', badge: '⚪ Chưa rõ' },
};

/**
 * Khuyến nghị hành động kỹ thuật (System Recommendations)
 */
export const RECOMMENDATION_ACTION_CONFIG = {
  SCHEDULE_MAINTENANCE: { label: 'Lập lịch bảo dưỡng ngay', bg: 'bg-amber-100 text-amber-900 border-amber-300', color: 'amber' },
  INSPECT_ASSET: { label: 'Kiểm tra chuyên sâu (7 ngày)', bg: 'bg-orange-100 text-orange-900 border-orange-300', color: 'orange' },
  MONITOR_ASSET: { label: 'Duy trì vận hành ổn định', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', color: 'emerald' },
  REPAIR_ASSET: { label: 'Theo dõi tiến độ sửa chữa', bg: 'bg-blue-100 text-blue-900 border-blue-300', color: 'blue' },
  CONSIDER_REPLACEMENT: { label: 'Xem xét thay mới thiết bị', bg: 'bg-rose-100 text-rose-900 border-rose-300', color: 'rose' },
};
