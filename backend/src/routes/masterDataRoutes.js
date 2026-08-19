const express = require('express');
const masterDataController = require('../controllers/masterDataController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validatorMiddleware');
const {
  buildingSchema,
  locationSchema,
  departmentSchema,
  deviceTypeSchema,
  supplierSchema,
} = require('../validators/masterValidator');
const { ROLES } = require('../constants/roles');

// 1. Buildings Router
const buildingRouter = express.Router();
buildingRouter.use(authenticate);
buildingRouter.get('/', masterDataController.getBuildings);
buildingRouter.get('/:id', masterDataController.getBuildingById);
buildingRouter.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(buildingSchema), masterDataController.createBuilding);
buildingRouter.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(buildingSchema.fork(['code'], (schema) => schema.optional())), masterDataController.updateBuilding);
buildingRouter.delete('/:id', authorize(ROLES.ADMIN), masterDataController.deleteBuilding);

// 2. Locations Router
const locationRouter = express.Router();
locationRouter.use(authenticate);
locationRouter.get('/', masterDataController.getLocations);
locationRouter.get('/:id', masterDataController.getLocationById);
locationRouter.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(locationSchema), masterDataController.createLocation);
locationRouter.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(locationSchema.fork(['code', 'buildingId'], (schema) => schema.optional())), masterDataController.updateLocation);
locationRouter.delete('/:id', authorize(ROLES.ADMIN), masterDataController.deleteLocation);

// 3. Departments Router
const departmentRouter = express.Router();
departmentRouter.use(authenticate);
departmentRouter.get('/', masterDataController.getDepartments);
departmentRouter.get('/:id', masterDataController.getDepartmentById);
departmentRouter.post('/', authorize(ROLES.ADMIN), validate(departmentSchema), masterDataController.createDepartment);
departmentRouter.put('/:id', authorize(ROLES.ADMIN), validate(departmentSchema.fork(['code'], (schema) => schema.optional())), masterDataController.updateDepartment);
departmentRouter.delete('/:id', authorize(ROLES.ADMIN), masterDataController.deleteDepartment);

// 4. Device Types Router
const deviceTypeRouter = express.Router();
deviceTypeRouter.use(authenticate);
deviceTypeRouter.get('/', masterDataController.getDeviceTypes);
deviceTypeRouter.get('/:id', masterDataController.getDeviceTypeById);
deviceTypeRouter.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(deviceTypeSchema), masterDataController.createDeviceType);
deviceTypeRouter.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), validate(deviceTypeSchema.fork(['code'], (schema) => schema.optional())), masterDataController.updateDeviceType);
deviceTypeRouter.delete('/:id', authorize(ROLES.ADMIN), masterDataController.deleteDeviceType);

// 5. Suppliers Router
const supplierRouter = express.Router();
supplierRouter.use(authenticate);
supplierRouter.get('/', masterDataController.getSuppliers);
supplierRouter.get('/:id', masterDataController.getSupplierById);
supplierRouter.post('/', authorize(ROLES.ADMIN), validate(supplierSchema), masterDataController.createSupplier);
supplierRouter.put('/:id', authorize(ROLES.ADMIN), validate(supplierSchema.fork(['code'], (schema) => schema.optional())), masterDataController.updateSupplier);
supplierRouter.delete('/:id', authorize(ROLES.ADMIN), masterDataController.deleteSupplier);

module.exports = {
  buildingRouter,
  locationRouter,
  departmentRouter,
  deviceTypeRouter,
  supplierRouter,
};
