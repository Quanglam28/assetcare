const ExcelJS = require('exceljs');
const reportRepository = require('../repositories/reportRepository');
const { BadRequestError, ForbiddenError } = require('../utils/appError');
const { ROLES } = require('../constants/roles');

/**
 * Service Xử lý 7 Báo Cáo Quản Trị, Xuất Excel (.xlsx) & CSV Chuẩn UTF-8
 */
class ReportService {
  /**
   * Lấy cấu hình metadata (Tiêu đề, Cột, Hàm truy vấn) cho từng loại báo cáo
   */
  _getReportConfig(reportType) {
    const configs = {
      'device-inventory': {
        title: 'BÁO CÁO KIỂM KÊ THIẾT BỊ & TÀI SẢN TRƯỜNG HỌC',
        sheetName: 'Danh sách thiết bị',
        fetcher: (filters) => reportRepository.getDeviceInventoryReport(filters),
        columns: [
          { header: 'Mã Thiết Bị', key: 'device_code', width: 18 },
          { header: 'Tên Thiết Bị', key: 'device_name', width: 30 },
          { header: 'Loại Thiết Bị', key: 'device_type_name', width: 20 },
          { header: 'Model', key: 'model', width: 18 },
          { header: 'Số Serial', key: 'serial_number', width: 18 },
          { header: 'Phòng / Vị Trí', key: 'room_name', width: 22 },
          { header: 'Tòa Nhà', key: 'building_name', width: 18 },
          { header: 'Đơn Vị Quản Lý', key: 'department_name', width: 22 },
          { header: 'Nhà Cung Cấp', key: 'supplier_name', width: 24 },
          { header: 'Giá Mua (VNĐ)', key: 'purchase_price', width: 18, isCurrency: true },
          { header: 'Ngày Mua', key: 'purchase_date', width: 15, isDate: true },
          { header: 'Bảo Hành Đến', key: 'warranty_end', width: 15, isDate: true },
          { header: 'Trạng Thái', key: 'device_status', width: 18 },
          { header: 'Điểm Sức Khỏe', key: 'health_score', width: 16 },
          { header: 'Mức Sức Khỏe', key: 'health_status', width: 16 },
          { header: 'Nguy Cơ Sự Cố', key: 'risk_level', width: 16 },
          { header: 'Khuyến Nghị', key: 'recommendation_action', width: 24 },
        ],
      },

      'maintenance': {
        title: 'BÁO CÁO TỔNG HỢP SỰ CỐ & LỊCH SỬ BẢO TRÌ',
        sheetName: 'Phiếu bảo trì',
        fetcher: (filters) => reportRepository.getMaintenanceReport(filters),
        columns: [
          { header: 'Mã Phiếu', key: 'request_code', width: 15 },
          { header: 'Tiêu Đề Sự Cố', key: 'request_title', width: 32 },
          { header: 'Mã TB', key: 'device_code', width: 16 },
          { header: 'Tên Thiết Bị', key: 'device_name', width: 26 },
          { header: 'Phòng Học', key: 'room_name', width: 20 },
          { header: 'Tòa Nhà', key: 'building_name', width: 16 },
          { header: 'Người Báo Cáo', key: 'reporter_name', width: 20 },
          { header: 'KTV Phụ Trách', key: 'technician_name', width: 20 },
          { header: 'Mức Ưu Tiên', key: 'priority', width: 15 },
          { header: 'Trạng Thái', key: 'request_status', width: 18 },
          { header: 'Thời Gian Báo', key: 'created_at', width: 20, isDateTime: true },
          { header: 'Thời Gian Hoàn Tất', key: 'completed_at', width: 20, isDateTime: true },
          { header: 'TG Xử Lý (Giờ)', key: 'resolution_hours', width: 16 },
          { header: 'Chi Phí (VNĐ)', key: 'actual_cost', width: 18, isCurrency: true },
          { header: 'Nguyên Nhân', key: 'root_cause', width: 30 },
          { header: 'Biện Pháp Khắc Phục', key: 'resolution', width: 35 },
        ],
      },

      'maintenance-cost': {
        title: 'BÁO CÁO CHI PHÍ BẢO TRÌ & THAY THẾ LINH KIỆN',
        sheetName: 'Chi phí bảo trì',
        fetcher: (filters) => reportRepository.getMaintenanceCostReport(filters),
        columns: [
          { header: 'Mã Phiếu', key: 'request_code', width: 15 },
          { header: 'Mã TB', key: 'device_code', width: 16 },
          { header: 'Tên Thiết Bị', key: 'device_name', width: 26 },
          { header: 'Vị Trí', key: 'room_name', width: 20 },
          { header: 'KTV Thực Hiện', key: 'technician_name', width: 20 },
          { header: 'Ngày Hoàn Tất', key: 'completed_at', width: 16, isDate: true },
          { header: 'Linh Kiện Thay Thế', key: 'part_name', width: 25 },
          { header: 'Mã LK', key: 'part_code', width: 15 },
          { header: 'Số Lượng', key: 'quantity', width: 12 },
          { header: 'Đơn Giá (VNĐ)', key: 'unit_price', width: 16, isCurrency: true },
          { header: 'Thành Tiền (VNĐ)', key: 'part_total_cost', width: 18, isCurrency: true },
          { header: 'Tổng Phiếu (VNĐ)', key: 'request_total_cost', width: 20, isCurrency: true },
        ],
      },

      'technician-performance': {
        title: 'BÁO CÁO ĐÁNH GIÁ HIỆU SUẤT KỸ THUẬT VIÊN',
        sheetName: 'Hiệu suất KTV',
        fetcher: (filters) => reportRepository.getTechnicianPerformanceReport(filters),
        columns: [
          { header: 'Tên Kỹ Thuật Viên', key: 'technician_name', width: 24 },
          { header: 'Tài Khoản', key: 'username', width: 16 },
          { header: 'Số Điện Thoại', key: 'technician_phone', width: 16 },
          { header: 'Email', key: 'technician_email', width: 24 },
          { header: 'Tổng Phiếu Được Giao', key: 'total_assigned_tickets', width: 22 },
          { header: 'Đã Hoàn Thành', key: 'completed_tickets', width: 18 },
          { header: 'Đã Nghiệm Thu Đóng', key: 'closed_tickets', width: 20 },
          { header: 'Đang Xử Lý', key: 'in_progress_tickets', width: 16 },
          { header: 'Quá Hạn (>48h)', key: 'overdue_tickets', width: 16 },
          { header: 'TG Trung Bình (Giờ)', key: 'avg_resolution_hours', width: 20 },
          { header: 'Tỷ Lệ Hoàn Thành (%)', key: 'completion_rate', width: 22 },
          { header: 'Tổng Chi Phí Xử Lý (VNĐ)', key: 'total_repair_cost', width: 24, isCurrency: true },
        ],
      },

      'device-incident-frequency': {
        title: 'BÁO CÁO TẦN SUẤT SỰ CỐ & ĐỘ TIN CẬY CỦA THIẾT BỊ',
        sheetName: 'Tần suất sự cố',
        fetcher: (filters) => reportRepository.getDeviceIncidentFrequencyReport(filters),
        columns: [
          { header: 'Mã Thiết Bị', key: 'device_code', width: 18 },
          { header: 'Tên Thiết Bị', key: 'device_name', width: 28 },
          { header: 'Model', key: 'model', width: 18 },
          { header: 'Loại Thiết Bị', key: 'device_type_name', width: 20 },
          { header: 'Vị Trí Phòng', key: 'room_name', width: 20 },
          { header: 'Tòa Nhà', key: 'building_name', width: 16 },
          { header: 'Trạng Thái Hiện Tại', key: 'device_status', width: 20 },
          { header: 'Số Lần Sự Cố', key: 'incident_count', width: 16 },
          { header: 'Tổng Chi Phí Sửa (VNĐ)', key: 'total_maintenance_cost', width: 24, isCurrency: true },
          { header: 'Sự Cố Gần Nhất', key: 'last_incident_date', width: 20, isDateTime: true },
        ],
      },

      'warranty-expiration': {
        title: 'BÁO CÁO THỜI HẠN BẢO HÀNH THIẾT BỊ & TÀI SẢN',
        sheetName: 'Thời hạn bảo hành',
        fetcher: (filters) => reportRepository.getWarrantyExpirationReport(filters),
        columns: [
          { header: 'Mã Thiết Bị', key: 'device_code', width: 18 },
          { header: 'Tên Thiết Bị', key: 'device_name', width: 28 },
          { header: 'Loại Thiết Bị', key: 'device_type_name', width: 20 },
          { header: 'Nhà Cung Cấp', key: 'supplier_name', width: 24 },
          { header: 'SĐT NCC', key: 'supplier_phone', width: 16 },
          { header: 'Vị Trí', key: 'room_name', width: 20 },
          { header: 'Ngày Mua', key: 'purchase_date', width: 15, isDate: true },
          { header: 'Hết Hạn Bảo Hành', key: 'warranty_end', width: 18, isDate: true },
          { header: 'Số Ngày Còn Lại', key: 'days_remaining', width: 18 },
          { header: 'Tình Trạng Bảo Hành', key: 'warranty_status', width: 22 },
        ],
      },

      'scheduled-maintenance': {
        title: 'BÁO CÁO KẾ HOẠCH BẢO DƯỠNG ĐỊNH KỲ (PREVENTATIVE)',
        sheetName: 'Bảo dưỡng định kỳ',
        fetcher: (filters) => reportRepository.getScheduledMaintenanceReport(filters),
        columns: [
          { header: 'Tiêu Đề Kế Hoạch', key: 'schedule_title', width: 30 },
          { header: 'Mã TB', key: 'device_code', width: 16 },
          { header: 'Tên Thiết Bị', key: 'device_name', width: 26 },
          { header: 'Vị Trí', key: 'room_name', width: 20 },
          { header: 'Chu Kỳ', key: 'frequency', width: 16 },
          { header: 'Ngày Dự Kiến', key: 'scheduled_date', width: 16, isDate: true },
          { header: 'Chu Kỳ Tiếp Theo', key: 'next_run_date', width: 18, isDate: true },
          { header: 'Lần Thực Hiện Gần Nhất', key: 'last_performed_at', width: 22, isDateTime: true },
          { header: 'KTV Phụ Trách', key: 'technician_name', width: 20 },
          { header: 'Cảnh Báo', key: 'alert_status', width: 18 },
          { header: 'Ghi Chú', key: 'notes', width: 30 },
        ],
      },
    };

    const config = configs[reportType];
    if (!config) {
      throw new BadRequestError(`Loại báo cáo không hợp lệ [${reportType}]`);
    }
    return config;
  }

