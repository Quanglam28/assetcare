import React, { useState, useEffect } from 'react';
import { deviceService } from '../../services/deviceService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';
import { 
  History, Clock, Wrench, ShieldAlert, CheckCircle2, 
  AlertTriangle, PauseCircle, PlayCircle, FileText, User, 
  DollarSign, ChevronLeft, ChevronRight, Filter, Sparkles,
  Layers, ArrowRight, ShieldCheck, CheckCheck
} from 'lucide-react';

export const DeviceActivityTimeline = ({ deviceId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, INCIDENT, MAINTENANCE, WORK_ORDER, AUDIT

  const fetchTimeline = async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        type: activeFilter !== 'ALL' ? activeFilter : undefined,
      };

      const res = await deviceService.getDeviceTimeline(deviceId, params);
      if (res?.success) {
        setTimeline(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalEvents(res.meta.total || 0);
        }
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải lịch sử hoạt động của thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [deviceId, page, activeFilter]);

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'DEVICE_CREATED':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'INCIDENT_REPORTED':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'INCIDENT_ASSIGNED':
        return <User className="w-4 h-4 text-sky-600" />;
      case 'MAINTENANCE_STARTED':
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'WAITING_PART':
        return <PauseCircle className="w-4 h-4 text-amber-600" />;
      case 'MAINTENANCE_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      case 'USER_ACCEPTED':
        return <CheckCheck className="w-4 h-4 text-emerald-600" />;
      case 'WORK_ORDER_CREATED':
        return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'STATUS_CHANGED':
        return <Clock className="w-4 h-4 text-slate-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeBg = (badgeColor) => {
    switch (badgeColor) {
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'sky':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="p-5 sm:p-6 border border-slate-200/80 shadow-sm rounded-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Lịch Sử Hoạt Động & Sự Cố (Activity Timeline)
            </h3>
            <p className="text-xs text-slate-500">
              Tổng hợp toàn bộ nhật ký vòng đời, báo hỏng, lệnh công tác và nghiệm thu thực tế
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'ALL', label: 'Tất Cả' },
            { key: 'INCIDENT', label: 'Báo Hỏng' },
            { key: 'MAINTENANCE', label: 'Bảo Trì' },
            { key: 'WORK_ORDER', label: 'Lệnh Công Tác' },
            { key: 'AUDIT', label: 'Thay Đổi' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveFilter(tab.key); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeFilter === tab.key
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Timeline List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : timeline.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600">Chưa có bản ghi hoạt động nào trong danh mục này</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Các sự kiện báo hỏng và bảo trì mới sẽ được hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          {timeline.map((event) => (
            <div key={event.id} className="relative group">
              {/* Node Icon on Timeline Line */}
              <div className="absolute -left-[24px] sm:-left-[32px] top-1.5 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white ring-4 ring-slate-100 shadow-xs border border-slate-200">
                {getEventIcon(event.eventType)}
              </div>

              {/* Event Content Box */}
              <div className="p-4 bg-white hover:bg-slate-50/75 rounded-xl border border-slate-200/80 shadow-2xs transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {event.title}
                    </h4>
                    {event.status && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeBg(event.badgeColor)}`}>
                        {event.status}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(event.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' - '}
                    {new Date(event.timestamp).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.description}
                </p>

                {/* Footer Metadata */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Người thực hiện: <strong className="text-slate-700 font-semibold">{event.actor?.name || 'Hệ thống'}</strong></span>
                    {event.actor?.role && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-600 font-mono">
                        {event.actor.role}
                      </span>
                    )}
                  </div>

                  {event.cost > 0 && (
                    <div className="flex items-center gap-1 text-emerald-700 font-bold">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      <span>Chi phí: {event.cost.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Trang {page} / {totalPages} (Tổng cộng {totalEvents} hoạt động)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
