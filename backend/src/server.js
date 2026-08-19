const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const { testConnection } = require('./config/db');
const logger = require('./utils/logger');

// Nạp biến môi trường
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const HOST = '0.0.0.0';

// Khởi động server
const server = app.listen(PORT, HOST, async () => {
  logger.info(`=======================================================`);
  logger.info(`🚀 Backend Server đang chạy tại: http://localhost:${PORT} (Host: ${HOST})`);
  logger.info(`📋 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`⚙️  Môi trường: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`=======================================================`);

  // Kiểm tra kết nối MySQL
  await testConnection();
});

// Xử lý Uncaught Exception & Unhandled Rejection
process.on('uncaughtException', (err) => {
  logger.error('Lỗi Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Lỗi Unhandled Rejection:', reason);
});

module.exports = server;
