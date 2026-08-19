import React, { useState, useEffect, useCallback } from 'react';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Layers, Plus, Edit2, Trash2, Search, Laptop, Calendar, CheckCircle
} from 'lucide-react';

export const DeviceTypesPage = () => {
  const { isAdmin, isManager } = useAuth();

  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'IT_EQUIPMENT',
    maintenanceIntervalDays: 90,
    description: '',
  });

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await masterDataService.getDeviceTypes({ search });
      if (res?.success) {
        setDeviceTypes(res.data || []);
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Không thể nạp danh mục loại thiết bị');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        code: item.code,
        name: item.name,
        category: item.category || 'IT_EQUIPMENT',
        maintenanceIntervalDays: item.maintenance_interval_days || 90,
        description: item.description || '',
      });
    } else {
      setFormData({
        code: '',
        name: '',
        category: 'IT_EQUIPMENT',
        maintenanceIntervalDays: 90,
        description: '',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (editingItem) {
        await masterDataService.updateDeviceType(editingItem.id, formData);
        setSuccess(`Cập nhật loại thiết bị "${formData.name}" thành công!`);
      } else {
        await masterDataService.createDeviceType(formData);
        setSuccess(`Thêm mới loại thiết bị "${formData.name}" thành công!`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchTypes();
    } catch (err) {
      setError(err?.message || err?.error || 'Lưu loại thiết bị thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      setError('');
      await masterDataService.deleteDeviceType(itemToDelete.id);
      setSuccess(`Đã xóa loại thiết bị "${itemToDelete.name}" thành công!`);
      setItemToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchTypes();
    } catch (err) {
      setError(err?.message || err?.error || 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-brand-600" />
            Quản Lý Loại Thiết Bị & Chu Kỳ Bảo Dưỡng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập danh mục phân loại và quy định chu kỳ bảo dưỡng định kỳ tự động theo từng dòng thiết bị
          </p>
        </div>

        {(isAdmin || isManager) && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleOpenModal()}
          >
            Thêm Loại Thiết Bị Mới
          </Button>
        )}
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search Input */}
      <div className="max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Tìm tên loại thiết bị, mã phân loại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Device Types Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã Loại</th>
                <th className="py-3 px-4">Tên Loại Thiết Bị</th>
                <th className="py-3 px-4">Nhóm Danh Mục</th>
                <th className="py-3 px-4">Chu Kỳ Bảo Dưỡng</th>
                <th className="py-3 px-4 text-center">Số Thiết Bị Đang Dùng</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deviceTypes.map((dt) => (
                <tr key={dt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-brand-700">{dt.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{dt.name}</td>
                  <td className="py-3 px-4 text-xs">
                    <span className="px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                      {dt.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {dt.maintenance_interval_days} ngày / lần
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Laptop className="w-3 h-3" />
                      {dt.total_devices || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(isAdmin || isManager) && (
                        <button
                          type="button"
                          onClick={() => handleOpenModal(dt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          title="Sửa loại thiết bị"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setItemToDelete(dt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa loại thiết bị"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add / Edit Device Type */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Chỉnh Sửa Loại Thiết Bị' : 'Thêm Loại Thiết Bị Mới'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã loại thiết bị <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VD: PC_DESKTOP, PROJECTOR..."
                disabled={!!editingItem}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-brand-500 focus:outline-none disabled:bg-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chu kỳ bảo dưỡng (ngày) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={3650}
                value={formData.maintenanceIntervalDays}
                onChange={(e) => setFormData({ ...formData, maintenanceIntervalDays: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên loại thiết bị <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Máy Chiếu Laser Độ Phân Giải Cao..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nhóm danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="IT_EQUIPMENT">Thiết bị CNTT / Máy tính</option>
                <option value="LAB_EQUIPMENT">Thiết bị Phòng Lab / Thí nghiệm</option>
                <option value="FACILITY">Cơ sở vật chất / Điện máy / Điều hòa</option>
                <option value="OFFICE_EQUIPMENT">Thiết bị Văn phòng / Máy in</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={submitting}>Lưu Loại Thiết Bị</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Xác nhận xóa loại thiết bị"
        message={`Bạn có chắc chắn muốn xóa loại thiết bị "${itemToDelete?.name}" (${itemToDelete?.code})? Lưu ý: Không thể xóa nếu đang có thiết bị thuộc loại này.`}
      />
    </div>
  );
};
