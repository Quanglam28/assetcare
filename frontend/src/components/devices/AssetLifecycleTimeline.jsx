import React from 'react';
import { Card } from '../ui/Card';
import { 
  History, Calendar, DollarSign, Wrench, AlertTriangle, 
  Clock, ShieldCheck, CheckCircle2, ArrowRight, Activity
} from 'lucide-react';

export const AssetLifecycleTimeline = ({ device, health, risk, priority }) => {
  if (!device) return null;

  const purchasePrice = Number(device.purchase_price) || 0;
  const healthScore = Math.round(Number(health?.healthScore) || 100);
  const riskScore = Math.round(Number(risk?.riskScore) || 10);
  const priorityScore = Math.round(Number(priority?.priorityScore) || 20);

  // Tính tuổi thiết bị
  const purchaseDate = device.purchase_date || device.created_at;
  let ageYears = 0;
  if (purchaseDate) {
    const pDate = new Date(purchaseDate);
    if (!isNaN(pDate.getTime())) {
      ageYears = Math.max(0, (Date.now() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
  }

  // Xác định giai đoạn vòng đời hiện tại
  let currentStage = 'IN_USE';
  if (device.status === 'RETIRED') {
    currentStage = 'RETIRED';
  } else if (riskScore >= 80 || healthScore < 40) {
    currentStage = 'REPLACEMENT_REVIEW';
  } else if (riskScore >= 60) {
    currentStage = 'HIGH_RISK';
  } else if (device.status === 'BROKEN') {
    currentStage = 'REPAIR';
  } else if (device.status === 'MAINTENANCE') {
    currentStage = 'MAINTENANCE';
  } else {
    currentStage = 'IN_USE';
  }

  const stages = [
    { id: 'PURCHASED', label: '1. Tiếp nhận mua sắm', desc: purchaseDate ? new Date(purchaseDate).toLocaleDateString('vi-VN') : 'Đã nhập kho' },
    { id: 'IN_USE', label: '2. Đang vận hành', desc: 'Sử dụng tại phòng ban' },
    { id: 'MAINTENANCE', label: '3. Bảo dưỡng định kỳ', desc: 'Bảo trì phòng ngừa' },
    { id: 'REPAIR', label: '4. Khắc phục sự cố', desc: 'Sửa chữa phát sinh' },
    { id: 'HIGH_RISK', label: '5. Cảnh báo rủi ro cao', desc: 'Gia tăng tần suất hỏng' },
    { id: 'REPLACEMENT_REVIEW', label: '6. Thẩm định thay thế', desc: 'Đánh giá khấu hao & chi phí' },
    { id: 'RETIRED', label: '7. Thanh lý / Thu hồi', desc: 'Kết thúc vòng đời' },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Vòng Đời Tài Sản (Asset Lifecycle Timeline)
          </h3>
          <p className="text-xs text-slate-500">
            Theo dõi giai đoạn vận hành, khấu hao kỹ thuật và lịch sử kinh tế của thiết bị
          </p>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="mt-6">
        <div className="relative">
          {/* Step Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {stages.map((stage, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-between ${
                    isCurrent ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20 shadow-xs' :
                    isPassed ? 'bg-slate-50 border-slate-200 text-slate-700' :
                    'bg-white border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <div>
                    <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 ${
                      isCurrent ? 'bg-blue-600 text-white' :
                      isPassed ? 'bg-emerald-500 text-white' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="text-[11px] font-bold block leading-tight">
                      {stage.label.split('. ')[1]}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block truncate">
                    {stage.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Thời gian sử dụng</span>
          <span className="text-sm font-black font-mono text-slate-800">{ageYears.toFixed(1)} năm</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Nguyên giá mua sắm</span>
          <span className="text-sm font-black font-mono text-slate-800">{purchasePrice.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Điểm sức khỏe (Health)</span>
          <span className="text-sm font-black font-mono text-emerald-600">{healthScore} / 100</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Điểm rủi ro (Risk)</span>
          <span className="text-sm font-black font-mono text-orange-600">{riskScore} / 100</span>
        </div>
      </div>
    </Card>
  );
};
