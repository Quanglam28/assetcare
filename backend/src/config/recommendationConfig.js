/**
 * Cấu hình 8 Quy Tắc Chuyên Gia Khuyến Nghị Quyết Định Bảo Trì Thiết Bị (Recommendation Engine)
 * Rule-Based Decision Support System (Phase 3 - Version 1.0)
 */

module.exports = {
  VERSION: 'v1.0',

  RULES: {
    // RULE 1: Failure Risk >= 80 -> Khẩn cấp
    RULE_1_CRITICAL_MAINTENANCE: {
      id: 'CRITICAL_MAINTENANCE',
      severity: 'CRITICAL',
      title: 'Bảo trì khẩn cấp (Emergency Maintenance)',
      action: 'Tạo phiếu lệnh công tác sửa chữa khẩn cấp',
      daysToDeadline: 1,
      match: (metrics) => metrics.riskScore >= 80,
      generate: (metrics) => ({
        reason: `Failure Risk đạt mức nguy cấp (${metrics.riskScore}/100) với tần suất sự cố cao (${metrics.failures30d || 0} vụ trong 30 ngày). Cần can thiệp kỹ thuật ngay lập tức.`,
        sourceFactors: ['failure_risk', 'recent_failures'],
      }),
    },

    // RULE 2: Risk >= 60 AND Maintenance Overdue > 30d
    RULE_2_OVERDUE_MAINTENANCE: {
      id: 'OVERDUE_MAINTENANCE',
      severity: 'HIGH',
      title: 'Bảo dưỡng định kỳ quá hạn',
      action: 'Thực hiện bảo dưỡng định kỳ ngay',
      daysToDeadline: 3,
      match: (metrics) => metrics.riskScore >= 60 && metrics.overdueDays > 30,
      generate: (metrics) => ({
        reason: `Lịch bảo dưỡng định kỳ đã quá hạn ${metrics.overdueDays} ngày kết hợp nguy cơ rủi ro cao (${metrics.riskScore}/100).`,
        sourceFactors: ['maintenance_overdue', 'failure_risk'],
      }),
    },

    // RULE 3: Chi phí sửa chữa tích lũy >= 60% nguyên giá mua
    RULE_3_REPLACEMENT_REVIEW: {
      id: 'REPLACEMENT_REVIEW',
      severity: 'HIGH',
      title: 'Đánh giá phương án thay thế thiết bị',
      action: 'Lập tờ trình thẩm định thay thế hoặc thanh lý',
      daysToDeadline: 14,
      match: (metrics) => metrics.repairCostRatio >= 0.60,
      generate: (metrics) => ({
        reason: `Chi phí sửa chữa tích lũy đã chiếm ${Math.round(metrics.repairCostRatio * 100)}% nguyên giá ban đầu (Chi phí: ${metrics.totalRepairCost.toLocaleString('vi-VN')} đ / Nguyên giá: ${metrics.purchasePrice.toLocaleString('vi-VN')} đ). Cần đánh giá hiệu quả kinh tế so với đầu tư mới.`,
        sourceFactors: ['repair_cost_ratio', 'total_repair_cost', 'purchase_price'],
      }),
    },

    // RULE 4: Số lần sự cố 30d >= 3 (Sự cố tái diễn dồn dập)
    RULE_4_RECURRENT_FAILURE: {
      id: 'RECURRENT_FAILURE',
      severity: 'HIGH',
      title: 'Kiểm tra nguyên nhân gốc rễ sự cố lặp lại',
      action: 'Chẩn đoán toàn diện hệ thống / Root Cause Analysis',
      daysToDeadline: 5,
      match: (metrics) => metrics.failures30d >= 3,
      generate: (metrics) => ({
        reason: `Thiết bị phát sinh ${metrics.failures30d} sự cố trong 30 ngày qua (Xu hướng ${metrics.failureTrendPercent > 0 ? '+' : ''}${metrics.failureTrendPercent}%). Cần kỹ sư chuyên môn tìm nguyên nhân gốc rễ.`,
        sourceFactors: ['failure_frequency_30d', 'failure_trend'],
      }),
    },

    // RULE 5: Downtime 30d > 72 giờ
    RULE_5_HIGH_DOWNTIME: {
      id: 'HIGH_DOWNTIME',
      severity: 'MEDIUM',
      title: 'Khắc phục thời gian ngừng máy kéo dài',
      action: 'Rà soát quy trình sửa chữa và cung ứng linh kiện',
      daysToDeadline: 7,
      match: (metrics) => metrics.downtime30d > 72,
      generate: (metrics) => ({
        reason: `Tổng thời gian ngừng máy trong 30 ngày đạt ${metrics.downtime30d} giờ, gây gián đoạn công tác đào tạo/nghiên cứu.`,
        sourceFactors: ['downtime_30d'],
      }),
    },

    // RULE 6: Tuổi đời > 5 năm AND Risk >= 60
    RULE_6_END_OF_LIFE_REVIEW: {
      id: 'END_OF_LIFE_REVIEW',
      severity: 'MEDIUM',
      title: 'Đánh giá khấu hao hết vòng đời kinh tế (End of Life)',
      action: 'Kiểm định hao mòn kỹ thuật và xây dựng kế hoạch nâng cấp',
      daysToDeadline: 30,
      match: (metrics) => metrics.ageYears > 5 && metrics.riskScore >= 60,
      generate: (metrics) => ({
        reason: `Thiết bị đã vận hành ${metrics.ageYears.toFixed(1)} năm (> 5 năm) và xuất hiện xu hướng rủi ro gia tăng (${metrics.riskScore}/100).`,
        sourceFactors: ['asset_age', 'failure_risk'],
      }),
    },

    // RULE 7: Health Score < 40 AND Risk >= 80 (Tình trạng báo động đỏ)
    RULE_7_IMMEDIATE_INTERVENTION: {
      id: 'IMMEDIATE_INTERVENTION',
      severity: 'CRITICAL',
      title: 'Can thiệp kỹ thuật khẩn cấp',
      action: 'Tạm dừng vận hành và đại tu toàn diện thiết bị',
      daysToDeadline: 1,
      match: (metrics) => metrics.healthScore < 40 && metrics.riskScore >= 80,
      generate: (metrics) => ({
        reason: `Thiết bị ở mức báo động đỏ: Điểm sức khỏe tụt xuống ${metrics.healthScore}/100 trong khi Nguy cơ sự cố đạt ${metrics.riskScore}/100.`,
        sourceFactors: ['health_score', 'failure_risk'],
      }),
    },

    // RULE 8: Health >= 80 AND Risk < 30 (Vận hành tối ưu)
    RULE_8_NORMAL_MONITORING: {
      id: 'NORMAL_MONITORING',
      severity: 'LOW',
      title: 'Duy trì theo dõi vận hành tiêu chuẩn',
      action: 'Tiếp tục vận hành và thực hiện bảo dưỡng theo lịch',
      daysToDeadline: 90,
      match: (metrics) => metrics.healthScore >= 80 && metrics.riskScore < 30,
      generate: (metrics) => ({
        reason: `Thiết bị đang vận hành ở trạng thái tối ưu (Sức khỏe: ${metrics.healthScore}/100, Rủi ro: ${metrics.riskScore}/100).`,
        sourceFactors: ['health_score', 'failure_risk'],
      }),
    },
  },
};
