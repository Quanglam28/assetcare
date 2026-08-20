import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getSafeRedirectPath, savePendingRedirect } from '../../utils/redirectUtil';
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight, 
  CheckCircle2, Sparkles, Laptop, QrCode
} from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có độ dài tối thiểu 8 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Đăng ký và nhận token Auto-Login
      const loggedUser = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      // Lấy đích đến an toàn (chống Open Redirect)
      const safeRedirect = getSafeRedirectPath(redirectParam, '');
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
      setError(err?.message || err?.error || 'Đăng ký không thành công. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const loginLink = redirectParam 
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : '/login';

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900">Đăng Ký Tài Khoản</h3>
        <p className="text-xs text-slate-500 mt-1">
          Dành cho Cán bộ, Giảng viên & Sinh viên UTT quét mã QR thiết bị
        </p>
      </div>

      {redirectParam && (
        <div className="mb-4 p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-800 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Tài khoản sau khi đăng ký sẽ tự động mở đúng thiết bị bạn vừa quét.</span>
        </div>
      )}

      {error && (
        <Alert type="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ và tên */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Họ và tên đầy đủ <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              id="fullName"
              name="name"
              autoComplete="name"
              placeholder="VD: TS. Nguyễn Văn A / Sinh viên..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Email trường */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Địa chỉ Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="ten@utt.edu.vn hoặc email cá nhân..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mật khẩu (tối thiểu 8 ký tự, gồm chữ & số) <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 mt-2 text-sm font-semibold shadow-md shadow-brand-600/20"
          loading={loading}
          icon={ArrowRight}
        >
          Đăng Ký & Tiếp Tục
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Đã có tài khoản?{' '}
        <Link to={loginLink} className="font-bold text-brand-600 hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};
