import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { UserCheck, X, Wrench, Send } from 'lucide-react';

export const AssignTechnicianModal = ({ isOpen, onClose, ticket, onSuccess }) => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loadTechnicians = async () => {
        try {
          setLoadingTechs(true);
          setError('');
          const res = await maintenanceService.getActiveTechnicians();
          if (res?.success && res?.data) {
            setTechnicians(res.data);
            if (ticket?.technician_id) {
              setSelectedTechId(ticket.technician_id);
            } else if (res.data.length > 0) {
              setSelectedTechId(res.data[0].id);
            }
          }
        } catch (err) {
          setError('Không tải được danh sách kỹ thuật viên');
        } finally {
          setLoadingTechs(false);
        }
      };

      loadTechnicians();
    }
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTechId) {
      setError('Vui lòng chọn một kỹ thuật viên');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await maintenanceService.assignTechnician(ticket.id, {
        technicianId: Number(selectedTechId),
        notes: notes.trim() || null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Phân công kỹ thuật viên thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Phân Công Kỹ Thuật Viên</h3>
              <p className="text-xs text-slate-500 font-mono">Phiếu: {ticket.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
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

          {/* Ticket preview */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 line-clamp-1">{ticket.title}</span>
            <p className="text-slate-500">
              Thiết bị: <strong>{ticket.device_name}</strong> ({ticket.room_name})
            </p>
          </div>

          {/* Select Tech */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Kỹ thuật viên phụ trách <span className="text-rose-500">*</span>
            </label>
            {loadingTechs ? (
              <div className="py-2 flex items-center gap-2 text-xs text-slate-500">
                <Spinner size="sm" /> Đang tải danh sách KTV...
              </div>
            ) : (
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="">-- Chọn kỹ thuật viên --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.username}) — Đang xử lý: {t.active_tickets_count || 0} phiếu
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú chỉ đạo / Yêu cầu ưu tiên (Tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="VD: Ưu tiên xử lý gấp trong buổi sáng trước giờ học ca 2..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting} icon={Send}>
              Giao Phiếu Ngay
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
