/**
 * Cấu hình tham số định lượng & quy tắc mô phỏng dự báo bảo trì (What-If Simulation Engine)
 * Rule-Based Predictive Simulation (Phase 4 - Version 1.0)
 * 100% Deterministic (Không sử dụng Math.random)
 */

module.exports = {
  VERSION: 'v1.0',

  // ---------------------------------------------------------------------------
  // 1. CÁC KHUNG THỜI GIAN MÔ PHỎNG (SIMULATION PERIODS - NGÀY)
  // ---------------------------------------------------------------------------
  PERIODS: [7, 14, 30, 60, 90],
  DEFAULT_PERIOD: 30,

  // ---------------------------------------------------------------------------
  // 2. KỊCH BẢN MÔ PHỎNG (SCENARIOS)
  // ---------------------------------------------------------------------------
  SCENARIOS: {
    NO_MAINTENANCE: 'NO_MAINTENANCE', // Trì hoãn / Không can thiệp bảo trì
    MAINTAIN_NOW: 'MAINTAIN_NOW',     // Thực hiện bảo dưỡng / Sửa chữa ngay lập tức
  },

  // ---------------------------------------------------------------------------
  // 3. TỐC ĐỘ SUY GIẢM ĐIỂM SỨC KHỎE (HEALTH DEGRADATION RATES - ĐIỂM / NGÀY)
  // ---------------------------------------------------------------------------
  HEALTH_DEGRADATION: {
    // Tốc độ suy giảm tự nhiên cơ bản theo ngày
    BASE_DAILY_RATE: 0.15, // 0.15 điểm / ngày (~4.5 điểm / 30 ngày)

    // Hệ số gia tốc theo tình trạng quá hạn bảo dưỡng (Overdue Multipliers)
    OVERDUE_MULTIPLIERS: [
      { maxDays: 0, multiplier: 1.0 },   // Đúng hạn: Tốc độ chuẩn
      { maxDays: 7, multiplier: 1.2 },   // Quá hạn nhẹ: Tăng 20%
      { maxDays: 30, multiplier: 1.5 },  // Quá hạn 1 tháng: Tăng 50%
      { maxDays: 60, multiplier: 2.0 },  // Quá hạn 2 tháng: Gấp đôi tốc độ
      { maxDays: Infinity, multiplier: 2.8 }, // Quá hạn nghiêm trọng: Tăng 180%
    ],

    // Hệ số gia tốc theo xu hướng sự cố (Failure Trend Multipliers)
    FAILURE_TREND_MULTIPLIERS: {
      DECREASING: 0.8, // Xu hướng giảm: Suy giảm chậm hơn
      STABLE: 1.0,     // Xu hướng ổn định: Chuẩn
      INCREASING_MILD: 1.3,     // Tăng nhẹ: Tăng 30%
      INCREASING_MODERATE: 1.7, // Tăng vừa: Tăng 70%
      INCREASING_STRONG: 2.2,   // Tăng mạnh: Tăng 120%
    },

    // Hệ số gia tốc theo mức độ tuổi thọ máy
    AGE_MULTIPLIERS: [
      { maxYears: 1.0, multiplier: 0.8 }, // Máy mới: Chống chịu tốt
      { maxYears: 3.0, multiplier: 1.0 }, // Máy trung bình: Chuẩn
      { maxYears: 5.0, multiplier: 1.4 }, // Máy cũ: Tăng 40%
      { maxYears: Infinity, multiplier: 1.8 }, // Máy > 5 năm: Tăng 80%
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. TỐC ĐỘ GIA TĂNG NGUY CƠ SỰ CỐ (RISK GROWTH RATES - ĐIỂM / NGÀY)
  // ---------------------------------------------------------------------------
  RISK_GROWTH: {
    BASE_DAILY_GROWTH: 0.20, // 0.20 điểm / ngày (~6 điểm / 30 ngày)

    // Hệ số đẩy rủi ro khi có sự cố dồn dập trong 30 ngày qua
    RECENT_FAILURES_MULTIPLIERS: [
      { maxFailures: 0, multiplier: 0.8 },
      { maxFailures: 1, multiplier: 1.1 },
      { maxFailures: 2, multiplier: 1.5 },
      { maxFailures: 3, multiplier: 2.0 },
      { maxFailures: Infinity, multiplier: 2.6 },
    ],

    // Hệ số quá hạn bảo dưỡng ảnh hưởng rủi ro
    MAINTENANCE_OVERDUE_RISK_BOOST: {
      DAILY_ADDITIONAL_POINTS: 0.10, // Mỗi ngày trôi qua không bảo trì cộng thêm 0.10 điểm rủi ro
    },
  },

  // ---------------------------------------------------------------------------
  // 5. LỢI ÍCH KHI BẢO TRÌ NGAY (MAINTENANCE BENEFIT & RECOVERY RATES)
  // ---------------------------------------------------------------------------
  MAINTENANCE_RECOVERY: {
    // Điểm sức khỏe phục hồi ngay khi bảo dưỡng / sửa chữa hoàn tất
    HEALTH_RECOVERY_BASE: 12.0, // Phục hồi tối thiểu 12 điểm
    HEALTH_RECOVERY_MAX_CEILING: 95.0, // Không vượt quá 95đ đối với máy cũ

    // Tỷ lệ giảm điểm nguy cơ sự cố (Risk Reduction Rate)
    RISK_REDUCTION_PERCENTAGE: 0.45, // Giảm 45% điểm rủi ro hiện tại
    MIN_RISK_FLOOR: 15.0, // Điểm rủi ro sàn sau bảo trì tối thiểu là 15đ

    // Reset chỉ số quá hạn về 0
    RESET_OVERDUE: true,
  },
};
