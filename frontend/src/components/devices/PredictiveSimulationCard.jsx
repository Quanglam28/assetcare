import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { 
  Sparkles, Clock, ShieldAlert, HeartPulse, Zap, 
  ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Wrench, Activity, HelpCircle
} from 'lucide-react';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';
import api from '../../services/api';

export const PredictiveSimulationCard = ({ deviceId, device, onWorkOrderCreated }) => {
  const [days, setDays] = useState(30);
  const [scenario, setScenario] = useState('NO_MAINTENANCE'); // 'NO_MAINTENANCE' | 'MAINTAIN_NOW'
  const [loading, setLoading] = useState(true);
  const [simData, setSimData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSimulation = async (selectedDays) => {
    try {
      setLoading(true);
      const res = await api.get(`/devices/${deviceId}/simulation`, {
        params: { days: selectedDays },
      });
      if (res?.data) {
        setSimData(res.data);
      } else if (res?.scenarios) {
        setSimData(res);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu mô phỏng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deviceId) {
      fetchSimulation(days);
    }
  }, [deviceId, days]);

  if (!deviceId) return null;

  const current = simData?.current || { healthScore: 100, failureRisk: 10, priorityScore: 20 };
  const currentScenarioData = simData?.scenarios?.[scenario] || simData || {};
  const projected = currentScenarioData.projected || current;
  const delta = currentScenarioData.delta || { health: 0, risk: 0, priority: 0 };
  const explanations = currentScenarioData.explanations || [];
  const statusChange = currentScenarioData.statusChange || {};

  const isNoMaint = scenario === 'NO_MAINTENANCE';
  const isHighRiskTransition = isNoMaint && (projected.priorityScore >= 80 || delta.priority >= 15 || delta.risk >= 15);

  return (
    <>
      <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl bg-gradient-to-b from-white to-slate-50/50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Mô Phỏng Dự Báo Bảo Trì (Rule-Based Predictive Simulation)
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  What-If
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Đánh giá định lượng sự biến thiên của Sức khỏe, Rủi ro và Mức độ ưu tiên theo thời gian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[7, 14, 30, 60, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  days === d
                    ? 'bg-white text-brand-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d} ngày
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Toggle */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-100/70 border border-slate-200/60">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Kịch Bản Giả Định:
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setScenario('NO_MAINTENANCE')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isNoMaint
                  ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ⚠️ Không bảo trì (Trì hoãn {days} ngày)
            </button>
            <button
              type="button"
              onClick={() => setScenario('MAINTAIN_NOW')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                !isNoMaint
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ✅ Bảo trì ngay lập tức
            </button>
          </div>
        </div>

        {/* Visual Comparison Grid */}
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Health Score Projection */}
              <div className="p-4 rounded-xl border bg-white shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    Sức Khỏe (Health)
                  </span>
                  <span className={`text-xs font-mono font-bold ${delta.health < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {delta.health > 0 ? `+${delta.health}` : delta.health}đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Hiện tại: <strong>{current.healthScore}đ</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900 font-mono">Dự kiến: {projected.healthScore}đ</span>
                </div>

                {/* Bars comparison */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${current.healthScore}%` }} />
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        projected.healthScore >= 80 ? 'bg-emerald-500' :
                        projected.healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(5, projected.healthScore)}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">{statusChange.health}</span>
              </div>

              {/* 2. Failure Risk Projection */}
              <div className="p-4 rounded-xl border bg-white shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-orange-600" />
                    Nguy Cơ (Failure Risk)
                  </span>
                  <span className={`text-xs font-mono font-bold ${delta.risk > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {delta.risk > 0 ? `+${delta.risk}` : delta.risk}đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Hiện tại: <strong>{current.failureRisk}%</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900 font-mono">Dự kiến: {projected.failureRisk}%</span>
                </div>

                {/* Bars comparison */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${current.failureRisk}%` }} />
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        projected.failureRisk >= 80 ? 'bg-rose-600' :
                        projected.failureRisk >= 60 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(5, projected.failureRisk)}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">{statusChange.risk}</span>
              </div>

              {/* 3. Priority Score Projection */}
              <div className="p-4 rounded-xl border bg-white shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-600" />
                    Ưu Tiên (Priority Score)
                  </span>
                  <span className={`text-xs font-mono font-bold ${delta.priority > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {delta.priority > 0 ? `+${delta.priority}` : delta.priority}đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Hiện tại: <strong>{current.priorityScore}đ</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-purple-700 font-mono">Dự kiến: {projected.priorityScore}đ</span>
                </div>

                {/* Bars comparison */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${current.priorityScore}%` }} />
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        projected.priorityScore >= 80 ? 'bg-rose-600' :
                        projected.priorityScore >= 60 ? 'bg-orange-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${Math.max(5, projected.priorityScore)}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">{statusChange.priority}</span>
              </div>
            </div>

            {/* Decision & Action Alert Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isHighRiskTransition
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : !isNoMaint
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {isNoMaint && isHighRiskTransition ? '🔴 Khuyến Nghị Quyết Định: Cần Lập Lệnh Bảo Trì Ngay' :
                       !isNoMaint ? '🟢 Hiệu Quả Bảo Trì: Giảm Rủi Ro & Phục Hồi Độ Tin Cậy' :
                       'ℹ️ Đánh Giá Xu Thế: Thiết Bị Trong Ngưỡng Ổn Định'}
                    </span>
                  </div>

                  <ul className="text-xs space-y-1 pt-1 font-medium">
                    {explanations.map((exp, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span>•</span>
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isHighRiskTransition ? 'danger' : 'primary'}
                    icon={Wrench}
                    onClick={() => setModalOpen(true)}
                  >
                    Tạo Lệnh Công Tác
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Tạo Lệnh Công Tác */}
      <CreateWorkOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        device={device}
        recommendation={{
          title: `Bảo trì theo kết quả mô phỏng dự báo ${days} ngày`,
          reason: explanations.join('. '),
          type: isHighRiskTransition ? 'EMERGENCY' : 'PREVENTIVE',
          severity: projected.priorityScore >= 80 ? 'CRITICAL' : 'HIGH',
        }}
        onSuccess={onWorkOrderCreated}
      />
    </>
  );
};
