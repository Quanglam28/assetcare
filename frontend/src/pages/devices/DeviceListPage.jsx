import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceService } from '../../services/deviceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PrintLabelModal } from '../../components/devices/PrintLabelModal';
import { 
  Laptop, Plus, Search, Filter, RotateCcw, Eye, Edit2, 
  Trash2, QrCode, Building2, Layers, MapPin, Printer, ArrowUpDown, Tag,
  HeartPulse, Flame, ShieldAlert, Sparkles
} from 'lucide-react';
import { 
  DEVICE_STATUS_CONFIG, HEALTH_STATUS_CONFIG, RISK_LEVEL_CONFIG, RECOMMENDATION_ACTION_CONFIG 
} from '../../utils/constants';

export const DeviceListPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const toast = useToast();

  const [devices, setDevices] = useState([]);
  const [masterData, setMasterData] = useState({
    buildings: [],
    locations: [],
    departments: [],
    deviceTypes: [],
    suppliers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter, Sort & Pagination
  const [search, setSearch] = useState('');
  const [deviceTypeId, setDeviceTypeId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [status, setStatus] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [dataQuality, setDataQuality] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedDeviceForPrint, setSelectedDeviceForPrint] = useState(null);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMasterData = async () => {
    try {
      const res = await deviceService.getMasterData();
      if (res?.success && res?.data) {
        setMasterData(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi nạp master data:', err);
    }
  };

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await deviceService.getDevices({
        page,
        limit,
        search,
        deviceTypeId: deviceTypeId || undefined,
        locationId: locationId || undefined,
        buildingId: buildingId || undefined,
        status: status || undefined,
        healthStatus: healthStatus || undefined,
        riskLevel: riskLevel || undefined,
        dataQuality: dataQuality || undefined,
        sortBy,
        sortOrder,
      });

      if (res?.success) {
        setDevices(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Không thể nạp danh sách thiết bị');
      toast.error(err?.message || 'Không thể nạp danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, deviceTypeId, locationId, buildingId, status, healthStatus, riskLevel, dataQuality, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDevices();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDeviceTypeId('');
    setLocationId('');
    setBuildingId('');
    setStatus('');
    setHealthStatus('');
    setRiskLevel('');
    setDataQuality('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return;
    try {
      setDeleting(true);
      await deviceService.deleteDevice(deviceToDelete.id);
      toast.success(`Đã xóa thiết bị "${deviceToDelete.name}" thành công!`);
      setDeviceToDelete(null);
      fetchDevices();
    } catch (err) {
      toast.error(err?.message || err?.error || 'Không thể xóa thiết bị');
    } finally {
      setDeleting(false);
    }
  };

  const filteredLocations = buildingId
    ? masterData.locations.filter((l) => String(l.building_id) === String(buildingId))
    : masterData.locations;

  const hasActiveFilters = Boolean(
    search || deviceTypeId || buildingId || status || healthStatus || riskLevel || dataQuality
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Quản lý tài sản' },
          { label: 'Danh sách thiết bị' },
        ]}
      />

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Laptop className="w-7 h-7 text-brand-600" />
            Danh Mục Thiết Bị & Sức Khỏe Tài Sản
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng hợp trang thiết bị kèm chỉ số Sức Khỏe (Health Score) & Dự báo Nguy cơ sự cố (Failure Risk)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(isAdmin || isManager) && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/devices/create')}
              className="shadow-md shadow-brand-600/20"
            >
              Thêm Thiết Bị Mới
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Panel */}
      <Card className="p-4 bg-white shadow-sm border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Tìm mã thiết bị, tên máy, model, serial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Loại thiết bị */}
            <div>
              <select
                value={deviceTypeId}
                onChange={(e) => {
                  setDeviceTypeId(e.target.value);
                  setPage(1);
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Tất cả loại thiết bị --</option>
                {masterData.deviceTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name} ({dt.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Trạng thái hoạt động */}
            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Tất cả trạng thái máy --</option>
                <option value="ACTIVE">Hoạt động tốt</option>
                <option value="MAINTENANCE">Đang bảo trì / Sửa chữa</option>
                <option value="BROKEN">Đang bị hỏng</option>
                <option value="RETIRED">Đã thanh lý</option>
              </select>
            </div>

            {/* Lọc theo Sức Khỏe (Health Status) */}
            <div>
              <select
                value={healthStatus}
                onChange={(e) => {
                  setHealthStatus(e.target.value);
                  setPage(1);
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Mức Sức Khỏe (Health) --</option>
                <option value="GOOD">🟢 GOOD (80 - 100 điểm)</option>
                <option value="FAIR">🟡 FAIR (60 - 79 điểm)</option>
                <option value="WARNING">🟠 WARNING (40 - 59 điểm)</option>
                <option value="CRITICAL">🔴 CRITICAL (&lt; 40 điểm)</option>
                <option value="INSUFFICIENT_DATA">⚪ CHƯA ĐỦ DỮ LIỆU</option>
              </select>
            </div>

            {/* Lọc theo Nguy Cơ Rủi Ro (Failure Risk) */}
            <div>
              <select
                value={riskLevel}
                onChange={(e) => {
                  setRiskLevel(e.target.value);
                  setPage(1);
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Mức Nguy Cơ (Risk) --</option>
                <option value="VERY_LOW">🟢 VERY_LOW (0 - 20%)</option>
                <option value="LOW">🟢 LOW (21 - 40%)</option>
                <option value="MEDIUM">🟡 MEDIUM (41 - 60%)</option>
                <option value="HIGH">🟠 HIGH (61 - 80%)</option>
                <option value="CRITICAL">🔴 CRITICAL (81 - 100%)</option>
              </select>
            </div>

            {/* Lọc theo Chất lượng dữ liệu */}
            <div>
              <select
                value={dataQuality}
                onChange={(e) => {
                  setDataQuality(e.target.value);
                  setPage(1);
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Độ Đầy Đủ Dữ Liệu --</option>
                <option value="COMPLETE">Đầy đủ dữ liệu (&ge; 70%)</option>
                <option value="INSUFFICIENT">Thiếu dữ liệu / Mới tạo (&lt; 70%)</option>
              </select>
            </div>

            {/* Tòa nhà */}
            <div>
              <select
                value={buildingId}
                onChange={(e) => {
                  setBuildingId(e.target.value);
                  setLocationId('');
                  setPage(1);
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">-- Tất cả tòa nhà --</option>
                {masterData.buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sắp xếp & Nút lọc */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
              >
                <option value="created_at">Ngày tạo</option>
                <option value="health_score">Điểm sức khỏe (Health)</option>
                <option value="risk_score">Nguy cơ rủi ro (Risk)</option>
                <option value="name">Tên thiết bị</option>
                <option value="code">Mã thiết bị</option>
                <option value="purchase_price">Giá mua</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
              >
                <option value="DESC">Giảm dần</option>
                <option value="ASC">Tăng dần</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm">
                Áp Dụng Bộ Lọc
              </Button>
              {hasActiveFilters && (
                <Button type="button" variant="outline" size="sm" onClick={handleResetFilters} icon={RotateCcw}>
                  Xóa Lọc
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      {/* Devices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={5} cols={8} />
          </div>
        ) : devices.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="Không tìm thấy thiết bị nào"
            description="Chưa có thiết bị nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại."
            actionText={hasActiveFilters ? 'Xóa bộ lọc tìm kiếm' : undefined}
            onAction={handleResetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã & Tên Thiết Bị</th>
                  <th className="py-3.5 px-4">Vị Trí</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Sức Khỏe (Health)</th>
                  <th className="py-3.5 px-4">Nguy Cơ (Risk)</th>
                  <th className="py-3.5 px-4">Khuyến Nghị</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devices.map((d) => {
                  const statusConf = DEVICE_STATUS_CONFIG[d.status] || {
                    label: d.status,
                    bg: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  const hScore = Math.round(Number(d.health_score) || 100);
                  const hStatus = d.health_status || 'GOOD';
                  const hConf = HEALTH_STATUS_CONFIG[hStatus] || HEALTH_STATUS_CONFIG.GOOD;

                  const rScore = Math.round(Number(d.risk_score) || 0);
                  const rLevel = d.risk_level || 'VERY_LOW';
                  const rConf = RISK_LEVEL_CONFIG[rLevel] || RISK_LEVEL_CONFIG.VERY_LOW;

                  const recAction = d.recommendation_action || 'MONITOR_ASSET';
                  const recConf = RECOMMENDATION_ACTION_CONFIG[recAction] || RECOMMENDATION_ACTION_CONFIG.MONITOR_ASSET;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDeviceForPrint(d)}
                            className="p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                            title="Xem / In mã QR nhãn dán"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <div>
                            <span
                              onClick={() => navigate(`/devices/${d.id}`)}
                              className="font-bold text-slate-900 hover:text-brand-600 cursor-pointer block leading-snug"
                            >
                              {d.name}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                              <span>{d.code}</span>
                              {d.model && <span>• {d.model}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vị trí */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{d.room_name} ({d.building_code})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {d.department_name || 'Toàn trường'}
                        </span>
                      </td>

                      {/* Trạng thái máy */}
                      <td className="py-3.5 px-4">
                        <Badge className={`${statusConf.bg} text-[11px] font-bold px-2 py-0.5 border`}>
                          {statusConf.label}
                        </Badge>
                      </td>

                      {/* Sức Khỏe (Health Score) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-sm ${
                            hScore >= 80 ? 'text-emerald-700' :
                            hScore >= 60 ? 'text-yellow-700' :
                            hScore >= 40 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {hScore}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${hConf.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${hConf.dot}`} />
                            {hStatus}
                          </span>
                        </div>
                      </td>

                      {/* Nguy Cơ Rủi Ro (Failure Risk) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-sm ${
                            rScore > 60 ? 'text-rose-700' :
                            rScore > 40 ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {rScore}%
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rConf.bg}`}>
                            {rLevel}
                          </span>
                        </div>
                      </td>

                      {/* Khuyến Nghị Kỹ Thuật */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${recConf.bg}`}>
                          {recConf.label}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/devices/${d.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết thiết bị & sức khỏe"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(isAdmin || isManager) && (
                            <button
                              type="button"
                              onClick={() => navigate(`/devices/${d.id}/edit`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeviceToDelete(d)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Thanh lý / Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="border-t border-slate-200 px-4 py-3 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Hiển thị <strong>{(page - 1) * limit + 1}</strong> đến{' '}
              <strong>{Math.min(page * limit, total)}</strong> trong tổng số <strong>{total}</strong> thiết bị
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Print QR Modal */}
      {selectedDeviceForPrint && (
        <PrintLabelModal
          device={selectedDeviceForPrint}
          isOpen={Boolean(selectedDeviceForPrint)}
          onClose={() => setSelectedDeviceForPrint(null)}
        />
      )}

      {/* Delete / Retire Modal */}
      <ConfirmDialog
        isOpen={Boolean(deviceToDelete)}
        onClose={() => setDeviceToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Xác nhận xóa / thanh lý thiết bị"
        message={
          <div>
            <p>
              Bạn có chắc chắn muốn xóa thiết bị <strong>"{deviceToDelete?.name}"</strong> ({deviceToDelete?.code})?
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
              ⚠️ Nếu thiết bị đã phát sinh lịch sử bảo trì, hệ thống sẽ tự động chuyển sang trạng thái <strong>Đã thanh lý (RETIRED)</strong> thay vì xóa cứng.
            </p>
          </div>
        }
        confirmText="Xác Nhận"
      />
    </div>
  );
};
