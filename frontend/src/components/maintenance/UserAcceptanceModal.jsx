import React, { useState } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { CheckCircle2, X, Star } from 'lucide-react';

export const UserAcceptanceModal = ({ isOpen, onClose, ticket, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await maintenanceService.acceptAndClose(ticket.id, {
        rating: Number(rating),
        notes: notes.trim() || null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Nghiệm thu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nghiệm Thu & Đóng Phiếu Bảo Trì</h3>
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

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <span className="font-bold">Xác nhận thiết bị đã được sửa chữa tốt:</span>
            <p className="text-emerald-800 text-[11px]">
              Bạn xác nhận thiết bị <strong>{ticket.device_name}</strong> tại {ticket.room_name} đã hoạt động bình thường trở lại.
            </p>
          </div>

          {/* Rating stars */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
              Đánh giá chất lượng phục vụ của Kỹ thuật viên:
            </label>
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs font-bold text-amber-600 mt-1">
              {rating === 5 && '⭐⭐⭐⭐⭐ Rất hài lòng'}
              {rating === 4 && '⭐⭐⭐⭐ Hài lòng'}
              {rating === 3 && '⭐⭐⭐ Bình thường'}
              {rating === 2 && '⭐⭐ Chưa hài lòng'}
              {rating === 1 && '⭐ Kém'}
            </p>
          </div>

          {/* Feedback note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nhận xét / Lời cảm ơn (Tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="VD: Kỹ thuật viên đến xử lý rất nhanh và hướng dẫn nhiệt tình..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={CheckCircle2}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Xác Nhận Đã Khắc Phục
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
