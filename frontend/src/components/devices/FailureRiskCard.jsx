import React from 'react';
import { Card } from '../ui/Card';
import { 
  ShieldAlert, TrendingUp, TrendingDown, Minus, AlertCircle,
  Activity, ArrowUpRight, ArrowDownRight, Flame, Clock,
  Wrench, DollarSign, Calendar, AlertTriangle
} from 'lucide-react';
import { RISK_LEVEL_CONFIG } from '../../utils/constants';

export const FailureRiskCard = ({ risk, loading }) => {
  if (loading || !risk) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-100 rounded-xl mb-4"></div>
        <div className="h-32 bg-slate-100 rounded-xl"></div>
      </Card>
    );
  }

  const status = risk.status || risk.riskStatus || risk.riskLevel || 'LOW';
  const levelConf = RISK_LEVEL_CONFIG[status] || {
    label: status,
    badge: status,
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
  };
  const riskScore = Math.round(Number(risk.riskScore) || 0);

  const failureTrend = Number(risk.trends?.failures?.changePercent ?? risk.trends?.failureTrendPercent ?? 0);
  const costTrend = Number(risk.trends?.repairCost?.changePercent ?? risk.trends?.costTrendPercent ?? 0);
  const downtimeTrend = Number(risk.trends?.downtime?.changePercent ?? 0);

  const rawReasons = risk.explainableReasons || [];
  const reasons = rawReasons.map(r => typeof r === 'string' ? { text: r } : r);

  const subScores = [
    {
      id: 'recent_failure',
      name: 'Tần suất sự cố (30d)',
      weight: '30%',
      score: Math.round(Number(risk.breakdown?.failureFrequencyScore ?? 10)),
      icon: AlertTriangle,
      detail: `${risk.trends?.failures?.current30d ?? 0} sự cố gần đây`,
    },
    {
      id: 'failure_trend',
      name: 'Xu hướng sự cố',
      weight: '25%',
      score: Math.round(Number(risk.breakdown?.failureTrendScore ?? 40)),
      icon: TrendingUp,
      detail: `${failureTrend > 0 ? '+' : ''}${failureTrend}% so với 30d trước`,
    },
    {
      id: 'maintenance',
      name: 'Bảo trì quá hạn',
      weight: '15%',
      score: Math.round(Number(risk.breakdown?.maintenanceRiskScore ?? 10)),
      icon: Wrench,
      detail: risk.detailedBreakdown?.maintenanceOverdue?.detail || 'Đúng hạn',
    },
    {
      id: 'cost_trend',
      name: 'Xu hướng chi phí (90d)',
      weight: '10%',
      score: Math.round(Number(risk.breakdown?.repairCostTrendScore ?? 35)),
      icon: DollarSign,
      detail: `${costTrend > 0 ? '+' : ''}${costTrend}%`,
    },
    {
      id: 'downtime_trend',
      name: 'Xu hướng Downtime',
      weight: '10%',
      score: Math.round(Number(risk.breakdown?.downtimeTrendScore ?? 35)),
      icon: Clock,
      detail: `${downtimeTrend > 0 ? '+' : ''}${downtimeTrend}%`,
    },
    {
      id: 'age_risk',
      name: 'Rủi ro tuổi thọ máy',
      weight: '10%',
      score: Math.round(Number(risk.breakdown?.ageRiskScore ?? 20)),
      icon: Calendar,
      detail: risk.detailedBreakdown?.ageRisk?.detail || 'Bình thường',
    },
  ];

  return (
    <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Nguy Cơ Sự Cố (Failure Risk Score)
              <span className="text-xs font-mono font-normal text-slate-400">
                ({risk.calculationVersion || 'v1.0'})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Định lượng xác suất hư hỏng thời gian tới theo 6 trọng số rủi ro
            </p>
          </div>
        </div>

        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${levelConf.bg}`}>
          {levelConf.badge || status}
        </span>
      </div>

      {/* Hero Metric & 3 Trend Delta Boxes */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Risk Percentage Box */}
        <div className="p-4 rounded-2xl border bg-gradient-to-br from-slate-50 to-white flex items-center gap-3">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-2 font-mono font-black text-2xl shadow-xs shrink-0 ${
            status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-300' :
            status === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-300' :
            status === 'MEDIUM' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
            'bg-emerald-50 text-emerald-700 border-emerald-300'
          }`}>
            {riskScore}%
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Xác suất rủi ro</span>
            <span className="text-xs font-bold text-slate-800">{levelConf.label || status}</span>
          </div>
        </div>

        {/* Failure Trend Box */}
        <div className="p-3.5 rounded-2xl border bg-slate-50/70 border-slate-200/70 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Xu hướng hỏng (30d)</span>
          <div className="flex items-center gap-1.5 my-1">
            {failureTrend > 0 ? (
              <span className="inline-flex items-center text-xs font-black text-rose-600 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +{failureTrend}%
              </span>
            ) : failureTrend < 0 ? (
              <span className="inline-flex items-center text-xs font-black text-emerald-600 font-mono">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> {failureTrend}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-slate-600 font-mono">
                <Minus className="w-3 h-3 mr-0.5" /> 0% (Ổn định)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">{risk.trends?.failures?.current30d ?? 0} vụ / 30 ngày qua</p>
        </div>

        {/* Cost Trend Box */}
        <div className="p-3.5 rounded-2xl border bg-slate-50/70 border-slate-200/70 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Xu hướng chi phí (90d)</span>
          <div className="flex items-center gap-1.5 my-1">
            {costTrend > 0 ? (
              <span className="inline-flex items-center text-xs font-black text-rose-600 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +{costTrend}%
              </span>
            ) : costTrend < 0 ? (
              <span className="inline-flex items-center text-xs font-black text-emerald-600 font-mono">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> {costTrend}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-slate-600 font-mono">
                <Minus className="w-3 h-3 mr-0.5" /> 0% (Ổn định)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">So với 90 ngày trước</p>
        </div>

        {/* Downtime Trend Box */}
        <div className="p-3.5 rounded-2xl border bg-slate-50/70 border-slate-200/70 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Downtime (30d)</span>
          <div className="flex items-center gap-1.5 my-1">
            {downtimeTrend > 0 ? (
              <span className="inline-flex items-center text-xs font-black text-rose-600 font-mono">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +{downtimeTrend}%
              </span>
            ) : downtimeTrend < 0 ? (
              <span className="inline-flex items-center text-xs font-black text-emerald-600 font-mono">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> {downtimeTrend}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-bold text-slate-600 font-mono">
                <Minus className="w-3 h-3 mr-0.5" /> 0% (Ổn định)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">{risk.trends?.downtime?.current30d ?? 0} giờ ngừng máy</p>
        </div>
      </div>

      {/* 6 Sub-Scores Breakdown */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Chi tiết 6 thành phần rủi ro (Risk Breakdown)</span>
          <span className="text-[11px] font-normal lowercase text-slate-400">thang điểm 0 - 100 (càng cao càng rủi ro)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subScores.map((item) => {
            const Icon = item.icon;
            const itemScore = item.score;
            const barColor = itemScore >= 80 ? 'bg-rose-500' : itemScore >= 60 ? 'bg-orange-500' : itemScore >= 40 ? 'bg-yellow-500' : 'bg-emerald-500';

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

      {/* Explainability Section: Why is Risk at this level? */}
      {reasons.length > 0 && (
        <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Giải thích định lượng nguyên nhân rủi ro (Why is risk at this level?)
          </h4>

          <div className="space-y-2">
            {reasons.map((r, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border bg-slate-50/80 border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700"
              >
                <span className="font-medium leading-relaxed">
                  {r.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
