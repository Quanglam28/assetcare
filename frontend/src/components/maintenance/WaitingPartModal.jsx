import React, { useState } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Clock, X, AlertTriangle } from 'lucide-react';

export const WaitingPartModal = ({ isOpen, onClose, ticket, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [partsNeeded, setPartsNeeded] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Vui lòng ghi rõ lý do chuyển sang chờ linh kiện');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await maintenanceService.markWaitingPart(ticket.id, {
        notes: notes.trim(),
        partsNeeded: partsNeeded.trim() || null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tạm Dừng Chờ Linh Kiện</h3>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Linh kiện cần đặt mua / yêu cầu kho cấp
            </label>
            <input
              type="text"
              value={partsNeeded}
              onChange={(e) => setPartsNeeded(e.target.value)}
              placeholder="VD: Nguồn Dell 500W, RAM DDR4 8GB Kingston..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lý do chi tiết & tình trạng thiết bị <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="VD: Bo nguồn cháy tụ không sửa được tại chỗ, đã tháo máy chuyển về phòng KTV chờ linh kiện thay thế..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              Xác Nhận Chờ Linh Kiện
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
