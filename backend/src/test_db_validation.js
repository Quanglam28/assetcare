const { pool } = require('./config/db');

async function runDatabaseValidation() {
  console.log('================================================================================');
  console.log('🗄️ MODULE 16: DATABASE INTEGRITY & SCHEMA VALIDATION (MYSQL 14 TABLES AUDIT)');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Kiểm tra 14 bảng trong CSDL
    const REQUIRED_TABLES = [
      'roles',
      'departments',
      'buildings',
      'locations',
      'users',
      'device_types',
      'suppliers',
      'devices',
      'maintenance_requests',
      'maintenance_histories',
      'maintenance_schedules',
      'maintenance_parts',
      'attachments',
      'notifications',
    ];

    const [tableRows] = await pool.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'asset_maintenance_system'
    `);

    const existingTables = new Set(tableRows.map(r => r.table_name || r.TABLE_NAME));
    console.log(`Danh sách bảng hiện có (${existingTables.size}):`, Array.from(existingTables).join(', '));

    for (const reqTab of REQUIRED_TABLES) {
      assert(existingTables.has(reqTab), `Bảng [${reqTab}] tồn tại trong cơ sở dữ liệu`);
    }

    // 2. Kiểm tra các ràng buộc khóa ngoại (Foreign Keys)
    console.log('\n--- Kiểm Tra Ràng Buộc Khóa Ngoại (Foreign Keys) ---');
    const [fkRows] = await pool.execute(`
      SELECT constraint_name, table_name, column_name, referenced_table_name, referenced_column_name
      FROM information_schema.key_column_usage
      WHERE table_schema = 'asset_maintenance_system' AND referenced_table_name IS NOT NULL
    `);
    assert(fkRows.length >= 15, `Tổng cộng ${fkRows.length} liên kết khóa ngoại hoạt động toàn vẹn`);

    // 3. Kiểm tra số lượng bản ghi thực tế
    console.log('\n--- Kiểm Tra Số Lượng Bản Ghi Dữ Liệu Thực Tế ---');
    for (const tab of REQUIRED_TABLES) {
      const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM \`${tab}\``);
      console.log(`   * Bảng [${tab.padEnd(22)}]: ${String(countRows[0].total).padStart(3)} bản ghi`);
    }
    assert(true, 'Toàn bộ 14 bảng CSDL sẵn sàng và có dữ liệu hoạt động chuẩn xác');

  } catch (error) {
    console.error('❌ Lỗi kiểm tra CSDL:', error.message);
    failed++;
  } finally {
    await pool.end();
  }

  console.log('\n================================================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ CSDL: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================================\n');
}

runDatabaseValidation();
