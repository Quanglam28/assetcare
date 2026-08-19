const dashboardRepository = require('../repositories/dashboardRepository');

/**
 * Service Xử lý Bảng Điều Khiển Tổng Hợp & Phân Tích Chuyên Sâu (Management Dashboard)
 */
class DashboardService {
  /**
   * Lấy 8 thẻ KPI thống kê tổng quan
   */
  async getOverviewStats(filters) {
    return dashboardRepository.getOverviewStats(filters);
  }

  /**
   * Lấy dữ liệu cho toàn bộ 8 biểu đồ phân tích chuyên sâu
   */
  async getAllChartsData(filters) {
    const [
      requestsByMonth,
      requestsByStatus,
      requestsByPriority,
      devicesByType,
      devicesByBuilding,
      costByMonth,
      topDevices,
      topLocations,
    ] = await Promise.all([
      dashboardRepository.getRequestsByMonth(filters),
      dashboardRepository.getRequestsByStatus(filters),
      dashboardRepository.getRequestsByPriority(filters),
      dashboardRepository.getDevicesByType(filters),
      dashboardRepository.getDevicesByBuilding(filters),
      dashboardRepository.getMaintenanceCostByMonth(filters),
      dashboardRepository.getTopDevicesWithIncidents(filters, 10),
      dashboardRepository.getTopLocationsWithIncidents(filters, 10),
    ]);

    return {
      requestsByMonth,
      requestsByStatus,
      requestsByPriority,
      devicesByType,
      devicesByBuilding,
      costByMonth,
      topDevices,
      topLocations,
    };
  }

  /**
   * Lấy số liệu phân tích tuân thủ cam kết SLA
   */
  async getSlaComplianceStats(filters) {
    return dashboardRepository.getSlaComplianceStats(filters);
  }

  /**
   * Lấy danh sách options cho bộ lọc đa chiều
   */
  async getFilterOptions() {
    return dashboardRepository.getFilterOptions();
  }

  /**
   * Lấy phân tích sức khỏe & rủi ro toàn hệ thống phục vụ Dashboard
   */
  async getHealthRiskAnalytics() {
    const healthRepository = require('../repositories/healthRepository');
    const [distribution, riskSummary, topAtRisk] = await Promise.all([
      healthRepository.findHealthDistribution(),
      healthRepository.findMaintenanceRiskSummary(),
      healthRepository.findTopAtRiskDevices(10),
    ]);

    return {
      distribution,
      riskSummary,
      topAtRisk,
    };
  }
}

module.exports = new DashboardService();
