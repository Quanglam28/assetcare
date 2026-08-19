const buildingRepository = require('../repositories/buildingRepository');
const locationRepository = require('../repositories/locationRepository');
const departmentRepository = require('../repositories/departmentRepository');
const deviceTypeRepository = require('../repositories/deviceTypeRepository');
const supplierRepository = require('../repositories/supplierRepository');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/appError');
const logger = require('../utils/logger');

class MasterDataService {
  // ==========================================
  // 1. BUILDINGS
  // ==========================================
  async getBuildings(query) {
    return buildingRepository.findAll(query);
  }

  async getBuildingById(id) {
    const b = await buildingRepository.findById(id);
    if (!b) throw new NotFoundError(`Không tìm thấy tòa nhà với ID [${id}]`);
    return b;
  }

  async createBuilding(data) {
    const existing = await buildingRepository.findByCode(data.code.trim().toUpperCase());
    if (existing) throw new ConflictError(`Mã tòa nhà "${data.code}" đã tồn tại`);
    const id = await buildingRepository.create(data);
    logger.info(`[Master Data] Đã tạo tòa nhà ID [${id}]`);
    return this.getBuildingById(id);
  }

  async updateBuilding(id, data) {
    await this.getBuildingById(id);
    await buildingRepository.update(id, data);
    return this.getBuildingById(id);
  }

  async deleteBuilding(id) {
    await this.getBuildingById(id);
    const locCount = await buildingRepository.countLocations(id);
    if (locCount > 0) {
      throw new BadRequestError(`Không thể xóa tòa nhà này vì đang có [${locCount}] phòng học / địa điểm trực thuộc`);
    }
    await buildingRepository.delete(id);
    return { success: true, message: 'Đã xóa tòa nhà thành công' };
  }

  // ==========================================
  // 2. LOCATIONS
  // ==========================================
  async getLocations(query) {
    return locationRepository.findAll(query);
  }

  async getLocationById(id) {
    const l = await locationRepository.findById(id);
    if (!l) throw new NotFoundError(`Không tìm thấy phòng / địa điểm với ID [${id}]`);
    return l;
  }

  async createLocation(data) {
    const existing = await locationRepository.findByCode(data.code.trim().toUpperCase());
    if (existing) throw new ConflictError(`Mã phòng / địa điểm "${data.code}" đã tồn tại`);
    const id = await locationRepository.create(data);
    logger.info(`[Master Data] Đã tạo phòng ID [${id}]`);
    return this.getLocationById(id);
  }

  async updateLocation(id, data) {
    await this.getLocationById(id);
    await locationRepository.update(id, data);
    return this.getLocationById(id);
  }

  async deleteLocation(id) {
    await this.getLocationById(id);
    const devCount = await locationRepository.countDevices(id);
    if (devCount > 0) {
      throw new BadRequestError(`Không thể xóa phòng này vì đang có [${devCount}] thiết bị đang đặt tại đây`);
    }
    await locationRepository.delete(id);
    return { success: true, message: 'Đã xóa địa điểm thành công' };
  }

  // ==========================================
  // 3. DEPARTMENTS
  // ==========================================
  async getDepartments(query) {
    return departmentRepository.findAll(query);
  }

  async getDepartmentById(id) {
    const d = await departmentRepository.findById(id);
    if (!d) throw new NotFoundError(`Không tìm thấy khoa / phòng ban với ID [${id}]`);
    return d;
  }

  async createDepartment(data) {
    const existing = await departmentRepository.findByCode(data.code.trim().toUpperCase());
    if (existing) throw new ConflictError(`Mã khoa / phòng ban "${data.code}" đã tồn tại`);
    const id = await departmentRepository.create(data);
    return this.getDepartmentById(id);
  }

  async updateDepartment(id, data) {
    await this.getDepartmentById(id);
    await departmentRepository.update(id, data);
    return this.getDepartmentById(id);
  }

  async deleteDepartment(id) {
    await this.getDepartmentById(id);
    const dep = await departmentRepository.countDependencies(id);
    if (dep.users > 0 || dep.devices > 0) {
      throw new BadRequestError(`Không thể xóa khoa/đơn vị này vì đang gắn với [${dep.users}] người dùng và [${dep.devices}] thiết bị`);
    }
    await departmentRepository.delete(id);
    return { success: true, message: 'Đã xóa khoa / phòng ban thành công' };
  }

  // ==========================================
  // 4. DEVICE TYPES
  // ==========================================
  async getDeviceTypes(query) {
    return deviceTypeRepository.findAll(query);
  }

  async getDeviceTypeById(id) {
    const dt = await deviceTypeRepository.findById(id);
    if (!dt) throw new NotFoundError(`Không tìm thấy loại thiết bị với ID [${id}]`);
    return dt;
  }

  async createDeviceType(data) {
    const existing = await deviceTypeRepository.findByCode(data.code.trim().toUpperCase());
    if (existing) throw new ConflictError(`Mã loại thiết bị "${data.code}" đã tồn tại`);
    const id = await deviceTypeRepository.create(data);
    return this.getDeviceTypeById(id);
  }

  async updateDeviceType(id, data) {
    await this.getDeviceTypeById(id);
    await deviceTypeRepository.update(id, data);
    return this.getDeviceTypeById(id);
  }

  async deleteDeviceType(id) {
    await this.getDeviceTypeById(id);
    const count = await deviceTypeRepository.countDevices(id);
    if (count > 0) {
      throw new BadRequestError(`Không thể xóa loại thiết bị này vì đang có [${count}] thiết bị thuộc loại này`);
    }
    await deviceTypeRepository.delete(id);
    return { success: true, message: 'Đã xóa loại thiết bị thành công' };
  }

  // ==========================================
  // 5. SUPPLIERS
  // ==========================================
  async getSuppliers(query) {
    return supplierRepository.findAll(query);
  }

  async getSupplierById(id) {
    const s = await supplierRepository.findById(id);
    if (!s) throw new NotFoundError(`Không tìm thấy nhà cung cấp với ID [${id}]`);
    return s;
  }

  async createSupplier(data) {
    const existing = await supplierRepository.findByCode(data.code.trim().toUpperCase());
    if (existing) throw new ConflictError(`Mã nhà cung cấp "${data.code}" đã tồn tại`);
    const id = await supplierRepository.create(data);
    return this.getSupplierById(id);
  }

  async updateSupplier(id, data) {
    await this.getSupplierById(id);
    await supplierRepository.update(id, data);
    return this.getSupplierById(id);
  }

  async deleteSupplier(id) {
    await this.getSupplierById(id);
    const count = await supplierRepository.countDevices(id);
    if (count > 0) {
      throw new BadRequestError(`Không thể xóa nhà cung cấp này vì đang gắn với [${count}] thiết bị`);
    }
    await supplierRepository.delete(id);
    return { success: true, message: 'Đã xóa nhà cung cấp thành công' };
  }
}

module.exports = new MasterDataService();
