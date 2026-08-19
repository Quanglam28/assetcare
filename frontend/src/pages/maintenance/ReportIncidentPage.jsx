import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { maintenanceService } from '../../services/maintenanceService';
import { deviceService } from '../../services/deviceService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { 
  ShieldAlert, ArrowLeft, Laptop, MapPin, 
  Send, AlertTriangle, Image as ImageIcon, Camera, 
  Phone, Mail, CheckCircle2, QrCode, Search, 
  Trash2, Upload, Clock, Sparkles
} from 'lucide-react';
import { PRIORITY_CONFIG } from '../../utils/constants';

export const ReportIncidentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const queryDeviceId = searchParams.get('device_id');
  const queryDeviceCode = searchParams.get('device_code');
  const queryToken = searchParams.get('token');

  const [formData, setFormData] = useState({
    deviceId: queryDeviceId || '',
    title: '',
    incidentType: 'HARDWARE',
    priority: 'MEDIUM',
    description: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    imageUrl: '',
  });

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devicesList, setDevicesList] = useState([]);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [searchingDevices, setSearchingDevices] = useState(false);
  const [loadingDevice, setLoadingDevice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Nạp thông tin thiết bị nếu có truyền query param
  useEffect(() => {
    const loadTargetDevice = async () => {
      if (queryDeviceId) {
        try {
          setLoadingDevice(true);
          const res = await deviceService.getDeviceById(queryDeviceId);
          if (res?.success && res?.data) {
            setSelectedDevice(res.data);
            setFormData(prev => ({ ...prev, deviceId: res.data.id }));
          }
        } catch (err) {
          console.warn('Không tải được thiết bị từ query id:', err);
        } finally {
          setLoadingDevice(false);
        }
      } else if (queryToken) {
        try {
          setLoadingDevice(true);
          const res = await deviceService.getDeviceByQr(queryToken);
          if (res?.success && res?.data) {
            setSelectedDevice(res.data);
            setFormData(prev => ({ ...prev, deviceId: res.data.id }));
          }
        } catch (err) {
          console.warn('Không tải được thiết bị từ token:', err);
        } finally {
          setLoadingDevice(false);
        }
      }
    };

    loadTargetDevice();
  }, [queryDeviceId, queryToken]);

  // Handle Photo capture / upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPreviewImage(uploadEvent.target.result);
        setFormData(prev => ({ ...prev, imageUrl: uploadEvent.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setPreviewImage('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Tìm kiếm thiết bị trong trường nếu chưa chọn
  const handleSearchDevices = async (e) => {
    e.preventDefault();
    if (!deviceSearch.trim()) return;
    try {
      setSearchingDevices(true);
      const res = await deviceService.getDevices({ search: deviceSearch.trim(), limit: 10 });
      if (res?.success) {
        setDevicesList(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm thiết bị:', err);
    } finally {
      setSearchingDevices(false);
    }
  };

  const handleSelectDevice = (dev) => {
    setSelectedDevice(dev);
    setFormData(prev => ({ ...prev, deviceId: dev.id }));
    setDevicesList([]);
    setDeviceSearch('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.deviceId) {
      setError('Vui lòng chọn thiết bị đang gặp sự cố');
      return;
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tóm tắt tiêu đề sự cố');
      return;
    }

    if (!formData.description.trim()) {
      setError('Vui lòng mô tả chi tiết hiện tượng hỏng hóc');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        deviceId: Number(formData.deviceId),
        title: formData.title.trim(),
        incidentType: formData.incidentType,
        priority: formData.priority,
        description: formData.description.trim(),
        contactPhone: formData.contactPhone.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
      };

      const res = await maintenanceService.createRequest(payload);
      if (res?.success && res?.data) {
        setCreatedTicket(res.data);
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Gửi báo cáo sự cố thất bại. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Quay lại
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600 shrink-0" />
            Báo Sự Cố & Yêu Cầu Sửa Chữa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gửi yêu cầu bảo trì trực tiếp tới Ban Quản trị và Kỹ thuật viên nhà trường
          </p>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Chọn thiết bị */}
          <Card className="p-4 sm:p-6 bg-white shadow-sm border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-brand-600" />
                1. Thiết Bị Gặp Sự Cố <span className="text-rose-500">*</span>
              </h3>
              {selectedDevice && (
                <button
                  type="button"
                  onClick={() => { setSelectedDevice(null); setFormData(p => ({ ...p, deviceId: '' })); }}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  Chọn thiết bị khác
                </button>
              )}
            </div>

            {loadingDevice ? (
              <div className="py-4 flex items-center justify-center">
                <Spinner size="sm" />
              </div>
            ) : selectedDevice ? (
              /* Selected Device Preview Card */
              <div className="p-3.5 bg-brand-50/60 rounded-2xl border border-brand-200 flex items-start gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-xs text-brand-600 border border-brand-100 shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-brand-200">
                      {selectedDevice.code}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{selectedDevice.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <strong>{selectedDevice.room_name}</strong> - {selectedDevice.building_name} (Tầng {selectedDevice.floor})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Phân loại: {selectedDevice.device_type_name || selectedDevice.category}
                  </p>
                </div>
              </div>
            ) : (
              /* Search Device Input */
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Nhập mã thiết bị, tên máy hoặc bấm Quét QR:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: DEV-2026-0001, Máy chiếu..."
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchDevices}
                    loading={searchingDevices}
                    icon={Search}
                    size="sm"
                  >
                    Tìm
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate('/qr-scanner')}
                    icon={QrCode}
                    size="sm"
                    className="shadow-md shadow-brand-600/20"
                  >
                    Quét QR
                  </Button>
                </div>

                {/* Search Results dropdown */}
                {devicesList.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50 max-h-52 overflow-y-auto">
                    {devicesList.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDevice(d)}
                        className="p-2.5 hover:bg-white cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-brand-700 mr-2">{d.code}</span>
                          <span className="font-semibold text-slate-800">{d.name}</span>
                          <span className="text-slate-500 block text-[11px] mt-0.5">
                            {d.room_name} ({d.building_name})
                          </span>
                        </div>
                        <Button size="sm" variant="outline">Chọn</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Section 2: Chi tiết sự cố */}
          <Card className="p-4 sm:p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              2. Mô Tả Sự Cố & Mức Độ Khẩn Cấp
            </h3>

            <div className="space-y-4">
              {/* Tiêu đề */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề tóm tắt sự cố <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="VD: Máy chiếu không lên đèn, PC không vào được mạng..."
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              {/* Mức độ ưu tiên - Thẻ chọn trực quan trên Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mức độ ưu tiên & Cam kết xử lý SLA <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'LOW', label: 'Thấp', sla: 'SLA: 72h', color: 'border-slate-200 hover:border-slate-400 bg-slate-50' },
                    { val: 'MEDIUM', label: 'Trung bình', sla: 'SLA: 24h', color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50' },
                    { val: 'HIGH', label: 'Cao', sla: 'SLA: 8h', color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50' },
                    { val: 'URGENT', label: 'Khẩn cấp', sla: 'SLA: 4h', color: 'border-rose-200 hover:border-rose-400 bg-rose-50/50' },
                  ].map((p) => {
                    const isSelected = formData.priority === p.val;
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: p.val }))}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/30'
                            : p.color
                        }`}
                      >
                        <p className={`text-xs font-bold ${isSelected ? 'text-brand-700' : 'text-slate-800'}`}>
                          {p.label}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {p.sla}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phân loại lỗi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại sự cố</label>
                <select
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="HARDWARE">Lỗi phần cứng / Thiết bị hỏng</option>
                  <option value="SOFTWARE">Lỗi phần mềm / Hệ điều hành</option>
                  <option value="NETWORK">Lỗi mạng Internet / Wifi / LAN</option>
                  <option value="POWER_ELECTRICITY">Lỗi nguồn điện / Chập cháy</option>
                  <option value="OTHER">Lỗi khác</option>
                </select>
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả chi tiết hiện tượng <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Mô tả cụ thể: Đang sử dụng thì tắt ngấm, phát ra tiếng kêu lạ, màn hình nhấp nháy, báo lỗi mã gì..."
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              {/* Chụp / Chọn ảnh hiện trường */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hình ảnh hiện trường sự cố (Chụp từ Camera hoặc chọn từ thư viện)
                </label>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewImage ? (
                  <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                    <img
                      src={previewImage}
                      alt="Ảnh sự cố"
                      className="w-full max-w-xs h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-colors"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Camera}
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-xs"
                    >
                      Chụp Ảnh Trực Tiếp
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={ImageIcon}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs"
                    >
                      Chọn Ảnh Từ Thư Viện
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Section 3: Thông tin liên hệ */}
          <Card className="p-4 sm:p-6 bg-white shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-600" />
              3. Thông Tin Liên Hệ Người Báo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số điện thoại liên hệ khi KTV tới</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email nhận thông báo tiến độ</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="email@university.edu.vn"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Summary & Action */}
        <div className="space-y-4">
          <Card className="p-4 sm:p-5 bg-white shadow-sm border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Xác Nhận & Gửi Phiếu
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Người báo:</span>
                <strong className="text-slate-900">{user?.fullName || user?.username}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Trạng thái ban đầu:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  PENDING (Chờ tiếp nhận)
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Mức độ ưu tiên:</span>
                <span className="font-bold text-slate-900">{formData.priority}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                variant="danger"
                size="lg"
                loading={submitting}
                icon={Send}
                className="w-full shadow-lg shadow-rose-600/20 font-bold py-3 text-sm"
              >
                Đăng Yêu Cầu Bảo Trì
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="w-full text-xs"
              >
                Hủy Bỏ
              </Button>
            </div>
          </Card>

          {/* SLA Guide */}
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
            <h5 className="font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Cam Kết Thời Gian Xử Lý (SLA):
            </h5>
            <ul className="text-[11px] text-blue-800 space-y-0.5 list-disc list-inside">
              <li><strong>KHẨN CẤP:</strong> Xử lý trong vòng 4 giờ</li>
              <li><strong>CAO:</strong> Xử lý trong vòng 8 giờ</li>
              <li><strong>TRUNG BÌNH:</strong> Xử lý trong vòng 24 giờ</li>
              <li><strong>THẤP:</strong> Xử lý trong vòng 72 giờ</li>
            </ul>
          </div>
        </div>
      </form>

      {/* Success Modal Showing Generated Ticket Code */}
      {showSuccessModal && createdTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Đã Gửi Yêu Cầu Bảo Trì Thành Công!
              </h3>
              <p className="text-xs text-slate-500">
                Hệ thống đã tự động ghi nhận và chuyển tới Ban Quản trị để điều phối kỹ thuật viên.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Mã Phiếu Yêu Cầu Định Danh
              </span>
              <p className="text-2xl font-black font-mono text-brand-600">
                {createdTicket.code}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {createdTicket.title}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => navigate(`/maintenance/${createdTicket.id}`)}
                className="w-full font-bold shadow-md shadow-brand-600/20"
              >
                Xem Chi Tiết Phiếu Vừa Tạo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/my-tickets')}
                className="w-full text-xs text-slate-600"
              >
                Về Danh Sách Phiếu Của Tôi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
