import React, { useState } from 'react';
import { scheduleService } from '../../services/scheduleService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { CheckCircle2, X, Wrench, Calendar, DollarSign } from 'lucide-react';

export const ExecuteScheduleModal = ({ isOpen, onClose, schedule, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !schedule) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      await scheduleService.executeSchedule(schedule.id, {
        notes: notes.trim() || null,
        cost: parseFloat(cost) || 0,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể ghi nhận bảo dưỡng');
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
              <h3 className="text-base font-bold text-slate-900">Ghi Nhận Bảo Dưỡng Định Kỳ</h3>
              <p className="text-xs text-slate-500 font-mono">Thiết bị: {schedule.device_name}</p>
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

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-800">{schedule.title}</p>
            <p className="text-slate-500">
              Vị trí: <strong>{schedule.room_name}</strong> ({schedule.building_name})
            </p>
            <p className="text-[11px] text-brand-600 font-semibold">
              Chu kỳ: {schedule.frequency} • Hạn hiện tại: {new Date(schedule.scheduled_date).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú công việc đã thực hiện & Tình trạng sau bảo dưỡng
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="VD: Đã vệ sinh quạt, bôi trơn bạc đạn, tra keo tản nhiệt, kiểm tra nguồn điện ổn định..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chi phí vật tư / dầu nhớt phát sinh (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
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
              Xác Nhận Đã Bảo Dưỡng
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
