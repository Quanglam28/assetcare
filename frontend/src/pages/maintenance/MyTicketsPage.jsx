import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { 
  Wrench, Plus, Search, Filter, RotateCcw, Eye, 
  MapPin, Clock, Calendar, Laptop, CheckCircle2, ShieldAlert, Tag
} from 'lucide-react';
import { MAINTENANCE_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';

export const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter & Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await maintenanceService.getMyRequests({
        page,
        limit,
        search,
        status: status || undefined,
        priority: priority || undefined,
      });

      if (res?.success) {
        setTickets(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Không thể tải danh sách phiếu bảo trì');
      toast.error(err?.message || 'Không thể tải danh sách phiếu bảo trì');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, priority, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Quy trình bảo trì' },
          { label: 'Phiếu yêu cầu bảo trì của tôi' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            Phiếu Báo Hỏng Của Tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Theo dõi tiến trình xử lý, KTV tiếp nhận và kết quả sửa chữa thiết bị
          </p>
        </div>

        <Button
          variant="danger"
          icon={Plus}
          onClick={() => navigate('/report-issue')}
          className="shadow-md shadow-rose-600/20 font-bold text-xs sm:text-sm py-2"
        >
          Báo Sự Cố Mới
        </Button>
      </div>

      {/* Toolbar / Filters */}
      <Card className="p-3.5 sm:p-4 bg-white shadow-xs border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, tiêu đề, tên thiết bị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Trạng thái */}
          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="PENDING">Chờ tiếp nhận (PENDING)</option>
              <option value="ASSIGNED">Đã phân công KTV</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="WAITING_PART">Chờ linh kiện</option>
              <option value="COMPLETED">Chờ bạn nghiệm thu</option>
              <option value="CLOSED">Đã hoàn tất & đóng</option>
              <option value="REOPENED">Yêu cầu xử lý lại</option>
            </select>
          </div>

          {/* Mức ưu tiên */}
          <div className="sm:col-span-2">
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Mức ưu tiên --</option>
              <option value="LOW">Thấp (LOW)</option>
              <option value="MEDIUM">Trung bình (MEDIUM)</option>
              <option value="HIGH">Cao (HIGH)</option>
              <option value="URGENT">Khẩn cấp (URGENT)</option>
            </select>
          </div>

          {/* Nút lọc */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" className="flex-1 text-xs">
              Tìm kiếm
            </Button>
            {(search || status || priority) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors"
                title="Xóa bộ lọc"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </Card>

      {/* Tickets List: Responsive Dual View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Chưa có phiếu báo sự cố nào"
            description="Bạn chưa tạo phiếu yêu cầu bảo trì nào hoặc không có phiếu nào khớp với điều kiện tìm kiếm."
            actionText="Báo Sự Cố Mới Ngay"
            onAction={() => navigate('/report-issue')}
          />
        ) : (
          <>
            {/* 1. Mobile Cards View (Hidden on md/lg) */}
            <div className="md:hidden divide-y divide-slate-100">
              {tickets.map((t) => {
                const statusConf = MAINTENANCE_STATUS_CONFIG[t.status] || {
                  label: t.status,
                  bg: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const priorityConf = PRIORITY_CONFIG[t.priority] || {
                  label: t.priority,
                  bg: 'bg-slate-100 text-slate-700',
                };
                const isWaitingMyAcceptance = t.status === 'COMPLETED';

                return (
                  <div key={t.id} className={`p-4 space-y-2.5 ${isWaitingMyAcceptance ? 'bg-amber-50/40' : ''}`}>
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

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        {t.room_name} ({t.building_code})
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityConf.bg}`}>
                        {priorityConf.label}
                      </span>
                    </div>

                    {isWaitingMyAcceptance && (
                      <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                        <span className="font-bold text-[11px] animate-pulse">👉 KTV đã sửa xong. Mời nghiệm thu!</span>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(`/maintenance/${t.id}`)}
                          className="text-xs py-1 px-2.5 bg-amber-600 hover:bg-amber-700"
                        >
                          Nghiệm Thu
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{new Date(t.created_at).toLocaleDateString('vi-VN')}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => navigate(`/maintenance/${t.id}`)}
                        className="text-xs py-1 px-3"
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
                    <th className="py-3 px-4">Thiết Bị Sự Cố</th>
                    <th className="py-3 px-4">Vị Trí Phòng Học</th>
                    <th className="py-3 px-4">Mức Ưu Tiên</th>
                    <th className="py-3 px-4">Kỹ Thuật Viên</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => {
                    const statusConf = MAINTENANCE_STATUS_CONFIG[t.status] || {
                      label: t.status,
                      bg: 'bg-slate-100 text-slate-700 border-slate-200',
                    };

                    const priorityConf = PRIORITY_CONFIG[t.priority] || {
                      label: t.priority,
                      bg: 'bg-slate-100 text-slate-700',
                    };

                    const isWaitingMyAcceptance = t.status === 'COMPLETED';

                    return (
                      <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors ${isWaitingMyAcceptance ? 'bg-amber-50/30' : ''}`}>
                        {/* Code & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {t.code}
                            </span>
                            <span
                              onClick={() => navigate(`/maintenance/${t.id}`)}
                              className="font-bold text-slate-900 hover:text-brand-600 cursor-pointer block leading-tight truncate max-w-[240px]"
                            >
                              {t.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(t.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                        </td>

                        {/* Device */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block truncate max-w-[160px]">{t.device_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{t.device_code}</span>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t.building_code} • {t.room_name}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4">
                          <Badge className={`${priorityConf.bg} text-[10px] font-bold px-2 py-0.5 border`}>
                            {priorityConf.label}
                          </Badge>
                        </td>

                        {/* Technician */}
                        <td className="py-3 px-4">
                          {t.technician_name ? (
                            <div className="font-medium text-slate-800">
                              <span>{t.technician_name}</span>
                              {t.technician_phone && (
                                <span className="block text-[10px] text-slate-400 font-mono">{t.technician_phone}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-200">
                              Chờ phân công
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <Badge className={`${statusConf.bg} text-[10px] font-bold px-2.5 py-0.5 border`}>
                            {statusConf.label}
                          </Badge>
                          {isWaitingMyAcceptance && (
                            <span className="block text-[10px] font-bold text-amber-700 mt-1 animate-pulse">
                              👉 Chờ bạn nghiệm thu
                            </span>
                          )}
                        </td>

                        {/* Detail Button */}
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={isWaitingMyAcceptance ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => navigate(`/maintenance/${t.id}`)}
                            className="gap-1 text-xs py-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {isWaitingMyAcceptance ? 'Nghiệm Thu' : 'Chi Tiết'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && tickets.length > 0 && (
          <div className="p-3.5 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
