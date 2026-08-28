import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, QrCode, Laptop, Wrench, Calendar,
  Building2, Users, Layers, FileText, BarChart3,
  ShieldAlert, ClipboardList, Menu
} from 'lucide-react';
import { clsx } from 'clsx';

export const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { user, isAdmin, isManager, isTechnician } = useAuth();

  const navGroups = [
    {
      title: 'Tổng quan',
      items: [
        { name: 'Tổng quan', to: '/dashboard', icon: LayoutDashboard, show: true },
        { name: 'Quét QR', to: '/qr-scanner', icon: QrCode, show: true },
      ],
    },
    {
      title: 'Thiết bị',
      items: [
        { name: 'Danh sách thiết bị', to: '/devices', icon: Laptop, show: true },
        { name: 'Loại thiết bị', to: '/device-types', icon: Layers, show: isAdmin || isManager },
        { name: 'Vị trí & Phòng', to: '/locations', icon: Building2, show: isAdmin || isManager },
        { name: 'Nhà cung cấp', to: '/suppliers', icon: FileText, show: isAdmin },
      ],
    },
    {
      title: 'Bảo trì',
      items: [
        { name: 'Yêu cầu bảo trì', to: '/maintenance', icon: ClipboardList, show: true },
        { name: 'Công việc bảo trì', to: '/work-orders', icon: Wrench, show: isAdmin || isManager || isTechnician },
        { name: 'Lịch bảo trì', to: '/schedules', icon: Calendar, show: isAdmin || isManager || isTechnician },
        { name: 'Báo cáo hỏng', to: '/report-issue', icon: ShieldAlert, show: true },
        { name: 'Xử lý sự cố', to: '/technician/dashboard', icon: Wrench, show: isAdmin || isManager || isTechnician },
      ],
    },
    {
      title: 'Phân tích',
      items: [
        { name: 'Ma trận rủi ro', to: '/risk-matrix', icon: BarChart3, show: isAdmin || isManager || isTechnician },
        { name: 'Báo cáo', to: '/reports', icon: FileText, show: isAdmin || isManager },
      ],
    },
    {
      title: 'Hệ thống',
      items: [
        { name: 'Người dùng', to: '/users', icon: Users, show: isAdmin || isManager },
      ],
    },
  ];

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar-bg text-sidebar-text transition-all duration-200 ease-in-out lg:static shadow-sidebar',
          isCollapsed ? 'w-16' : 'w-60',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className={clsx('flex h-14 items-center border-b border-sidebar-border shrink-0', isCollapsed ? 'justify-center px-2' : 'px-4')}>
          <div className={clsx('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-600 text-white text-xs font-bold shrink-0">
              A
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <div className="text-sm font-bold text-white">AssetCare</div>
                <div className="text-[10px] text-brand-400 font-medium">UTT</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5 scrollbar-thin scrollbar-thumb-sidebar-border">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((i) => i.show);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.title}>
                {!isCollapsed && (
                  <div className="px-3 mb-1 text-[10px] font-semibold text-sidebar-text uppercase tracking-widest">
                    {group.title}
                  </div>
                )}
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-sidebar-active text-sidebar-text-active font-medium'
                              : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white',
                            isCollapsed && 'justify-center px-2'
                          )
                        }
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-t border-sidebar-border">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-sidebar-hover/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-900" />
              <span className="text-xs text-sidebar-text font-medium truncate">{user?.role || 'SYSTEM'}</span>
              <span className="ml-auto text-[10px] text-sidebar-text/60">v1.2</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};