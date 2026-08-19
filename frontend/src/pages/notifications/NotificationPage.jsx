import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Bell, CheckCheck, Trash2, CheckCircle2, ShieldAlert, 
  AlertTriangle, Info, Clock, Search, RotateCcw, ExternalLink, 
  ChevronLeft, ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';

export const NotificationPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Pagination
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UNREAD, URGENT, WARNING, SUCCESS
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        unreadOnly: activeTab === 'UNREAD' ? 'true' : undefined,
        type: (activeTab !== 'ALL' && activeTab !== 'UNREAD') ? activeTab : undefined,
        search: search.trim() || undefined,
      };

      const res = await notificationService.getMyNotifications(params);
      if (res?.success) {
        setNotifications(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.total || 0);
          setUnreadCount(res.meta.unreadCount || 0);
        }
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setSuccess('Đã đánh dấu tất cả thông báo là đã đọc');
      fetchNotifications();
    } catch (err) {
      setError(err?.message || 'Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAsRead = async (notif) => {
    try {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(p => Math.max(0, p - 1));
    } catch (err) {
      console.warn('Lỗi đánh dấu đã đọc:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSuccess('Đã xóa thông báo');
    } catch (err) {
      setError(err?.message || 'Không thể xóa thông báo');
    }
  };

  const handleScanSystem = async () => {
    try {
      setScanning(true);
      setError('');
      const res = await notificationService.scanSystemAlerts();
      if (res?.success) {
        setSuccess(`Đã quét cảnh báo hệ thống: Tìm thấy ${res.data?.triggeredCount || 0} cảnh báo mới!`);
        fetchNotifications();
      }
    } catch (err) {
      setError(err?.message || 'Không thể quét cảnh báo hệ thống');
    } finally {
      setScanning(false);
    }
  };

  const handleNavigate = (notif) => {
    handleMarkAsRead(notif);
    if (notif.reference_type === 'MAINTENANCE_REQUEST' && notif.reference_id) {
      navigate(`/maintenance/${notif.reference_id}`);
    } else if (notif.reference_type === 'SCHEDULE') {
      navigate(`/schedules`);
    } else if (notif.reference_type === 'DEVICE' && notif.reference_id) {
      navigate(`/devices/${notif.reference_id}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'URGENT':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-brand-600" />
            Trung Tâm Thông Báo & Cảnh Báo Hệ Thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ xử lý sự cố, kế hoạch bảo trì và cảnh báo thiết bị tự động.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(isAdmin || isManager) && (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={scanning}
              onClick={handleScanSystem}
              title="Quét các sự cố quá hạn, lịch bảo dưỡng đến hạn và bảo hành sắp hết"
            >
              Quét Cảnh Báo
            </Button>
          )}

          {unreadCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Đã Đọc Tất Cả ({unreadCount})
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

      {/* Filter Tabs & Search */}
      <Card className="p-4 bg-white shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { key: 'ALL', label: 'Tất Cả' },
            { key: 'UNREAD', label: `Chưa Đọc (${unreadCount})`, badgeColor: 'text-brand-600' },
            { key: 'URGENT', label: '⚠️ Khẩn Cấp', badgeColor: 'text-rose-600' },
            { key: 'WARNING', label: '🔔 Cảnh Báo', badgeColor: 'text-amber-600' },
            { key: 'SUCCESS', label: '✅ Thành Công', badgeColor: 'text-emerald-600' },
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

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề, nội dung thông báo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <Button type="submit" variant="outline" size="md">
            Tìm
          </Button>
        </form>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 bg-white border border-slate-200 space-y-2">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Hộp thông báo trống</h4>
            <p className="text-xs text-slate-500">Bạn không có thông báo nào trong danh mục này.</p>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 transition-all border flex items-start gap-4 ${
                !notif.is_read
                  ? 'bg-brand-50/40 border-brand-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${!notif.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">
                        Mới
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(notif.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {notif.message}
                </p>

                {/* Bottom Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-3 text-xs">
                    {notif.reference_type && (
                      <button
                        type="button"
                        onClick={() => handleNavigate(notif)}
                        className="font-semibold text-brand-600 hover:text-brand-800 hover:underline flex items-center gap-1"
                      >
                        Xem chi tiết liên quan
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notif)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(notif.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl">
          <span className="text-xs text-slate-500">
            Trang {page} / {totalPages} (Tổng cộng {totalCount} thông báo)
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
    </div>
  );
};
