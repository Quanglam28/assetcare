import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, User, LogOut, KeyRound, ChevronDown, Shield, CheckCircle } from 'lucide-react';
import { ROLE_LABELS } from '../utils/constants';
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal';
import { NotificationDropdown } from '../components/layout/NotificationDropdown';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 sm:px-6 backdrop-blur-xl transition-all shadow-2xs">
        {/* Left side: Hamburger & System Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95"
            title="Thu gọn / Mở rộng menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              UTT AssetCare — Hệ Thống Quản Lý & Bảo Trì Thiết Bị
            </span>
          </div>
        </div>

        {/* Right side: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Center */}
          <NotificationDropdown />

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100/80 transition-all text-left group"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                alt={user?.fullName || 'User Avatar'}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/30 group-hover:ring-brand-500 transition-all"
              />
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName || user?.username}</p>
                <p className="text-[11px] text-brand-600 font-semibold">{ROLE_LABELS[user?.role] || user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>

            {/* User Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white py-2 shadow-2xl border border-slate-200/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Đang đăng nhập:</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{user?.fullName || user?.username}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[10px] border border-brand-200">
                      {ROLE_LABELS[user?.role] || user?.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1.5">{user?.email}</p>
                  {user?.departmentName && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">{user.departmentName}</p>
                  )}
                </div>

                <div className="py-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setChangePasswordOpen(true);
                    }}
                    className="w-full flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <KeyRound className="h-4 w-4 mr-2.5 text-slate-400" />
                    Đổi mật khẩu
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2.5 text-rose-500" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
};
