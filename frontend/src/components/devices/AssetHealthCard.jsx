import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  HeartPulse, ShieldCheck, AlertTriangle, ShieldAlert,
  Calendar, Wrench, DollarSign, Clock, Shield, CheckCircle2, HelpCircle
} from 'lucide-react';
import { HEALTH_STATUS_CONFIG } from '../../utils/constants';

export const AssetHealthCard = ({ health, loading }) => {
  if (loading || !health) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-100 rounded-xl mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </Card>
    );
  }

  const status = health.healthStatus || health.status || 'GOOD';
  const statusConf = HEALTH_STATUS_CONFIG[status] || HEALTH_STATUS_CONFIG.GOOD;
  const isInsufficient = status === 'INSUFFICIENT_DATA' || health.healthScore === null || health.healthScore === undefined;
  const score = isInsufficient ? '--' : Math.round(Number(health.healthScore));
  const dataCompleteness = Math.round(Number(health.completenessPercentage ?? health.dataCompleteness ?? 100));

  const subScores = [
    {
      id: 'age',
      name: 'Tuổi thọ & Khấu hao',
      weight: '20%',
      score: Math.round(Number(health.ageScore ?? health.breakdown?.age?.score ?? 100)),
      icon: Calendar,
      detail: health.breakdown?.age?.detail || `${health.metrics?.ageYears?.toFixed(1) || 0} năm`,
    },
    {
      id: 'failure',
      name: 'Tần suất sự cố hỏng',
      weight: '25%',
      score: Math.round(Number(health.failureScore ?? health.breakdown?.failureFrequency?.score ?? 100)),
      icon: AlertTriangle,
      detail: health.breakdown?.failureFrequency?.detail || `${health.metrics?.totalIncidents || 0} sự cố`,
    },
    {
      id: 'maintenance',
      name: 'Bảo trì định kỳ',
      weight: '15%',
      score: Math.round(Number(health.maintenanceScore ?? health.breakdown?.maintenance?.score ?? 100)),
      icon: Wrench,
      detail: health.breakdown?.maintenance?.detail || 'Tuân thủ lịch',
    },
    {
      id: 'repair_cost',
      name: 'Chi phí sửa / Nguyên giá',
      weight: '20%',
      score: Math.round(Number(health.repairCostScore ?? health.breakdown?.repairCost?.score ?? 100)),
      icon: DollarSign,
      detail: health.breakdown?.repairCost?.detail || `${Number(health.metrics?.totalRepairCost || 0).toLocaleString('vi-VN')} đ`,
    },
    {
      id: 'downtime',
      name: 'Thời gian gián đoạn',
      weight: '10%',
      score: Math.round(Number(health.downtimeScore ?? health.breakdown?.downtime?.score ?? 100)),
      icon: Clock,
      detail: health.breakdown?.downtime?.detail || `${health.metrics?.downtimeHours || 0} giờ`,
    },
    {
      id: 'warranty',
      name: 'Thời hạn bảo hành',
      weight: '10%',
      score: Math.round(Number(health.warrantyScore ?? health.breakdown?.warranty?.score ?? 100)),
      icon: Shield,
      detail: health.breakdown?.warranty?.detail || 'Chính hãng',
    },
  ];

  return (
    <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Chỉ Số Sức Khỏe Thiết Bị
              <span className="text-xs font-mono font-normal text-slate-400">
                ({health.calculationVersion || 'v1.0'})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Định lượng đa chiều theo 6 nhóm trọng số kỹ thuật & tài chính
            </p>
          </div>
        </div>

        {/* Data Completeness Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Độ đủ dữ liệu: <strong>{dataCompleteness}%</strong></span>
          </div>
        </div>
      </div>

      {/* Main Score Hero Display */}
      <div className="mt-4 p-5 rounded-2xl border bg-gradient-to-br from-slate-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className={`relative flex items-center justify-center w-20 h-20 rounded-2xl border-2 font-mono font-black text-3xl shadow-sm ${
            status === 'GOOD' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
            status === 'FAIR' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
            status === 'WARNING' ? 'bg-amber-50 text-amber-800 border-amber-300' :
            status === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border-rose-300' :
            'bg-slate-50 text-slate-700 border-slate-300'
          }`}>
            {score}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${statusConf.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusConf.dot}`} />
                {statusConf.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {status === 'GOOD' && 'Thiết bị ở trạng thái rất tốt, độ tin cậy cao.'}
              {status === 'FAIR' && 'Thiết bị hoạt động bình thường, hao mòn mức độ nhẹ.'}
              {status === 'WARNING' && 'Cần lưu ý kiểm tra, phát hiện dấu hiệu hỏng hóc hoặc quá hạn bảo trì.'}
              {status === 'CRITICAL' && 'Thiết bị ở mức nguy cấp, nguy cơ hỏng hóc cao hoặc chi phí sửa vượt ngưỡng.'}
              {status === 'INSUFFICIENT_DATA' && 'Chưa đủ dữ liệu lịch sử để đánh giá chính xác.'}
            </p>
          </div>
        </div>

        {/* Completeness bar */}
        <div className="w-full md:w-56 space-y-1.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Mức độ hoàn thiện</span>
            <span className="font-mono">{dataCompleteness}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dataCompleteness >= 80 ? 'bg-emerald-500' : dataCompleteness >= 50 ? 'bg-amber-500' : 'bg-slate-400'
              }`}
              style={{ width: `${dataCompleteness}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            Đánh giá dựa trên {health.evaluatedFactorsCount || 6}/{health.totalFactorsCount || 6} chỉ số
          </p>
        </div>
      </div>

      {/* 6 Sub-Scores Breakdown Grid */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Chi tiết 6 nhóm chỉ số thành phần</span>
          <span className="text-[11px] font-normal lowercase text-slate-400">thang điểm 0 - 100</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subScores.map((item) => {
            const Icon = item.icon;
            const itemScore = item.score;
            const barColor = itemScore >= 80 ? 'bg-emerald-500' : itemScore >= 60 ? 'bg-yellow-500' : itemScore >= 40 ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
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
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[140px] text-right">{item.detail}</span>
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
