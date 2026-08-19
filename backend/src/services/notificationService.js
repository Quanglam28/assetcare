const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const { pool } = require('../config/db');
const { ROLES } = require('../constants/roles');
const logger = require('../utils/logger');

/**
 * Service Quản lý Hệ thống Thông Báo Nội Bộ Đa Vai Trò (Notification System)
 */
class NotificationService {
  /**
   * Tạo thông báo mới kèm cơ chế chống gửi trùng lặp (Deduplication)
   */
  async createNotification({ userId, deviceId, type, title, message, referenceType, referenceId, severity = 'INFO' }) {
    if (!userId || !title || !message) return null;

    const mappedType = severity === 'CRITICAL' ? 'URGENT' : (severity === 'HIGH' ? 'WARNING' : 'INFO');

    // Kiểm tra trùng lặp trong 24 giờ qua cho cùng 1 thực thể
    if (referenceType && referenceId) {
      const [existing] = await pool.execute(`
        SELECT id FROM notifications
        WHERE user_id = ? AND entity_type = ? AND entity_id = ? AND type = ?
          AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY id DESC
        LIMIT 1
      `, [userId, referenceType, referenceId, mappedType]);

      if (existing.length > 0) {
        logger.info(`[Notification] Bỏ qua thông báo trùng lặp cho User [${userId}] và Entity [${referenceType}:${referenceId}]`);
        return existing[0].id;
      }
    }

    return notificationRepository.create({
      userId,
      title,
      message,
      type: mappedType,
      entityType: referenceType || 'DEVICE',
      entityId: referenceId || deviceId || null,
    });
  }

