/**
 * Status constants cho Devices, Maintenance Requests, Schedules, Users
 */

const DEVICE_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',           // Đang hoạt động
  MAINTENANCE: 'MAINTENANCE', // Đang bảo trì
  BROKEN: 'BROKEN',           // Hỏng hóc
  RETIRED: 'RETIRED',         // Đã thanh lý
});

const MAINTENANCE_STATUS = Object.freeze({
  PENDING: 'PENDING',         // Chờ tiếp nhận
  ASSIGNED: 'ASSIGNED',       // Đã phân công KTV
  IN_PROGRESS: 'IN_PROGRESS', // Đang xử lý sửa chữa
  WAITING_PART: 'WAITING_PART', // Chờ linh kiện
  COMPLETED: 'COMPLETED',     // KTV hoàn thành
  CLOSED: 'CLOSED',           // Người dùng nghiệm thu đóng ticket
  REOPENED: 'REOPENED',       // Yêu cầu làm lại
});

const PRIORITY_LEVEL = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
});

const SCHEDULE_STATUS = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
});

module.exports = {
  DEVICE_STATUS,
  MAINTENANCE_STATUS,
  PRIORITY_LEVEL,
  USER_STATUS,
  SCHEDULE_STATUS,
};
