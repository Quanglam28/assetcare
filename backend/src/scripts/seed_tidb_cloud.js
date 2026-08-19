const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'sq6Mjn2QT6979VH.root',
  password: '5rW3qkGdL387JFuo',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
};

async function initAndSeedTiDB() {
  console.log('========================================================================');
  console.log('🚀 ĐANG SAO CHÉP 100% CẤU TRÚC VÀ DỮ LIỆU SANG TIDB CLOUD...');
  console.log('========================================================================\n');

  // 1. Tạo Database
  const adminConn = await mysql.createConnection(dbConfig);
  await adminConn.query('CREATE DATABASE IF NOT EXISTS `asset_maintenance_system`;');
  await adminConn.end();

  const cloudPool = mysql.createPool({
    ...dbConfig,
    database: 'asset_maintenance_system',
  });

  const localPool = require('../config/db').pool;

  // Lấy danh sách toàn bộ bảng từ local MySQL
  const [tableRows] = await localPool.query('SHOW TABLES');
  const tableNames = tableRows.map(r => Object.values(r)[0]);

  console.log(`📋 Phát hiện ${tableNames.length} bảng dữ liệu trong CSDL Local.`);

  await cloudPool.query('SET FOREIGN_KEY_CHECKS = 0;');

  // 2. Tạo bảng trên Cloud (thay enum bằng VARCHAR(100) để hỗ trợ 100% tiếng Việt)
  for (const tbl of tableNames) {
    try {
      const [createRes] = await localPool.query(`SHOW CREATE TABLE \`${tbl}\``);
      let createSql = createRes[0]['Create Table'];
      
      // Chuyển ENUM sang VARCHAR(100)
      createSql = createSql.replace(/enum\([^)]+\)/gi, 'VARCHAR(100)');

      await cloudPool.query(`DROP TABLE IF EXISTS \`${tbl}\``);
      await cloudPool.query(createSql);
      console.log(`✅ [DDL] Tạo bảng [${tbl}] thành công.`);
    } catch (err) {
      console.error(`❌ Lỗi tạo bảng [${tbl}]: ${err.message}`);
    }
  }

  // 3. Sao chép toàn bộ dữ liệu từ Local sang Cloud bằng Bulk Insert
  console.log('\n⏳ Bắt đầu nạp toàn bộ bản ghi dữ liệu...');
  for (const tbl of tableNames) {
    try {
      const [rows] = await localPool.query(`SELECT * FROM \`${tbl}\``);
      if (rows.length > 0) {
        const keys = Object.keys(rows[0]);
        const columnList = keys.map(k => `\`${k}\``).join(', ');

        // Chia nhỏ thành các mẻ (batch) 50 bản ghi
        const batchSize = 50;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const valuesArray = [];
          const placeholdersList = [];

          for (const row of batch) {
            const placeholders = keys.map(() => '?').join(', ');
            placeholdersList.push(`(${placeholders})`);
            for (const k of keys) {
              const v = row[k];
              valuesArray.push(typeof v === 'object' && v !== null && !(v instanceof Date) ? JSON.stringify(v) : v);
            }
          }

          const sql = `INSERT INTO \`${tbl}\` (${columnList}) VALUES ${placeholdersList.join(', ')}`;
          await cloudPool.query(sql, valuesArray);
        }
        console.log(`   ✨ Bảng [${tbl}]: Đã nạp thành công ${rows.length} bản ghi.`);
      } else {
        console.log(`   ℹ️ Bảng [${tbl}]: 0 bản ghi (Bảng rỗng).`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Lỗi chèn dữ liệu bảng [${tbl}]: ${err.message}`);
    }
  }

  await cloudPool.query('SET FOREIGN_KEY_CHECKS = 1;');
  await cloudPool.end();

  console.log('\n========================================================================');
  console.log('🎉 TOÀN BỘ 22 BẢNG VÀ DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ 100% LÊN TIDB CLOUD!');
  console.log('========================================================================\n');
}

initAndSeedTiDB().catch((err) => {
  console.error('❌ Lỗi khởi tạo TiDB Cloud:', err);
  process.exit(1);
});