  /**
   * Lấy danh sách thông báo của người dùng
   */
  async getMyNotifications(userId, query = {}) {
    return notificationRepository.findByUserId(userId, {
      page: query.page,
      limit: query.limit,
      unreadOnly: query.unreadOnly === 'true',
      type: query.type,
      search: query.search,
    });
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(userId) {
    return notificationRepository.getUnreadCount(userId);
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id, userId) {
    return notificationRepository.markAsRead(id, userId);
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }

  /**
   * Xóa 1 thông báo
   */
  async deleteNotification(id, userId) {
    return notificationRepository.delete(id, userId);
  }

  /**
   * Quét và tạo thông báo hệ thống tự động:
   * 1. Ticket quá hạn (>48h chưa xong) -> Gửi KTV & Manager
   * 2. Lịch bảo dưỡng đến hạn hôm nay -> Gửi Manager & KTV
   * 3. Thiết bị sắp hết hạn bảo hành (<30 ngày) -> Gửi Manager
   */
  async scanSystemAlerts() {
    let triggeredCount = 0;

    // Lấy danh sách ID của tất cả Managers & Admins
    const [managerRows] = await pool.execute(`
      SELECT u.id 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.code IN ('ADMIN', 'MANAGER') AND u.status = 'ACTIVE'
    `);
    const managerIds = managerRows.map(r => r.id);

    // 1. Quét Ticket quá hạn (>48 giờ từ khi tạo mà chưa hoàn thành)
    const [overdueTickets] = await pool.execute(`
      SELECT mr.id, mr.code, mr.title, mr.priority, mr.technician_id,
             d.name AS device_name, loc.room_name,
             TIMESTAMPDIFF(HOUR, mr.created_at, NOW()) AS hours_elapsed
      FROM maintenance_requests mr
      JOIN devices d ON mr.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      WHERE mr.status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'REOPENED')
        AND TIMESTAMPDIFF(HOUR, mr.created_at, NOW()) >= 48
    `);

    for (const ticket of overdueTickets) {
      // Thông báo cho KTV nếu có
      if (ticket.technician_id) {
        await notificationRepository.create({
          userId: ticket.technician_id,
          title: `⚠️ Phiếu [${ticket.code}] đã quá hạn xử lý (>48h)`,
          message: `Sự cố thiết bị "${ticket.device_name}" tại phòng ${ticket.room_name} đã quá hạn ${ticket.hours_elapsed} giờ chưa hoàn tất. Vui lòng khẩn trương xử lý!`,
          type: 'URGENT',
          entityType: 'MAINTENANCE_REQUEST',
          entityId: ticket.id,
        });
        triggeredCount++;
      }

      // Thông báo cho Quản lý
      for (const mId of managerIds) {
        await notificationRepository.create({
          userId: mId,
          title: `⚠️ Cảnh báo tiến độ: Phiếu [${ticket.code}] quá hạn`,
          message: `Sự cố "${ticket.title}" (${ticket.device_name} - ${ticket.room_name}) đã chậm tiến độ ${ticket.hours_elapsed} giờ.`,
          type: 'WARNING',
          entityType: 'MAINTENANCE_REQUEST',
          entityId: ticket.id,
        });
        triggeredCount++;
      }
    }

    // 2. Quét Lịch bảo dưỡng định kỳ đến hạn hôm nay
    const [dueSchedules] = await pool.execute(`
      SELECT ms.id, ms.title, ms.frequency, ms.assigned_technician_id,
             d.name AS device_name, d.code AS device_code, loc.room_name
      FROM maintenance_schedules ms
      JOIN devices d ON ms.device_id = d.id
      JOIN locations loc ON d.location_id = loc.id
      WHERE ms.status != 'COMPLETED' AND ms.scheduled_date = CURDATE()
    `);

    for (const sched of dueSchedules) {
      if (sched.assigned_technician_id) {
        await notificationRepository.create({
          userId: sched.assigned_technician_id,
          title: `🔔 Hôm nay đến hạn bảo dưỡng: ${sched.title}`,
          message: `Hôm nay là ngày thực hiện bảo dưỡng định kỳ thiết bị "${sched.device_name}" tại phòng ${sched.room_name}.`,
          type: 'INFO',
          entityType: 'SCHEDULE',
          entityId: sched.id,
        });
        triggeredCount++;
      }

      for (const mId of managerIds) {
        await notificationRepository.create({
          userId: mId,
          title: `🔔 Lịch bảo dưỡng đến hạn hôm nay: [${sched.device_code}]`,
          message: `Kế hoạch bảo dưỡng "${sched.title}" cho thiết bị "${sched.device_name}" đến hạn thực hiện hôm nay.`,
          type: 'INFO',
          entityType: 'SCHEDULE',
          entityId: sched.id,
        });
        triggeredCount++;
      }
    }

    // 3. Quét Thiết bị sắp hết hạn bảo hành trong 30 ngày
    const [expiringDevices] = await pool.execute(`
      SELECT d.id, d.code, d.name, d.warranty_end, loc.room_name,
             DATEDIFF(d.warranty_end, CURDATE()) AS days_left
      FROM devices d
      JOIN locations loc ON d.location_id = loc.id
      WHERE d.status = 'ACTIVE'
        AND d.warranty_end IS NOT NULL
        AND d.warranty_end BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `);

    for (const dev of expiringDevices) {
      for (const mId of managerIds) {
        await notificationRepository.create({
          userId: mId,
          title: `⚠️ Thiết bị [${dev.code}] sắp hết hạn bảo hành`,
          message: `Thiết bị "${dev.name}" tại ${dev.room_name} còn ${dev.days_left} ngày là hết hạn bảo hành (${new Date(dev.warranty_end).toLocaleDateString('vi-VN')}).`,
          type: 'WARNING',
          entityType: 'DEVICE',
          entityId: dev.id,
        });
        triggeredCount++;
      }
    }

    logger.info(`[Notification] Đã thực hiện quét cảnh báo hệ thống, gửi ${triggeredCount} thông báo.`);
    return {
      triggeredCount,
      overdueTicketsCount: overdueTickets.length,
      dueSchedulesCount: dueSchedules.length,
      expiringDevicesCount: expiringDevices.length,
    };
  }
}

module.exports = new NotificationService();
