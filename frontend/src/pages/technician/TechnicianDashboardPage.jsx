import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { Pagination } from '../../components/ui/Pagination';
import { AssignTechnicianModal } from '../../components/maintenance/AssignTechnicianModal';
import { WaitingPartModal } from '../../components/maintenance/WaitingPartModal';
import { CompleteTicketModal } from '../../components/maintenance/CompleteTicketModal';
import { 
  Wrench, Clock, AlertTriangle, CheckCircle2, Play, 
  RotateCcw, UserCheck, Eye, Search, Filter, Laptop, 
  MapPin, ShieldAlert, Sparkles, Send, ArrowRight
} from 'lucide-react';
import { MAINTENANCE_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';

export const TechnicianDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isManager, isTechnician } = useAuth();

  const [stats, setStats] = useState({
    newTickets: 0,
    assignedTickets: 0,
    inProgressTickets: 0,
    overdueTickets: 0,
    completedTickets: 0,
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab & Filters
  const [activeTab, setActiveTab] = useState(isTechnician ? 'ASSIGNED_TO_ME' : 'ALL');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [assignModalTicket, setAssignModalTicket] = useState(null);
  const [waitingPartTicket, setWaitingPartTicket] = useState(null);
  const [completeModalTicket, setCompleteModalTicket] = useState(null);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await maintenanceService.getTechnicianStats();
      if (res?.success && res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải thống kê KTV:', err);
    }
  };

  // Fetch Tickets List
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        all: activeTab === 'ALL' ? 'true' : undefined,
        assignedToMe: activeTab === 'ASSIGNED_TO_ME' ? 'true' : undefined,
      };

      if (activeTab === 'IN_PROGRESS') {
        params.status = 'IN_PROGRESS';
      } else if (activeTab === 'WAITING_PART') {
        params.status = 'WAITING_PART';
      } else if (activeTab === 'COMPLETED') {
        params.status = 'COMPLETED';
      } else if (activeTab === 'DUE_SOON') {
        params.isDueSoon = 'true';
      } else if (activeTab === 'OVERDUE') {
        params.isOverdue = 'true';
      }

      const res = await maintenanceService.getRequests(params);
      if (res?.success) {
        setTickets(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách phiếu bảo trì');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, priorityFilter, activeTab]);

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [fetchTickets]);

  const handleRefresh = () => {
    fetchStats();
    fetchTickets();
  };

  // Fast action: Start Work
  const handleStartWork = async (ticket) => {
    try {
      await maintenanceService.startWork(ticket.id);
      setSuccess(`Đã bắt đầu xử lý phiếu [${ticket.code}]`);
      handleRefresh();
    } catch (err) {
      setError(err?.message || 'Không thể bắt đầu xử lý');
    }
  };

  // Fast action: Resume Work
  const handleResumeWork = async (ticket) => {
    try {
      await maintenanceService.resumeWork(ticket.id);
      setSuccess(`Đã tiếp tục xử lý phiếu [${ticket.code}]`);
      handleRefresh();
    } catch (err) {
      setError(err?.message || 'Không thể tiếp tục xử lý');
    }
  };

  // Fast action: Close Ticket
  const handleCloseTicket = async (ticket) => {
    if (!window.confirm(`Xác nhận nghiệm thu thiết bị và đóng phiếu bảo trì [${ticket.code}]?`)) return;
    try {
      await maintenanceService.closeRequest(ticket.id, { notes: 'Nghiệm thu hoàn tất.' });
      setSuccess(`Đã nghiệm thu và đóng phiếu [${ticket.code}] thành công`);
      handleRefresh();
    } catch (err) {
      setError(err?.message || 'Không thể đóng phiếu');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            Không Gian Xử Lý Của Kỹ Thuật Viên
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tiếp nhận, xử lý hiện trường và cập nhật tiến độ bảo trì thiết bị
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleRefresh} className="text-xs">
            Làm mới
          </Button>
          {(isAdmin || isManager) && (
            <Button
              variant="danger"
              size="sm"
              icon={ShieldAlert}
              onClick={() => navigate('/report-issue')}
              className="text-xs"
            >
              Báo Sự Cố
            </Button>
          )}
        </div>
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

      {/* 6 KPI Stats Cards - Mobile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* 1. Ticket mới */}
        <Card className="p-3 bg-white border-l-4 border-l-brand-600 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket Mới</span>
            <div className="p-1 bg-brand-50 text-brand-600 rounded-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 font-mono">{stats.newTickets}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Chờ giao</span>
        </Card>

        {/* 2. Ticket được giao */}
        <Card className="p-3 bg-white border-l-4 border-l-amber-500 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Được Giao</span>
            <div className="p-1 bg-amber-50 text-amber-600 rounded-md">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 font-mono">{stats.assignedTickets}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Chờ xử lý</span>
        </Card>

        {/* 3. Ticket đang xử lý */}
        <Card className="p-3 bg-white border-l-4 border-l-cyan-500 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Đang Sửa</span>
            <div className="p-1 bg-cyan-50 text-cyan-600 rounded-md">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 font-mono">{stats.inProgressTickets}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Tại hiện trường</span>
        </Card>

        {/* 4. Ticket SẮP QUÁ HẠN SLA */}
        <Card className="p-3 bg-white border-l-4 border-l-amber-500 shadow-xs border border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Sắp Quá Hạn</span>
            <div className="p-1 bg-amber-100 text-amber-700 rounded-md">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-amber-700 mt-0.5 font-mono">{stats.dueSoonTickets || 0}</p>
          <span className="text-[10px] text-amber-800/80 mt-0.5 block font-semibold">{'Hạn <= 2h'}</span>
        </Card>

        {/* 5. Ticket ĐÃ QUÁ HẠN SLA */}
        <Card className="p-3 bg-white border-l-4 border-l-rose-500 shadow-xs border-2 border-rose-300 bg-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Đã Quá Hạn</span>
            <div className="p-1 bg-rose-100 text-rose-600 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-600 mt-0.5 font-mono">{stats.overdueTickets}</p>
          <span className="text-[10px] text-rose-600 mt-0.5 block font-bold">Trễ SLA ⚠️</span>
        </Card>

        {/* 6. Tuân Thủ SLA */}
        <Card className="p-3 bg-white border-l-4 border-l-emerald-500 shadow-xs border border-slate-200 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Tuân Thủ SLA</span>
            <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5 font-mono">{stats.slaComplianceRate || 100}%</p>
          <span className="text-[10px] text-emerald-800/80 mt-0.5 block font-medium">
            {stats.completedTickets} hoàn tất
          </span>
        </Card>
      </div>

      {/* Tabs & Search Toolbar */}
      <Card className="p-3.5 sm:p-4 bg-white shadow-xs border border-slate-200 space-y-3">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2.5">
          {[
            { id: 'ASSIGNED_TO_ME', label: 'Phiếu Của Tôi' },
            { id: 'IN_PROGRESS', label: 'Đang Xử Lý' },
            { id: 'DUE_SOON', label: '⚠️ Sắp Quá Hạn' },
            { id: 'OVERDUE', label: '🚨 Quá Hạn' },
            { id: 'WAITING_PART', label: 'Chờ Linh Kiện' },
            { id: 'COMPLETED', label: 'Đã Xong' },
            { id: 'ALL', label: 'Tất Cả' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm mã phiếu (REQ...), tiêu đề sự cố, người báo, tên máy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4 flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Mức ưu tiên --</option>
              <option value="LOW">Thấp (LOW - 72h)</option>
              <option value="MEDIUM">Trung bình (MEDIUM - 24h)</option>
              <option value="HIGH">Cao (HIGH - 8h)</option>
              <option value="URGENT">Khẩn cấp (URGENT - 4h)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets List: Responsive Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center px-4">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">Không có phiếu nào trong mục này</h3>
            <p className="text-xs text-slate-500 mt-0.5">Toàn bộ thiết bị đang hoạt động bình thường.</p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards View (Hidden on md/lg) */}
            <div className="md:hidden divide-y divide-slate-100">
              {tickets.map((t) => {
                const statusConf = MAINTENANCE_STATUS_CONFIG[t.status] || { label: t.status, bg: 'bg-slate-100' };
                const prioConf = PRIORITY_CONFIG[t.priority] || { label: t.priority, bg: 'bg-slate-100' };

                return (
                  <div key={t.id} className={`p-4 space-y-2.5 ${t.is_overdue ? 'bg-rose-50/30' : t.is_due_soon ? 'bg-amber-50/30' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                        {t.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConf.bg}`}>
                        {statusConf.label}
                      </span>
                    </div>

                    <h4 
                      onClick={() => navigate(`/maintenance/${t.id}`)}
                      className="font-bold text-slate-900 text-xs hover:text-brand-600 cursor-pointer line-clamp-2"
                    >
                      {t.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        {t.room_name} ({t.building_code})
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prioConf.bg}`}>
                        {prioConf.label} ({t.sla_hours || 24}h)
                      </span>
                    </div>

                    {/* SLA Countdown Badge */}
                    {t.due_at && (
                      <div className="text-[11px] flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500">Hạn SLA: {new Date(t.due_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(t.due_at).toLocaleDateString('vi-VN')}</span>
                        {t.is_overdue ? (
                          <span className="text-rose-600 font-bold text-[10px] flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> Quá hạn
                          </span>
                        ) : t.is_due_soon ? (
                          <span className="text-amber-600 font-bold text-[10px] flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> Sắp quá hạn
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[10px]">Đúng hạn</span>
                        )}
                      </div>
                    )}

                    {/* Mobile Touch Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {t.status === 'ASSIGNED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Play}
                          onClick={() => handleStartWork(t)}
                          className="flex-1 text-xs py-1.5"
                        >
                          Bắt Đầu Sửa
                        </Button>
                      )}

                      {t.status === 'IN_PROGRESS' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setWaitingPartTicket(t)}
                            className="flex-1 text-xs py-1.5 text-amber-700 border-amber-300"
                          >
                            Chờ Linh Kiện
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={CheckCircle2}
                            onClick={() => setCompleteModalTicket(t)}
                            className="flex-1 text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Hoàn Thành
                          </Button>
                        </>
                      )}

                      {t.status === 'WAITING_PART' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResumeWork(t)}
                            className="flex-1 text-xs py-1.5 text-cyan-700 border-cyan-300"
                          >
                            Tiếp Tục
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={CheckCircle2}
                            onClick={() => setCompleteModalTicket(t)}
                            className="flex-1 text-xs py-1.5 bg-emerald-600 text-white"
                          >
                            Hoàn Thành
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => navigate(`/maintenance/${t.id}`)}
                        className="text-xs py-1.5 px-3"
                      >
                        Chi Tiết
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                    <th className="py-3 px-4">Mã Phiếu & Tiêu Đề</th>
                    <th className="py-3 px-4">Thiết Bị & Vị Trí</th>
                    <th className="py-3 px-4">Ưu Tiên (SLA)</th>
                    <th className="py-3 px-4">Hạn Chót SLA</th>
                    <th className="py-3 px-4">KTV Phụ Trách</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác Kỹ Thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => {
                    const statusConf = MAINTENANCE_STATUS_CONFIG[t.status] || { label: t.status, bg: 'bg-slate-100' };
                    const prioConf = PRIORITY_CONFIG[t.priority] || { label: t.priority, bg: 'bg-slate-100' };

                    return (
                      <tr key={t.id} className={`hover:bg-slate-50/70 transition-colors ${t.is_overdue ? 'bg-rose-50/20' : t.is_due_soon ? 'bg-amber-50/20' : ''}`}>
                        {/* Code & Title */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-[10px]">
                              {t.code}
                            </span>
                            <h4
                              onClick={() => navigate(`/maintenance/${t.id}`)}
                              className="font-bold text-slate-900 text-xs hover:text-brand-600 cursor-pointer line-clamp-1 mt-0.5"
                            >
                              {t.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 block">
                              Báo: {new Date(t.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                              {new Date(t.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </td>

                        {/* Device & Location */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block truncate max-w-[160px]">{t.device_name}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {t.room_name} ({t.building_code})
                          </span>
                        </td>

                        {/* Priority (SLA) */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prioConf.bg}`}>
                              {prioConf.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              SLA: {t.sla_hours || 24}h
                            </span>
                          </div>
                        </td>

                        {/* SLA Due Date & Countdown */}
                        <td className="py-3 px-4">
                          {t.due_at ? (
                            <div className="space-y-1">
                              <span className="font-mono text-[11px] font-semibold text-slate-700 block">
                                {new Date(t.due_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                                {new Date(t.due_at).toLocaleDateString('vi-VN')}
                              </span>
                              {t.is_overdue ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  ĐÃ QUÁ HẠN
                                </span>
                              ) : t.is_due_soon ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  SẮP QUÁ HẠN
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Đúng tiến độ
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Technician */}
                        <td className="py-3 px-4">
                          {t.technician_name ? (
                            <span className="font-semibold text-brand-700 bg-brand-50/60 px-2 py-0.5 rounded border border-brand-100">
                              {t.technician_name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa giao</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusConf.bg}`}>
                            {statusConf.label}
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === 'ASSIGNED' && (
                              <Button
                                size="sm"
                                variant="primary"
                                icon={Play}
                                onClick={() => handleStartWork(t)}
                                className="text-xs py-1"
                              >
                                Bắt Đầu
                              </Button>
                            )}

                            {t.status === 'IN_PROGRESS' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setWaitingPartTicket(t)}
                                  className="text-xs py-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                                >
                                  Chờ LK
                                </Button>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon={CheckCircle2}
                                  onClick={() => setCompleteModalTicket(t)}
                                  className="text-xs py-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Xong
                                </Button>
                              </>
                            )}

                            {t.status === 'WAITING_PART' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResumeWork(t)}
                                  className="text-xs py-1 text-cyan-700 border-cyan-300 hover:bg-cyan-50"
                                >
                                  Tiếp Tục
                                </Button>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon={CheckCircle2}
                                  onClick={() => setCompleteModalTicket(t)}
                                  className="text-xs py-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Xong
                                </Button>
                              </>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              icon={Eye}
                              onClick={() => navigate(`/maintenance/${t.id}`)}
                              className="text-xs py-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Modals */}
      <AssignTechnicianModal
        isOpen={!!assignModalTicket}
        onClose={() => setAssignModalTicket(null)}
        ticket={assignModalTicket}
        onSuccess={handleRefresh}
      />

      <WaitingPartModal
        isOpen={!!waitingPartTicket}
        onClose={() => setWaitingPartTicket(null)}
        ticket={waitingPartTicket}
        onSuccess={handleRefresh}
      />

      <CompleteTicketModal
        isOpen={!!completeModalTicket}
        onClose={() => setCompleteModalTicket(null)}
        ticket={completeModalTicket}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
