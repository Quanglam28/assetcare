import React, { useState, useEffect, useCallback } from 'react';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  FileText, Plus, Edit2, Trash2, Search, Phone, Mail, MapPin, User, Laptop
} from 'lucide-react';

export const SuppliersPage = () => {
  const { isAdmin } = useAuth();

  const [suppliers, setSuppliers] = useState([]);
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
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    description: '',
  });

  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await masterDataService.getSuppliers({ search });
      if (res?.success) {
        setSuppliers(res.data || []);
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Không thể nạp danh mục nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        code: item.code,
        name: item.name,
        contactPerson: item.contact_person || '',
        phone: item.phone || '',
        email: item.email || '',
        address: item.address || '',
        taxCode: item.tax_code || '',
        description: item.description || '',
      });
    } else {
      setFormData({
        code: '',
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        taxCode: '',
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
        await masterDataService.updateSupplier(editingItem.id, formData);
        setSuccess(`Cập nhật nhà cung cấp "${formData.name}" thành công!`);
      } else {
        await masterDataService.createSupplier(formData);
        setSuccess(`Thêm mới nhà cung cấp "${formData.name}" thành công!`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchSuppliers();
    } catch (err) {
      setError(err?.message || err?.error || 'Lưu nhà cung cấp thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      setError('');
      await masterDataService.deleteSupplier(itemToDelete.id);
      setSuccess(`Đã xóa nhà cung cấp "${itemToDelete.name}" thành công!`);
      setItemToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchSuppliers();
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
            <FileText className="w-7 h-7 text-brand-600" />
            Quản Lý Nhà Cung Cấp & Đối Tác Bảo Hành
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh bạ các đơn vị phân phối thiết bị chính hãng, thông tin liên hệ bảo hành và bảo trì
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => handleOpenModal()}
          >
            Thêm Nhà Cung Cấp Mới
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
          placeholder="Tìm tên nhà cung cấp, mã, SĐT, người liên hệ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã NCC</th>
                <th className="py-3 px-4">Tên Nhà Cung Cấp</th>
                <th className="py-3 px-4">Người Liên Hệ</th>
                <th className="py-3 px-4">Số Điện Thoại / Email</th>
                <th className="py-3 px-4">Địa Chỉ</th>
                <th className="py-3 px-4 text-center">Số Thiết Bị Cung Cấp</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-brand-700">{s.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {s.contact_person ? (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {s.contact_person}
                      </span>
                    ) : '---'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {s.phone && (
                      <div className="flex items-center gap-1 font-mono font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {s.phone}
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {s.email}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 truncate max-w-[200px]">
                    {s.address || '---'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Laptop className="w-3 h-3" />
                      {s.total_devices || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Sửa nhà cung cấp"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa nhà cung cấp"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add / Edit Supplier */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã nhà cung cấp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VD: SUP-DELL, SUP-DAIKIN..."
                disabled={!!editingItem}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-brand-500 focus:outline-none disabled:bg-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mã số thuế</label>
              <input
                type="text"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                placeholder="0101234567"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên công ty / Nhà cung cấp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Công ty TNHH Dell Technologies Việt Nam..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Người đại diện liên hệ</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="VD: Nguyễn Văn Phụ Trách..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại hotline</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="1800 545 455"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ Email bảo hành</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="support@partner.com"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ trụ sở / trung tâm bảo hành</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Số 123 Đường ABC, Quận XYZ, TP. Hà Nội"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={submitting}>Lưu Nhà Cung Cấp</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Xác nhận xóa nhà cung cấp"
        message={`Bạn có chắc chắn muốn xóa nhà cung cấp "${itemToDelete?.name}" (${itemToDelete?.code})? Lưu ý: Không thể xóa nếu nhà cung cấp đang gắn với các thiết bị trong trường.`}
      />
    </div>
  );
};
