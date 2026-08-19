/**
 * Abstract Class: RiskAssessmentProvider
 * Kiến trúc trừu tượng cho phép thay thế hoặc mở rộng thuật toán đánh giá rủi ro
 * (Hiện tại: RuleBasedRiskProvider, Tương lai: MLRiskProvider)
 */

class RiskAssessmentProvider {
  /**
   * Tên định danh của Provider
   */
  getProviderName() {
    throw new Error('Method getProviderName() must be implemented');
  }

  /**
   * Phiên bản thuật toán
   */
  getVersion() {
    throw new Error('Method getVersion() must be implemented');
  }

  /**
   * Đánh giá nguy cơ sự cố và sinh điểm rủi ro
   * @param {Object} context - Dữ liệu thiết bị, lịch sử sự cố, chi phí, lịch bảo trì
   * @returns {Promise<Object>} Kết quả đánh giá rủi ro
   */
  async assessRisk(context) {
    throw new Error('Method assessRisk(context) must be implemented');
  }
}

module.exports = RiskAssessmentProvider;
