const scheduleRepository = require('../repositories/scheduleRepository');
const deviceRepository = require('../repositories/deviceRepository');
const userRepository = require('../repositories/userRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/appError');
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
      if (tech.role_code !== 'TECHNICIAN') {
        throw new BadRequestError(`Người dùng được phân công phải có vai trò Kỹ thuật viên (TECHNICIAN). Người dùng [${tech.full_name || tech.username}] có vai trò [${tech.role_code}].`);
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

    // 1. Kiểm tra chuyển đổi trạng thái (State Transition Validation)
    // Lifecycle: SCHEDULED -> COMPLETED, SCHEDULED -> CANCELLED
    if (data.status && data.status !== schedule.status) {
      if (schedule.status === 'COMPLETED') {
        throw new BadRequestError(`Kế hoạch bảo trì đã hoàn tất (COMPLETED), không thể chuyển sang trạng thái [${data.status}]`);
      }
      if (schedule.status === 'CANCELLED') {
        throw new BadRequestError(`Kế hoạch bảo trì đã bị hủy (CANCELLED), không thể chuyển sang trạng thái [${data.status}]`);
      }
      if (schedule.status === 'SCHEDULED' && !['COMPLETED', 'CANCELLED', 'SCHEDULED'].includes(data.status)) {
        throw new BadRequestError(`Trạng thái chuyển đổi không hợp lệ: [${data.status}]. Chỉ chấp nhận COMPLETED hoặc CANCELLED.`);
      }
    }

    // 2. Kiểm tra kỹ thuật viên (nếu có gán)
    if (data.assignedTechnicianId !== undefined && data.assignedTechnicianId !== null && data.assignedTechnicianId !== '') {
      const tech = await userRepository.findById(data.assignedTechnicianId);
      if (!tech) {
        throw new NotFoundError(`Không tìm thấy kỹ thuật viên với ID [${data.assignedTechnicianId}]`);
      }
      if (tech.role_code !== 'TECHNICIAN') {
        throw new BadRequestError(`Người dùng được phân công phải có vai trò Kỹ thuật viên (TECHNICIAN). Người dùng [${tech.full_name || tech.username}] có vai trò [${tech.role_code}].`);
      }
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

    // 1. Phân quyền & Chống IDOR: TECHNICIAN chỉ được execute lịch phân công cho chính mình
    if (currentUser) {
      if (currentUser.role === 'TECHNICIAN') {
        if (!schedule.assigned_technician_id || Number(schedule.assigned_technician_id) !== Number(currentUser.id)) {
          throw new ForbiddenError('Bạn không có quyền thực hiện lịch bảo trì được phân công cho kỹ thuật viên khác');
        }
      } else if (currentUser.role === 'USER') {
        throw new ForbiddenError('Bạn không có quyền thực hiện lịch bảo trì');
      }
    }

    // 2. Kiểm tra trạng thái vòng đời (State Transition):
    // Chỉ cho phép thực hiện lịch đang SCHEDULED. COMPLETED hoặc CANCELLED không được phép.
    if (schedule.status === 'COMPLETED') {
      throw new BadRequestError('Kế hoạch bảo trì này đã hoàn tất (COMPLETED), không thể thực hiện lại');
    }
    if (schedule.status === 'CANCELLED') {
      throw new BadRequestError('Kế hoạch bảo trì này đã bị hủy (CANCELLED), không thể thực hiện');
    }
    if (schedule.status !== 'SCHEDULED') {
      throw new BadRequestError(`Không thể thực hiện kế hoạch bảo trì ở trạng thái [${schedule.status}]. Chỉ có thể thực hiện khi ở trạng thái SCHEDULED.`);
    }

    const toDateStr = (val) => {
      if (!val) return '';
      if (typeof val === 'string') {
        const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : val.substring(0, 10);
      }
      if (val instanceof Date && !isNaN(val.getTime())) {
        return val.toISOString().slice(0, 10);
      }
      return String(val).substring(0, 10);
    };

    const currentSchedStr = toDateStr(schedule.scheduled_date);
    let newScheduledDate = toDateStr(schedule.next_run_date);

    if (!newScheduledDate || newScheduledDate <= currentSchedStr) {
      newScheduledDate = scheduleRepository.calculateNextRunDate(schedule.scheduled_date, schedule.frequency, schedule.custom_days);
    }
    const newNextRunDate = scheduleRepository.calculateNextRunDate(newScheduledDate, schedule.frequency, schedule.custom_days);

    const now = new Date();

    await scheduleRepository.executeMaintenance(id, {
      scheduledDate: newScheduledDate,
      nextRunDate: newNextRunDate,
      lastPerformedAt: now,
      notes: notes ? notes.trim() : `Bảo dưỡng hoàn thành bởi ${currentUser?.fullName || currentUser?.username || 'Kỹ thuật viên'} (Chi phí: ${Number(cost).toLocaleString('vi-VN')} đ)`,
    });

    logger.info(`[Schedule] KTV [${currentUser?.username || 'System'}] đã thực hiện bảo dưỡng định kỳ ID [${id}], chu kỳ mới [${newScheduledDate}], chu kỳ sau nữa [${newNextRunDate}]`);
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
