import React, { useState, useEffect } from 'react';
import { scheduleService } from '../../services/scheduleService';
import { deviceService } from '../../services/deviceService';
import { maintenanceService } from '../../services/maintenanceService';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { Calendar, X, Laptop, Clock, Wrench, Search, Plus } from 'lucide-react';
import { SCHEDULE_FREQUENCY_CONFIG } from '../../utils/constants';

export const CreateScheduleModal = ({ isOpen, onClose, onSuccess, initialDevice = null }) => {
  const [formData, setFormData] = useState({
    deviceId: initialDevice?.id || '',
    title: '',
    frequency: 'QUARTERLY',
    customDays: 30,
    scheduledDate: new Date().toISOString().split('T')[0],
    assignedTechnicianId: '',
    notes: '',
  });

  const [selectedDevice, setSelectedDevice] = useState(initialDevice);
  const [devicesList, setDevicesList] = useState([]);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [searchingDevices, setSearchingDevices] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialDevice) {
        setSelectedDevice(initialDevice);
        setFormData(p => ({
          ...p,
          deviceId: initialDevice.id,
          title: `Bảo dưỡng định kỳ: ${initialDevice.name}`,
        }));
      }

      // Load Technicians
      const loadTechs = async () => {
        try {
          setLoadingTechs(true);
          const res = await maintenanceService.getActiveTechnicians();
          if (res?.success) {
            setTechnicians(res.data || []);
          }
        } catch (err) {
          console.warn('Lỗi tải KTV:', err);
        } finally {
          setLoadingTechs(false);
        }
      };
      loadTechs();
    }
  }, [isOpen, initialDevice]);

  if (!isOpen) return null;

  const handleSearchDevices = async (e) => {
    e.preventDefault();
    if (!deviceSearch.trim()) return;
    try {
      setSearchingDevices(true);
      const res = await deviceService.getDevices({ search: deviceSearch.trim(), limit: 8 });
      if (res?.success) {
        setDevicesList(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi tìm thiết bị:', err);
    } finally {
      setSearchingDevices(false);
    }
  };

  const handleSelectDevice = (dev) => {
    setSelectedDevice(dev);
    setFormData(prev => ({
      ...prev,
      deviceId: dev.id,
      title: prev.title || `Bảo dưỡng định kỳ: ${dev.name}`,
    }));
    setDevicesList([]);
    setDeviceSearch('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Tính ngày bảo trì tiếp theo xem trước
  const calculatePreviewNextDate = () => {
    const d = new Date(formData.scheduledDate || Date.now());
    if (isNaN(d.getTime())) return 'N/A';

    switch (formData.frequency) {
      case 'MONTHLY':
        d.setMonth(d.getMonth() + 1);
        break;
      case 'QUARTERLY':
        d.setMonth(d.getMonth() + 3);
        break;
      case 'SEMI_ANNUALLY':
      case 'SEMIANNUAL':
        d.setMonth(d.getMonth() + 6);
        break;
      case 'ANNUALLY':
      case 'YEARLY':
        d.setFullYear(d.getFullYear() + 1);
        break;
      case 'CUSTOM':
        d.setDate(d.getDate() + (parseInt(formData.customDays, 10) || 30));
        break;
      default:
        d.setMonth(d.getMonth() + 3);
        break;
    }
    return d.toLocaleDateString('vi-VN');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deviceId) {
      setError('Vui lòng chọn thiết bị cần lập lịch');
      return;
    }
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề lịch bảo trì');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await scheduleService.createSchedule({
        deviceId: Number(formData.deviceId),
        title: formData.title.trim(),
        frequency: formData.frequency,
        scheduledDate: formData.scheduledDate,
        customDays: formData.frequency === 'CUSTOM' ? Number(formData.customDays) : undefined,
        assignedTechnicianId: formData.assignedTechnicianId ? Number(formData.assignedTechnicianId) : null,
        notes: formData.notes.trim() || null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.message || 'Không thể tạo lịch bảo trì');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-brand-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Lập Kế Hoạch Bảo Trì Định Kỳ</h3>
              <p className="text-xs text-slate-500">Phòng ngừa hỏng hóc và duy trì tuổi thọ thiết bị</p>
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

          {/* Device selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Thiết bị bảo dưỡng <span className="text-rose-500">*</span>
            </label>
            {selectedDevice ? (
              <div className="p-3 bg-brand-50/70 rounded-xl border border-brand-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-brand-700">{selectedDevice.code}</span> -{' '}
                  <span className="font-bold text-slate-800">{selectedDevice.name}</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    {selectedDevice.room_name} ({selectedDevice.building_name})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedDevice(null); setFormData(p => ({ ...p, deviceId: '' })); }}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tìm theo tên máy, mã thiết bị (VD: DEV-2026...)"
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSearchDevices}
                    loading={searchingDevices}
                    icon={Search}
                  >
                    Tìm
                  </Button>
                </div>

                {devicesList.length > 0 && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-36 overflow-y-auto bg-slate-50 text-xs">
                    {devicesList.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDevice(d)}
                        className="p-2 hover:bg-white cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-brand-700 font-mono">{d.code}</strong> - {d.name}
                          <span className="text-slate-400 block text-[10px]">{d.room_name}</span>
                        </div>
                        <Button size="sm" variant="outline" className="py-0.5 text-[11px]">Chọn</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                <option value="MONTHLY">Hàng tháng (30 ngày)</option>
                <option value="QUARTERLY">Hàng quý (90 ngày)</option>
                <option value="SEMI_ANNUALLY">Nửa năm (180 ngày)</option>
                <option value="ANNUALLY">Hàng năm (365 ngày)</option>
                <option value="CUSTOM">Tùy chỉnh số ngày</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bắt đầu / Ngày dự kiến <span className="text-rose-500">*</span>
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
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
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

          {/* Notes / Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú nội dung & Hạng mục kiểm tra (Checklist)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="VD: Kiểm tra nguồn điện, bôi trơn bạc đạn quạt, tra keo tản nhiệt, test áp suất gas..."
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Live Next Date Preview Notice */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Lần bảo dưỡng kế tiếp dự kiến:
            </span>
            <strong className="font-mono text-sm text-blue-800">{calculatePreviewNextDate()}</strong>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting} icon={Plus}>
              Tạo Lịch Bảo Trì
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
