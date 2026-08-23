import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import {
  LayoutDashboard,
  QrCode,
  Laptop,
  Wrench,
  Calendar,
  Building2,
  Users,
  Layers,
  FileText,
  BarChart3,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { user, isAdmin, isManager, isTechnician, isUser } = useAuth();

  // Danh mục menu theo quyền hạn
  const navGroups = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard, show: true },
        { name: 'Quét mã QR', to: '/qr-scanner', icon: QrCode, show: true },
      ],
    },
    {
      title: 'QUẢN LÝ THIẾT BỊ',
      items: [
        { name: 'Thiết bị', to: '/devices', icon: Laptop, show: true },
        { name: 'Loại thiết bị', to: '/device-types', icon: Layers, show: isAdmin || isManager },
        { name: 'Vị trí & Phòng', to: '/locations', icon: Building2, show: isAdmin || isManager },
        { name: 'Nhà cung cấp', to: '/suppliers', icon: FileText, show: isAdmin },
      ],
    },
    {
      title: 'QUẢN LÝ BẢO TRÌ',
      items: [
        { name: 'Phân tích rủi ro', to: '/risk-matrix', icon: BarChart3, show: isAdmin || isManager || isTechnician },
        { name: 'Công việc bảo trì', to: '/work-orders', icon: FileText, show: isAdmin || isManager || isTechnician },
        { name: 'Xử lý sự cố', to: '/technician/dashboard', icon: Wrench, show: isAdmin || isManager || isTechnician },
        { name: 'Báo cáo hỏng thiết bị', to: '/report-issue', icon: ShieldAlert, show: true },
        { name: 'Yêu cầu bảo trì', to: '/maintenance', icon: FileText, show: true },
        { name: 'Lịch bảo trì', to: '/schedules', icon: Calendar, show: isAdmin || isManager || isTechnician },
        { name: 'Báo cáo & Thống kê', to: '/reports', icon: BarChart3, show: isAdmin || isManager },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        { name: 'Tài khoản người dùng', to: '/users', icon: Users, show: isAdmin || isManager },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-all duration-300 ease-in-out lg:static shadow-2xl lg:shadow-none',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand logo header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold shadow-lg shadow-brand-600/30 ring-1 ring-white/20">
              <QrCode className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-white tracking-wide text-sm block">UTT ASSETCARE</span>
                <span className="block text-[10px] text-brand-400 font-semibold tracking-tight">ĐH Công Nghệ GTVT</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu list navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx}>
                {!isCollapsed && (
                  <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">
                    {group.title}
                  </h4>
                )}
                <ul className="space-y-1">
                  {visibleItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 group relative',
                            isActive
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-1 ring-brand-400/30'
                              : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                            isCollapsed && 'justify-center px-2'
                          )
                        }
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* User Info footer in Sidebar */}
        {!isCollapsed && (
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-950 shrink-0" />
                <span className="text-[11px] text-slate-300 font-medium truncate">
                  {user?.role || 'SYSTEM'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v1.2</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