  /**
   * Lấy dữ liệu xem trước (Preview Data)
   */
  async getReportData(reportType, filters = {}, currentUser) {
    // Phân quyền: KTV chỉ xem công việc của mình
    if (currentUser.role === ROLES.TECHNICIAN) {
      filters.technicianId = currentUser.id;
    }

    const config = this._getReportConfig(reportType);
    const data = await config.fetcher(filters);

    return {
      title: config.title,
      reportType,
      columns: config.columns,
      totalRows: data.length,
      data,
    };
  }

  /**
   * Xuất file Excel (.xlsx) chuyên nghiệp
   */
  async exportExcel(reportType, filters = {}, currentUser, res) {
    if (currentUser.role === ROLES.TECHNICIAN) {
      filters.technicianId = currentUser.id;
    }

    const config = this._getReportConfig(reportType);
    const data = await config.fetcher(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'University Asset Maintenance System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(config.sheetName);

    // 1. Tiêu đề Báo cáo lớn
    worksheet.mergeCells(1, 1, 1, config.columns.length);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = config.title;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }, // Navy Blue
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 35;

    // 2. Dòng thông tin xuất báo cáo
    worksheet.mergeCells(2, 1, 2, config.columns.length);
    const subCell = worksheet.getCell('A2');
    subCell.value = `Thời gian xuất: ${new Date().toLocaleString('vi-VN')} | Người thực hiện: ${currentUser.fullName || currentUser.username} (${currentUser.role})`;
    subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 22;

    // 3. Header Cột
    const headers = config.columns.map(c => c.header);
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' }, // Brand Blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    // 4. Đổ dữ liệu vào hàng
    data.forEach((row, idx) => {
      const rowValues = config.columns.map(c => {
        const val = row[c.key];
        if (val === null || val === undefined) return '';
        if (c.isDate && val) return new Date(val).toLocaleDateString('vi-VN');
        if (c.isDateTime && val) return new Date(val).toLocaleString('vi-VN');
        return val;
      });

      const dataRow = worksheet.addRow(rowValues);
      dataRow.height = 22;

      dataRow.eachCell((cell, colIndex) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        const colConfig = config.columns[colIndex - 1];
        if (colConfig?.isCurrency && typeof cell.value === 'number') {
          cell.numFmt = '#,##0 "đ"';
          cell.alignment = { horizontal: 'right' };
        } else if (colConfig?.isDate || colConfig?.isDateTime) {
          cell.alignment = { horizontal: 'center' };
        }

        // Xen kẽ màu dòng
        if (idx % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
      });
    });

    // 5. Căn chỉnh độ rộng cột
    config.columns.forEach((col, i) => {
      worksheet.getColumn(i + 1).width = col.width || 18;
    });

    // 6. Thiết lập Response Headers & Stream file
    const filename = `Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Xuất file CSV định dạng chuẩn UTF-8 có BOM
   */
  async exportCsv(reportType, filters = {}, currentUser, res) {
    if (currentUser.role === ROLES.TECHNICIAN) {
      filters.technicianId = currentUser.id;
    }

    const config = this._getReportConfig(reportType);
    const data = await config.fetcher(filters);

    // UTF-8 BOM cho Excel tiếng Việt
    let csv = '\ufeff';

    // Headers
    const headers = config.columns.map(c => `"${c.header.replace(/"/g, '""')}"`);
    csv += headers.join(',') + '\r\n';

    // Rows
    data.forEach(row => {
      const rowValues = config.columns.map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        if (c.isDate && val) val = new Date(val).toLocaleDateString('vi-VN');
        if (c.isDateTime && val) val = new Date(val).toLocaleString('vi-VN');
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csv += rowValues.join(',') + '\r\n';
    });

    const filename = `Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(csv, 'utf8'));
  }
}

module.exports = new ReportService();
