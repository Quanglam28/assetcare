# 💾 HƯỚNG DẪN SAO LƯU & PHỤC HỒI CƠ SỞ DỮ LIỆU (BACKUP & RESTORE GUIDE)
## HỆ THỐNG THÔNG TIN QUẢN LÝ TÀI SẢN VÀ BẢO TRÌ THIẾT BỊ ĐẠI HỌC UTT (ASSETCARE)

---

### 1. Chiến lược Sao lưu Dữ liệu (Backup Strategy)

Để đảm bảo tính liên tục của hệ thống và tránh rủi ro mất mát dữ liệu tài sản:
- **Sao lưu Hàng ngày (Daily Full Backup)**: Tự động chạy vào 01:00 AM hàng ngày (giờ thấp điểm).
- **Sao lưu Trước khi Nâng cấp (Pre-Release Backup)**: Thực hiện thủ công trước khi deploy phiên bản mới.
- **Thời gian lưu trữ (Retention Period)**: Giữ bản sao lưu 30 ngày gần nhất trên Cloud Storage độc lập (AWS S3 hoặc Google Cloud Storage).

---

### 2. Hướng dẫn Sao lưu Dữ liệu (Backup Commands)

#### A. Đối với MySQL Cục bộ / Máy chủ Riêng (Self-Hosted):
```bash
# Tạo thư mục lưu trữ bản sao lưu
mkdir -p /var/backups/assetcare

# Thực hiện Dump toàn bộ schema và dữ liệu (gồm cả trigger, routine, foreign keys)
mysqldump -u root -p \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  asset_maintenance_system > /var/backups/assetcare/assetcare_backup_$(date +%Y%m%d_%H%M%S).sql

# Nén tệp sao lưu bằng gzip
gzip /var/backups/assetcare/assetcare_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### B. Đối với TiDB Cloud (Managed Database):
1. Đăng nhập [TiDB Cloud Console](https://tidbcloud.com/).
2. Chọn Cluster `assetcare-prod` → Tab **Backups**.
3. Bấm **Manual Backup** → Đặt tên bản sao lưu: `backup_pre_deploy_20260820`.
4. Hoặc bật tính năng **Automatic Daily Backup** (miễn phí lưu trữ 7 ngày trên TiDB Serverless).

---

### 3. Hướng dẫn Phục hồi Dữ liệu (Restore Commands)

#### A. Phục hồi về MySQL Cục bộ / Server:
```bash
# 1. Tạo mới Database trắng nếu cần
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS asset_maintenance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Nhập dữ liệu từ bản sao lưu
mysql -u root -p asset_maintenance_system < /var/backups/assetcare/assetcare_backup_20260820_010000.sql
```

#### B. Phục hồi qua Script Node.js tự động:
```bash
# Chạy script kiểm tra và nạp lại toàn bộ dữ liệu mẫu ban đầu (nếu cần reset môi trường demo)
cd d:/LAMm/backend
node src/seed_demo_data.js
```

---

### 4. Quy trình Kiểm thử Phục hồi Định kỳ (Drill & Verification)

1. Mỗi quý một lần, thực hiện restore bản backup gần nhất vào một môi trường database thử nghiệm (Staging Database).
2. Chạy bộ kiểm thử tự động `node test_security_hardening_suite.js` và `node test_phase4_simulation_suite.js` trên Staging DB.
3. Xác nhận số lượng bản ghi thiết bị, phiếu sự cố và người dùng khớp 100% với môi trường thực tế.
