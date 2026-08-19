import React from 'react';
import { Card } from '../ui/Card';
import { 
  Zap, AlertOctagon, ShieldAlert, Award, 
  DollarSign, Clock, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';

const PRIORITY_STATUS_CONFIG = {
  VERY_LOW: { label: 'RẤT THẤP', badge: 'VERY LOW', bg: 'bg-slate-100 text-slate-700 border-slate-200', bar: 'bg-slate-400' },
  LOW: { label: 'THẤP', badge: 'LOW', bg: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500' },
  MEDIUM: { label: 'TRUNG BÌNH', badge: 'MEDIUM', bg: 'bg-amber-50 text-amber-800 border-amber-200', bar: 'bg-amber-500' },
  HIGH: { label: 'CAO', badge: 'HIGH', bg: 'bg-orange-50 text-orange-800 border-orange-200', bar: 'bg-orange-500' },
  CRITICAL: { label: 'KHẨN CẤP / NGUY CẤP', badge: 'CRITICAL', bg: 'bg-rose-50 text-rose-800 border-rose-200', bar: 'bg-rose-600' },
};

export const PriorityScoreCard = ({ priority, loading }) => {
  if (loading || !priority) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-100 rounded-xl mb-4"></div>
        <div className="h-32 bg-slate-100 rounded-xl"></div>
      </Card>
    );
  }

  const status = priority.priorityStatus || priority.status || 'LOW';
  const statusConf = PRIORITY_STATUS_CONFIG[status] || PRIORITY_STATUS_CONFIG.LOW;
  const score = Math.round(Number(priority.priorityScore) || 0);
  const dataCompleteness = Math.round(Number(priority.completenessPercentage ?? priority.dataCompleteness ?? 100));

  const subScores = [
    {
      id: 'risk',
      name: 'Nguy cơ sự cố (Failure Risk)',
      weight: '50%',
      score: Math.round(Number(priority.breakdown?.riskScore ?? 0)),
      icon: ShieldAlert,
      detail: priority.detailedBreakdown?.risk?.detail || 'Từ động cơ Phase 2',
    },
    {
      id: 'business_criticality',
      name: 'Độ quan trọng nghiệp vụ',
      weight: '20%',
      score: Math.round(Number(priority.breakdown?.businessCriticalityScore ?? 50)),
      icon: Award,
      detail: priority.detailedBreakdown?.businessCriticality?.detail || 'Mức độ phục vụ đào tạo',
    },
    {
      id: 'asset_value',
      name: 'Nguyên giá tài sản',
      weight: '15%',
      score: Math.round(Number(priority.breakdown?.assetValueScore ?? 20)),
      icon: DollarSign,
      detail: priority.detailedBreakdown?.assetValue?.detail || 'Nguyên giá ban đầu',
    },
    {
      id: 'downtime_impact',
      name: 'Mức độ ảnh hưởng Downtime',
      weight: '15%',
      score: Math.round(Number(priority.breakdown?.downtimeImpactScore ?? 10)),
      icon: Clock,
      detail: priority.detailedBreakdown?.downtimeImpact?.detail || 'Thời gian ngừng máy',
    },
  ];

  return (
    <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Mức Độ Ưu Tiên Xử Lý (Priority Score)
              <span className="text-xs font-mono font-normal text-slate-400">
                ({priority.calculationVersion || 'v1.0'})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Định lượng thứ tự ưu tiên can thiệp kỹ thuật dựa trên rủi ro và giá trị nghiệp vụ
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusConf.bg}`}>
          {statusConf.badge}
        </span>
      </div>

      {/* Hero Metric */}
      <div className="mt-4 p-4 rounded-2xl border bg-gradient-to-br from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-16 h-16 rounded-2xl border-2 font-mono font-black text-2xl shadow-xs shrink-0 ${
            status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-300' :
            status === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-300' :
            status === 'MEDIUM' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {score}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{statusConf.label}</span>
              <span className="text-xs text-slate-400 font-mono">/ 100 điểm</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {score >= 80 ? 'Cần phát lệnh công tác và cử kỹ thuật viên xử lý khẩn cấp ngay' :
               score >= 60 ? 'Cần đưa vào kế hoạch bảo trì ưu tiên trong tuần' :
               score >= 40 ? 'Theo dõi và bảo dưỡng theo lịch thông thường' :
               'Tình trạng ổn định, ưu tiên ở mức thấp'}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Độ hoàn thiện dữ liệu</span>
          <span className="text-xs font-mono font-bold text-slate-700">
            {priority.dataCompleteness || `${dataCompleteness}%`}
          </span>
        </div>
      </div>

      {/* 4 Components Sub-Scores Breakdown */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Chi tiết 4 thành phần ưu tiên (Priority Breakdown)</span>
          <span className="text-[11px] font-normal lowercase text-slate-400">thang điểm 0 - 100 (càng cao càng ưu tiên)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subScores.map((item) => {
            const Icon = item.icon;
            const itemScore = item.score;
            const barColor = itemScore >= 80 ? 'bg-rose-500' : itemScore >= 60 ? 'bg-orange-500' : itemScore >= 40 ? 'bg-amber-500' : 'bg-blue-500';

            return (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-semibold">
                    {item.weight}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span className="text-base font-black font-mono text-slate-900">{itemScore}</span>
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[170px] text-right">{item.detail}</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.max(5, itemScore)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
