/**
 * Cấu hình định lượng trọng số, ngưỡng và phân loại Mức Độ Ưu Tiên Xử Lý (Priority Score: 0 - 100)
 * Rule-Based Priority Engine (Phase 3 - Version 1.0)
 */

module.exports = {
  VERSION: 'v1.0',

  // ---------------------------------------------------------------------------
  // 1. CẤU HÌNH TRỌNG SỐ PRIORITY SCORE (Tổng = 100%)
  // ---------------------------------------------------------------------------
  PRIORITY_WEIGHTS: {
    FAILURE_RISK: 0.50,          // Điểm nguy cơ sự cố từ Phase 2 (50%)
    BUSINESS_CRITICALITY: 0.20,  // Mức độ quan trọng đối với hoạt động đào tạo/nghiên cứu (20%)
    ASSET_VALUE: 0.15,           // Giá trị nguyên giá tài sản (15%)
    DOWNTIME_IMPACT: 0.15,       // Mức độ ảnh hưởng do thời gian ngừng máy (15%)
  },

  // ---------------------------------------------------------------------------
  // 2. MAPPING ĐỘ QUAN TRỌNG NGHIỆP VỤ (BUSINESS CRITICALITY MAPPING)
  // ---------------------------------------------------------------------------
  BUSINESS_CRITICALITY_SCORES: {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 100,
  },

  // ---------------------------------------------------------------------------
  // 3. NGƯỠNG ĐỊNH LƯỢNG NGUYÊN GIÁ MUA TÀI SẢN (ASSET VALUE THRESHOLDS - VNĐ)
  // ---------------------------------------------------------------------------
  ASSET_VALUE_THRESHOLDS: [
    { maxPrice: 5000000, score: 20, label: '< 5 triệu VNĐ (Thiết bị nhỏ)' },
    { maxPrice: 20000000, score: 40, label: '5 - 20 triệu VNĐ (Thiết bị phổ thông)' },
    { maxPrice: 50000000, score: 60, label: '20 - 50 triệu VNĐ (Thiết bị trung cấp)' },
    { maxPrice: 100000000, score: 80, label: '50 - 100 triệu VNĐ (Thiết bị cao cấp/chuyên dụng)' },
    { maxPrice: Infinity, score: 100, label: '> 100 triệu VNĐ (Tài sản trọng điểm đặc biệt)' },
  ],

  // ---------------------------------------------------------------------------
  // 4. NGƯỠNG ĐỊNH LƯỢNG THỜI GIAN NGỪNG MÁY (DOWNTIME IMPACT THRESHOLDS - GIỜ)
  // ---------------------------------------------------------------------------
  DOWNTIME_IMPACT_THRESHOLDS: [
    { maxHours: 0, score: 10, label: '0 giờ (Không gián đoạn)' },
    { maxHours: 8, score: 30, label: '<= 8 giờ (Trong 1 ngày làm việc)' },
    { maxHours: 24, score: 50, label: '<= 24 giờ (Trong 1 - 3 ngày)' },
    { maxHours: 72, score: 70, label: '<= 72 giờ (Gián đoạn vừa)' },
    { maxHours: 168, score: 85, label: '<= 1 tuần (Gián đoạn nặng)' },
    { maxHours: Infinity, score: 100, label: '> 1 tuần (Ảnh hưởng cực kỳ nghiêm trọng)' },
  ],

  // ---------------------------------------------------------------------------
  // 5. PHÂN LOẠI MỨC ĐỘ ƯU TIÊN (PRIORITY CLASSIFICATION)
  // ---------------------------------------------------------------------------
  PRIORITY_LEVELS: {
    VERY_LOW: { min: 0, max: 19.99, label: 'RẤT THẤP', color: 'slate', badge: 'VERY LOW', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    LOW: { min: 20, max: 39.99, label: 'THẤP', color: 'blue', badge: 'LOW', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    MEDIUM: { min: 40, max: 59.99, label: 'TRUNG BÌNH', color: 'amber', badge: 'MEDIUM', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    HIGH: { min: 60, max: 79.99, label: 'CAO', color: 'orange', badge: 'HIGH', bg: 'bg-orange-50 text-orange-800 border-orange-200' },
    CRITICAL: { min: 80, max: 100, label: 'KHẨN CẤP / NGUY CẤP', color: 'rose', badge: 'CRITICAL', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
  },
};
