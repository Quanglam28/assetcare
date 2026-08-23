import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { 
  Home, QrCode, ClipboardList, Bell, User, 
  Wrench, Calendar, LayoutDashboard, Laptop, 
  BarChart3, Users, Settings, LogOut, KeyRound
} from 'lucide-react';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const MobileBottomNav = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!isAuthenticated) return null;

  // Build navigation items based on current role
  let navItems = [];

  if (user?.role === ROLES.USER) {
    navItems = [
      { to: '/dashboard', label: 'Trang chủ', icon: Home },
      { to: '/my-tickets', label: 'Phiếu của tôi', icon: ClipboardList },
      { to: '/qr-scanner', label: 'Quét QR', icon: QrCode, isAction: true },
      { to: '/notifications', label: 'Thông báo', icon: Bell },
      { label: 'Cá nhân', icon: User, isProfile: true },
    ];
  } else if (user?.role === ROLES.TECHNICIAN) {
    navItems = [
      { to: '/technician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/maintenance', label: 'Xử lý sự cố', icon: Wrench },
      { to: '/qr-scanner', label: 'Quét QR', icon: QrCode, isAction: true },
      { to: '/schedules', label: 'Lịch bảo trì', icon: Calendar },
      { to: '/notifications', label: 'Thông báo', icon: Bell },
    ];
  } else if (user?.role === ROLES.MANAGER) {
    navItems = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/devices', label: 'Thiết bị', icon: Laptop },
      { to: '/qr-scanner', label: 'Quét QR', icon: QrCode, isAction: true },
      { to: '/maintenance', label: 'Bảo trì', icon: Wrench },
      { to: '/reports', label: 'Báo cáo', icon: BarChart3 },
    ];
  } else {
    // ADMIN
    navItems = [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/devices', label: 'Thiết bị', icon: Laptop },
      { to: '/qr-scanner', label: 'Quét QR', icon: QrCode, isAction: true },
      { to: '/maintenance', label: 'Bảo trì', icon: Wrench },
      { to: '/users', label: 'Tài khoản', icon: Users },
    ];
  }

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Hidden on md/lg screens) */}
      <nav 
        aria-label="Thanh điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-3 py-1.5 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom,6px)+2px)] transition-all"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;

            if (item.isAction) {
              // Center prominent QR Action Button
              return (
                <NavLink
                  key={idx}
                  to={item.to}
                  className="flex flex-col items-center -mt-6 group focus:outline-none"
                  title={item.label}
                >
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/40 ring-4 ring-white group-active:scale-95 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 mt-1 tracking-tight">
                    {item.label}
                  </span>
                </NavLink>
              );
            }

            if (item.isProfile) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="flex flex-col items-center py-1 px-2 text-slate-500 hover:text-brand-600 active:scale-95 transition-all min-w-[50px] touch-manipulation focus:outline-none"
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium leading-none">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={idx}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center py-1 px-2 transition-all min-w-[50px] touch-manipulation focus:outline-none ${
                    isActive
                      ? 'text-brand-600 font-bold'
                      : 'text-slate-500 hover:text-slate-800 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon className="w-5 h-5 mb-0.5" />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
                      )}
                    </div>
                    <span className="text-[10px] leading-none mt-0.5">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Profile Modal on Mobile */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl text-slate-900 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                  alt={user?.fullName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500/20"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{user?.fullName || user?.username}</h3>
                  <p className="text-xs text-brand-600 font-semibold">{user?.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <p className="text-slate-500">Email: <span className="font-semibold text-slate-800">{user?.email}</span></p>
                {user?.departmentName && (
                  <p className="text-slate-500">Đơn vị: <span className="font-semibold text-slate-800">{user.departmentName}</span></p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    setChangePasswordOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  <KeyRound className="w-4 h-4" />
                  Đổi Mật Khẩu
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileModalOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50 text-rose-600 font-semibold hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng Xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
};
