import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSafeRedirectPath, consumePendingRedirect } from '../utils/redirectUtil';
import { QrCode, ShieldCheck, Cpu, Wrench } from 'lucide-react';

export const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const safeRedirect = getSafeRedirectPath(
    redirectParam || location.state?.from?.pathname || consumePendingRedirect(''),
    '/dashboard'
  );

  // Nếu đã đăng nhập, chuyển hướng thẳng vào redirect target hoặc dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to={safeRedirect} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xl shadow-brand-500/25">
            <QrCode className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
        </div>
        <h2 className="mt-3 sm:mt-4 text-center text-xl sm:text-2xl font-bold tracking-tight text-white px-2">
          Quản Lý Tài Sản & Bảo Trì Thiết Bị
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Trường Đại học Công nghệ Giao thông Vận tải (UTT) • QR Code
        </p>
      </div>

      <div className="mt-5 sm:mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-2 sm:px-0">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-8 shadow-2xl rounded-2xl border border-slate-100">
          <Outlet />
        </div>

        {/* Feature badges footer */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-slate-400 text-center">
          <span className="flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-brand-400" /> Quét QR tức thì
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" /> Phân luồng 4 Roles
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Nghiệm thu minh bạch
          </span>
        </div>
      </div>
    </div>
  );
};
