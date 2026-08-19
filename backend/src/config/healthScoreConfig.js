/**
 * Cấu hình định lượng trọng số và ngưỡng đánh giá sức khỏe & nguy cơ thiết bị
 * Rule-Based Asset Health & Maintenance Risk Engine (Version 1.0)
 */

module.exports = {
  VERSION: 'v1.0',

  // ---------------------------------------------------------------------------
  // 1. CẤU HÌNH TRỌNG SỐ ASSET HEALTH SCORE (Tổng = 100%)
  // ---------------------------------------------------------------------------
  HEALTH_WEIGHTS: {
    AGE: 0.20,              // Tuổi thọ thiết bị (20%)
    FAILURE_FREQUENCY: 0.25,// Tần suất sự cố hỏng (25%)
    MAINTENANCE: 0.15,      // Tuân thủ bảo dưỡng định kỳ (15%)
    REPAIR_COST: 0.20,      // Chi phí sửa chữa / Nguyên giá mua (20%)
    DOWNTIME: 0.10,         // Thời gian gián đoạn ngừng máy (10%)
    WARRANTY: 0.10,         // Tình trạng thời hạn bảo hành (10%)
  },

  // ---------------------------------------------------------------------------
  // 2. CẤU HÌNH TRỌNG SỐ FAILURE RISK SCORE (Tổng = 100%)
  // ---------------------------------------------------------------------------
  RISK_WEIGHTS: {
    RECENT_FAILURES: 0.25,      // Tần suất sự cố trong 90 ngày (25%)
    FAILURE_TREND: 0.20,        // Xu hướng gia tăng sự cố so với chu kỳ trước (20%)
    REPAIR_COST_TREND: 0.15,    // Xu hướng gia tăng chi phí sửa chữa (15%)
    AGE_RISK: 0.15,             // Rủi ro từ tuổi thọ và hao mòn máy (15%)
    DOWNTIME_RISK: 0.10,        // Rủi ro từ thời gian ngừng hoạt động (10%)
    MAINTENANCE_OVERDUE: 0.10,  // Rủi ro từ bảo dưỡng định kỳ quá hạn (10%)
    CRITICAL_INCIDENTS: 0.05,   // Rủi ro từ các sự cố khẩn cấp URGENT/HIGH (5%)
  },

  // ---------------------------------------------------------------------------
  // 3. CÁC NGƯỠNG TÍNH TOÁN HEALTH SUB-SCORES (0 - 100)
  // ---------------------------------------------------------------------------
  AGE_THRESHOLDS: [
    { maxYears: 1.0, score: 100 },
    { maxYears: 2.0, score: 90 },
    { maxYears: 3.0, score: 80 },
    { maxYears: 4.0, score: 65 },
    { maxYears: 5.0, score: 45 },
    { maxYears: Infinity, score: 25 },
  ],

  FAILURE_COUNT_THRESHOLDS: [
    { maxFailures: 0, score: 100 },
    { maxFailures: 1, score: 90 },
    { maxFailures: 2, score: 80 },
    { maxFailures: 3, score: 65 },
    { maxFailures: 4, score: 50 },
    { maxFailures: 5, score: 35 },
    { maxFailures: Infinity, score: 20 },
  ],

  REPAIR_COST_RATIO_THRESHOLDS: [
    { maxRatio: 0.10, score: 100 },  // Chi phí sửa < 10% giá trị mua
    { maxRatio: 0.20, score: 85 },
    { maxRatio: 0.40, score: 65 },
    { maxRatio: 0.60, score: 40 },
    { maxRatio: Infinity, score: 20 },
  ],

  DOWNTIME_HOURS_THRESHOLDS: [
    { maxHours: 0, score: 100 },
    { maxHours: 8, score: 90 },
    { maxHours: 24, score: 75 },
    { maxHours: 72, score: 60 },
    { maxHours: 168, score: 40 }, // 7 ngày
    { maxHours: Infinity, score: 20 },
  ],

  MAINTENANCE_OVERDUE_DAYS_THRESHOLDS: [
    { maxDays: 0, score: 100 },
    { maxDays: 7, score: 80 },
    { maxDays: 30, score: 60 },
    { maxDays: 60, score: 40 },
    { maxDays: Infinity, score: 20 },
  ],

  // ---------------------------------------------------------------------------
  // 4. PHÂN LOẠI SỨC KHỎE THIẾT BỊ (HEALTH RATINGS)
  // ---------------------------------------------------------------------------
  HEALTH_STATUS: {
    GOOD: { min: 80, max: 100, label: 'TỐT', color: 'emerald', icon: 'CheckCircle2' },
    FAIR: { min: 60, max: 79.99, label: 'KHÁ / TRUNG BÌNH', color: 'yellow', icon: 'Info' },
    WARNING: { min: 40, max: 59.99, label: 'CẦN LƯU Ý', color: 'amber', icon: 'AlertTriangle' },
    CRITICAL: { min: 0, max: 39.99, label: 'NGHIÊM TRỌNG', color: 'rose', icon: 'ShieldAlert' },
    INSUFFICIENT_DATA: { label: 'CHƯA ĐỦ DỮ LIỆU', color: 'slate', icon: 'HelpCircle' },
  },

  // ---------------------------------------------------------------------------
  // 5. PHÂN LOẠI NGUY CƠ SỰ CỐ (RISK LEVELS)
  // ---------------------------------------------------------------------------
  RISK_LEVELS: {
    VERY_LOW: { min: 0, max: 20, label: 'RẤT THẤP', color: 'emerald' },
    LOW: { min: 20.01, max: 40, label: 'THẤP', color: 'emerald' },
    MEDIUM: { min: 40.01, max: 60, label: 'TRUNG BÌNH', color: 'amber' },
    HIGH: { min: 60.01, max: 80, label: 'CAO', color: 'orange' },
    CRITICAL: { min: 80.01, max: 100, label: 'NGUY CẤP', color: 'rose' },
    UNKNOWN: { label: 'CHƯA XÁC ĐỊNH', color: 'slate' },
  },

  // ---------------------------------------------------------------------------
  // 6. NGƯỠNG ĐỀ XUẤT THAY THẾ (REPLACEMENT INDICATOR)
  // ---------------------------------------------------------------------------
  REPLACEMENT_RULES: {
    REPAIR_COST_RATIO_THRESHOLD: 0.60, // Chi phí sửa chữa vượt 60% giá trị mua
    HEALTH_SCORE_THRESHOLD: 40,        // Health Score < 40
    RISK_SCORE_THRESHOLD: 70,          // Risk Score > 70%
    AGE_YEARS_THRESHOLD: 5.0,          // Tuổi máy > 5 năm
  },
};
