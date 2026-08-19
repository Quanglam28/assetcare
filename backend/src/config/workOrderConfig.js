/**
 * Cấu hình Quy trình & Trạng thái Phiếu Lệnh Công Tác Bảo Trì (Maintenance Work Order)
 * Phase 3 - Version 1.0
 */

module.exports = {
  VERSION: 'v1.0',

  STATUS: {
    OPEN: 'OPEN',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING_PARTS: 'WAITING_PARTS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },

  TYPES: {
    PREVENTIVE: { id: 'PREVENTIVE', label: 'Bảo trì định kỳ', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    CORRECTIVE: { id: 'CORRECTIVE', label: 'Sửa chữa sự cố', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
    EMERGENCY: { id: 'EMERGENCY', label: 'Bảo trì khẩn cấp', badge: 'bg-rose-50 text-rose-800 border-rose-200' },
    INSPECTION: { id: 'INSPECTION', label: 'Kiểm định / Đo kiểm', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    REPLACEMENT_REVIEW: { id: 'REPLACEMENT_REVIEW', label: 'Thẩm định thay mới', badge: 'bg-orange-50 text-orange-800 border-orange-200' },
  },

  PRIORITIES: {
    LOW: { id: 'LOW', label: 'Thấp', bg: 'bg-slate-100 text-slate-700' },
    MEDIUM: { id: 'MEDIUM', label: 'Trung bình', bg: 'bg-amber-100 text-amber-800' },
    HIGH: { id: 'HIGH', label: 'Cao', bg: 'bg-orange-100 text-orange-800' },
    CRITICAL: { id: 'CRITICAL', label: 'Khẩn cấp', bg: 'bg-rose-100 text-rose-800' },
  },

  // Ma trận chuyển đổi trạng thái hợp lệ (Valid Status Transitions)
  VALID_TRANSITIONS: {
    OPEN: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['WAITING_PARTS', 'COMPLETED', 'CANCELLED'],
    WAITING_PARTS: ['IN_PROGRESS', 'CANCELLED'],
    COMPLETED: [], // Terminal state
    CANCELLED: [], // Terminal state
  },
};
