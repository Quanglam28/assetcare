const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

const isCloudDb = process.env.DB_SSL === 'true' || 
  (process.env.DB_HOST && (process.env.DB_HOST.includes('tidbcloud.com') || process.env.DB_HOST.includes('aivencloud.com') || process.env.DB_HOST.includes('railway')));

/**
 * MySQL Connection Pool Config
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asset_maintenance_system',
  ssl: isCloudDb ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+07:00',
  dateStrings: true,
});

/**
 * Kiểm tra kết nối tới MySQL
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.success(`[Database] Kết nối MySQL thành công tới database: ${process.env.DB_NAME || 'asset_maintenance_system'}`);
    connection.release();
    return true;
  } catch (error) {
    logger.warn(`[Database] Chưa thể kết nối MySQL (${error.message}). Server vẫn sẵn sàng nhận request khi DB online.`);
    return false;
  }
};

/**
 * Helper thực thi Query tiện lợi
 */
const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

module.exports = {
  pool,
  query,
  testConnection,
};
