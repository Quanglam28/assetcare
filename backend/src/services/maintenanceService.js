const maintenanceRepository = require('../repositories/maintenanceRepository');
const deviceRepository = require('../repositories/deviceRepository');
const userRepository = require('../repositories/userRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/appError');
const { ROLES } = require('../constants/roles');
const logger = require('../utils/logger');
const { pool } = require('../config/db');

/**
 * Service xử lý toàn bộ quy trình Báo sự cố, Vòng đời bảo trì & Nghiệm thu người dùng
 */
class MaintenanceService {
  /**
   * Tạo phiếu báo sự cố mới từ người dùng / quét mã QR
   */
  async createRequest(data, currentUser) {
    const {
      deviceId,
      title,
      description,
      priority = 'MEDIUM',
      contactPhone,
      contactEmail,
      incidentType,
      imageUrl,
    } = data;

    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    if (device.status === 'RETIRED') {
      throw new BadRequestError('Thiết bị này đã được thanh lý hoặc ngừng sử dụng (RETIRED), không thể tạo phiếu bảo trì mới.');
    }

    // Chống tạo trùng phiếu lặp lại trong vòng 15 giây cho cùng 1 thiết bị và cùng 1 người báo
    const [recentDupes] = await pool.execute(`
      SELECT id, code, title, created_at
      FROM maintenance_requests
      WHERE device_id = ? AND reporter_id = ? AND status = 'PENDING'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 15 SECOND)
      LIMIT 1
    `, [device.id, currentUser.id]);

    if (recentDupes.length > 0) {
      logger.warn(`[Maintenance] Bỏ qua yêu cầu tạo trùng phiếu [${recentDupes[0].code}] từ user [${currentUser.username}]`);
      return maintenanceRepository.findById(recentDupes[0].id);
    }

    const nextCode = await maintenanceRepository.generateNextCode();

    let fullDescription = description.trim();
    if (incidentType && incidentType !== 'OTHER') {
      fullDescription = `[Phân loại: ${incidentType}]\n` + fullDescription;
    }

    const contactInfo = contactPhone || contactEmail 
      ? `\n[Thông tin liên hệ người báo: ${contactPhone || 'N/A'} - ${contactEmail || 'N/A'}]` 
      : '';

    const requestId = await maintenanceRepository.create({
      code: nextCode,
      deviceId: device.id,
      reporterId: currentUser.id,
      title: title.trim(),
      description: fullDescription + contactInfo,
      priority: priority || 'MEDIUM',
      status: 'PENDING',
    });

    if (imageUrl && imageUrl.trim() !== '') {
      await maintenanceRepository.addAttachment({
        entityType: 'MAINTENANCE_REQUEST',
        entityId: requestId,
        fileName: `incident_photo_${nextCode}.jpg`,
        filePath: imageUrl.trim(),
        fileType: 'image/jpeg',
        uploadedBy: currentUser.id,
      });
    }

    await maintenanceRepository.addHistory({
      requestId,
      actorId: currentUser.id,
      fromStatus: null,
      toStatus: 'PENDING',
      action: 'TẠO YÊU CẦU BÁO SỰ CỐ',
      notes: `Người dùng ${currentUser.fullName || currentUser.username} gửi yêu cầu báo hỏng cho thiết bị "${device.name}" (${device.code}).`,
      cost: 0,
    });

    // 1. MODULE 10 NOTIFICATION: Gửi thông báo xác nhận tạo phiếu cho Người báo (USER)
    await notificationRepository.create({
      userId: currentUser.id,
      title: `Đã gửi yêu cầu báo sự cố [${nextCode}]`,
      message: `Phiếu báo sự cố thiết bị "${device.name}" đã được tiếp nhận vào hệ thống và đang chờ Ban Quản lý phân công Kỹ thuật viên.`,
      type: 'INFO',
      entityType: 'MAINTENANCE_REQUEST',
      entityId: requestId,
    });

    // 2. MODULE 10 NOTIFICATION: Gửi thông báo cho toàn bộ Ban Quản lý (ADMIN, MANAGER)
    const [managerRows] = await pool.execute(`
      SELECT u.id 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.code IN ('ADMIN', 'MANAGER') AND u.status = 'ACTIVE'
    `);
    
    const notifType = priority === 'URGENT' ? 'URGENT' : (priority === 'HIGH' ? 'WARNING' : 'INFO');
    const notifTitle = priority === 'URGENT' 
      ? `⚠️ Sự cố KHẨN CẤP mới: [${nextCode}]`
      : (priority === 'HIGH' ? `🔔 Sự cố Ưu tiên cao: [${nextCode}]` : `📋 Phiếu báo sự cố mới: [${nextCode}]`);

    for (const m of managerRows) {
      await notificationRepository.create({
        userId: m.id,
        title: notifTitle,
        message: `Người dùng ${currentUser.fullName || currentUser.username} vừa báo hỏng thiết bị "${device.name}" (${device.code}) tại phòng ${device.room_name || 'chưa xác định'}. Mức ưu tiên: ${priority}.`,
        type: notifType,
        entityType: 'MAINTENANCE_REQUEST',
        entityId: requestId,
      });
    }

    logger.info(`[Maintenance] Đã tạo phiếu yêu cầu mới [${nextCode}] ID [${requestId}] bởi user [${currentUser.username}]`);
    return maintenanceRepository.findById(requestId);
  }

