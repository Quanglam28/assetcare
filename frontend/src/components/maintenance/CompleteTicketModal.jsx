import React, { useState } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { CheckCircle2, X, Plus, Trash2, Layers, DollarSign } from 'lucide-react';

export const CompleteTicketModal = ({ isOpen, onClose, ticket, onSuccess }) => {
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [parts, setParts] = useState([]);
  const [customCost, setCustomCost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  // Quản lý danh sách linh kiện thay thế
  const handleAddPart = () => {
    setParts(prev => [
      ...prev,
      { id: Date.now(), partName: '', partCode: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemovePart = (index) => {
    setParts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePartChange = (index, field, value) => {
    setParts(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const partsTotal = parts.reduce((sum, p) => sum + ((parseInt(p.quantity, 10) || 1) * (parseFloat(p.unitPrice) || 0)), 0);
  const totalCost = customCost !== '' ? parseFloat(customCost) || 0 : partsTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rootCause.trim()) {
      setError('Vui lòng nhập nguyên nhân gây hỏng hóc');
      return;
    }
    if (!resolution.trim()) {
      setError('Vui lòng nhập biện pháp / kết quả khắc phục');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const cleanParts = parts.filter(p => p.partName.trim() !== '').map(p => ({
        partName: p.partName.trim(),
        partCode: p.partCode.trim() || null,
        quantity: parseInt(p.quantity, 10) || 1,
        unitPrice: parseFloat(p.unitPrice) || 0,
      }));

      await maintenanceService.completeRequest(ticket.id, {
        rootCause: rootCause.trim(),
        resolution: resolution.trim(),
        actualCost: totalCost,
        completionNote: completionNote.trim() || null,
        parts: cleanParts,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể hoàn thành phiếu bảo trì');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hoàn Thành Sửa Chữa & Nghiệm Thu Kỹ Thuật</h3>
              <p className="text-xs text-slate-500 font-mono">Phiếu: {ticket.code} • Thiết bị: {ticket.device_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <Alert type="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Root Cause */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nguyên nhân sự cố (Root Cause) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="VD: Hỏng tụ nguồn 500W do quá áp, quạt tản nhiệt bị kẹt bụi gây quá nhiệt..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Resolution */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Biện pháp / Kết quả xử lý (Resolution) <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
              placeholder="VD: Đã thay thế nguồn máy tính Dell 500W chính hãng, vệ sinh quạt CPU, bôi keo tản nhiệt và chạy thử nghiệm hệ thống ổn định 1 giờ."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              required
            />
          </div>

          {/* Parts Used Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-600" />
                Linh Kiện / Phụ Tùng Thay Thế
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddPart}
                className="text-xs py-1"
              >
                Thêm Linh Kiện
              </Button>
            </div>

            {parts.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">
                Không thay thế linh kiện (chỉ bảo dưỡng / sửa chữa phần mềm / chỉnh dây cáp).
              </p>
            ) : (
              <div className="space-y-2">
                {parts.map((p, idx) => (
                  <div key={p.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Tên linh kiện *"
                        value={p.partName}
                        onChange={(e) => handlePartChange(idx, 'partName', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Mã LK"
                        value={p.partCode}
                        onChange={(e) => handlePartChange(idx, 'partCode', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="SL"
                        value={p.quantity}
                        onChange={(e) => handlePartChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Đơn giá (đ)"
                        value={p.unitPrice}
                        onChange={(e) => handlePartChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePart(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Cost Summary */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Tổng chi phí thực tế (Actual Cost):</span>
              <div className="flex items-center gap-1 font-mono font-bold text-sm text-emerald-700">
                <input
                  type="number"
                  min="0"
                  value={customCost !== '' ? customCost : partsTotal}
                  onChange={(e) => setCustomCost(e.target.value)}
                  className="w-32 px-2 py-1 border border-slate-300 rounded text-right font-mono text-xs text-emerald-700 font-bold"
                />
                <span>VNĐ</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
            <input
              type="text"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="VD: Dặn dò giảng viên tránh cắm nhiều thiết bị tải nặng cùng ổ cắm..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Hủy Bỏ
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting} icon={CheckCircle2}>
              Xác Nhận Hoàn Tất Sửa Chữa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
