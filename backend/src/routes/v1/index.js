const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('../authRoutes');
const userRoutes = require('../userRoutes');
const deviceRoutes = require('../deviceRoutes');
const maintenanceRoutes = require('../maintenanceRoutes');
const scheduleRoutes = require('../scheduleRoutes');
const notificationRoutes = require('../notificationRoutes');
const dashboardRoutes = require('../dashboardRoutes');
const reportRoutes = require('../reportRoutes');
const {
  buildingRouter,
  locationRouter,
  departmentRouter,
  deviceTypeRouter,
  supplierRouter,
} = require('../masterDataRoutes');
const publicRoutes = require('../publicRoutes');
const testRoutes = require('../testRoutes');

const router = express.Router();

router.use('/public', publicRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/upload', require('../uploadRoutes'));
router.use('/buildings', buildingRouter);
router.use('/locations', locationRouter);
router.use('/departments', departmentRouter);
router.use('/device-types', deviceTypeRouter);
router.use('/suppliers', supplierRouter);
router.use('/test', testRoutes);

module.exports = router;