  /**
   * Phân công Kỹ thuật viên (Manager/Admin assign technician)
   */
  async assignTechnician(id, data, currentUser) {
    const { technicianId, notes } = data;

    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì ID [${id}]`);
    }

    if (request.status === 'CLOSED') {
      throw new BadRequestError('Phiếu bảo trì này đã được nghiệm thu và đóng hoàn tất (CLOSED), không thể phân công lại.');
    }

    const technician = await userRepository.findById(technicianId);
    if (!technician) {
      throw new NotFoundError(`Không tìm thấy kỹ thuật viên với ID [${technicianId}]`);
    }

    const prevStatus = request.status;
    await maintenanceRepository.assignTechnician(id, technicianId);

    if (request.device_status === 'ACTIVE' || request.device_status === 'BROKEN') {
      await deviceRepository.updateStatus(request.device_id, 'MAINTENANCE');
    }

    await maintenanceRepository.addHistory({
      requestId: id,
      actorId: currentUser.id,
      fromStatus: prevStatus,
      toStatus: 'ASSIGNED',
      action: 'PHÂN CÔNG KỸ THUẬT VIÊN',
      notes: notes || `Giao xử lý cho KTV: ${technician.full_name || technician.username} (${technician.phone || 'N/A'})`,
      cost: 0,
    });

    // MODULE 10 NOTIFICATION: Thông báo cho KTV được giao
    const isUrgent = request.priority === 'URGENT';
    await notificationRepository.create({
      userId: technicianId,
      title: isUrgent ? `⚠️ Phiếu KHẨN CẤP được giao: [${request.code}]` : `Bạn được phân công xử lý phiếu [${request.code}]`,
      message: `Quản lý đã giao cho bạn xử lý sự cố thiết bị "${request.device_name}" tại phòng ${request.room_name}.`,
      type: isUrgent ? 'URGENT' : 'INFO',
      entityType: 'MAINTENANCE_REQUEST',
      entityId: id,
    });

    // MODULE 10 NOTIFICATION: Thông báo cho Người báo sự cố (USER)
    if (request.reporter_id) {
      await notificationRepository.create({
        userId: request.reporter_id,
        title: `Phiếu [${request.code}] đã được phân công KTV`,
        message: `Kỹ thuật viên ${technician.full_name || technician.username} đã tiếp nhận sự cố thiết bị "${request.device_name}" của bạn.`,
        type: 'INFO',
        entityType: 'MAINTENANCE_REQUEST',
        entityId: id,
      });
    }

    logger.info(`[Maintenance] Phân công phiếu [${request.code}] cho KTV [${technician.username}] bởi [${currentUser.username}]`);
    return maintenanceRepository.findById(id);
  }

  /**
   * KTV bắt đầu xử lý phiếu (Start Work)
   */
  async startWork(id, data, currentUser) {
    const { notes } = data;
    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì ID [${id}]`);
    }

    if (request.status !== 'ASSIGNED' && request.status !== 'REOPENED') {
      throw new BadRequestError(`Không thể bắt đầu xử lý phiếu đang ở trạng thái [${request.status}]. Trạng thái yêu cầu phải là [ASSIGNED] hoặc [REOPENED].`);
    }

    if (currentUser.role === ROLES.TECHNICIAN && request.technician_id !== currentUser.id) {
      throw new ForbiddenError('Phiếu này chưa được phân công cho bạn xử lý');
    }

    await maintenanceRepository.updateWorkflowStatus(id, {
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    });

    await maintenanceRepository.addHistory({
      requestId: id,
      actorId: currentUser.id,
      fromStatus: request.status,
      toStatus: 'IN_PROGRESS',
      action: 'BẮT ĐẦU XỬ LÝ',
      notes: notes || 'Kỹ thuật viên đã tiếp nhận tại hiện trường và tiến hành kiểm tra thiết bị.',
      cost: 0,
    });

    logger.info(`[Maintenance] KTV [${currentUser.username}] bắt đầu xử lý phiếu [${request.code}]`);
    return maintenanceRepository.findById(id);
  }

  /**
   * Đánh dấu tạm dừng chờ linh kiện
   */
  async markWaitingPart(id, data, currentUser) {
    const { notes, partsNeeded } = data;
    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì ID [${id}]`);
    }

    if (request.status !== 'IN_PROGRESS') {
      throw new BadRequestError(`Không thể chuyển sang chờ linh kiện khi phiếu đang ở trạng thái [${request.status}]. Cần ở trạng thái [IN_PROGRESS].`);
    }

    if (currentUser.role === ROLES.TECHNICIAN && request.technician_id !== currentUser.id) {
      throw new ForbiddenError('Bạn không có quyền cập nhật phiếu này');
    }

    await maintenanceRepository.updateWorkflowStatus(id, {
      status: 'WAITING_PART',
    });

    const noteDetail = notes + (partsNeeded ? ` (Linh kiện yêu cầu: ${partsNeeded})` : '');

    await maintenanceRepository.addHistory({
      requestId: id,
      actorId: currentUser.id,
      fromStatus: 'IN_PROGRESS',
      toStatus: 'WAITING_PART',
      action: 'CHỜ LINH KIỆN THAY THẾ',
      notes: noteDetail,
      cost: 0,
    });

    return maintenanceRepository.findById(id);
  }

  /**
   * Tiếp tục xử lý sau khi có linh kiện
   */
  async resumeWork(id, data, currentUser) {
    const { notes } = data;
    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì ID [${id}]`);
    }

    if (request.status !== 'WAITING_PART') {
      throw new BadRequestError(`Chỉ có thể tiếp tục xử lý khi phiếu đang ở trạng thái [WAITING_PART].`);
    }

    if (currentUser.role === ROLES.TECHNICIAN && request.technician_id !== currentUser.id) {
      throw new ForbiddenError('Bạn không có quyền cập nhật phiếu này');
    }

    await maintenanceRepository.updateWorkflowStatus(id, {
      status: 'IN_PROGRESS',
    });

    await maintenanceRepository.addHistory({
      requestId: id,
      actorId: currentUser.id,
      fromStatus: 'WAITING_PART',
      toStatus: 'IN_PROGRESS',
      action: 'TIẾP TỤC XỬ LÝ',
      notes: notes || 'Linh kiện thay thế đã sẵn sàng, KTV tiếp tục lắp đặt và chạy thử nghiệm.',
      cost: 0,
    });

    return maintenanceRepository.findById(id);
  }

  /**
   * Hoàn thành xử lý sự cố (Complete Ticket)
   */
  async completeRequest(id, data, currentUser) {
    const { rootCause, resolution, actualCost = 0, completionNote, parts = [] } = data;

    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì ID [${id}]`);
    }

    if (request.status === 'PENDING') {
      throw new BadRequestError('Không thể hoàn thành trực tiếp phiếu đang ở trạng thái PENDING. Cần được phân công và bắt đầu xử lý.');
    }
    if (request.status === 'ASSIGNED') {
      throw new BadRequestError('Không thể hoàn thành phiếu khi chưa bắt đầu xử lý. Vui lòng chọn "Bắt đầu xử lý" trước.');
    }
    if (request.status === 'COMPLETED' || request.status === 'CLOSED') {
      throw new BadRequestError(`Phiếu này đã ở trạng thái [${request.status}], không thể hoàn thành lại.`);
    }

    if (currentUser.role === ROLES.TECHNICIAN && request.technician_id !== currentUser.id) {
      throw new ForbiddenError('Bạn không có quyền hoàn tất phiếu của kỹ thuật viên khác');
    }

    let calculatedCost = parseFloat(actualCost) || 0;
    if (parts && parts.length > 0) {
      const partsTotal = parts.reduce((sum, p) => sum + ((p.quantity || 1) * (parseFloat(p.unitPrice) || 0)), 0);
      if (calculatedCost === 0) {
        calculatedCost = partsTotal;
      }
      await maintenanceRepository.addParts(id, parts);
    }

    await maintenanceRepository.updateWorkflowStatus(id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      resolution: resolution.trim(),
      rootCause: rootCause.trim(),
      actualCost: calculatedCost,
    });

    await deviceRepository.updateStatus(request.device_id, 'ACTIVE');

    const fullNote = `Nguyên nhân: ${rootCause.trim()}\nKhắc phục: ${resolution.trim()}` +
      (completionNote ? `\nGhi chú: ${completionNote.trim()}` : '') +
      (parts.length > 0 ? `\nĐã thay thế ${parts.length} linh kiện (Tổng chi phí: ${calculatedCost.toLocaleString('vi-VN')} đ)` : '');

    await maintenanceRepository.addHistory({
      requestId: id,
      actorId: currentUser.id,
      fromStatus: request.status,
      toStatus: 'COMPLETED',
      action: 'HOÀN THÀNH SỬA CHỮA',
      notes: fullNote,
      cost: calculatedCost,
    });

    // MODULE 10 NOTIFICATION: Gửi thông báo cho Người báo sự cố (USER) để nghiệm thu thiết bị
    await notificationRepository.create({
      userId: request.reporter_id,
      title: `Thiết bị [${request.device_code}] đã được sửa chữa xong`,
      message: `Kỹ thuật viên ${currentUser.fullName || currentUser.username} đã hoàn thành xử lý sự cố cho phiếu [${request.code}]. Vui lòng kiểm tra và nghiệm thu thiết bị.`,
      type: 'SUCCESS',
      entityType: 'MAINTENANCE_REQUEST',
      entityId: id,
    });

    logger.info(`[Maintenance] KTV [${currentUser.username}] đã hoàn thành phiếu [${request.code}] và gửi thông báo nghiệm thu cho user [${request.reporter_username}]`);
    return maintenanceRepository.findById(id);
  }

  /**
   * MODULE 8: Người dùng nghiệm thu "ĐÃ KHẮC PHỤC" & Đóng phiếu (Accept & Close)
   */
  async acceptAndClose(id, data, currentUser) {
    const { notes, rating = 5 } = data;

    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì ID [${id}]`);
    }

    if (request.status !== 'COMPLETED') {
      throw new BadRequestError(`Không thể nghiệm thu đóng phiếu khi kỹ thuật viên chưa hoàn thành sửa chữa. Trạng thái hiện tại: [${request.status}].`);
    }

    if (currentUser.role === ROLES.USER && request.reporter_id !== currentUser.id) {
      throw new ForbiddenError('Bạn không có quyền nghiệm thu phiếu của người khác');
    }

    await maintenanceRepository.updateWorkflowStatus(id, {
      status: 'CLOSED',
      closedAt: new Date(),
    });

    await deviceRepository.updateStatus(request.device_id, 'ACTIVE');

    const feedbackNote = notes && notes.trim() !== ''
      ? `Đã nghiệm thu thiết bị hoạt động tốt. Đánh giá: ${rating}/5 sao. Ghi chú: ${notes.trim()}`
      : `Đã nghiệm thu thiết bị hoạt động tốt. Đánh giá: ${rating}/5 sao.`;

    await maintenanceRepository.addHistory({
      requestId: id,
      actorId: currentUser.id,
      fromStatus: 'COMPLETED',
      toStatus: 'CLOSED',
      action: 'NGHIỆM THU ĐẠT - ĐÓNG PHIẾU',
      notes: feedbackNote,
      cost: 0,
    });

    // MODULE 10 NOTIFICATION: Thông báo cho Kỹ thuật viên phụ trách
    if (request.technician_id) {
      await notificationRepository.create({
        userId: request.technician_id,
        title: `Phiếu [${request.code}] đã được nghiệm thu hoàn tất`,
        message: `Người dùng ${currentUser.fullName || currentUser.username} đã xác nhận khắc phục thành công và đánh giá ${rating}/5 sao.`,
        type: 'SUCCESS',
        entityType: 'MAINTENANCE_REQUEST',
        entityId: id,
      });
    }

    // MODULE 10 NOTIFICATION: Thông báo cảm ơn cho Người báo sự cố (USER)
    await notificationRepository.create({
      userId: request.reporter_id,
      title: `Phiếu [${request.code}] đã nghiệm thu và đóng hoàn tất`,
      message: `Cảm ơn bạn đã nghiệm thu và gửi đánh giá chất lượng phục vụ cho sự cố thiết bị "${request.device_name}".`,
      type: 'SUCCESS',
      entityType: 'MAINTENANCE_REQUEST',
      entityId: id,
    });

    logger.info(`[Maintenance] User [${currentUser.username}] đã nghiệm thu và đóng phiếu [${request.code}]`);
    return maintenanceRepository.findById(id);
  }

  /**
   * MODULE 8: Người dùng nghiệm thu "CHƯA KHẮC PHỤC" & Mở lại phiếu (Reject & Reopen)
   */
  async rejectAndReopen(id, data, currentUser) {
    const { reason } = data;

    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì ID [${id}]`);
    }

    if (request.status !== 'COMPLETED') {
      throw new BadRequestError(`Chỉ có thể yêu cầu sửa lại phiếu đang ở trạng thái COMPLETED. Trạng thái hiện tại: [${request.status}].`);
    }

    if (currentUser.role === ROLES.USER && request.reporter_id !== currentUser.id) {
      throw new ForbiddenError('Bạn không có quyền phản hồi phiếu của người khác');
    }

    await maintenanceRepository.updateWorkflowStatus(id, {
      status: 'REOPENED',
    });

    await deviceRepository.updateStatus(request.device_id, 'BROKEN');

    await maintenanceRepository.addHistory({
      requestId: id,
      actorId: currentUser.id,
      fromStatus: 'COMPLETED',
      toStatus: 'REOPENED',
      action: 'NGHIỆM THU KHÔNG ĐẠT - YÊU CẦU XỬ LÝ LẠI',
      notes: `Người dùng báo cáo sự cố chưa được giải quyết triệt để.\nLý do: "${reason.trim()}"`,
      cost: 0,
    });

    // MODULE 10 NOTIFICATION: Gửi thông báo khẩn cấp cho Kỹ thuật viên phụ trách
    if (request.technician_id) {
      await notificationRepository.create({
        userId: request.technician_id,
        title: `⚠️ Yêu cầu xử lý lại phiếu [${request.code}]`,
        message: `Người dùng ${currentUser.fullName || currentUser.username} phản hồi sự cố chưa được khắc phục. Lý do: "${reason.trim()}". Vui lòng kiểm tra lại thiết bị.`,
        type: 'URGENT',
        entityType: 'MAINTENANCE_REQUEST',
        entityId: id,
      });
    }

    // MODULE 10 NOTIFICATION: Gửi xác nhận cho Người báo (USER)
    await notificationRepository.create({
      userId: request.reporter_id,
      title: `Phiếu [${request.code}] đã được chuyển yêu cầu xử lý lại`,
      message: `Phản hồi của bạn đã được chuyển tới Kỹ thuật viên để quay lại kiểm tra thiết bị.`,
      type: 'WARNING',
      entityType: 'MAINTENANCE_REQUEST',
      entityId: id,
    });

    logger.info(`[Maintenance] User [${currentUser.username}] yêu cầu xử lý lại phiếu [${request.code}] với lý do: [${reason.trim()}]`);
    return maintenanceRepository.findById(id);
  }

  /**
   * Lấy danh sách phiếu yêu cầu do chính người dùng hiện tại báo sự cố
   */
  async getMyRequests(currentUser, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));

    const result = await maintenanceRepository.findAll({
      page,
      limit,
      search: query.search || '',
      status: query.status || '',
      priority: query.priority || '',
      reporterId: currentUser.id,
      sortBy: query.sortBy || 'created_at',
      sortOrder: query.sortOrder || 'DESC',
    });

    return result;
  }

  /**
   * Lấy chi tiết một phiếu yêu cầu bảo trì
   */
  async getRequestById(id, currentUser) {
    const request = await maintenanceRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Không tìm thấy phiếu yêu cầu bảo trì với ID [${id}]`);
    }

    if (currentUser.role === ROLES.USER && request.reporter_id !== currentUser.id) {
      throw new ForbiddenError('Bạn không có quyền xem phiếu yêu cầu bảo trì của người khác');
    }

    return request;
  }

  /**
   * Lấy toàn bộ danh sách phiếu bảo trì
   */
  async getRequests(query, currentUser) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));

    let technicianId = query.technicianId || null;
    if (currentUser.role === ROLES.TECHNICIAN && (query.assignedToMe === 'true' || !query.technicianId)) {
      technicianId = currentUser.id;
    }

    const result = await maintenanceRepository.findAll({
      page,
      limit,
      search: query.search || '',
      status: query.status || '',
      priority: query.priority || '',
      reporterId: query.reporterId || null,
      technicianId: query.all === 'true' && (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.MANAGER) ? null : technicianId,
      deviceId: query.deviceId || null,
      buildingId: query.buildingId || null,
      sortBy: query.sortBy || 'created_at',
      sortOrder: query.sortOrder || 'DESC',
    });

    return result;
  }

  /**
   * Thống kê Dashboard KTV
   */
  async getTechnicianStats(currentUser) {
    const technicianId = currentUser.role === ROLES.TECHNICIAN ? currentUser.id : null;
    return maintenanceRepository.getTechnicianStats(technicianId);
  }

  /**
   * Danh sách KTV khả dụng
   */
  async getActiveTechnicians() {
    return maintenanceRepository.getActiveTechnicians();
  }
}

module.exports = new MaintenanceService();
