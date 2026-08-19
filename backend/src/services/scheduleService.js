const scheduleRepository = require('../repositories/scheduleRepository');
const deviceRepository = require('../repositories/deviceRepository');
const userRepository = require('../repositories/userRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { BadRequestError, NotFoundError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Service Quản lý Lịch Bảo Trì Định Kỳ & Phòng Ngừa Sự Cố (Scheduled Maintenance)
 */
class ScheduleService {
  /**
   * Tạo kế hoạch bảo trì định kỳ mới
   * Tự động tính ngày bảo trì tiếp theo (next_run_date) từ chu kỳ dữ liệu
   */
  async createSchedule(data, currentUser) {
    const {
      deviceId,
      title,
      frequency = 'QUARTERLY',
      scheduledDate,
      customDays,
      assignedTechnicianId,
      notes,
    } = data;

    // 1. Kiểm tra thiết bị
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    // 2. Kiểm tra kỹ thuật viên (nếu có gán)
    if (assignedTechnicianId) {
      const tech = await userRepository.findById(assignedTechnicianId);
      if (!tech) {
        throw new NotFoundError(`Không tìm thấy kỹ thuật viên với ID [${assignedTechnicianId}]`);
      }
    }

    // 3. Chuẩn hóa chu kỳ và tự động tính ngày chạy tiếp theo
    let freq = frequency.toUpperCase();
    if (freq === 'SEMIANNUAL') freq = 'SEMI_ANNUALLY';
    if (freq === 'YEARLY') freq = 'ANNUALLY';

    const nextRunDate = scheduleRepository.calculateNextRunDate(scheduledDate, freq, customDays);

    // 4. Lưu vào CSDL
    const scheduleId = await scheduleRepository.create({
      deviceId,
      title: title.trim(),
      frequency: freq,
      scheduledDate,
      nextRunDate,
      assignedTechnicianId: assignedTechnicianId || null,
      notes: notes ? notes.trim() : null,
      status: 'SCHEDULED',
    });

    // 5. Gửi thông báo cho KTV nếu được gán
    if (assignedTechnicianId) {
      await notificationRepository.create({
        userId: assignedTechnicianId,
        title: `Lịch bảo trì định kỳ mới: ${title.trim()}`,
        message: `Bạn được phân công thực hiện bảo dưỡng định kỳ cho thiết bị "${device.name}" vào ngày ${scheduledDate}.`,
        type: 'INFO',
        entityType: 'SCHEDULE',
        entityId: scheduleId,
      });
    }

    logger.info(`[Schedule] Tạo lịch bảo trì [${title}] cho thiết bị [${device.code}] ngày [${scheduledDate}], lần tiếp theo [${nextRunDate}]`);
    return scheduleRepository.findById(scheduleId);
  }

  /**
   * Lấy danh sách lịch bảo dưỡng kèm tìm kiếm, lọc và phân loại cảnh báo
   */
  async getSchedules(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));

    let freq = query.frequency;
    if (freq) {
      freq = freq.toUpperCase();
      if (freq === 'SEMIANNUAL') freq = 'SEMI_ANNUALLY';
      if (freq === 'YEARLY') freq = 'ANNUALLY';
    }

    const result = await scheduleRepository.findAll({
      page,
      limit,
      search: query.search || '',
      status: query.status || '',
      alertType: query.alertType || '',
      frequency: freq || '',
      deviceId: query.deviceId || null,
      buildingId: query.buildingId || null,
      technicianId: query.technicianId || null,
      sortBy: query.sortBy || 'scheduled_date',
      sortOrder: query.sortOrder || 'ASC',
    });

    return result;
  }

  /**
   * Lấy số liệu thống kê cảnh báo Dashboard (Upcoming, Due, Overdue, Completed)
   */
  async getAlertStats() {
    return scheduleRepository.getAlertStats();
  }

  /**
   * Lấy chi tiết một lịch bảo trì
   */
  async getScheduleById(id) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError(`Không tìm thấy lịch bảo trì với ID [${id}]`);
    }
    return schedule;
  }

  /**
   * Cập nhật lịch bảo trì
   */
  async updateSchedule(id, data, currentUser) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError(`Không tìm thấy lịch bảo trì với ID [${id}]`);
    }

    let nextRunDate = schedule.next_run_date;
    const targetDate = data.scheduledDate || schedule.scheduled_date;
    const targetFreq = data.frequency || schedule.frequency;

    if (data.scheduledDate || data.frequency) {
      let freq = targetFreq.toUpperCase();
      if (freq === 'SEMIANNUAL') freq = 'SEMI_ANNUALLY';
      if (freq === 'YEARLY') freq = 'ANNUALLY';
      nextRunDate = scheduleRepository.calculateNextRunDate(targetDate, freq, data.customDays);
    }

    await scheduleRepository.update(id, {
      title: data.title,
      frequency: data.frequency,
      scheduledDate: data.scheduledDate,
      nextRunDate,
      assignedTechnicianId: data.assignedTechnicianId,
      status: data.status,
      notes: data.notes,
    });

    return scheduleRepository.findById(id);
  }

  /**
   * Thực hiện bảo dưỡng định kỳ (Execute Maintenance)
   * Cập nhật trạng thái COMPLETED, ghi nhận ngày thực hiện và tự động tính ngày chu kỳ kế tiếp
   */
  async executeSchedule(id, data, currentUser) {
    const { notes, cost = 0 } = data;

    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError(`Không tìm thấy lịch bảo trì với ID [${id}]`);
    }

    const now = new Date();
    const nextRunDate = scheduleRepository.calculateNextRunDate(now, schedule.frequency);

    await scheduleRepository.executeMaintenance(id, {
      lastPerformedAt: now,
      nextRunDate,
      notes: notes ? notes.trim() : `Bảo dưỡng hoàn thành bởi ${currentUser.fullName || currentUser.username} (Chi phí: ${Number(cost).toLocaleString('vi-VN')} đ)`,
    });

    logger.info(`[Schedule] KTV [${currentUser.username}] đã thực hiện bảo dưỡng định kỳ ID [${id}], chu kỳ tiếp theo [${nextRunDate}]`);
    return scheduleRepository.findById(id);
  }

  /**
   * Xóa lịch bảo trì
   */
  async deleteSchedule(id) {
    const schedule = await scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError(`Không tìm thấy lịch bảo trì với ID [${id}]`);
    }
    await scheduleRepository.delete(id);
    return true;
  }
}

module.exports = new ScheduleService();
