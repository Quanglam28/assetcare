import React, { useState, useEffect } from 'react';
import { scheduleService } from '../../services/scheduleService';
import { maintenanceService } from '../../services/maintenanceService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { Calendar, X, Laptop, Clock, Wrench, Edit3, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SCHEDULE_FREQUENCY_CONFIG } from '../../utils/constants';
import { calculateNextRunDateClamped, formatDate } from '../../utils/formatters';

export const EditScheduleModal = ({ isOpen, onClose, schedule, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    frequency: 'QUARTERLY',
    customDays: 30,
    scheduledDate: '',
    assignedTechnicianId: '',
    status: 'SCHEDULED',
    notes: '',
  });

  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && schedule) {
      setFormData({
        title: schedule.title || '',
        frequency: schedule.frequency || 'QUARTERLY',
        customDays: schedule.custom_days || 30,
        scheduledDate: schedule.scheduled_date ? String(schedule.scheduled_date).substring(0, 10) : '',
        assignedTechnicianId: schedule.assigned_technician_id ? String(schedule.assigned_technician_id) : '',
        status: schedule.status || 'SCHEDULED',
        notes: schedule.notes || '',
      });
      setError('');
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    if (isOpen) {
      const loadTechs = async () => {
        try {
          setLoadingTechs(true);
          const res = await maintenanceService.getActiveTechnicians();
          if (res?.success) {
            setTechnicians(res.data || []);
          }
        } catch (err) {
          console.warn('Lỗi tải danh sách KTV:', err);
        } finally {
          setLoadingTechs(false);
        }
      };
      loadTechs();
    }
  }, [isOpen]);

  if (!isOpen || !schedule) return null;

  const isTerminal = schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Tiêu đề kế hoạch bảo dưỡng không được để trống');
      return;
    }
    if (!formData.scheduledDate) {
      setError('Ngày dự kiến thực hiện bảo trì là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        title: formData.title.trim(),
        frequency: formData.frequency,
        scheduledDate: formData.scheduledDate,
        assignedTechnicianId: formData.assignedTechnicianId ? Number(formData.assignedTechnicianId) : null,
        status: formData.status,
        notes: formData.notes ? formData.notes.trim() : null,
      };

      if (formData.frequency === 'CUSTOM') {
        payload.customDays = parseInt(formData.customDays, 10) || 30;
      }

      await scheduleService.updateSchedule(schedule.id, payload);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể cập nhật kế hoạch bảo dưỡng');
    } finally {
      setSubmitting(false);
    }
  };

  const nextDatePreview = calculateNextRunDateClamped(
    formData.scheduledDate,
    formData.frequency,
    formData.customDays
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Chỉnh Sửa Kế Hoạch Bảo Trì
              </h3>
              <p className="text-xs text-slate-500">
                Mã lịch: <span className="font-mono font-bold text-slate-700">#{schedule.id}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
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

          {/* Device Info (Read-only banner) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Thiết bị bảo dưỡng</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-brand-700">{schedule.device_code}</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-slate-800">{schedule.device_name}</span>
              </div>
              <span className="text-slate-500 text-[11px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {schedule.room_name} ({schedule.building_name})
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
              schedule.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800'
                : schedule.status === 'CANCELLED'
                ? 'bg-slate-200 text-slate-700'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {schedule.status}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề kế hoạch bảo dưỡng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Vệ sinh quạt gió và nạp gas điều hòa định kỳ..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Frequency & Scheduled Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chu kỳ lặp lại (Frequency)
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="MONTHLY">Hàng tháng (1 tháng)</option>
                <option value="QUARTERLY">Hàng quý (3 tháng)</option>
                <option value="SEMI_ANNUALLY">Nửa năm (6 tháng)</option>
                <option value="ANNUALLY">Hàng năm (12 tháng)</option>
                <option value="CUSTOM">Tùy chỉnh số ngày</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày thực hiện dự kiến <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Custom days if CUSTOM */}
          {formData.frequency === 'CUSTOM' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhập số ngày lặp lại chu kỳ
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                name="customDays"
                value={formData.customDays}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          )}

          {/* Technician Assign */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phân công Kỹ thuật viên phụ trách
            </label>
            <select
              name="assignedTechnicianId"
              value={formData.assignedTechnicianId}
              onChange={handleChange}
              disabled={loadingTechs}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Chưa chỉ định (Để trống) --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.username})
                </option>
              ))}
            </select>
          </div>

          {/* Status field (Respecting State Transitions) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trạng thái kế hoạch
            </label>
            {isTerminal ? (
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span className="font-semibold font-mono">
                  {schedule.status === 'COMPLETED' ? 'COMPLETED (Đã hoàn thành)' : 'CANCELLED (Đã hủy)'}
                </span>
                <span className="text-[11px] text-amber-700 italic">
                  Trạng thái kết thúc - không thể mở lại
                </span>
              </div>
            ) : (
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="SCHEDULED">Đang lên lịch (SCHEDULED)</option>
                <option value="CANCELLED">Hủy kế hoạch (CANCELLED)</option>
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú nội dung & Hạng mục kiểm tra
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="VD: Kiểm tra nguồn điện, bôi trơn bạc đạn, tra keo tản nhiệt..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Live Next Date Preview Notice */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Lần bảo dưỡng kế tiếp dự kiến:
            </span>
            <strong className="font-mono text-sm text-blue-800">{nextDatePreview}</strong>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting} icon={CheckCircle2}>
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
