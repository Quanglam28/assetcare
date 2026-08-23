import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deviceService } from '../../services/deviceService';
import { healthService } from '../../services/healthService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { QRCodeCard } from '../../components/devices/QRCodeCard';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AssetHealthCard } from '../../components/devices/AssetHealthCard';
import { FailureRiskCard } from '../../components/devices/FailureRiskCard';
import { PriorityScoreCard } from '../../components/devices/PriorityScoreCard';
import { AssetLifecycleTimeline } from '../../components/devices/AssetLifecycleTimeline';
import { DeviceActivityTimeline } from '../../components/devices/DeviceActivityTimeline';
import { PredictiveSimulationCard } from '../../components/devices/PredictiveSimulationCard';
import { SystemRecommendationCard } from '../../components/devices/SystemRecommendationCard';
import { HealthRiskHistoryChart } from '../../components/devices/HealthRiskHistoryChart';
import { 
  Laptop, ArrowLeft, Edit2, Trash2, Wrench, ShieldAlert, 
  MapPin, Building2, Calendar, DollarSign, ShieldCheck, 
  CheckCircle2, Clock, AlertTriangle, FileText, Phone, Mail, User, Layers,
  Activity, HeartPulse, Sparkles, History, Layers3, Zap, ClipboardList, Plus
} from 'lucide-react';
import { DEVICE_STATUS_CONFIG, MAINTENANCE_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';
import api from '../../services/api';

export const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager, isTechnician, isUser, user } = useAuth();

  const [activeTab, setActiveTab] = useState('health'); // 'health' | 'specs' | 'history'
  const [device, setDevice] = useState(null);
  const [health, setHealth] = useState(null);
  const [risk, setRisk] = useState(null);
  const [priority, setPriority] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyDays, setHistoryDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchDeviceData = async (days = historyDays) => {
    try {
      setLoading(true);
      setError('');
      // 1. Lấy thông tin thiết bị chính trước để render ngay lập tức (LCP < 500ms)
      const deviceRes = await deviceService.getDeviceById(id);
      if (deviceRes?.success && deviceRes?.data) {
        setDevice(deviceRes.data);
      }
      setLoading(false);

      // 2. Lazy load Health, Risk, Priority, Work Orders và History song song không block UI
      Promise.all([
        healthService.getDeviceHealth(id).catch(() => null),
        healthService.getDeviceRisk(id).catch(() => null),
        api.get(`/devices/${id}/priority`).catch(() => null),
        api.get(`/work-orders`, { params: { deviceId: id } }).catch(() => null),
        healthService.getDeviceHealthHistory(id, days).catch(() => null),
      ]).then(([healthRes, riskRes, prioRes, woRes, historyRes]) => {
        if (healthRes?.success && healthRes?.data) {
          setHealth(healthRes.data);
        }
        if (riskRes?.success && riskRes?.data) {
          setRisk(riskRes.data);
        }
        if (prioRes?.data) {
          setPriority(prioRes.data);
        } else if (prioRes?.priorityScore !== undefined) {
          setPriority(prioRes);
        }
        if (woRes?.data) {
          setWorkOrders(woRes.data);
        } else if (Array.isArray(woRes)) {
          setWorkOrders(woRes);
        }
        if (historyRes?.success && historyRes?.data) {
          setHistory(historyRes.data);
        }
      });
    } catch (err) {
      setError(err?.message || 'Không thể tải thông tin thiết bị');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceData(historyDays);
  }, [id]);

  const handleRangeChange = async (days) => {
    setHistoryDays(days);
    try {
      const res = await healthService.getDeviceHealthHistory(id, days);
      if (res?.success && res?.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.warn('Lỗi lấy lịch sử sức khỏe:', err);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setStatusUpdating(true);
      setError('');
      await deviceService.updateStatus(id, newStatus);
      setSuccess(`Đã cập nhật trạng thái thiết bị thành ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchDeviceData(historyDays);
    } catch (err) {
      setError(err?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError('');
      const res = await deviceService.deleteDevice(id);
      setSuccess(res?.message || 'Đã xử lý thiết bị');
      setDeleteDialogOpen(false);
      setTimeout(() => {
        navigate('/devices');
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Xóa thiết bị thất bại');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Laptop className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy thiết bị</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/devices')} className="mt-3">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusConf = DEVICE_STATUS_CONFIG[device.status] || {
    label: device.status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const isWarrantyValid = device.warranty_end && new Date(device.warranty_end) >= new Date();

  return (
    <div className="space-y-6">
      {/* Header with Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/devices')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Quay lại danh sách thiết bị
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900">{device.name}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConf.bg}`}>
              {statusConf.label}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Mã: {device.code} {device.model && `• Model: ${device.model}`} {device.serial_number && `• S/N: ${device.serial_number}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút báo hỏng sự cố */}
          <Button
            variant="danger"
            icon={ShieldAlert}
            onClick={() => navigate(`/report-issue?device_id=${device.id}&device_code=${device.code}`)}
            className="shadow-sm shadow-rose-600/20"
          >
            Báo Hỏng Thiết Bị
          </Button>

          {/* Sửa thông tin (Admin, Manager) */}
          {(isAdmin || isManager) && (
            <Button
              variant="outline"
              icon={Edit2}
              onClick={() => navigate(`/devices/${device.id}/edit`)}
            >
              Chỉnh Sửa
            </Button>
          )}

          {/* Xóa / Thanh lý (Admin) */}
          {isAdmin && (
            <Button
              variant="outline"
              icon={Trash2}
              onClick={() => setDeleteDialogOpen(true)}
              className="text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            >
              Thanh Lý / Xóa
            </Button>
          )}
        </div>
      </div>

      {/* Alert Banners */}
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
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'health'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Sức Khỏe & Dự Báo Rủi Ro
          {risk?.riskScore > 60 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'specs'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Laptop className="w-4 h-4" />
          Thông Số & Vị Trí
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Lịch Sử Bảo Trì ({device.maintenanceHistory?.length || 0})
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: SỨC KHỎE & DỰ BÁO RỦI RO */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              {/* 1. Khuyến nghị thông minh từ Động cơ Phase 3 */}
              <SystemRecommendationCard
                recommendation={risk?.recommendation}
                recommendations={risk?.recommendations}
                device={device}
                userRole={user?.role}
                onWorkOrderCreated={() => fetchDeviceData(historyDays)}
              />

              {/* 2. Thẻ Sức Khỏe Thiết Bị (Phase 1) */}
              <AssetHealthCard health={health} loading={loading} />

              {/* 3. Thẻ Đánh Giá Rủi Ro Sự Cố (Phase 2) */}
              <FailureRiskCard risk={risk} loading={loading} />

              {/* 4. Thẻ Mức Độ Ưu Tiên Xử Lý (Phase 3) */}
              <PriorityScoreCard priority={priority} loading={loading} />

              {/* 5. Danh sách Lệnh Công Tác của Thiết Bị (Work Orders) */}
              {workOrders.length > 0 && (
                <Card className="p-5 border border-slate-200/80 shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Phiếu Lệnh Công Tác ({workOrders.length})
                      </h3>
                    </div>
                    <Button size="xs" variant="outline" onClick={() => navigate('/work-orders')}>
                      Xem tất cả
                    </Button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {workOrders.slice(0, 3).map((wo) => (
                      <div key={wo.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand-700">{wo.work_order_code}</span>
                            <span className="font-bold text-slate-800">{wo.title}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {wo.assigned_technician_name ? `KTV: ${wo.assigned_technician_name}` : 'Chưa phân công'} • {new Date(wo.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-white text-slate-700">
                          {wo.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 6. Mô Phỏng Dự Báo Bảo Trì (Phase 4 — What-If Simulation) */}
              <PredictiveSimulationCard
                deviceId={device.id}
                device={device}
                onWorkOrderCreated={() => fetchDeviceData(historyDays)}
              />

              {/* 7. Vòng Đời Tài Sản (Asset Lifecycle Timeline) */}
              <AssetLifecycleTimeline
                device={device}
                health={health}
                risk={risk}
                priority={priority}
              />

              {/* 8. Biểu đồ Biến Động Lịch Sử */}
              <HealthRiskHistoryChart
                history={history}
                selectedDays={historyDays}
                onRangeChange={handleRangeChange}
              />
            </div>
          )}

          {/* TAB 2: THÔNG SỐ KỸ THUẬT & VỊ TRÍ */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Laptop className="w-4 h-4 text-brand-600" />
                  Thông Tin Kỹ Thuật & Tài Sản
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Tên thiết bị:</span>
                    <span className="font-bold text-slate-800 text-sm">{device.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Loại thiết bị:</span>
                    <span className="font-semibold text-slate-800">{device.device_type_name || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Model:</span>
                    <span className="font-mono font-medium text-slate-800">{device.model || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Số Serial (S/N):</span>
                    <span className="font-mono font-medium text-slate-800">{device.serial_number || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Vị trí lắp đặt:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      {device.room_name} ({device.building_name})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Đơn vị quản lý / Khoa:</span>
                    <span className="font-medium text-slate-800">{device.department_name || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Nhà cung cấp:</span>
                    <span className="font-medium text-slate-800">{device.supplier_name || '---'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Giá mua / Nguyên giá:</span>
                    <span className="font-bold font-mono text-emerald-700 text-sm">
                      {device.purchase_price ? `${Number(device.purchase_price).toLocaleString('vi-VN')} đ` : '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Ngày đưa vào sử dụng:</span>
                    <span className="font-medium text-slate-800">
                      {device.purchase_date ? new Date(device.purchase_date).toLocaleDateString('vi-VN') : '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Thời hạn bảo hành:</span>
                    <span className="font-medium text-slate-800">
                      {device.warranty_start ? new Date(device.warranty_start).toLocaleDateString('vi-VN') : '---'} đến{' '}
                      {device.warranty_end ? new Date(device.warranty_end).toLocaleDateString('vi-VN') : '---'}
                    </span>
                    {device.warranty_end && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isWarrantyValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isWarrantyValid ? 'Trong hạn bảo hành' : 'Hết hạn bảo hành'}
                      </span>
                    )}
                  </div>
                  {device.description && (
                    <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                      <span className="text-slate-400 block mb-0.5 font-medium">Mô tả / Ghi chú kỹ thuật:</span>
                      <p className="text-slate-700 leading-relaxed">{device.description}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: LỊCH SỬ BẢO TRÌ & SỬA CHỮA */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* 1. Timeline Hoạt động Tổng hợp */}
              <DeviceActivityTimeline deviceId={device.id} />

              {/* 2. Chi tiết các Phiếu yêu cầu bảo trì */}
              <Card className="p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-brand-600" />
                    Danh Sách Phiếu Sự Cố & Bảo Trì ({device.maintenanceHistory?.length || 0})
                  </h3>
                </div>

              {(!device.maintenanceHistory || device.maintenanceHistory.length === 0) ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Chưa có sự cố bảo trì nào</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Thiết bị đang hoạt động ổn định và chưa từng phát sinh yêu cầu sửa chữa.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {device.maintenanceHistory.map((req) => {
                    const reqStatusConf = MAINTENANCE_STATUS_CONFIG[req.status] || {
                      label: req.status,
                      bg: 'bg-slate-100 text-slate-700',
                    };
                    const prioConf = PRIORITY_CONFIG[req.priority] || {
                      label: req.priority,
                      bg: 'bg-slate-100 text-slate-700',
                    };

                    return (
                      <div
                        key={req.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-brand-300 transition-all space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {req.code}
                            </span>
                            <span className="font-bold text-xs text-slate-800">{req.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${prioConf.bg}`}>
                              {prioConf.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${reqStatusConf.bg}`}>
                              {reqStatusConf.label}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600">{req.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <div>
                            <span>Người báo: <strong>{req.reporter_name}</strong></span>
                            <span className="block mt-0.5">
                              KTV xử lý: <strong>{req.technician_name || 'Chưa phân công'}</strong>
                            </span>
                          </div>
                          <div className="sm:text-right">
                            <span>Ngày tạo: {new Date(req.created_at).toLocaleString('vi-VN')}</span>
                            {req.actual_cost && (
                              <span className="block mt-0.5 text-emerald-700 font-bold font-mono">
                                Chi phí: {Number(req.actual_cost).toLocaleString('vi-VN')} đ
                              </span>
                            )}
                          </div>
                        </div>

                        {req.resolution && (
                          <div className="p-2 bg-emerald-50 rounded-lg text-xs text-emerald-900 mt-2 border border-emerald-100">
                            <strong>Kết quả khắc phục:</strong> {req.resolution}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

        {/* Right 1 Col: QR Code Panel & Quick Status Changer */}
        <div className="space-y-6">
          {/* QR Code Visual Panel */}
          <QRCodeCard device={device} />

          {/* Quick Status Changer */}
          {(isAdmin || isManager || isTechnician) && (
            <Card className="p-5 bg-white shadow-sm border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Cập Nhật Nhanh Trạng Thái
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={statusUpdating || device.status === 'ACTIVE'}
                  onClick={() => handleUpdateStatus('ACTIVE')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    device.status === 'ACTIVE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Hoạt Động Tốt
                </button>

                <button
                  type="button"
                  disabled={statusUpdating || device.status === 'MAINTENANCE'}
                  onClick={() => handleUpdateStatus('MAINTENANCE')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    device.status === 'MAINTENANCE'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Đang Bảo Dưỡng
                </button>

                <button
                  type="button"
                  disabled={statusUpdating || device.status === 'BROKEN'}
                  onClick={() => handleUpdateStatus('BROKEN')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    device.status === 'BROKEN'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  Hỏng Hóc
                </button>

                <button
                  type="button"
                  disabled={statusUpdating || device.status === 'RETIRED'}
                  onClick={() => handleUpdateStatus('RETIRED')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    device.status === 'RETIRED'
                      ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Đã Thanh Lý
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete / Retire Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Xác nhận xóa / thanh lý thiết bị"
        message={
          <div>
            <p>
              Bạn có chắc chắn muốn xóa thiết bị <strong>"{device.name}"</strong> ({device.code})?
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
              ⚠️ <strong>Lưu ý:</strong> Nếu thiết bị đã có lịch sử bảo trì, hệ thống sẽ tự động chuyển sang trạng thái <strong>Đã thanh lý (RETIRED)</strong> thay vì xóa vĩnh viễn để bảo đảm tính toàn vẹn dữ liệu.
            </p>
          </div>
        }
        confirmText="Xác Nhận Xử Lý"
      />
    </div>
  );
};
