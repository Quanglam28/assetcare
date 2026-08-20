const workOrderRepository = require('../repositories/workOrderRepository');
const deviceRepository = require('../repositories/deviceRepository');
const auditRepository = require('../repositories/auditRepository');
const notificationService = require('./notificationService');
const assetHealthService = require('./assetHealthService');
const failureRiskService = require('./failureRiskService');
const priorityService = require('./priorityService');
const config = require('../config/workOrderConfig');
const { pool } = require('../config/db');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * WorkOrderService
 * Điều phối toàn bộ quy trình Lệnh Công Tác Bảo Trì & Sửa Chữa (Maintenance Work Orders)
 * Phase 3 - Version 1.0
 */
class WorkOrderService {
  /**
   * Sinh mã phiếu lệnh công tác tự động (VD: WO-2026-0001)
   */
  async _generateWorkOrderCode() {
    const year = new Date().getFullYear();
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM maintenance_work_orders WHERE work_order_code LIKE ?",
      [`WO-${year}-%`]
    );
    const nextSeq = (rows[0]?.total || 0) + 1;
    return `WO-${year}-${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * 1. Tạo mới Lệnh công tác
   */
  async createWorkOrder(data, creatorUser) {
    if (!data.deviceId) {
      throw new BadRequestError('Vui lòng chọn thiết bị áp dụng lệnh công tác');
    }
    if (!data.title) {
      throw new BadRequestError('Vui lòng nhập tiêu đề lệnh công tác');
    }

    const device = await deviceRepository.findById(data.deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${data.deviceId}]`);
    }

    const code = await this._generateWorkOrderCode();
    const initialStatus = data.assignedTo ? config.STATUS.ASSIGNED : config.STATUS.OPEN;

    const payload = {
      deviceId: data.deviceId,
      recommendationId: data.recommendationId || null,
      workOrderCode: code,
      title: data.title,
      description: data.description || '',
      type: data.type || 'CORRECTIVE',
      priority: data.priority || 'MEDIUM',
      status: initialStatus,
      assignedTo: data.assignedTo || null,
      reportedBy: creatorUser?.id || data.reportedBy || 1,
      scheduledAt: data.scheduledAt || null,
      estimatedCost: Number(data.estimatedCost) || 0,
      actualCost: 0,
      resolution: null,
      technicianNote: null,
    };

    const workOrderId = await workOrderRepository.create(payload);

    // Ghi nhận Audit Log
    await auditRepository.createLog({
      userId: creatorUser?.id || null,
      action: 'CREATE_WORK_ORDER',
      entityType: 'WORK_ORDER',
      entityId: workOrderId,
      newValues: { code, title: data.title, priority: payload.priority, assignedTo: payload.assignedTo },
    });

    // Gửi thông báo cho Kỹ thuật viên nếu được phân công ngay
    if (payload.assignedTo) {
      try {
        await notificationService.createNotification({
          userId: payload.assignedTo,
          deviceId: payload.deviceId,
          type: 'WORK_ORDER_ASSIGNED',
          title: `Lệnh công tác mới: ${code}`,
          message: `Bạn được phân công xử lý lệnh công tác [${data.title}] cho thiết bị ${device.name} (${device.code}).`,
          referenceType: 'WORK_ORDER',
          referenceId: workOrderId,
        });
      } catch (err) {
        logger.error(`[WorkOrderService] Lỗi gửi thông báo phân công: ${err.message}`);
      }
    }

    return this.getWorkOrderById(workOrderId);
  }

  /**
   * 2. Lấy chi tiết lệnh công tác
   */
  async getWorkOrderById(id, currentUser = null) {
    const wo = await workOrderRepository.findById(id);
    if (!wo) {
      throw new NotFoundError(`Không tìm thấy lệnh công tác với ID [${id}]`);
    }
    if (currentUser && currentUser.role === 'USER' && wo.reported_by !== currentUser.id) {
      throw new ForbiddenError('Bạn không có quyền xem lệnh công tác này');
    }
    return wo;
  }

  /**
   * 3. Lấy danh sách lệnh công tác
   */
  async getWorkOrders(filter = {}) {
    return workOrderRepository.findAll(filter);
  }

  /**
   * 4. Phân công Kỹ thuật viên (Assign)
   */
  async assignWorkOrder(id, technicianId, actorUser) {
    const wo = await this.getWorkOrderById(id);

    if (wo.status === config.STATUS.COMPLETED || wo.status === config.STATUS.CANCELLED) {
      throw new BadRequestError(`Không thể phân công lệnh công tác đã ở trạng thái [${wo.status}]`);
    }

    const nextStatus = wo.status === config.STATUS.OPEN ? config.STATUS.ASSIGNED : wo.status;

    await workOrderRepository.update(id, {
      assigned_to: technicianId,
      status: nextStatus,
    });

    // Audit Log
    await auditRepository.createLog({
      userId: actorUser?.id || null,
      action: 'ASSIGN_WORK_ORDER',
      entityType: 'WORK_ORDER',
      entityId: id,
      oldValues: { assignedTo: wo.assigned_to, status: wo.status },
      newValues: { assignedTo: technicianId, status: nextStatus },
    });

    // Gửi thông báo tới KTV
    try {
      await notificationService.createNotification({
        userId: technicianId,
        deviceId: wo.device_id,
        type: 'WORK_ORDER_ASSIGNED',
        title: `Phân công công việc: ${wo.work_order_code}`,
        message: `Bạn được phân công thực hiện lệnh công tác [${wo.title}] cho thiết bị ${wo.device_name} (${wo.device_code}).`,
        referenceType: 'WORK_ORDER',
        referenceId: id,
      });
    } catch (err) {
      logger.error(`[WorkOrderService] Lỗi gửi thông báo phân công: ${err.message}`);
    }

    return this.getWorkOrderById(id);
  }

  /**
   * 5. Bắt đầu thực hiện (Start In Progress)
   */
  async startWorkOrder(id, actorUser) {
    const wo = await this.getWorkOrderById(id);

    if (actorUser && actorUser.role === 'TECHNICIAN' && wo.assigned_to && Number(wo.assigned_to) !== Number(actorUser.id)) {
      throw new ForbiddenError('Bạn không có quyền thao tác trên lệnh công tác của kỹ thuật viên khác');
    }

    const validTransitions = config.VALID_TRANSITIONS[wo.status] || [];
    if (!validTransitions.includes(config.STATUS.IN_PROGRESS)) {
      throw new BadRequestError(`Không thể chuyển trạng thái từ [${wo.status}] sang [${config.STATUS.IN_PROGRESS}]`);
    }

    await workOrderRepository.update(id, {
      status: config.STATUS.IN_PROGRESS,
      started_at: new Date(),
    });

    await auditRepository.createLog({
      userId: actorUser?.id || null,
      action: 'START_WORK_ORDER',
      entityType: 'WORK_ORDER',
      entityId: id,
      oldValues: { status: wo.status },
      newValues: { status: config.STATUS.IN_PROGRESS },
    });

    return this.getWorkOrderById(id);
  }

  /**
   * 6. Hoàn thành và Nghiệm thu Lệnh công tác (Complete)
   * Kích hoạt tự động tính toán lại Health Score, Failure Risk, Priority Score
   */
  async completeWorkOrder(id, { actualCost = 0, resolution = '', technicianNote = '' }, actorUser) {
    const wo = await this.getWorkOrderById(id);

    if (actorUser && actorUser.role === 'TECHNICIAN' && wo.assigned_to && Number(wo.assigned_to) !== Number(actorUser.id)) {
      throw new ForbiddenError('Bạn không có quyền hoàn tất lệnh công tác của kỹ thuật viên khác');
    }

    const validTransitions = config.VALID_TRANSITIONS[wo.status] || [];
    if (!validTransitions.includes(config.STATUS.COMPLETED)) {
      throw new BadRequestError(`Không thể hoàn thành lệnh công tác từ trạng thái hiện tại [${wo.status}]`);
    }

    const cost = Math.max(0, Number(actualCost) || 0);

    // Cập nhật trạng thái COMPLETED
    await workOrderRepository.update(id, {
      status: config.STATUS.COMPLETED,
      actual_cost: cost,
      resolution: resolution || 'Đã hoàn thành xử lý kỹ thuật theo đúng quy trình.',
      technician_note: technicianNote || null,
      completed_at: new Date(),
    });

    // Cập nhật trạng thái thiết bị nếu đang ở trạng thái BROKEN hoặc MAINTENANCE
    if (wo.device_status === 'BROKEN' || wo.device_status === 'MAINTENANCE') {
      await deviceRepository.update(wo.device_id, { status: 'ACTIVE' });
    }

    // Audit Log
    await auditRepository.createLog({
      userId: actorUser?.id || null,
      action: 'COMPLETE_WORK_ORDER',
      entityType: 'WORK_ORDER',
      entityId: id,
      newValues: { status: config.STATUS.COMPLETED, actualCost: cost, resolution },
    });

    // Thông báo cho người báo / Quản trị viên
    try {
      await notificationService.createNotification({
        userId: wo.reported_by,
        deviceId: wo.device_id,
        type: 'WORK_ORDER_COMPLETED',
        title: `Đã hoàn thành lệnh công tác: ${wo.work_order_code}`,
        message: `Lệnh công tác [${wo.title}] cho thiết bị ${wo.device_name} đã được Kỹ thuật viên nghiệm thu hoàn tất.`,
        referenceType: 'WORK_ORDER',
        referenceId: id,
      });
    } catch (err) {
      logger.error(`[WorkOrderService] Lỗi thông báo hoàn thành: ${err.message}`);
    }

    // Tự động kích hoạt tính toán lại toàn bộ chỉ số theo chu trình khép kín:
    // Health Score -> Failure Risk -> Priority Score
    setImmediate(async () => {
      try {
        await assetHealthService.calculateHealthScore(wo.device_id);
        await failureRiskService.calculateFailureRisk(wo.device_id);
        await priorityService.calculatePriorityScore(wo.device_id);
        logger.info(`[WorkOrderService] Đã tự động cập nhật lại Health, Risk, Priority cho thiết bị ID ${wo.device_id}.`);
      } catch (calcErr) {
        logger.error(`[WorkOrderService] Lỗi tính toán lại chỉ số sau nghiệm thu: ${calcErr.message}`);
      }
    });

    return this.getWorkOrderById(id);
  }

  /**
   * 7. Hủy bỏ Lệnh công tác (Cancel)
   */
  async cancelWorkOrder(id, reason = '', actorUser) {
    const wo = await this.getWorkOrderById(id);

    const validTransitions = config.VALID_TRANSITIONS[wo.status] || [];
    if (!validTransitions.includes(config.STATUS.CANCELLED)) {
      throw new BadRequestError(`Không thể hủy lệnh công tác ở trạng thái [${wo.status}]`);
    }

    await workOrderRepository.update(id, {
      status: config.STATUS.CANCELLED,
      resolution: `Đã hủy: ${reason || 'Không thực hiện'}`,
    });

    await auditRepository.createLog({
      userId: actorUser?.id || null,
      action: 'CANCEL_WORK_ORDER',
      entityType: 'WORK_ORDER',
      entityId: id,
      newValues: { status: config.STATUS.CANCELLED, reason },
    });

    return this.getWorkOrderById(id);
  }
}

module.exports = new WorkOrderService();
