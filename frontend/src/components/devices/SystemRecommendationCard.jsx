import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Sparkles, Wrench, ShieldAlert, Calendar, CheckCircle2,
  AlertOctagon, ArrowRight, FileCheck, RefreshCw, AlertTriangle
} from 'lucide-react';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';

const SEVERITY_BADGE = {
  CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
  LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

export const SystemRecommendationCard = ({ recommendation, recommendations, device, userRole, onWorkOrderCreated }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);

  const list = recommendations || (recommendation ? [recommendation] : []);
  if (list.length === 0) return null;

  const topRec = list[0];
  const isCritical = topRec.severity === 'CRITICAL';

  const handleOpenWorkOrder = (rec) => {
    setSelectedRec(rec);
    setModalOpen(true);
  };

  return (
    <>
      <Card className={`p-5 sm:p-6 border rounded-2xl shadow-sm ${
        isCritical ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/50 border-slate-200/80'
      }`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isCritical ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-brand-50 text-brand-600 border-brand-100'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Khuyến Nghị Hành Động (Decision Support Engine)
              </h3>
              <p className="text-xs text-slate-500">
                Gợi ý can thiệp kỹ thuật định lượng theo 8 quy tắc chuyên gia
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border shadow-xs ${
            SEVERITY_BADGE[topRec.severity] || SEVERITY_BADGE.MEDIUM
          }`}>
            {topRec.severity === 'CRITICAL' ? 'KHẨN CẤP (CRITICAL)' :
             topRec.severity === 'HIGH' ? 'ƯU TIÊN CAO (HIGH)' :
             topRec.severity === 'MEDIUM' ? 'TRUNG BÌNH (MEDIUM)' : 'THEO DÕI TIÊU CHUẨN'}
          </span>
        </div>

        {/* List of active recommendations */}
        <div className="mt-4 space-y-3">
          {list.map((rec, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                rec.severity === 'CRITICAL' ? 'bg-rose-100/50 border-rose-300 text-rose-950' :
                rec.severity === 'HIGH' ? 'bg-orange-50/60 border-orange-200 text-orange-950' :
                'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      SEVERITY_BADGE[rec.severity] || SEVERITY_BADGE.MEDIUM
                    }`}>
                      {rec.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {rec.reason || rec.text}
                  </p>
                  {rec.suggestedDeadline && (
                    <span className="text-[11px] text-slate-500 block font-mono">
                      📅 Hạn chót khuyến nghị xử lý: <strong>{new Date(rec.suggestedDeadline).toLocaleDateString('vi-VN')}</strong>
                    </span>
                  )}
                </div>

                {rec.severity !== 'LOW' && (
                  <Button
                    size="sm"
                    variant={rec.severity === 'CRITICAL' ? 'danger' : 'primary'}
                    icon={Wrench}
                    onClick={() => handleOpenWorkOrder(rec)}
                    className="shrink-0"
                  >
                    Tạo Lệnh Công Tác
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="italic">* Khuyến nghị sinh tự động từ dữ liệu đo đạc thực tế 30d/90d.</span>
          {topRec.severity === 'LOW' && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Thiết bị vận hành tối ưu
            </span>
          )}
        </div>
      </Card>

      {/* Modal tạo Work Order */}
      <CreateWorkOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        device={device}
        recommendation={selectedRec}
        onSuccess={onWorkOrderCreated}
      />
    </>
  );
};
