const maintenanceService = require('../services/maintenanceService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Quản lý Phiếu yêu cầu, Quy trình Kỹ thuật viên & Nghiệm thu Người dùng
 */
class MaintenanceController {
  /**
   * Tạo phiếu báo sự cố mới
   * POST /api/maintenance
   */
  async createRequest(req, res, next) {
    try {
      const data = await maintenanceService.createRequest(req.body, req.user);
      return ApiResponse.created(res, {
        message: 'Gửi yêu cầu báo sự cố thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Phân công Kỹ thuật viên (Manager/Admin)
   * POST /api/maintenance/:id/assign
   */
  async assignTechnician(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.assignTechnician(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Phân công kỹ thuật viên xử lý phiếu thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * KTV bắt đầu xử lý phiếu
   * POST /api/maintenance/:id/start
   */
  async startWork(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.startWork(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Bắt đầu xử lý phiếu sự cố thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Đánh dấu tạm dừng để chờ linh kiện
   * POST /api/maintenance/:id/waiting-part
   */
  async markWaitingPart(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.markWaitingPart(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Chuyển trạng thái phiếu sang Chờ linh kiện thay thế thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tiếp tục xử lý sau khi có linh kiện
   * POST /api/maintenance/:id/resume
   */
  async resumeWork(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.resumeWork(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Tiếp tục xử lý phiếu sự cố thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * KTV hoàn thành sửa chữa phiếu
   * POST /api/maintenance/:id/complete
   */
  async completeRequest(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.completeRequest(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Hoàn thành sửa chữa và gửi thông báo nghiệm thu thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * MODULE 8: Người dùng nghiệm thu "ĐÃ KHẮC PHỤC" & Đóng phiếu
   * POST /api/maintenance/:id/accept hoặc /close
   */
  async acceptAndClose(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.acceptAndClose(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Nghiệm thu thành công và đã đóng phiếu bảo trì',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * MODULE 8: Người dùng nghiệm thu "CHƯA KHẮC PHỤC" & Yêu cầu xử lý lại
   * POST /api/maintenance/:id/reopen
   */
  async rejectAndReopen(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.rejectAndReopen(id, req.body, req.user);
      return ApiResponse.success(res, {
        message: 'Đã gửi phản hồi yêu cầu kỹ thuật viên kiểm tra và xử lý lại',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách phiếu sự cố do người dùng hiện tại báo
   * GET /api/maintenance/my
   */
  async getMyRequests(req, res, next) {
    try {
      const result = await maintenanceService.getMyRequests(req.user, req.query);
      return ApiResponse.paginate(
        res,
        result.requests,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'Lấy danh sách phiếu yêu cầu của bạn thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết phiếu yêu cầu bảo trì
   * GET /api/maintenance/:id
   */
  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await maintenanceService.getRequestById(id, req.user);
      return ApiResponse.success(res, {
        message: 'Lấy thông tin phiếu yêu cầu thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách tất cả các phiếu yêu cầu (ADMIN, MANAGER, TECHNICIAN)
   * GET /api/maintenance
   */
  async getRequests(req, res, next) {
    try {
      const result = await maintenanceService.getRequests(req.query, req.user);
      return ApiResponse.paginate(
        res,
        result.requests,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'Lấy danh sách phiếu bảo trì thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy số liệu thống kê Dashboard Kỹ thuật viên
   * GET /api/maintenance/technician/stats
   */
  async getTechnicianStats(req, res, next) {
    try {
      const data = await maintenanceService.getTechnicianStats(req.user);
      return ApiResponse.success(res, {
        message: 'Lấy số liệu thống kê Kỹ thuật viên thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách Kỹ thuật viên khả dụng
   * GET /api/maintenance/meta/technicians
   */
  async getActiveTechnicians(req, res, next) {
    try {
      const data = await maintenanceService.getActiveTechnicians();
      return ApiResponse.success(res, {
        message: 'Lấy danh sách Kỹ thuật viên thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
