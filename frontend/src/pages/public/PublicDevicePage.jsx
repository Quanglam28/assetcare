import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deviceService } from '../../services/deviceService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Laptop, QrCode, ShieldAlert, LogIn, CheckCircle2, 
  MapPin, Building2, Calendar, Wrench, Clock, ShieldCheck, 
  AlertTriangle, ArrowRight, UserCheck, Activity, HeartPulse,
  Share2, ArrowLeft, RefreshCw, BarChart3
} from 'lucide-react';
import { DEVICE_STATUS_CONFIG } from '../../utils/constants';

export const PublicDevicePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isManager, isTechnician } = useAuth();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDevice = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await deviceService.getPublicDeviceByQr(token);
      if (res?.success && res?.data) {
        setDevice(res.data);
      } else {
        setError('Không tìm thấy thông tin thiết bị');
      }
    } catch (err) {
      if (!navigator.onLine) {
        setError('Không thể kết nối máy chủ. Bạn đang ngoại tuyến.');
      } else {
        setError(err?.message || err?.error || 'Mã QR không hợp lệ hoặc thiết bị không tồn tại');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDevice();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-slate-300">Đang đọc thông tin thiết bị...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {error && error.includes('ngoại tuyến') ? 'Lỗi Kết Nối Mạng' : 'Không Tìm Thấy Thiết Bị'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'Mã QR này không khớp với bất kỳ tài sản nào trong cơ sở dữ liệu trường.'}
          </p>
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              size="md"
              onClick={fetchDevice}
              icon={RefreshCw}
              className="w-full"
            >
              Thử Lại
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/qr-scanner')}
              className="w-full"
            >
              Quét Mã Khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConf = DEVICE_STATUS_CONFIG[device.status] || {
    label: device.status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const isWarrantyValid = device.warranty_end && new Date(device.warranty_end) >= new Date();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-4 sm:py-6 px-3 sm:px-6">
      {/* Top Header Bar */}
      <header className="max-w-lg mx-auto w-full flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/qr-scanner')}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            title="Quét lại QR"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="p-1.5 bg-brand-600 rounded-xl text-white shadow-md shadow-brand-600/30">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wider">
              AssetCare • UTT
            </h1>
            <p className="text-[10px] text-brand-400 font-medium">Thông Tin Thiết Bị</p>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 py-1 px-2.5 rounded-full text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium max-w-[110px] truncate">{user?.fullName || user?.username}</span>
          </div>
        ) : (
          <Link
            to={`/login?redirect=/device/${token}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full"
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng nhập
          </Link>
        )}
      </header>

      {/* Main Mobile-First Card */}
      <main className="max-w-lg mx-auto w-full space-y-3.5 flex-1">
        <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-sm space-y-4">
          {/* Header Title & Status */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-brand-400 bg-brand-950/70 border border-brand-800/60 px-2.5 py-0.5 rounded-md">
                {device.code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConf.bg}`}>
                {statusConf.label}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
              {device.name}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {device.model && <span>Model: <strong className="text-slate-200">{device.model}</strong></span>}
              {device.device_type_name && <span>• {device.device_type_name}</span>}
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
            {/* Vị trí */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                Vị Trí Lắp Đặt
              </span>
              <p className="font-bold text-slate-100 text-xs sm:text-sm">{device.room_name}</p>
              <p className="text-[11px] text-slate-400">{device.building_name} (Tầng {device.floor})</p>
            </div>

            {/* Đơn vị quản lý */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Đơn Vị Quản Lý
              </span>
              <p className="font-bold text-slate-200 text-xs truncate">
                {device.department_name || 'Toàn trường'}
              </p>
              <p className="text-[11px] text-slate-400">Loại: {device.device_category}</p>
            </div>

            {/* Tình trạng bảo hành */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-0.5 sm:col-span-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Thời Hạn Bảo Hành
              </span>
              <p className="font-semibold text-slate-200 text-xs">
                {device.warranty_end ? (
                  <span className={isWarrantyValid ? 'text-emerald-400' : 'text-rose-400'}>
                    {isWarrantyValid ? 'Đang trong hạn' : 'Hết hạn bảo hành'} ({new Date(device.warranty_end).toLocaleDateString('vi-VN')})
                  </span>
                ) : 'Không có thông tin bảo hành'}
              </p>
            </div>
          </div>

          {/* Lần bảo trì gần nhất */}
          {device.lastMaintenance && (
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-brand-400" />
                Lần Bảo Trì Gần Nhất
              </span>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{device.lastMaintenance.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(device.lastMaintenance.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {device.lastMaintenance.resolution && (
                  <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    {device.lastMaintenance.resolution}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-2.5">
            {/* Primary Action Button: BÁO SỰ CỐ */}
            {isAuthenticated ? (
              <Button
                variant="danger"
                size="lg"
                icon={ShieldAlert}
                onClick={() => navigate(`/report-issue?device_id=${device.id}&device_code=${device.code}&token=${device.qr_token}`)}
                className="w-full py-3.5 text-sm font-bold shadow-lg shadow-rose-600/30"
              >
                🔴 Báo Hỏng Thiết Bị Này
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={LogIn}
                onClick={() => navigate(`/login?redirect=/device/${token}`)}
                className="w-full py-3.5 text-sm font-bold shadow-lg shadow-brand-600/30"
              >
                Đăng Nhập Để Báo Hỏng / Quản Lý
              </Button>
            )}

            {/* Role-specific CTA: Technician */}
            {isTechnician && (
              <Button
                variant="outline"
                size="md"
                icon={Wrench}
                onClick={() => navigate(`/report-issue?device_id=${device.id}&device_code=${device.code}&token=${device.qr_token}`)}
                className="w-full text-xs text-amber-300 border-amber-800/80 hover:bg-amber-950/40"
              >
                🔧 Tạo Phiếu Xử Lý Sự Cố (Kỹ Thuật)
              </Button>
            )}

            {/* Role-specific CTA: Admin / Manager */}
            {(isAdmin || isManager) && (
              <Button
                variant="outline"
                size="md"
                icon={BarChart3}
                onClick={() => navigate(`/devices/${device.id}`)}
                className="w-full text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                📊 Xem Hồ Sơ & Sức Khỏe Chi Tiết
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto w-full text-center text-[10px] text-slate-400 pt-4">
        <p>AssetCare • Hệ thống Quản lý Tài sản & Bảo trì Thiết bị Đại Học</p>
      </footer>
    </div>
  );
};
