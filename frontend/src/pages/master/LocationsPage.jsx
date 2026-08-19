import React, { useState, useEffect, useCallback } from 'react';
import { masterDataService } from '../../services/masterDataService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Building2, MapPin, Plus, Edit2, Trash2, Search, 
  Layers, CheckCircle, AlertTriangle, Laptop
} from 'lucide-react';

export const LocationsPage = () => {
  const { isAdmin, isManager } = useAuth();

  const [activeTab, setActiveTab] = useState('locations'); // 'locations' | 'buildings'
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Location Modal State
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({
    buildingId: '',
    code: '',
    roomName: '',
    floor: 1,
    type: 'CLASSROOM',
    description: '',
  });

  // Building Modal State
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [buildingForm, setBuildingForm] = useState({
    code: '',
    name: '',
    address: '',
    totalFloors: 5,
    description: '',
  });

  // Confirm delete dialog
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'location' | 'building', item }
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [locRes, bRes] = await Promise.all([
        masterDataService.getLocations({ limit: 200, search }),
        masterDataService.getBuildings({ search }),
      ]);

      if (locRes?.success) setLocations(locRes.data || []);
      if (bRes?.success) setBuildings(bRes.data || []);
    } catch (err) {
      setError(err?.message || err?.error || 'Không thể nạp dữ liệu địa điểm/tòa nhà');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Location Form Handlers
  const handleOpenLocationModal = (loc = null) => {
    setEditingLocation(loc);
    if (loc) {
      setLocationForm({
        buildingId: loc.building_id,
        code: loc.code,
        roomName: loc.room_name,
        floor: loc.floor,
        type: loc.type,
        description: loc.description || '',
      });
    } else {
      setLocationForm({
        buildingId: buildings[0]?.id || '',
        code: '',
        roomName: '',
        floor: 1,
        type: 'CLASSROOM',
        description: '',
      });
    }
    setLocationModalOpen(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (editingLocation) {
        await masterDataService.updateLocation(editingLocation.id, locationForm);
        setSuccess(`Cập nhật phòng "${locationForm.roomName}" thành công!`);
      } else {
        await masterDataService.createLocation(locationForm);
        setSuccess(`Thêm mới phòng "${locationForm.roomName}" thành công!`);
      }
      setLocationModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError(err?.message || err?.error || 'Lưu phòng học thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // Building Form Handlers
  const handleOpenBuildingModal = (b = null) => {
    setEditingBuilding(b);
    if (b) {
      setBuildingForm({
        code: b.code,
        name: b.name,
        address: b.address || '',
        totalFloors: b.total_floors,
        description: b.description || '',
      });
    } else {
      setBuildingForm({
        code: '',
        name: '',
        address: '',
        totalFloors: 5,
        description: '',
      });
    }
    setBuildingModalOpen(true);
  };

  const handleSaveBuilding = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      if (editingBuilding) {
        await masterDataService.updateBuilding(editingBuilding.id, buildingForm);
        setSuccess(`Cập nhật tòa nhà "${buildingForm.name}" thành công!`);
      } else {
        await masterDataService.createBuilding(buildingForm);
        setSuccess(`Thêm mới tòa nhà "${buildingForm.name}" thành công!`);
      }
      setBuildingModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError(err?.message || err?.error || 'Lưu tòa nhà thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      setError('');
      if (itemToDelete.type === 'location') {
        await masterDataService.deleteLocation(itemToDelete.item.id);
        setSuccess(`Đã xóa phòng "${itemToDelete.item.room_name}"`);
      } else {
        await masterDataService.deleteBuilding(itemToDelete.item.id);
        setSuccess(`Đã xóa tòa nhà "${itemToDelete.item.name}"`);
      }
      setItemToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      setError(err?.message || err?.error || 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-brand-600" />
            Quản Lý Tòa Nhà & Phòng Học
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị vị trí, khu giảng đường, phòng thí nghiệm và cơ sở hạ tầng đại học
          </p>
        </div>

        {(isAdmin || isManager) && (
          <div className="flex items-center gap-2">
            {activeTab === 'locations' ? (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => handleOpenLocationModal()}
              >
                Thêm Phòng Mới
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => handleOpenBuildingModal()}
              >
                Thêm Tòa Nhà Mới
              </Button>
            )}
          </div>
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'locations'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Danh Sách Phòng Học / Địa Điểm ({locations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('buildings')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'buildings'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Danh Sách Tòa Nhà ({buildings.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder={activeTab === 'locations' ? 'Tìm tên phòng, mã phòng, tòa nhà...' : 'Tìm tên tòa, mã tòa nhà, địa chỉ...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : activeTab === 'locations' ? (
        /* TAB 1: Locations Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã Phòng</th>
                <th className="py-3 px-4">Tên Phòng Học / Địa Điểm</th>
                <th className="py-3 px-4">Tòa Nhà</th>
                <th className="py-3 px-4">Tầng</th>
                <th className="py-3 px-4">Phân Loại</th>
                <th className="py-3 px-4 text-center">Số Thiết Bị</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-brand-700">{loc.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{loc.room_name}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{loc.building_name} ({loc.building_code})</td>
                  <td className="py-3 px-4 text-xs text-slate-600">Tầng {loc.floor}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {loc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Laptop className="w-3 h-3" />
                      {loc.total_devices || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(isAdmin || isManager) && (
                        <button
                          type="button"
                          onClick={() => handleOpenLocationModal(loc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          title="Sửa phòng"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setItemToDelete({ type: 'location', item: loc })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa phòng"
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
        </div>
      ) : (
        /* TAB 2: Buildings Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Mã Tòa</th>
                <th className="py-3 px-4">Tên Tòa Nhà</th>
                <th className="py-3 px-4">Địa Chỉ</th>
                <th className="py-3 px-4">Số Tầng</th>
                <th className="py-3 px-4 text-center">Số Phòng</th>
                <th className="py-3 px-4 text-center">Tổng Thiết Bị</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-purple-700">{b.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{b.name}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{b.address || 'Khuôn viên trường'}</td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-700">{b.total_floors} tầng</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800 text-xs">
                    {b.total_locations || 0} phòng
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      <Laptop className="w-3 h-3" />
                      {b.total_devices || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(isAdmin || isManager) && (
                        <button
                          type="button"
                          onClick={() => handleOpenBuildingModal(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          title="Sửa tòa nhà"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setItemToDelete({ type: 'building', item: b })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa tòa nhà"
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
        </div>
      )}

      {/* Location Modal */}
      <Modal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        title={editingLocation ? 'Chỉnh Sửa Phòng Học / Địa Điểm' : 'Thêm Phòng Học Mới'}
        size="md"
      >
        <form onSubmit={handleSaveLocation} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tòa nhà <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationForm.buildingId}
                onChange={(e) => setLocationForm({ ...locationForm, buildingId: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                required
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã phòng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={locationForm.code}
                onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                placeholder="VD: A1-101, C3-401..."
                disabled={!!editingLocation}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-brand-500 focus:outline-none disabled:bg-slate-100"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên phòng học / phòng chức năng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={locationForm.roomName}
                onChange={(e) => setLocationForm({ ...locationForm, roomName: e.target.value })}
                placeholder="VD: Phòng Thực Hành Mạng Máy Tính..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tầng</label>
              <input
                type="number"
                min={1}
                max={50}
                value={locationForm.floor}
                onChange={(e) => setLocationForm({ ...locationForm, floor: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loại phòng</label>
              <select
                value={locationForm.type}
                onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
              >
                <option value="CLASSROOM">Phòng học lý thuyết</option>
                <option value="LAB">Phòng thực hành / Lab</option>
                <option value="OFFICE">Văn phòng / Phòng làm việc</option>
                <option value="SERVER_ROOM">Phòng Server / Hạ tầng mạng</option>
                <option value="WAREHOUSE">Kho thiết bị</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
              <textarea
                value={locationForm.description}
                onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                rows={2}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setLocationModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={submitting}>Lưu Địa Điểm</Button>
          </div>
        </form>
      </Modal>

      {/* Building Modal */}
      <Modal
        isOpen={buildingModalOpen}
        onClose={() => setBuildingModalOpen(false)}
        title={editingBuilding ? 'Chỉnh Sửa Tòa Nhà' : 'Thêm Tòa Nhà Mới'}
        size="md"
      >
        <form onSubmit={handleSaveBuilding} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã tòa nhà <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={buildingForm.code}
                onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
                placeholder="VD: A1, B2, C3..."
                disabled={!!editingBuilding}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-brand-500 focus:outline-none disabled:bg-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tổng số tầng</label>
              <input
                type="number"
                min={1}
                max={100}
                value={buildingForm.totalFloors}
                onChange={(e) => setBuildingForm({ ...buildingForm, totalFloors: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên tòa nhà <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={buildingForm.name}
                onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                placeholder="VD: Khu Giảng Đường A1..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ / Vị trí khuôn viên</label>
              <input
                type="text"
                value={buildingForm.address}
                onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                placeholder="VD: Khuôn viên cơ sở 1..."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setBuildingModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={submitting}>Lưu Tòa Nhà</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Xác nhận xóa danh mục"
        message={
          itemToDelete?.type === 'location'
            ? `Bạn có chắc chắn muốn xóa phòng "${itemToDelete?.item?.room_name}" (${itemToDelete?.item?.code})? Lưu ý: Không thể xóa nếu phòng đang chứa thiết bị.`
            : `Bạn có chắc chắn muốn xóa tòa nhà "${itemToDelete?.item?.name}" (${itemToDelete?.item?.code})? Lưu ý: Không thể xóa nếu tòa nhà đang chứa phòng học.`
        }
      />
    </div>
  );
};
