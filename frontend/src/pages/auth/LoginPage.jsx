import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getSafeRedirectPath, consumePendingRedirect } from '../../utils/redirectUtil';
import { User, Lock, Eye, EyeOff, ArrowRight, QrCode } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const safeRedirect = getSafeRedirectPath(
    redirectParam || location.state?.from?.pathname || consumePendingRedirect(''),
    ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập/email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(username.trim(), password);

      // Chuyển hướng trực tiếp tới Target Device nếu có redirect query
      if (safeRedirect && safeRedirect !== '/dashboard' && safeRedirect !== '/') {
        navigate(safeRedirect, { replace: true });
      } else {
        if (loggedUser?.role === 'TECHNICIAN') {
          navigate('/technician/dashboard', { replace: true });
        } else if (loggedUser?.role === 'USER') {
          navigate('/my-tickets', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại');
    } finally {
      setLoading(false);
    }
  };

  const registerLink = redirectParam
    ? `/register?redirect=${encodeURIComponent(redirectParam)}`
    : '/register';

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Đăng Nhập Hệ Thống</h3>
        <p className="text-xs text-slate-500 mt-1">
          Trường Đại học Công nghệ GTVT (UTT) • Quản lý & Bảo trì bằng mã QR
        </p>
      </div>

      {redirectParam && (
        <div className="mb-4 p-3 bg-brand-50 border border-brand-200/80 rounded-xl text-xs text-brand-900 flex items-start gap-2.5 shadow-2xs">
          <QrCode className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">Bạn đang mở thiết bị từ mã QR. Sau khi đăng nhập, hệ thống sẽ tự động đưa bạn về đúng thiết bị.</span>
        </div>
      )}

      {error && (
        <Alert type="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Form đăng nhập */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên đăng nhập hoặc Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Tên đăng nhập hoặc Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              placeholder="Nhập username hoặc email trường..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Mật khẩu kèm nút Show/Hide */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer">
              Quên mật khẩu?
            </span>
          </div>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <span>Ghi nhớ phiên đăng nhập</span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 mt-2 text-sm font-bold shadow-md shadow-brand-600/25 rounded-xl"
          loading={loading}
          icon={ArrowRight}
        >
          Đăng Nhập Hệ Thống
        </Button>
      </form>

      {/* Nút chuyển sang Đăng Ký */}
      <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
        Chưa có tài khoản?{' '}
        <Link to={registerLink} className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
          Đăng ký tài khoản mới
        </Link>
      </div>
    </div>
  );
};
