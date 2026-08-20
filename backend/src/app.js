const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const routesV1 = require('./routes/v1');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const {
  buildingRouter,
  locationRouter,
  departmentRouter,
  deviceTypeRouter,
  supplierRouter,
} = require('./routes/masterDataRoutes');
const testRoutes = require('./routes/testRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Parse cookies securely
app.use(cookieParser());

// High Performance Gzip/Deflate Compression
app.use(compression({
  threshold: 1024, // Compress all payloads > 1KB
  level: 6,
}));

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  xContentTypeOptions: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Dynamic CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép requests không có origin (Mobile apps, Postman, Server-to-Server, cùng máy)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Cho phép localhost, mạng LAN nội bộ, và Vercel / Render domains
    if (
      /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      /^https:\/\/.*\.onrender\.com$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error('Chính sách CORS không cho phép truy cập từ Origin này'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF Protection Middleware
const { csrfProtection } = require('./middlewares/csrfMiddleware');
app.use(csrfProtection);

// Static file serving cho thư mục uploads
const uploadPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

const publicRoutes = require('./routes/publicRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { authRateLimiter, apiRateLimiter, publicScanRateLimiter } = require('./middlewares/rateLimitMiddleware');

// Áp dụng Rate Limiting bảo vệ toàn diện hệ thống
app.use('/api', apiRateLimiter);
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/public', publicScanRateLimiter);

const healthRoutes = require('./routes/healthRoutes');
const priorityRoutes = require('./routes/priorityRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const workOrderRoutes = require('./routes/workOrderRoutes');

// Direct `/api/...` routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/buildings', buildingRouter);
app.use('/api/locations', locationRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/device-types', deviceTypeRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/test', testRoutes);
app.use('/api', healthRoutes);
app.use('/api', priorityRoutes);
app.use('/api', simulationRoutes);

// Versioned `/api/v1` routes
app.use('/api/v1', routesV1);

// Serve Frontend SPA build if dist folder exists (Single-Port Hosting)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('registerSW.js') || filePath.endsWith('manifest.webmanifest')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Route root chào mừng khi chưa build frontend
  app.get('/', (req, res) => {
    res.json({
      name: 'Hệ thống Quản lý Tài sản và Bảo trì Thiết bị Đại học (QR Code) - API',
      version: '1.0.0',
      health: '/api/health',
    });
  });
}

// 404 & Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
