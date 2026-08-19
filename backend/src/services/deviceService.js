const deviceRepository = require('../repositories/deviceRepository');
const buildingRepository = require('../repositories/buildingRepository');
const locationRepository = require('../repositories/locationRepository');
const departmentRepository = require('../repositories/departmentRepository');
const deviceTypeRepository = require('../repositories/deviceTypeRepository');
const supplierRepository = require('../repositories/supplierRepository');
const QRCodeUtil = require('../utils/qrCode');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Service xử lý nghiệp vụ Quản lý Thiết bị & Mã QR Code (Device Management)
 */
class DeviceService {
  /**
   * Lấy danh sách thiết bị kèm phân trang, tìm kiếm, lọc và sắp xếp
   */
  async getDevices(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));

    const result = await deviceRepository.findAll({
      page,
      limit,
      search: query.search || '',
      deviceTypeId: query.deviceTypeId || null,
      locationId: query.locationId || null,
      buildingId: query.buildingId || null,
      departmentId: query.departmentId || null,
      supplierId: query.supplierId || null,
      status: query.status || '',
      healthStatus: query.healthStatus || '',
      riskLevel: query.riskLevel || '',
      dataQuality: query.dataQuality || '',
      sortBy: query.sortBy || 'created_at',
      sortOrder: query.sortOrder || 'DESC',
    });

    return result;
  }

  /**
   * Lấy chi tiết một thiết bị kèm đầy đủ quan hệ và lịch sử bảo trì
   */
  async getDeviceById(id) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${id}]`);
    }

    // Lấy danh sách các phiếu bảo trì và lịch sử xử lý
    const maintenanceHistory = await deviceRepository.findMaintenanceHistory(id);

    return {
      ...device,
      maintenanceHistory,
    };
  }

  /**
   * Tìm kiếm thiết bị trực tiếp bằng mã QR Token khi quét camera
   */
  async getDeviceByQrToken(qrToken) {
    if (!qrToken || qrToken.trim() === '') {
      throw new BadRequestError('Mã QR Token không được để trống');
    }

    const device = await deviceRepository.findByQrToken(qrToken.trim());
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị tương ứng với mã QR Token: [${qrToken}]`);
    }

    const maintenanceHistory = await deviceRepository.findMaintenanceHistory(device.id);

    return {
      ...device,
      maintenanceHistory,
    };
  }

  /**
   * Tạo thiết bị mới kèm tự động sinh mã QR Token duy nhất
   */
  async createDevice(data) {
    const {
      code,
      name,
      deviceTypeId,
      locationId,
      departmentId,
      supplierId,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      warrantyStart,
      warrantyEnd,
      status,
      description,
      qrToken,
    } = data;

    // 1. Kiểm tra trùng lặp mã thiết bị code
    const existingCode = await deviceRepository.findByCode(code.trim().toUpperCase());
    if (existingCode) {
      throw new ConflictError(`Mã thiết bị "${code}" đã tồn tại trong hệ thống`);
    }

    // 2. Tự động sinh mã QR Token nếu chưa có
    const generatedToken = qrToken && qrToken.trim() !== ''
      ? qrToken.trim()
      : QRCodeUtil.generateDeviceToken(code.trim().toUpperCase());

    // 3. Kiểm tra trùng lặp mã QR Token
    const existingToken = await deviceRepository.findByQrToken(generatedToken);
    if (existingToken) {
      throw new ConflictError(`Mã QR Token "${generatedToken}" đã bị trùng lặp`);
    }

    // 4. Lưu vào CSDL MySQL
    const newDeviceId = await deviceRepository.create({
      code,
      name,
      deviceTypeId,
      locationId,
      departmentId,
      supplierId,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      warrantyStart,
      warrantyEnd,
      status: status || 'ACTIVE',
      description,
      qrToken: generatedToken,
    });

    logger.info(`[Device Management] Đã thêm mới thiết bị ID [${newDeviceId}], Mã [${code}], QR [${generatedToken}]`);

    return this.getDeviceById(newDeviceId);
  }

  /**
   * Cập nhật thông tin thiết bị
   */
  async updateDevice(id, data) {
    const existing = await deviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${id}]`);
    }

    await deviceRepository.update(id, data);
    logger.info(`[Device Management] Đã cập nhật thiết bị ID [${id}]`);

    return this.getDeviceById(id);
  }

  /**
   * Cập nhật nhanh trạng thái thiết bị (ACTIVE, MAINTENANCE, BROKEN, RETIRED)
   */
  async updateDeviceStatus(id, status) {
    const existing = await deviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${id}]`);
    }

    await deviceRepository.updateStatus(id, status);
    logger.info(`[Device Management] Đã cập nhật trạng thái thiết bị [${existing.code}] sang [${status}]`);

    return {
      id: existing.id,
      code: existing.code,
      name: existing.name,
      status,
      message: `Đã cập nhật trạng thái thiết bị thành ${status}`,
    };
  }

  /**
   * Xóa thiết bị hoặc chuyển sang RETIRED nếu đã có lịch sử bảo trì
   * Ràng buộc nghiệp vụ: "Không cho xóa thiết bị đã có lịch sử bảo trì. Thay vào đó chuyển sang RETIRED."
   */
  async deleteDevice(id) {
    const existing = await deviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${id}]`);
    }

    // Đếm số lượng phiếu bảo trì liên quan
    const requestCount = await deviceRepository.countMaintenanceRequests(id);

    if (requestCount > 0) {
      // Chuyển sang trạng thái RETIRED thay vì xóa cứng
      await deviceRepository.updateStatus(id, 'RETIRED');
      logger.warn(`[Device Management] Thiết bị [${existing.code}] có ${requestCount} phiếu sự cố -> Chuyển sang RETIRED thay vì xóa.`);

      return {
        success: true,
        retired: true,
        id: existing.id,
        code: existing.code,
        message: `Thiết bị "${existing.name}" (${existing.code}) đã phát sinh ${requestCount} phiếu yêu cầu bảo trì trong quá khứ nên không thể xóa vĩnh viễn. Hệ thống đã tự động chuyển trạng thái thiết bị sang Đã thanh lý (RETIRED).`,
      };
    }

    // Nếu chưa từng phát sinh sự cố bảo trì nào -> Cho phép xóa hoàn toàn
    await deviceRepository.delete(id);
    logger.info(`[Device Management] Đã xóa hoàn toàn thiết bị ID [${id}] (${existing.code}) khỏi hệ thống`);

    return {
      success: true,
      retired: false,
      id: existing.id,
      code: existing.code,
      message: `Đã xóa thiết bị "${existing.name}" (${existing.code}) thành công.`,
    };
  }

  /**
   * Lấy toàn bộ danh mục phục vụ bộ lọc và form thêm/sửa thiết bị
   */
  async getMasterDataForDevice() {
    const [buildings, locationsRes, departments, deviceTypes, suppliers] = await Promise.all([
      buildingRepository.findAll(),
      locationRepository.findAll({ limit: 500 }),
      departmentRepository.findAll(),
      deviceTypeRepository.findAll(),
      supplierRepository.findAll(),
    ]);

    return {
      buildings,
      locations: locationsRes.locations || [],
      departments,
      deviceTypes,
      suppliers,
    };
  }

  /**
   * Lấy dữ liệu mã QR Code và đường dẫn quét URL cho thiết bị (Admin/Manager)
   */
  async getDeviceQrData(id) {
    const device = await deviceRepository.findById(id);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${id}]`);
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const qrUrl = `${clientUrl}/device/${device.qr_token}`;
    const qrDataUrl = await QRCodeUtil.generateDataURL(qrUrl);

    return {
      deviceId: device.id,
      code: device.code,
      name: device.name,
      qrToken: device.qr_token,
      qrUrl,
      qrDataUrl,
      roomName: device.room_name,
      buildingName: device.building_name,
      deviceTypeName: device.device_type_name,
      status: device.status,
    };
  }

  /**
   * Lấy thông tin công khai (Public) của thiết bị cho trang quét QR Code
   */
  async getPublicDeviceByQr(qrToken) {
    if (!qrToken || qrToken.trim() === '') {
      throw new BadRequestError('Mã QR Token không được để trống');
    }

    const device = await deviceRepository.findPublicByQrToken(qrToken.trim());
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị ứng với mã QR: [${qrToken}]`);
    }

    const lastMaintenance = await deviceRepository.findLastMaintenance(device.id);

    return {
      ...device,
      lastMaintenance,
    };
  }

  /**
   * Phân tích tình trạng sức khỏe thiết bị & Tính điểm Asset Health Score (0 - 100) (MODULE 14)
   * Sử dụng thuật toán quy tắc định lượng (Rule-Based Analytics Engine)
   */
  async getAssetHealthAnalytics(id) {
    const rawData = await deviceRepository.getAssetHealthData(id);
    if (!rawData) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${id}]`);
    }

    const { device, maintStat, schedStat } = rawData;

    // 1. Số lần hỏng (Incident / Failure Count)
    const incidentCount = Number(maintStat.total_incidents || 0);

    // 2. Số lần bảo trì (Maintenance Count)
    const completedRepairs = Number(maintStat.completed_repairs || 0);
    const completedSchedules = Number(schedStat.completed_schedules || 0);
    const maintenanceCount = completedRepairs + completedSchedules;

    // 3. Tổng chi phí sửa chữa (Total Repair Cost)
    const totalRepairCost = Number(maintStat.total_repair_cost || 0);

    // 4. Thời gian ngừng hoạt động (Downtime Hours)
    const downtimeHours = Number(maintStat.total_downtime_hours || 0);

    // 5. Tuổi thiết bị (Asset Age)
    const ageMonths = Math.max(1, Number(device.age_months || 1));
    const ageYears = Number((ageMonths / 12.0).toFixed(1));
    const ageText = ageYears >= 1 ? `${ageYears} năm (${ageMonths} tháng)` : `${ageMonths} tháng`;

    // 6. Chi phí sửa chữa trung bình (Average Repair Cost)
    const avgRepairCost = incidentCount > 0 ? Math.round(totalRepairCost / incidentCount) : 0;

    // 7. Tần suất sự cố (Incident Frequency per Year)
    const incidentFrequencyPerYear = ageYears > 0 ? Number((incidentCount / ageYears).toFixed(2)) : incidentCount;

    // --- RULE-BASED SCORING ENGINE (Asset Health Score: 0 - 100) ---
    let score = 100;
    const deductions = [];

    // Tiêu chí 1: Tần suất hỏng hóc & Sự cố khẩn cấp (Trừ tối đa 35 điểm)
    const urgentCount = Number(maintStat.urgent_incidents || 0);
    const highCount = Number(maintStat.high_incidents || 0);
    const failureDeduction = Math.min(35, incidentCount * 6 + urgentCount * 5 + highCount * 2);
    if (failureDeduction > 0) {
      score -= failureDeduction;
      deductions.push({
        factor: 'Tần suất sự cố hỏng hóc',
        points: -failureDeduction,
        detail: `${incidentCount} lần sự cố (${urgentCount} lần khẩn cấp URGENT, ${highCount} lần mức HIGH)`,
      });
    }

    // Tiêu chí 2: Chi phí sửa chữa so với giá trị mua (Trừ tối đa 25 điểm)
    const purchasePrice = Number(device.purchase_price || 0);
    let costRatio = 0;
    let costDeduction = 0;
    if (purchasePrice > 0) {
      costRatio = totalRepairCost / purchasePrice;
      if (costRatio >= 0.5) costDeduction = 25;
      else if (costRatio >= 0.3) costDeduction = 15;
      else if (costRatio >= 0.1) costDeduction = 8;
    } else {
      if (totalRepairCost > 5000000) costDeduction = 20;
      else if (totalRepairCost > 2000000) costDeduction = 10;
      else if (totalRepairCost > 500000) costDeduction = 5;
    }
    if (costDeduction > 0) {
      score -= costDeduction;
      deductions.push({
        factor: 'Tỷ lệ chi phí sửa chữa / Giá trị máy',
        points: -costDeduction,
        detail: purchasePrice > 0
          ? `${(costRatio * 100).toFixed(1)}% giá trị mua ban đầu (${totalRepairCost.toLocaleString('vi-VN')} đ / ${purchasePrice.toLocaleString('vi-VN')} đ)`
          : `Tổng chi phí đã phát sinh ${totalRepairCost.toLocaleString('vi-VN')} đ`,
      });
    }

    // Tiêu chí 3: Tuổi thọ & Khấu hao thời gian (Trừ tối đa 20 điểm)
    let ageDeduction = 0;
    if (ageYears >= 5) ageDeduction = 20;
    else if (ageYears >= 3) ageDeduction = 12;
    else if (ageYears >= 1) ageDeduction = 5;
    if (ageDeduction > 0) {
      score -= ageDeduction;
      deductions.push({
        factor: 'Thời gian vận hành & Khấu hao thiết bị',
        points: -ageDeduction,
        detail: `Đã đưa vào sử dụng ${ageText}`,
      });
    }

    // Tiêu chí 4: Tình trạng vận hành & Lịch bảo dưỡng (Trừ tối đa 20 điểm)
    let statusDeduction = 0;
    if (device.status === 'BROKEN') statusDeduction += 20;
    else if (device.status === 'MAINTENANCE') statusDeduction += 10;
    else if (device.status === 'RETIRED') statusDeduction += 30;

    const overdueSchedules = Number(schedStat.overdue_schedules || 0);
    if (overdueSchedules > 0) statusDeduction += Math.min(15, overdueSchedules * 8);

    const isWarrantyExpired = device.warranty_end && new Date(device.warranty_end) < new Date();
    if (isWarrantyExpired) statusDeduction += 5;

    if (statusDeduction > 0) {
      score -= statusDeduction;
      deductions.push({
        factor: 'Trạng thái hoạt động & Lịch bảo dưỡng',
        points: -statusDeduction,
        detail: `Trạng thái: ${device.status}${overdueSchedules > 0 ? `, ${overdueSchedules} lịch bảo trì quá hạn` : ''}${isWarrantyExpired ? ', Đã hết hạn bảo hành' : ''}`,
      });
    }

    // Điểm số cuối cùng từ 0 - 100
    const healthScore = Math.max(0, Math.min(100, Math.round(score)));

    // Phân loại sức khỏe thiết bị (Health Rating)
    let healthRating = 'GOOD';
    let ratingLabel = 'TỐT';
    let ratingColor = 'emerald';
    let recommendation = 'Thiết bị hoạt động ổn định, độ tin cậy cao. Tiếp tục duy trì quy trình vận hành và lịch bảo dưỡng định kỳ.';

    if (healthScore >= 80) {
      healthRating = 'GOOD';
      ratingLabel = 'TỐT';
      ratingColor = 'emerald';
      recommendation = 'Thiết bị hoạt động ổn định, độ tin cậy cao. Tiếp tục duy trì quy trình vận hành và lịch bảo dưỡng định kỳ.';
    } else if (healthScore >= 60) {
      healthRating = 'WARNING';
      ratingLabel = 'CẦN LƯU Ý';
      ratingColor = 'amber';
      recommendation = 'Thiết bị có dấu hiệu hao mòn hoặc tần suất hỏng nhẹ. Cần tăng cường kiểm tra định kỳ và vệ sinh bảo dưỡng.';
    } else if (healthScore >= 40) {
      healthRating = 'RISK';
      ratingLabel = 'NGUY CƠ CAO';
      ratingColor = 'orange';
      recommendation = 'Thiết bị hỏng hóc thường xuyên hoặc chi phí sửa chữa cao. Cần kiểm tra chuyên sâu, thay thế linh kiện hao mòn trọng yếu.';
    } else {
      healthRating = 'CRITICAL';
      ratingLabel = 'NGHIÊM TRỌNG';
      ratingColor = 'rose';
      recommendation = 'Thiết bị xuống cấp nghiêm trọng hoặc chi phí sửa chữa vượt ngưỡng kinh tế. Đề xuất lập hội đồng thẩm định thanh lý hoặc thay thế mới.';
    }

    return {
      deviceId: device.id,
      deviceCode: device.code,
      deviceName: device.name,
      deviceStatus: device.status,
      // 7 Core Metrics
      metrics: {
        incidentCount,
        maintenanceCount,
        totalRepairCost,
        downtimeHours,
        assetAgeMonths: ageMonths,
        assetAgeYears: ageYears,
        assetAgeText: ageText,
        avgRepairCost,
        incidentFrequencyPerYear,
      },
      // Health Score & Rating
      healthScore,
      healthRating,
      ratingLabel,
      ratingColor,
      recommendation,
      deductions,
      lastEvaluatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new DeviceService();
