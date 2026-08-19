import React, { useState, useEffect } from 'react';
import { scheduleService } from '../../services/scheduleService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { CreateScheduleModal } from '../../components/schedules/CreateScheduleModal';
import { ExecuteScheduleModal } from '../../components/schedules/ExecuteScheduleModal';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, ShieldAlert, 
  Plus, Search, Filter, RotateCcw, Wrench, ChevronLeft, ChevronRight,
  Laptop, MapPin, User, ArrowRight, Trash2, Edit3
} from 'lucide-react';
import { SCHEDULE_FREQUENCY_CONFIG, SCHEDULE_ALERT_CONFIG } from '../../utils/constants';

export const SchedulesPage = () => {
  const { user, isAdmin, isManager, isTechnician } = useAuth();

  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, due: 0, overdue: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, OVERDUE, DUE, UPCOMING, COMPLETED
  const [frequencyFilter, setFrequencyFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await scheduleService.getAlertStats();
      if (res?.success && res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Lỗi lấy thống kê lịch bảo trì:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        alertType: activeTab !== 'ALL' ? activeTab : undefined,
        frequency: frequencyFilter || undefined,
      };

      const res = await scheduleService.getSchedules(params);
      if (res?.success) {
        setSchedules(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || 0);
        }
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách lịch bảo trì');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [page, activeTab, frequencyFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSchedules();
  };

  const handleDelete = async (sched) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lịch bảo trì "${sched.title}" của thiết bị ${sched.device_name}?`)) {
      return;
    }
    try {
      await scheduleService.deleteSchedule(sched.id);
      setSuccess('Đã xóa kế hoạch bảo trì thành công');
      fetchStats();
      fetchSchedules();
    } catch (err) {
      setError(err?.message || 'Không thể xóa lịch');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-brand-600" />
            Lịch Bảo Trì & Bảo Dưỡng Định Kỳ (Preventive Maintenance)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lập kế hoạch bảo dưỡng phòng ngừa hỏng hóc, tính toán chu kỳ định kỳ tự động và cảnh báo hạn xử lý.
          </p>
        </div>

        {(isAdmin || isManager) && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
            className="shadow-sm"
          >
            Lập Kế Hoạch Mới
          </Button>
        )}
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 4 Dashboard KPI Stat Cards with Distinct Alert Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Sắp đến hạn (Upcoming) */}
        <Card
          onClick={() => { setActiveTab('UPCOMING'); setPage(1); }}
          className={`p-4 cursor-pointer transition-all border-2 ${
            activeTab === 'UPCOMING'
              ? 'border-blue-500 bg-blue-50/60 shadow-md'
              : 'border-slate-200 hover:border-blue-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Sắp Đến Hạn
            </span>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.upcoming}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">lịch trong tương lai</span>
          </div>
        </Card>

        {/* 2. Đến hạn hôm nay (Due Today) */}
        <Card
          onClick={() => { setActiveTab('DUE'); setPage(1); }}
          className={`p-4 cursor-pointer transition-all border-2 ${
            activeTab === 'DUE'
              ? 'border-amber-500 bg-amber-50/60 shadow-md'
              : 'border-slate-200 hover:border-amber-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Đến Hạn Hôm Nay
            </span>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {stats.due}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">cần thực hiện ngay</span>
          </div>
        </Card>

        {/* 3. Đã quá hạn (Overdue - Cảnh báo đỏ) */}
        <Card
          onClick={() => { setActiveTab('OVERDUE'); setPage(1); }}
          className={`p-4 cursor-pointer transition-all border-2 ${
            activeTab === 'OVERDUE'
              ? 'border-rose-500 bg-rose-50/80 shadow-md ring-2 ring-rose-500/20'
              : 'border-slate-200 hover:border-rose-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Đã Quá Hạn
            </span>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {stats.overdue}
            </span>
            <span className="text-xs text-rose-600/80 ml-1.5 font-medium">chậm tiến độ ⚠️</span>
          </div>
        </Card>

        {/* 4. Đã hoàn thành (Completed) */}
        <Card
          onClick={() => { setActiveTab('COMPLETED'); setPage(1); }}
          className={`p-4 cursor-pointer transition-all border-2 ${
            activeTab === 'COMPLETED'
              ? 'border-emerald-500 bg-emerald-50/60 shadow-md'
              : 'border-slate-200 hover:border-emerald-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Đã Hoàn Thành
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {stats.completed}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">lượt bảo dưỡng</span>
          </div>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Card className="p-4 bg-white shadow-sm border border-slate-200 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { key: 'ALL', label: `Tất Cả (${stats.total})` },
            { key: 'OVERDUE', label: `⚠️ Đã Quá Hạn (${stats.overdue})`, badgeColor: 'text-rose-600' },
            { key: 'DUE', label: `🔔 Đến Hạn Hôm Nay (${stats.due})`, badgeColor: 'text-amber-600' },
            { key: 'UPCOMING', label: `⏳ Sắp Đến Hạn (${stats.upcoming})`, badgeColor: 'text-blue-600' },
            { key: 'COMPLETED', label: `✅ Đã Hoàn Thành (${stats.completed})`, badgeColor: 'text-emerald-600' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={activeTab !== tab.key && tab.badgeColor ? tab.badgeColor : ''}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Frequency Select */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, tên thiết bị, mã thiết bị, KTV phụ trách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={frequencyFilter}
              onChange={(e) => { setFrequencyFilter(e.target.value); setPage(1); }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Tất cả chu kỳ --</option>
              <option value="MONTHLY">Hàng tháng (30 ngày)</option>
              <option value="QUARTERLY">Hàng quý (90 ngày)</option>
              <option value="SEMI_ANNUALLY">Nửa năm (180 ngày)</option>
              <option value="ANNUALLY">Hàng năm (365 ngày)</option>
            </select>

            <Button type="submit" variant="primary" size="md">
              Lọc
            </Button>
          </div>
        </form>
      </Card>

      {/* Schedules Table */}
      <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Không có lịch bảo dưỡng nào phù hợp</h4>
            <p className="text-xs text-slate-500">Hãy thử thay đổi bộ lọc hoặc thêm mới kế hoạch bảo trì định kỳ.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">Thiết Bị & Vị Trí</th>
                  <th className="py-3.5 px-4">Kế Hoạch & Chu Kỳ</th>
                  <th className="py-3.5 px-4">Hạn Bảo Trì</th>
                  <th className="py-3.5 px-4">Chu Kỳ Kế Tiếp</th>
                  <th className="py-3.5 px-4">KTV Phụ Trách</th>
                  <th className="py-3.5 px-4">Cảnh Báo</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((item) => {
                  const alertConf = SCHEDULE_ALERT_CONFIG[item.alert_status] || {
                    label: item.alert_status,
                    bg: 'bg-slate-100 text-slate-700',
                  };
                  const freqConf = SCHEDULE_FREQUENCY_CONFIG[item.frequency] || { label: item.frequency };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Device & Location */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-brand-700 block">
                            {item.device_code}
                          </span>
                          <span className="font-bold text-slate-900 block">{item.device_name}</span>
                          <span className="text-slate-500 text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.room_name} ({item.building_name})
                          </span>
                        </div>
                      </td>

                      {/* Title & Frequency */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800 block">{item.title}</span>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {freqConf.label}
                          </span>
                        </div>
                      </td>

                      {/* Scheduled Date */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-800 block">
                            {new Date(item.scheduled_date).toLocaleDateString('vi-VN')}
                          </span>
                          {item.days_remaining !== undefined && item.alert_status !== 'COMPLETED' && (
                            <span className={`text-[10px] font-medium block ${
                              item.days_remaining < 0 
                                ? 'text-rose-600 font-bold' 
                                : item.days_remaining === 0 
                                ? 'text-amber-600 font-bold' 
                                : 'text-slate-400'
                            }`}>
                              {item.days_remaining < 0
                                ? `Trễ ${Math.abs(item.days_remaining)} ngày`
                                : item.days_remaining === 0
                                ? 'Đến hạn hôm nay'
                                : `Còn ${item.days_remaining} ngày`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Next Run Date */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-600 text-xs">
                          {item.next_run_date
                            ? new Date(item.next_run_date).toLocaleDateString('vi-VN')
                            : 'Chưa có'}
                        </span>
                      </td>

                      {/* Technician */}
                      <td className="py-3 px-4">
                        {item.technician_name ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 block">{item.technician_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.technician_phone || 'N/A'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa phân công</span>
                        )}
                      </td>

                      {/* Alert status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${alertConf.bg}`}>
                          {item.alert_status === 'OVERDUE' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          {item.alert_status === 'DUE' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {item.alert_status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {alertConf.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={CheckCircle2}
                              onClick={() => { setSelectedSchedule(item); setExecuteModalOpen(true); }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-1 px-2.5"
                            >
                              Bảo Dưỡng
                            </Button>
                          )}

                          {(isAdmin || isManager) && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa lịch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Trang {page} / {totalPages} (Tổng cộng {totalCount} lịch bảo trì)
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

      {/* Modals */}
      <CreateScheduleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => { fetchStats(); fetchSchedules(); }}
      />

      <ExecuteScheduleModal
        isOpen={executeModalOpen}
        onClose={() => setExecuteModalOpen(false)}
        schedule={selectedSchedule}
        onSuccess={() => { fetchStats(); fetchSchedules(); }}
      />
    </div>
  );
};
