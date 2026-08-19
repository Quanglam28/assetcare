import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deviceService } from '../../services/deviceService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { PrintLabelModal } from '../../components/devices/PrintLabelModal';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  QrCode, ArrowLeft, Download, Printer, Copy, Check, 
  Laptop, MapPin, Building2, ExternalLink, RefreshCw, AlertTriangle
} from 'lucide-react';

export const DeviceQRCodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [qrData, setQrData] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        setLoading(true);
        setError('');
        const [qrRes, devRes] = await Promise.all([
          deviceService.getDeviceQr(id),
          deviceService.getDeviceById(id),
        ]);

        if (qrRes?.success && qrRes?.data) {
          setQrData(qrRes.data);
        }
        if (devRes?.success && devRes?.data) {
          setDevice(devRes.data);
        }
      } catch (err) {
        setError(err?.message || 'Không thể tải thông tin mã QR của thiết bị');
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [id]);

  const handleCopy = () => {
    if (!qrData?.qrUrl) return;
    navigator.clipboard.writeText(qrData.qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `QR_LABEL_${device?.code || id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy mã QR của thiết bị</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/devices')} className="mt-3">
          Quay lại danh sách thiết bị
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/devices/${id}`)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Quay lại chi tiết thiết bị
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-brand-600" />
            Quản Lý Mã QR Code Định Danh
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sinh mã định danh, tải file ảnh độ phân giải cao và in tem dán decal cho thiết bị: <strong>{device.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={ExternalLink}
            onClick={() => window.open(`/device/${device.qr_token}`, '_blank')}
          >
            Xem Trang Quét Thử
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Interactive Preview & Download Box */}
        <Card className="p-6 bg-white shadow-sm border border-slate-200 text-center space-y-5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Xem Trước Mã QR Chuẩn Quốc Tế
          </h3>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
            <QRCodeSVG
              value={qrData.qrUrl}
              size={220}
              level="H"
              includeMargin={true}
              className="mx-auto"
            />
          </div>

          {/* Hidden Canvas for Super High-Res Download (1200x1200px) */}
          <div ref={canvasRef} className="hidden">
            <QRCodeCanvas
              value={qrData.qrUrl}
              size={1200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="space-y-2 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Đường dẫn quét (Payload URL):</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-brand-600 font-bold flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>
            <p className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200 break-all select-all font-semibold">
              {qrData.qrUrl}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleDownloadPNG}
              className="w-full text-xs font-bold"
            >
              Tải File PNG (HD)
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={Printer}
              onClick={() => setPrintModalOpen(true)}
              className="w-full text-xs font-bold"
            >
              In Tem Dán QR
            </Button>
          </div>
        </Card>

        {/* Right: Asset Spec Summary */}
        <div className="space-y-4">
          <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-brand-600" />
              Thông Tin Thiết Bị Gắn Với Mã QR
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Mã thiết bị:</span>
                <span className="font-mono font-bold text-slate-900">{device.code}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Tên thiết bị:</span>
                <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">{device.name}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Loại thiết bị:</span>
                <span className="font-semibold text-slate-800">{device.device_type_name}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Vị trí phòng:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {device.room_name} ({device.building_name})
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Đơn vị quản lý:</span>
                <span className="font-semibold text-slate-800">{device.department_name || 'Toàn trường'}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Mã Token Xác Thực:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {device.qr_token}
                </span>
              </div>
            </div>
          </Card>

          {/* Security & Usage Guidelines */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-950">
              <Check className="w-4 h-4 text-emerald-600" />
              Tiêu Chuẩn Bảo Mật & Tiện Ích QR:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800">
              <li>Mã QR chỉ chứa đường dẫn Token URL được mã hóa, không chứa mật khẩu hay thông tin tài chính nhạy cảm.</li>
              <li>Giảng viên, sinh viên và cán bộ chỉ cần mở camera điện thoại quét để báo hỏng tức thì mà không cần cài đặt ứng dụng.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      <PrintLabelModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        device={device}
      />
    </div>
  );
};
