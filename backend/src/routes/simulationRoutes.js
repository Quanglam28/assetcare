const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * Route Mô phỏng Dự báo Bảo trì (Predictive Simulation Routes)
 * Phase 4 — Rule-Based Decision Support
 */

// Yêu cầu xác thực token
router.use(authenticate);

// 1. Analytics endpoints
router.get('/analytics/predictive/top-degrading', (req, res, next) => simulationController.getTopDegrading(req, res, next));
router.get('/analytics/predictive/alerts', (req, res, next) => simulationController.getPredictiveAlerts(req, res, next));

// 2. Device simulation endpoints
router.get('/devices/:id/simulation', (req, res, next) => simulationController.getSimulation(req, res, next));
router.post('/devices/:id/simulation', (req, res, next) => simulationController.runSimulation(req, res, next));

module.exports = router;
