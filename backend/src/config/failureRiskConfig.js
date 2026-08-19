/**
 * Cấu hình định lượng trọng số, ngưỡng và phân loại Nguy Cơ Sự Cố Thiết Bị
 * Rule-Based Failure Risk Engine (Phase 2 - Version 1.0)
 */

module.exports = {
  VERSION: 'v1.0',

  // ---------------------------------------------------------------------------
  // 1. CẤU HÌNH TRỌNG SỐ FAILURE RISK SCORE (Tổng = 100%)
  // ---------------------------------------------------------------------------
  RISK_WEIGHTS: {
    RECENT_FAILURE_FREQUENCY: 0.30, // Tần suất sự cố trong 30 ngày gần nhất (30%)
    FAILURE_TREND: 0.25,            // Xu hướng gia tăng sự cố 30d hiện tại vs 30d trước (25%)
    MAINTENANCE_OVERDUE: 0.15,      // Nguy cơ do bảo dưỡng định kỳ quá hạn (15%)
    REPAIR_COST_TREND: 0.10,        // Xu hướng gia tăng chi phí sửa chữa 90d (10%)
    DOWNTIME_TREND: 0.10,           // Xu hướng thời gian ngừng máy 30d (10%)
    AGE_RISK: 0.10,                 // Rủi ro từ tuổi đời và khấu hao thiết bị (10%)
  },

  // ---------------------------------------------------------------------------
  // 2. KHUNG THỜI GIAN ĐO ĐẠC (TIME WINDOWS)
  // ---------------------------------------------------------------------------
  TIME_WINDOWS: {
    DAYS_7: 7,
    DAYS_30: 30,
    DAYS_90: 90,
    DAYS_365: 365,
  },

  // ---------------------------------------------------------------------------
  // 3. NGƯỠNG TẦN SUẤT SỰ CỐ GẦN ĐÂY (30 NGÀY)
  // ---------------------------------------------------------------------------
  RECENT_FAILURE_THRESHOLDS_30D: [
    { maxCount: 0, score: 10, label: 'Không phát sinh sự cố' },
    { maxCount: 1, score: 30, label: 'Phát sinh 1 sự cố nhỏ' },
    { maxCount: 2, score: 60, label: 'Phát sinh 2 sự cố' },
    { maxCount: 3, score: 80, label: 'Phát sinh 3 sự cố (Tần suất cao)' },
    { maxCount: Infinity, score: 95, label: 'Phát sinh >= 4 sự cố (Tần suất rất cao)' },
  ],

  // ---------------------------------------------------------------------------
  // 4. NGƯỠNG XU HƯỚNG SỰ CỐ (FAILURE TREND: 30D HIỆN TẠI VS 30D TRƯỚC)
  // ---------------------------------------------------------------------------
  FAILURE_TREND_THRESHOLDS: {
    DECREASING_STRONG: { maxDeltaPercent: -50, score: 10, label: 'Giảm mạnh (>50%)' },
    DECREASING_MILD: { maxDeltaPercent: -10, score: 25, label: 'Giảm nhẹ' },
    STABLE: { maxDeltaPercent: 10, score: 40, label: 'Ổn định (±10%)' },
    INCREASING_MILD: { maxDeltaPercent: 50, score: 60, label: 'Tăng nhẹ (+10% đến +50%)' },
    INCREASING_MODERATE: { maxDeltaPercent: 150, score: 75, label: 'Tăng vừa (+50% đến +150%)' },
    INCREASING_STRONG: { score: 90, label: 'Tăng mạnh (> +150%)' },
  },

  // ---------------------------------------------------------------------------
  // 5. NGƯỠNG BẢO DƯỠNG QUÁ HẠN (MAINTENANCE OVERDUE RISK)
  // ---------------------------------------------------------------------------
  MAINTENANCE_OVERDUE_THRESHOLDS: [
    { maxDays: 0, score: 10, label: 'Đúng hạn / Chưa có lịch quá hạn' },
    { maxDays: 7, score: 30, label: 'Quá hạn <= 7 ngày' },
    { maxDays: 30, score: 60, label: 'Quá hạn <= 30 ngày' },
    { maxDays: 60, score: 80, label: 'Quá hạn <= 60 ngày' },
    { maxDays: Infinity, score: 95, label: 'Quá hạn > 60 ngày (Rất nghiêm trọng)' },
  ],

  // ---------------------------------------------------------------------------
  // 6. NGƯỠNG XU HƯỚNG CHI PHÍ SỬA CHỮA (REPAIR COST TREND: 90D)
  // ---------------------------------------------------------------------------
  REPAIR_COST_TREND_THRESHOLDS: {
    DECREASING: { maxDeltaPercent: -10, score: 20, label: 'Chi phí giảm' },
    STABLE: { maxDeltaPercent: 15, score: 35, label: 'Chi phí ổn định' },
    INCREASING_MILD: { maxDeltaPercent: 50, score: 65, label: 'Chi phí tăng nhẹ' },
    INCREASING_MODERATE: { maxDeltaPercent: 150, score: 80, label: 'Chi phí tăng vừa' },
    INCREASING_STRONG: { score: 95, label: 'Chi phí tăng đột biến' },
  },

  // ---------------------------------------------------------------------------
  // 7. NGƯỠNG XU HƯỚNG THỜI GIAN NGỪNG MÁY (DOWNTIME TREND: 30D)
  // ---------------------------------------------------------------------------
  DOWNTIME_TREND_THRESHOLDS: {
    DECREASING: { score: 15, label: 'Thời gian ngừng máy giảm' },
    STABLE: { score: 35, label: 'Thời gian ngừng máy ổn định' },
    INCREASING_MILD: { score: 60, label: 'Thời gian ngừng máy tăng nhẹ' },
    INCREASING_STRONG: { score: 85, label: 'Thời gian ngừng máy tăng mạnh' },
  },

  // ---------------------------------------------------------------------------
  // 8. NGƯỠNG RỦI RO TUỔI ĐỜI THIẾT BỊ (AGE RISK)
  // ---------------------------------------------------------------------------
  AGE_RISK_THRESHOLDS: [
    { maxYears: 1.0, score: 10, label: '<= 1 năm (Mới)' },
    { maxYears: 2.0, score: 20, label: '<= 2 năm' },
    { maxYears: 3.0, score: 35, label: '<= 3 năm' },
    { maxYears: 4.0, score: 50, label: '<= 4 năm' },
    { maxYears: 5.0, score: 70, label: '<= 5 năm' },
    { maxYears: Infinity, score: 90, label: '> 5 năm (Hao mòn lớn)' },
  ],

  // ---------------------------------------------------------------------------
  // 9. PHÂN LOẠI MỨC ĐỘ NGUY CƠ (RISK CLASSIFICATION)
  // ---------------------------------------------------------------------------
  RISK_LEVELS: {
    VERY_LOW: { min: 0, max: 19.99, label: 'RẤT THẤP', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'ShieldCheck' },
    LOW: { min: 20, max: 39.99, label: 'THẤP', color: 'teal', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: 'CheckCircle2' },
    MEDIUM: { min: 40, max: 59.99, label: 'TRUNG BÌNH', color: 'amber', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: 'AlertTriangle' },
    HIGH: { min: 60, max: 79.99, label: 'CAO', color: 'orange', bg: 'bg-orange-50 text-orange-800 border-orange-200', icon: 'AlertOctagon' },
    CRITICAL: { min: 80, max: 100, label: 'NGUY CẤP', color: 'rose', bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: 'ShieldAlert' },
    INSUFFICIENT_DATA: { label: 'CHƯA ĐỦ DỮ LIỆU', color: 'slate', bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: 'HelpCircle' },
  },
};
