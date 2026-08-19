import api from './api';

export const masterDataService = {
  // Buildings
  async getBuildings(params = {}) { return api.get('/buildings', { params }); },
  async getBuildingById(id) { return api.get(`/buildings/${id}`); },
  async createBuilding(data) { return api.post('/buildings', data); },
  async updateBuilding(id, data) { return api.put(`/buildings/${id}`, data); },
  async deleteBuilding(id) { return api.delete(`/buildings/${id}`); },

  // Locations
  async getLocations(params = {}) { return api.get('/locations', { params }); },
  async getLocationById(id) { return api.get(`/locations/${id}`); },
  async createLocation(data) { return api.post('/locations', data); },
  async updateLocation(id, data) { return api.put(`/locations/${id}`, data); },
  async deleteLocation(id) { return api.delete(`/locations/${id}`); },

  // Departments
  async getDepartments(params = {}) { return api.get('/departments', { params }); },
  async getDepartmentById(id) { return api.get(`/departments/${id}`); },
  async createDepartment(data) { return api.post('/departments', data); },
  async updateDepartment(id, data) { return api.put(`/departments/${id}`, data); },
  async deleteDepartment(id) { return api.delete(`/departments/${id}`); },

  // Device Types
  async getDeviceTypes(params = {}) { return api.get('/device-types', { params }); },
  async getDeviceTypeById(id) { return api.get(`/device-types/${id}`); },
  async createDeviceType(data) { return api.post('/device-types', data); },
  async updateDeviceType(id, data) { return api.put(`/device-types/${id}`, data); },
  async deleteDeviceType(id) { return api.delete(`/device-types/${id}`); },

  // Suppliers
  async getSuppliers(params = {}) { return api.get('/suppliers', { params }); },
  async getSupplierById(id) { return api.get(`/suppliers/${id}`); },
  async createSupplier(data) { return api.post('/suppliers', data); },
  async updateSupplier(id, data) { return api.put(`/suppliers/${id}`, data); },
  async deleteSupplier(id) { return api.delete(`/suppliers/${id}`); },
};
