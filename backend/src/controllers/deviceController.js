const deviceService = require('../services/deviceService');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller Quản lý Thiết bị & Tài sản
 */
class DeviceController {
  /**
   * Lấy danh sách thiết bị kèm phân trang, tìm kiếm, lọc và sắp xếp
   * GET /api/devices
   */
  async getDevices(req, res, next) {
    try {
      const result = await deviceService.getDevices(req.query);
      return ApiResponse.paginate(
        res,
        result.devices,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        'Lấy danh sách thiết bị thành công'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết thiết bị kèm lịch sử bảo trì
   * GET /api/devices/:id
   */
  async getDeviceById(req, res, next) {
    try {
      const { id } = req.params;
      const device = await deviceService.getDeviceById(id);
      return ApiResponse.success(res, {
        message: 'Lấy thông tin thiết bị thành công',
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Phân tích tình trạng sức khỏe thiết bị & Tính điểm Asset Health Score (0 - 100) (MODULE 14)
   * GET /api/devices/:id/health-analytics
   */
  async getAssetHealthAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const data = await deviceService.getAssetHealthAnalytics(id);
      return ApiResponse.success(res, {
        message: 'Phân tích sức khỏe thiết bị thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tìm kiếm thiết bị theo mã QR Token
   * GET /api/devices/qr/:token
   */
  async getDeviceByQrToken(req, res, next) {
    try {
      const { token } = req.params;
      const device = await deviceService.getDeviceByQrToken(token);
      return ApiResponse.success(res, {
        message: 'Quét mã QR thành công',
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy mã QR Code và đường dẫn quét URL cho thiết bị (Admin/Manager)
   * GET /api/devices/:id/qr
   */
  async getDeviceQr(req, res, next) {
    try {
      const { id } = req.params;
      const data = await deviceService.getDeviceQrData(id);
      return ApiResponse.success(res, {
        message: 'Lấy dữ liệu mã QR thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thông tin công khai của thiết bị khi quét QR (Không yêu cầu đăng nhập)
   * GET /api/public/devices/qr/:token
   */
  async getPublicDeviceByQr(req, res, next) {
    try {
      const { token } = req.params;
      const data = await deviceService.getPublicDeviceByQr(token);
      return ApiResponse.success(res, {
        message: 'Tra cứu thông tin thiết bị thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo thiết bị mới
   * POST /api/devices
   */
  async createDevice(req, res, next) {
    try {
      const newDevice = await deviceService.createDevice(req.body);
      return ApiResponse.created(res, {
        message: 'Thêm mới thiết bị thành công',
        data: newDevice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin thiết bị
   * PUT /api/devices/:id
   */
  async updateDevice(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await deviceService.updateDevice(id, req.body);
      return ApiResponse.success(res, {
        message: 'Cập nhật thiết bị thành công',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật trạng thái thiết bị
   * PATCH /api/devices/:id/status
   */
  async updateDeviceStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await deviceService.updateDeviceStatus(id, status);
      return ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa thiết bị hoặc chuyển sang RETIRED nếu đã có lịch sử
   * DELETE /api/devices/:id
   */
  async deleteDevice(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deviceService.deleteDevice(id);
      return ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh mục phục vụ chọn trong Form thiết bị
   * GET /api/devices/meta/master-data
   */
  async getMasterData(req, res, next) {
    try {
      const data = await deviceService.getMasterDataForDevice();
      return ApiResponse.success(res, {
        message: 'Lấy dữ liệu danh mục thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeviceController();
