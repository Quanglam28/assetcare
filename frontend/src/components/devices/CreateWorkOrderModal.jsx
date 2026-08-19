import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';

export const CreateWorkOrderModal = ({ isOpen, onClose, device, recommendation, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CORRECTIVE',
    priority: 'MEDIUM',
    assignedTo: '',
    estimatedCost: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadTechnicians();
      if (recommendation) {
        setFormData({
          title: `[Khuyến nghị] ${recommendation.title || 'Bảo trì thiết bị'}`,
          description: recommendation.reason || '',
          type: recommendation.type === 'CRITICAL_MAINTENANCE' ? 'EMERGENCY' : (recommendation.type === 'OVERDUE_MAINTENANCE' ? 'PREVENTIVE' : 'CORRECTIVE'),
          priority: recommendation.severity === 'CRITICAL' ? 'CRITICAL' : (recommendation.severity === 'HIGH' ? 'HIGH' : 'MEDIUM'),
          assignedTo: '',
          estimatedCost: '',
        });
      } else if (device) {
        setFormData({
          title: `Lệnh công tác bảo trì thiết bị ${device.name}`,
          description: '',
          type: 'CORRECTIVE',
          priority: 'MEDIUM',
          assignedTo: '',
          estimatedCost: '',
        });
      }
    }
  }, [isOpen, recommendation, device]);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({ role: 'TECHNICIAN', limit: 100 });
      setTechnicians(res.data?.users || res.data || []);
    } catch (err) {
      console.error('Lỗi tải kỹ thuật viên:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showError('Vui lòng nhập tiêu đề lệnh công tác');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        deviceId: device?.id,
        recommendationId: recommendation?.id || null,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        assignedTo: formData.assignedTo ? parseInt(formData.assignedTo, 10) : null,
        estimatedCost: Number(formData.estimatedCost) || 0,
      };

      const token = localStorage.getItem('token');
      const res = await fetch('/api/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tạo lệnh công tác');

      showSuccess(`Đã tạo thành công lệnh công tác [${data.data?.work_order_code || ''}]`);
      if (onSuccess) onSuccess(data.data);
      onClose();
    } catch (err) {
      showError(err.message || 'Không thể tạo lệnh công tác');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Lệnh Công Tác Bảo Trì (Work Order)">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block font-semibold">Thiết bị áp dụng:</span>
            <span className="font-bold text-slate-800">{device?.name} ({device?.code})</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">
            {device?.room_name || 'Phòng ban'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Tiêu đề lệnh công tác <span className="text-rose-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="VD: Sửa chữa sự cố bóng đèn máy chiếu P203"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Phân loại công việc
            </label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="CORRECTIVE">Sửa chữa sự cố (Corrective)</option>
              <option value="PREVENTIVE">Bảo trì định kỳ (Preventive)</option>
              <option value="EMERGENCY">Khẩn cấp (Emergency)</option>
              <option value="INSPECTION">Kiểm định / Đo kiểm (Inspection)</option>
              <option value="REPLACEMENT_REVIEW">Thẩm định thay thế (Replacement)</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Mức độ ưu tiên
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="LOW">Thấp (Low)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="HIGH">Cao (High)</option>
              <option value="CRITICAL">Khẩn cấp / Nguy cấp (Critical)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Phân công Kỹ thuật viên
            </label>
            <Select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            >
              <option value="">-- Chưa phân công (Open) --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.email})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Chi phí dự kiến (VNĐ)
            </label>
            <Input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="VD: 500000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Mô tả chi tiết / Hướng dẫn xử lý
          </label>
          <textarea
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ghi chú chi tiết về sự cố, hiện tượng hoặc khuyến nghị kỹ thuật..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Phát Lệnh Công Tác
          </Button>
        </div>
      </form>
    </Modal>
  );
};
