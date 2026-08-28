import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, ChevronDown, KeyRound, LogOut, Bell } from 'lucide-react';
import { ROLE_LABELS } from '../utils/constants';
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal';
import { NotificationDropdown } from '../components/layout/NotificationDropdown';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white border-b border-slate-200 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-medium text-slate-600">Hệ thống quản lý tài sản</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationDropdown />

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-600 text-white text-[11px] font-bold">
                {(user?.fullName || user?.username || '?')[0].toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-slate-800 leading-tight">{user?.fullName || user?.username}</div>
                <div className="text-[10px] text-slate-500">{ROLE_LABELS[user?.role] || user?.role}</div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-1 w-56 rounded border border-slate-200 bg-white py-1 shadow-lg z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="text-xs font-medium text-slate-900">{user?.fullName || user?.username}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{user?.email}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                        {ROLE_LABELS[user?.role] || user?.role}
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); setChangePasswordOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </>
  );
};