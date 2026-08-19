const workOrderService = require('../services/workOrderService');
const workOrderRepository = require('../repositories/workOrderRepository');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * WorkOrderController
 * Điều phối các API Lệnh công tác bảo trì (Maintenance Work Orders)
 */
class WorkOrderController {
  /**
   * POST /api/work-orders
   */
  async create(req, res, next) {
    try {
      const wo = await workOrderService.createWorkOrder(req.body, req.user);
      return ApiResponse.created(res, {
        message: 'Tạo lệnh công tác bảo trì thành công',
        data: wo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/work-orders
   */
  async getAll(req, res, next) {
    try {
      const filter = {
        deviceId: req.query.deviceId,
        status: req.query.status,
        type: req.query.type,
        priority: req.query.priority,
        assignedTo: req.query.assignedTo,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
      };

      // Nếu là TECHNICIAN và không phải Admin/Manager, chỉ xem việc của mình
      if (req.user.role === 'TECHNICIAN' && !filter.assignedTo && req.query.all !== 'true') {
        filter.assignedTo = req.user.id;
      }

      const list = await workOrderService.getWorkOrders(filter);
      return ApiResponse.success(res, {
        message: 'Lấy danh sách lệnh công tác thành công',
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/work-orders/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await workOrderRepository.countByStatus();
      return ApiResponse.success(res, {
        message: 'Lấy thống kê lệnh công tác thành công',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/work-orders/:id
   */
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const wo = await workOrderService.getWorkOrderById(id);
      return ApiResponse.success(res, {
        message: 'Lấy chi tiết lệnh công tác thành công',
        data: wo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/work-orders/:id/assign
   */
  async assign(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { technicianId } = req.body;
      const wo = await workOrderService.assignWorkOrder(id, technicianId, req.user);
      return ApiResponse.success(res, {
        message: 'Phân công kỹ thuật viên thành công',
        data: wo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/work-orders/:id/start
   */
  async start(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const wo = await workOrderService.startWorkOrder(id, req.user);
      return ApiResponse.success(res, {
        message: 'Bắt đầu thực hiện lệnh công tác thành công',
        data: wo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/work-orders/:id/complete
   */
  async complete(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { actualCost, resolution, technicianNote } = req.body;
      const wo = await workOrderService.completeWorkOrder(id, { actualCost, resolution, technicianNote }, req.user);
      return ApiResponse.success(res, {
        message: 'Nghiệm thu và hoàn thành lệnh công tác thành công',
        data: wo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/work-orders/:id/cancel
   */
  async cancel(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { reason } = req.body;
      const wo = await workOrderService.cancelWorkOrder(id, reason, req.user);
      return ApiResponse.success(res, {
        message: 'Hủy lệnh công tác thành công',
        data: wo,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkOrderController();
