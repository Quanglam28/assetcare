import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { 
  Bell, Check, CheckCheck, Clock, ShieldAlert, 
  Info, AlertTriangle, CheckCircle2, Wrench
} from 'lucide-react';

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications({ limit: 10 });
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.meta?.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Lỗi lấy thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 60 seconds only when tab is visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Lỗi đánh dấu đã đọc tất cả:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('Lỗi đánh dấu đọc:', err);
      }
    }

    setIsOpen(false);

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
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'URGENT':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-brand-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        title="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/75">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Thông Báo Hệ Thống
              </h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đã đọc tất cả
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                Bạn không có thông báo mới nào
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                    !notif.is_read ? 'bg-brand-50/40 font-medium' : 'bg-white'
                  }`}
                >
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs ${!notif.is_read ? 'font-bold text-slate-900' : 'text-slate-700'} truncate`}>
                        {notif.title}
                      </h5>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 ml-1"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(notif.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                      {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer view all */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Xem tất cả thông báo & Cài đặt ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
