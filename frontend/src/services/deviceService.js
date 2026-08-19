import api from './api';

export const deviceService = {
  /**
   * Lấy danh sách thiết bị kèm phân trang, tìm kiếm, lọc và sắp xếp
   */
  async getDevices(params = {}) {
    return api.get('/devices', { params });
  },

  /**
   * Lấy chi tiết một thiết bị kèm lịch sử bảo trì
   */
  async getDeviceById(id) {
    return api.get(`/devices/${id}`);
  },

  /**
   * Tra cứu thiết bị theo mã QR Token
   */
  async getDeviceByQr(token) {
    return api.get(`/devices/qr/${token}`);
  },

  /**
   * Thêm mới thiết bị
   */
  async createDevice(data) {
    return api.post('/devices', data);
  },

  /**
   * Cập nhật thông tin thiết bị
   */
  async updateDevice(id, data) {
    return api.put(`/devices/${id}`, data);
  },

  /**
   * Cập nhật trạng thái thiết bị (ACTIVE, MAINTENANCE, BROKEN, RETIRED)
   */
  async updateStatus(id, status) {
    return api.patch(`/devices/${id}/status`, { status });
  },

  /**
   * Xóa thiết bị hoặc chuyển sang RETIRED nếu đã có lịch sử
   */
  async deleteDevice(id) {
    return api.delete(`/devices/${id}`);
  },

  /**
   * Lấy mã QR Code và đường dẫn quét URL cho thiết bị (Admin/Manager)
   */
  async getDeviceQr(id) {
    return api.get(`/devices/${id}/qr`);
  },

  /**
   * Lấy thông tin công khai của thiết bị khi quét QR (Không cần đăng nhập)
   */
  async getPublicDeviceByQr(token) {
    return api.get(`/public/devices/qr/${token}`);
  },

  /**
   * Phân tích tình trạng sức khỏe thiết bị & Tính điểm Asset Health Score (0 - 100) (MODULE 14)
   */
  async getAssetHealthAnalytics(id) {
    return api.get(`/devices/${id}/health-analytics`);
  },

  /**
   * Lấy danh mục phục vụ bộ lọc và form thêm/sửa thiết bị
   */
  async getMasterData() {
    return api.get('/devices/meta/master-data');
  },
};
