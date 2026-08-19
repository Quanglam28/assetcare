import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { userService } from '../../services/userService';
import { KeyRound, Copy, Check, Lock, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!user) return null;

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessResult(null);

    try {
      setLoading(true);
      const res = await userService.resetPassword(user.id, newPassword);
      setSuccessResult(res?.data || { resetPassword: newPassword });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.message || err?.error || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (successResult?.resetPassword) {
      navigator.clipboard.writeText(successResult.resetPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setNewPassword('password123');
    setError('');
    setSuccessResult(null);
    setShowPassword(false);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đặt Lại Mật Khẩu Người Dùng"
      size="md"
    >
      <div className="space-y-4">
        {/* User preview header */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
            {user.full_name?.charAt(0) || user.username?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user.full_name}</p>
            <p className="text-xs text-slate-500 truncate">@{user.username} • {user.email}</p>
          </div>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {successResult ? (
          <div className="space-y-4">
            <Alert type="success">
              Mật khẩu đã được đặt lại thành công cho tài khoản <strong>@{user.username}</strong>!
            </Alert>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Mật khẩu mới đã được cập nhật:
              </label>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 select-all">
                  {successResult.resetPassword}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  icon={copied ? Check : Copy}
                  className={copied ? 'text-emerald-600 border-emerald-300' : ''}
                >
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="primary" onClick={handleClose}>
                Hoàn Tất
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu mới thiết lập <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới hoặc dùng mặc định..."
                  className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gợi ý mặc định: <code className="font-mono text-brand-600 font-semibold cursor-pointer" onClick={() => setNewPassword('password123')}>password123</code>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={KeyRound}>
                Xác Nhận Đặt Lại
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
