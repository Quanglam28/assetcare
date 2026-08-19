import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { changePassword } = useAuth();

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (newPassword === oldPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không trùng khớp');
      return;
    }

    try {
      setLoading(true);
      const res = await changePassword(oldPassword, newPassword, confirmPassword);
      setSuccess(res?.message || 'Đổi mật khẩu thành công!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err?.message || err?.error || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đổi Mật Khẩu Tài Khoản"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success">
            {success}
          </Alert>
        )}

        {/* Mật khẩu cũ */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mật khẩu hiện tại <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showOld ? 'text' : 'password'}
              placeholder="Nhập mật khẩu đang dùng"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="md" onClick={handleClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            Lưu Mật Khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
