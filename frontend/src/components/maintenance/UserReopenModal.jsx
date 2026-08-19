import React, { useState } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

export const UserReopenModal = ({ isOpen, onClose, ticket, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Vui lòng nêu rõ lý do sự cố chưa được khắc phục (tối thiểu 5 ký tự)');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await maintenanceService.rejectAndReopen(ticket.id, {
        reason: reason.trim(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể gửi yêu cầu xử lý lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Yêu Cầu Sửa Chữa Lại</h3>
              <p className="text-xs text-slate-500 font-mono">Phiếu: {ticket.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <Alert type="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
            <span className="font-bold">Sự cố chưa được giải quyết dứt điểm?</span>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              Phiếu sẽ được mở lại (REOPENED) và thông báo khẩn cấp tới Kỹ thuật viên <strong>{ticket.technician_name || 'phụ trách'}</strong> để quay lại kiểm tra.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả hiện tượng lỗi vẫn còn tồn tại <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="VD: Khi bật máy lên sau 10 phút vẫn bị tắt nguồn đột ngột, màn hình vẫn còn sọc ngang mờ..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="md"
              loading={submitting}
              icon={RotateCcw}
            >
              Gửi Yêu Cầu Sửa Lại
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
