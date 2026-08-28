import React, { useState, useEffect, useCallback } from 'react';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const CATEGORY_LABELS = {
  IT_EQUIPMENT: 'CNTT - Máy tính',
  LAB_EQUIPMENT: 'Phòng Lab - Thí nghiệm',
  FACILITY: 'Cơ sở vật chất',
  OFFICE_EQUIPMENT: 'Văn phòng',
  OTHER: 'Khác',
};

export const DeviceTypesPage = () => {
  const { isAdmin, isManager } = useAuth();

  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', category: 'IT_EQUIPMENT',
    maintenanceIntervalDays: 90, description: '',
  });

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await masterDataService.getDeviceTypes({ search });
      if (res?.success) setDeviceTypes(res.data || []);
    } catch (err) {
      setError(err?.message || err?.error || 'Không thể nạp danh mục');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const filtered = deviceTypes.filter(dt =>
    !categoryFilter || dt.category === categoryFilter
  );

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        code: item.code, name: item.name,
        category: item.category || 'IT_EQUIPMENT',
        maintenanceIntervalDays: item.maintenance_interval_days || 90,
        description: item.description || '',
      });
    } else {
      setFormData({ code: '', name: '', category: 'IT_EQUIPMENT', maintenanceIntervalDays: 90, description: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true); setError('');
      if (editingItem) {
        await masterDataService.updateDeviceType(editingItem.id, formData);
        setSuccess(`Cập nhật "${formData.name}" thành công`);
      } else {
        await masterDataService.createDeviceType(formData);
        setSuccess(`Thêm "${formData.name}" thành công`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchTypes();
    } catch (err) {
      setError(err?.message || err?.error || 'Lưu thất bại');
    } finally { setSubmitting(false); }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true); setError('');
      await masterDataService.deleteDeviceType(itemToDelete.id);
      setSuccess(`Đã xóa "${itemToDelete.name}"`);
      setItemToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchTypes();
    } catch (err) {
      setError(err?.message || err?.error || 'Xóa thất bại');
    } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400">
        <span className="text-slate-500">Quản lý thiết bị</span>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700 font-medium">Loại thiết bị</span>
      </div>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Loại thiết bị</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý danh mục và chu kỳ bảo dưỡng</p>
        </div>
        {(isAdmin || isManager) && (
          <Button variant="primary" size="sm" icon={Plus} onClick={() => handleOpenModal()}>
            Thêm loại thiết bị
          </Button>
        )}
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-brand-500"
        >
          <option value="">Tất cả nhóm</option>
          <option value="IT_EQUIPMENT">CNTT - Máy tính</option>
          <option value="LAB_EQUIPMENT">Phòng Lab</option>
          <option value="FACILITY">Cơ sở vật chất</option>
          <option value="OFFICE_EQUIPMENT">Văn phòng</option>
          <option value="OTHER">Khác</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} loại</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Spinner size="md" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mã loại</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tên loại</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nhóm</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chu kỳ</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Số TB</th>
                <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((dt) => (
                <tr key={dt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-4">
                    <span className="text-xs font-mono text-brand-700 font-medium">{dt.code}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-sm text-slate-800">{dt.name}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs text-slate-500">{CATEGORY_LABELS[dt.category] || dt.category}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs text-slate-600">{dt.maintenance_interval_days} ngày</span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="text-xs font-medium text-slate-700">{dt.total_devices || 0}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(isAdmin || isManager) && (
                        <button onClick={() => handleOpenModal(dt)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Sửa">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => setItemToDelete(dt)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    Không có loại thiết bị nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingItem ? 'Chỉnh sửa loại thiết bị' : 'Thêm loại thiết bị'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mã loại <span className="text-red-500">*</span>
              </label>
              <input type="text" value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="VD: PC_DESKTOP" disabled={!!editingItem}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-brand-500 disabled:bg-slate-50 font-mono"
                required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Chu kỳ (ngày) <span className="text-red-500">*</span>
              </label>
              <input type="number" min={1} max={3650}
                value={formData.maintenanceIntervalDays}
                onChange={(e) => setFormData({...formData, maintenanceIntervalDays: Number(e.target.value)})}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-brand-500"
                required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tên loại <span className="text-red-500">*</span>
              </label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="VD: Máy chiếu Laser" 
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-brand-500"
                required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nhóm danh mục</label>
              <select value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-brand-500">
                <option value="IT_EQUIPMENT">CNTT - Máy tính</option>
                <option value="LAB_EQUIPMENT">Phòng Lab - Thí nghiệm</option>
                <option value="FACILITY">Cơ sở vật chất</option>
                <option value="OFFICE_EQUIPMENT">Văn phòng</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
              <textarea value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={2} 
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>Lưu</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete} loading={deleting}
        title="Xác nhận xóa"
        message={`Xóa loại thiết bị "${itemToDelete?.name}" (${itemToDelete?.code})? Không thể xóa nếu đang có thiết bị thuộc loại này.`} />
    </div>
  );
};