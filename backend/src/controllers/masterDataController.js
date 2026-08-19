const masterDataService = require('../services/masterDataService');
const ApiResponse = require('../utils/apiResponse');

class MasterDataController {
  // Buildings
  async getBuildings(req, res, next) {
    try {
      const data = await masterDataService.getBuildings(req.query);
      return ApiResponse.success(res, { message: 'Lấy danh sách tòa nhà thành công', data });
    } catch (err) { next(err); }
  }

  async getBuildingById(req, res, next) {
    try {
      const data = await masterDataService.getBuildingById(req.params.id);
      return ApiResponse.success(res, { message: 'Lấy chi tiết tòa nhà thành công', data });
    } catch (err) { next(err); }
  }

  async createBuilding(req, res, next) {
    try {
      const data = await masterDataService.createBuilding(req.body);
      return ApiResponse.created(res, { message: 'Tạo tòa nhà thành công', data });
    } catch (err) { next(err); }
  }

  async updateBuilding(req, res, next) {
    try {
      const data = await masterDataService.updateBuilding(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Cập nhật tòa nhà thành công', data });
    } catch (err) { next(err); }
  }

  async deleteBuilding(req, res, next) {
    try {
      const data = await masterDataService.deleteBuilding(req.params.id);
      return ApiResponse.success(res, { message: data.message, data });
    } catch (err) { next(err); }
  }

  // Locations
  async getLocations(req, res, next) {
    try {
      const result = await masterDataService.getLocations(req.query);
      return ApiResponse.paginate(res, result.locations, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }, 'Lấy danh sách phòng/địa điểm thành công');
    } catch (err) { next(err); }
  }

  async getLocationById(req, res, next) {
    try {
      const data = await masterDataService.getLocationById(req.params.id);
      return ApiResponse.success(res, { message: 'Lấy chi tiết địa điểm thành công', data });
    } catch (err) { next(err); }
  }

  async createLocation(req, res, next) {
    try {
      const data = await masterDataService.createLocation(req.body);
      return ApiResponse.created(res, { message: 'Tạo phòng/địa điểm thành công', data });
    } catch (err) { next(err); }
  }

  async updateLocation(req, res, next) {
    try {
      const data = await masterDataService.updateLocation(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Cập nhật phòng/địa điểm thành công', data });
    } catch (err) { next(err); }
  }

  async deleteLocation(req, res, next) {
    try {
      const data = await masterDataService.deleteLocation(req.params.id);
      return ApiResponse.success(res, { message: data.message, data });
    } catch (err) { next(err); }
  }

  // Departments
  async getDepartments(req, res, next) {
    try {
      const data = await masterDataService.getDepartments(req.query);
      return ApiResponse.success(res, { message: 'Lấy danh sách khoa/phòng ban thành công', data });
    } catch (err) { next(err); }
  }

  async getDepartmentById(req, res, next) {
    try {
      const data = await masterDataService.getDepartmentById(req.params.id);
      return ApiResponse.success(res, { message: 'Lấy chi tiết khoa/phòng ban thành công', data });
    } catch (err) { next(err); }
  }

  async createDepartment(req, res, next) {
    try {
      const data = await masterDataService.createDepartment(req.body);
      return ApiResponse.created(res, { message: 'Tạo khoa/phòng ban thành công', data });
    } catch (err) { next(err); }
  }

  async updateDepartment(req, res, next) {
    try {
      const data = await masterDataService.updateDepartment(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Cập nhật khoa/phòng ban thành công', data });
    } catch (err) { next(err); }
  }

  async deleteDepartment(req, res, next) {
    try {
      const data = await masterDataService.deleteDepartment(req.params.id);
      return ApiResponse.success(res, { message: data.message, data });
    } catch (err) { next(err); }
  }

  // Device Types
  async getDeviceTypes(req, res, next) {
    try {
      const data = await masterDataService.getDeviceTypes(req.query);
      return ApiResponse.success(res, { message: 'Lấy danh sách loại thiết bị thành công', data });
    } catch (err) { next(err); }
  }

  async getDeviceTypeById(req, res, next) {
    try {
      const data = await masterDataService.getDeviceTypeById(req.params.id);
      return ApiResponse.success(res, { message: 'Lấy chi tiết loại thiết bị thành công', data });
    } catch (err) { next(err); }
  }

  async createDeviceType(req, res, next) {
    try {
      const data = await masterDataService.createDeviceType(req.body);
      return ApiResponse.created(res, { message: 'Tạo loại thiết bị thành công', data });
    } catch (err) { next(err); }
  }

  async updateDeviceType(req, res, next) {
    try {
      const data = await masterDataService.updateDeviceType(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Cập nhật loại thiết bị thành công', data });
    } catch (err) { next(err); }
  }

  async deleteDeviceType(req, res, next) {
    try {
      const data = await masterDataService.deleteDeviceType(req.params.id);
      return ApiResponse.success(res, { message: data.message, data });
    } catch (err) { next(err); }
  }

  // Suppliers
  async getSuppliers(req, res, next) {
    try {
      const data = await masterDataService.getSuppliers(req.query);
      return ApiResponse.success(res, { message: 'Lấy danh sách nhà cung cấp thành công', data });
    } catch (err) { next(err); }
  }

  async getSupplierById(req, res, next) {
    try {
      const data = await masterDataService.getSupplierById(req.params.id);
      return ApiResponse.success(res, { message: 'Lấy chi tiết nhà cung cấp thành công', data });
    } catch (err) { next(err); }
  }

  async createSupplier(req, res, next) {
    try {
      const data = await masterDataService.createSupplier(req.body);
      return ApiResponse.created(res, { message: 'Tạo nhà cung cấp thành công', data });
    } catch (err) { next(err); }
  }

  async updateSupplier(req, res, next) {
    try {
      const data = await masterDataService.updateSupplier(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Cập nhật nhà cung cấp thành công', data });
    } catch (err) { next(err); }
  }

  async deleteSupplier(req, res, next) {
    try {
      const data = await masterDataService.deleteSupplier(req.params.id);
      return ApiResponse.success(res, { message: data.message, data });
    } catch (err) { next(err); }
  }
}

module.exports = new MasterDataController();
