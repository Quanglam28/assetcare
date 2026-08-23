const { pool } = require('../config/db');
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

  /**
   * Lấy Timeline lịch sử hoạt động toàn diện của thiết bị (Device Activity Timeline)
   * Tổng hợp đa nguồn: Thiết bị tạo, Báo hỏng, Phân công, Lệnh công tác, Xử lý, Hoàn thành, Nghiệm thu, Audit
   */
  async getDeviceTimeline(deviceId, query = {}) {
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thiết bị với ID [${deviceId}]`);
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
    const filterType = query.type || null;

    const events = [];

    // 1. Sự kiện Thiết bị được khởi tạo vào hệ thống
    const createdTimestamp = device.created_at || device.purchase_date;
    if (createdTimestamp) {
      events.push({
        id: `dev-created-${device.id}`,
        eventType: 'DEVICE_CREATED',
        category: 'LIFECYCLE',
        title: `Tiếp nhận thiết bị [${device.code}]`,
        description: `Thiết bị "${device.name}" được khởi tạo vào hệ thống. Model: ${device.model || 'N/A'}, Serial: ${device.serial_number || 'N/A'}.`,
        timestamp: createdTimestamp,
        actor: { name: 'Hệ thống', role: 'SYSTEM' },
        status: device.status,
        badgeColor: 'emerald',
        cost: device.purchase_price ? Number(device.purchase_price) : 0,
        metadata: {
          purchaseDate: device.purchase_date,
          warrantyEnd: device.warranty_end,
          purchasePrice: device.purchase_price,
          roomName: device.room_name,
          buildingName: device.building_name,
        },
      });
    }

    // 2. Lấy các sự kiện từ Phiếu báo hỏng (Maintenance Requests)
    const [requestRows] = await pool.execute(`
      SELECT mr.id, mr.code, mr.title, mr.description, mr.priority, mr.status,
             mr.created_at, mr.assigned_at, mr.started_at, mr.completed_at, mr.closed_at,
             mr.actual_cost, mr.root_cause, mr.resolution,
             u.full_name AS reporter_name, r.code AS reporter_role,
             tech.full_name AS technician_name, tech_r.code AS technician_role
      FROM maintenance_requests mr
      JOIN users u ON mr.reporter_id = u.id
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN users tech ON mr.technician_id = tech.id
      LEFT JOIN roles tech_r ON tech.role_id = tech_r.id
      WHERE mr.device_id = ?
    `, [deviceId]);

    for (const mr of requestRows) {
      // 2.1. Sự kiện báo hỏng
      events.push({
        id: `mr-reported-${mr.id}`,
        eventType: 'INCIDENT_REPORTED',
        category: 'INCIDENT',
        title: `Báo hỏng sự cố [${mr.code}]`,
        description: mr.title + (mr.description ? ` - ${mr.description}` : ''),
        timestamp: mr.created_at,
        actor: { name: mr.reporter_name, role: mr.reporter_role },
        status: 'PENDING',
        priority: mr.priority,
        badgeColor: 'rose',
        metadata: { requestId: mr.id, requestCode: mr.code, priority: mr.priority },
      });

      // 2.2. Sự kiện phân công KTV
      if (mr.assigned_at && mr.technician_name) {
        events.push({
          id: `mr-assigned-${mr.id}`,
          eventType: 'INCIDENT_ASSIGNED',
          category: 'MAINTENANCE',
          title: `Phân công Kỹ thuật viên [${mr.code}]`,
          description: `Giao xử lý cho Kỹ thuật viên: ${mr.technician_name}.`,
          timestamp: mr.assigned_at,
          actor: { name: 'Ban Quản Lý', role: 'MANAGER' },
          status: 'ASSIGNED',
          badgeColor: 'sky',
          metadata: { requestId: mr.id, requestCode: mr.code, technician: mr.technician_name },
        });
      }

      // 2.3. Sự kiện bắt đầu xử lý
      if (mr.started_at) {
        events.push({
          id: `mr-started-${mr.id}`,
          eventType: 'MAINTENANCE_STARTED',
          category: 'MAINTENANCE',
          title: `Bắt đầu sửa chữa [${mr.code}]`,
          description: `KTV ${mr.technician_name || ''} đã tiếp nhận tại hiện trường và tiến hành kiểm tra sửa chữa.`,
          timestamp: mr.started_at,
          actor: { name: mr.technician_name || 'Kỹ thuật viên', role: mr.technician_role || 'TECHNICIAN' },
          status: 'IN_PROGRESS',
          badgeColor: 'blue',
          metadata: { requestId: mr.id, requestCode: mr.code },
        });
      }

      // 2.4. Sự kiện hoàn tất sửa chữa
      if (mr.completed_at) {
        events.push({
          id: `mr-completed-${mr.id}`,
          eventType: 'MAINTENANCE_COMPLETED',
          category: 'MAINTENANCE',
          title: `Hoàn tất sửa chữa [${mr.code}]`,
          description: (mr.resolution ? `Giải pháp: ${mr.resolution}. ` : '') + (mr.root_cause ? `Nguyên nhân: ${mr.root_cause}.` : ''),
          timestamp: mr.completed_at,
          actor: { name: mr.technician_name || 'Kỹ thuật viên', role: mr.technician_role || 'TECHNICIAN' },
          status: 'COMPLETED',
          badgeColor: 'indigo',
          cost: mr.actual_cost ? Number(mr.actual_cost) : 0,
          metadata: { requestId: mr.id, requestCode: mr.code, actualCost: mr.actual_cost, rootCause: mr.root_cause, resolution: mr.resolution },
        });
      }

      // 2.5. Sự kiện nghiệm thu và đóng phiếu
      if (mr.closed_at) {
        events.push({
          id: `mr-closed-${mr.id}`,
          eventType: 'USER_ACCEPTED',
          category: 'MAINTENANCE',
          title: `Nghiệm thu đạt & Đóng phiếu [${mr.code}]`,
          description: `Người báo (${mr.reporter_name}) đã kiểm tra hiện trường, xác nhận thiết bị hoạt động tốt và đóng phiếu thành công.`,
          timestamp: mr.closed_at,
          actor: { name: mr.reporter_name, role: mr.reporter_role },
          status: 'CLOSED',
          badgeColor: 'emerald',
          metadata: { requestId: mr.id, requestCode: mr.code },
        });
      }
    }

    // 3. Lấy các sự kiện Lệnh công tác (Maintenance Work Orders)
    const [workOrderRows] = await pool.execute(`
      SELECT mwo.id, mwo.work_order_code, mwo.title, mwo.description, mwo.status, mwo.priority,
             mwo.created_at, mwo.scheduled_at, mwo.actual_cost,
             u.full_name AS technician_name, r.code AS technician_role
      FROM maintenance_work_orders mwo
      LEFT JOIN users u ON mwo.assigned_to = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE mwo.device_id = ?
    `, [deviceId]);

    for (const wo of workOrderRows) {
      events.push({
        id: `wo-created-${wo.id}`,
        eventType: 'WORK_ORDER_CREATED',
        category: 'WORK_ORDER',
        title: `Phát hành Lệnh công tác [${wo.work_order_code}]`,
        description: `${wo.title} - Phân công: ${wo.technician_name || 'Chưa chỉ định'}.`,
        timestamp: wo.created_at,
        actor: { name: 'Ban Quản Lý', role: 'MANAGER' },
        status: wo.status,
        priority: wo.priority,
        badgeColor: 'purple',
        cost: wo.actual_cost ? Number(wo.actual_cost) : 0,
        metadata: { workOrderId: wo.id, workOrderCode: wo.work_order_code, status: wo.status },
      });
    }

    // 4. Lấy các sự kiện chuyển đổi trạng thái đặc biệt từ Maintenance Histories (Waiting part, Resume...)
    const [historyRows] = await pool.execute(`
      SELECT mh.id, mh.action, mh.from_status, mh.to_status, mh.notes, mh.cost, mh.created_at,
             u.full_name AS actor_name, r.code AS actor_role, mr.code AS request_code
      FROM maintenance_histories mh
      JOIN maintenance_requests mr ON mh.request_id = mr.id
      LEFT JOIN users u ON mh.actor_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE mr.device_id = ? AND mh.action IN ('WAITING_PART', 'TẠM DỪNG CHỜ LINH KIỆN', 'RESUME', 'TIẾP TỤC XỬ LÝ', 'REOPEN', 'MỞ LẠI YÊU CẦU')
    `, [deviceId]);

    for (const h of historyRows) {
      const isWait = h.action.includes('WAITING_PART') || h.action.includes('TẠM DỪNG');
      events.push({
        id: `mh-${h.id}`,
        eventType: isWait ? 'WAITING_PART' : 'STATUS_CHANGED',
        category: 'MAINTENANCE',
        title: isWait ? `Tạm dừng chờ linh kiện [${h.request_code}]` : `${h.action} [${h.request_code}]`,
        description: h.notes || `Chuyển trạng thái từ ${h.from_status} sang ${h.to_status}.`,
        timestamp: h.created_at,
        actor: { name: h.actor_name || 'Hệ thống', role: h.actor_role || 'STAFF' },
        status: h.to_status,
        badgeColor: isWait ? 'amber' : 'blue',
        metadata: { historyId: h.id, requestCode: h.request_code, fromStatus: h.from_status, toStatus: h.to_status },
      });
    }

    // 5. Lấy các sự kiện thay đổi trạng thái từ Audit Logs
    const [auditRows] = await pool.execute(`
      SELECT al.id, al.action, al.old_values, al.new_values, al.created_at,
             u.full_name AS actor_name, r.code AS actor_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE al.entity_type = 'DEVICE' AND al.entity_id = ? AND al.action IN ('UPDATE_STATUS', 'UPDATE_DEVICE')
    `, [deviceId]);

    for (const a of auditRows) {
      let desc = 'Cập nhật thông tin hồ sơ thiết bị';
      if (a.action === 'UPDATE_STATUS') {
        desc = `Thay đổi trạng thái vận hành thiết bị`;
      }
      events.push({
        id: `audit-${a.id}`,
        eventType: 'STATUS_CHANGED',
        category: 'AUDIT',
        title: `Cập nhật hồ sơ thiết bị`,
        description: desc,
        timestamp: a.created_at,
        actor: { name: a.actor_name || 'Quản trị viên', role: a.actor_role || 'ADMIN' },
        status: device.status,
        badgeColor: 'slate',
        metadata: { auditId: a.id, action: a.action },
      });
    }

    // Lọc theo loại nếu có yêu cầu
    let filteredEvents = events;
    if (filterType && filterType !== 'ALL') {
      filteredEvents = events.filter(e => e.category === filterType || e.eventType === filterType);
    }

    // Sắp xếp giảm dần theo mốc thời gian thực tế
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = filteredEvents.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const pagedTimeline = filteredEvents.slice(startIndex, startIndex + limit);

    return {
      deviceId: device.id,
      deviceCode: device.code,
      deviceName: device.name,
      page,
      limit,
      total,
      totalPages,
      timeline: pagedTimeline,
    };
  }
}

module.exports = new DeviceService();
