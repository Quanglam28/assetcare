import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deviceService } from '../../services/deviceService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Laptop, ArrowLeft, CheckCircle, QrCode, Tag, 
  MapPin, Building2, DollarSign, Calendar, Edit3
} from 'lucide-react';

export const DeviceEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    deviceTypeId: '',
    buildingId: '',
    locationId: '',
    departmentId: '',
    supplierId: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: 0,
    warrantyStart: '',
    warrantyEnd: '',
    status: 'ACTIVE',
    description: '',
    qrToken: '',
  });

  const [masterData, setMasterData] = useState({
    buildings: [],
    locations: [],
    departments: [],
    deviceTypes: [],
    suppliers: [],
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [devRes, masterRes] = await Promise.all([
          deviceService.getDeviceById(id),
          deviceService.getMasterData(),
        ]);

        if (devRes?.success && devRes?.data) {
          const d = devRes.data;
          setFormData({
            code: d.code || '',
            name: d.name || '',
            deviceTypeId: d.device_type_id || '',
            buildingId: d.building_id || '',
            locationId: d.location_id || '',
            departmentId: d.department_id || '',
            supplierId: d.supplier_id || '',
            model: d.model || '',
            serialNumber: d.serial_number || '',
            purchaseDate: d.purchase_date ? d.purchase_date.split('T')[0] : '',
            purchasePrice: d.purchase_price || 0,
            warrantyStart: d.warranty_start ? d.warranty_start.split('T')[0] : '',
            warrantyEnd: d.warranty_end ? d.warranty_end.split('T')[0] : '',
            status: d.status || 'ACTIVE',
            description: d.description || '',
            qrToken: d.qr_token || '',
          });
        }

        if (masterRes?.success && masterRes?.data) {
          setMasterData(masterRes.data);
        }
      } catch (err) {
        setError(err?.message || 'Không thể tải thông tin thiết bị');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filteredLocations = formData.buildingId
    ? masterData.locations?.filter(loc => String(loc.building_id) === String(formData.buildingId))
    : masterData.locations;

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
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Vui lòng điền tên thiết bị');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        deviceTypeId: Number(formData.deviceTypeId),
        locationId: Number(formData.locationId),
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
        model: formData.model.trim() || null,
        serialNumber: formData.serialNumber.trim() || null,
        purchaseDate: formData.purchaseDate || null,
        purchasePrice: Number(formData.purchasePrice) || 0,
        warrantyStart: formData.warrantyStart || null,
        warrantyEnd: formData.warrantyEnd || null,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      const res = await deviceService.updateDevice(id, payload);
      setSuccess(`Cập nhật thiết bị "${res.data?.name || formData.name}" thành công!`);
      setTimeout(() => {
        navigate(`/devices/${id}`);
      }, 1200);
    } catch (err) {
      setError(err?.message || err?.error || 'Cập nhật thiết bị thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header & Back Button */}
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
            <Edit3 className="w-7 h-7 text-brand-600" />
            Chỉnh Sửa Thiết Bị: {formData.name}
          </h1>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Thông tin cơ bản */}
          <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600" />
              1. Thông Tin Định Danh & Phân Loại
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mã thiết bị (Disabled) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã thiết bị <span className="text-xs text-slate-400 font-normal">(Cố định)</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  disabled
                  className="block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 font-mono cursor-not-allowed"
                />
              </div>

              {/* Loại thiết bị */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại thiết bị <span className="text-rose-500">*</span>
                </label>
                <select
                  name="deviceTypeId"
                  value={formData.deviceTypeId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                  required
                >
                  {masterData.deviceTypes?.map(dt => (
                    <option key={dt.id} value={dt.id}>{dt.name} ({dt.code})</option>
                  ))}
                </select>
              </div>

              {/* Tên thiết bị */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên thiết bị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model sản phẩm</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Serial number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số Serial (S/N)</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Vị trí & Đơn vị quản lý */}
          <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              2. Vị Trí Lắp Đặt & Quản Lý
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tòa nhà */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tòa nhà</label>
                <select
                  name="buildingId"
                  value={formData.buildingId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">-- Tất cả tòa nhà --</option>
                  {masterData.buildings?.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              {/* Phòng học / Địa điểm */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phòng học / Vị trí <span className="text-rose-500">*</span>
                </label>
                <select
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                  required
                >
                  {filteredLocations?.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.room_name} ({loc.code}) {loc.building_name ? `- ${loc.building_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Đơn vị quản lý */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khoa / Đơn vị trực thuộc</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">-- Toàn trường / Không phân khoa --</option>
                  {masterData.departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Nhà cung cấp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhà cung cấp</label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {masterData.suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Section 3: Mua sắm, Bảo hành & Trạng thái */}
          <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-600" />
              3. Mua Sắm, Bảo Hành & Trạng Thái
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Giá mua */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giá mua (VNĐ)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min={0}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Ngày mua */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày mua</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="ACTIVE">Hoạt động tốt</option>
                  <option value="MAINTENANCE">Đang bảo dưỡng</option>
                  <option value="BROKEN">Hỏng hóc</option>
                  <option value="RETIRED">Đã thanh lý</option>
                </select>
              </div>

              {/* Ngày bắt đầu bảo hành */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bắt đầu bảo hành</label>
                <input
                  type="date"
                  name="warrantyStart"
                  value={formData.warrantyStart}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Ngày hết hạn bảo hành */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hết hạn bảo hành</label>
                <input
                  type="date"
                  name="warrantyEnd"
                  value={formData.warrantyEnd}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Ghi chú */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả / Ghi chú</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: QR Card & Actions */}
        <div className="space-y-6">
          <Card className="p-5 bg-white shadow-sm border border-slate-200 text-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-600" />
              Mã QR Đã Cấp Phát
            </h4>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 inline-block mx-auto mb-3">
              <QRCodeSVG
                value={formData.qrToken || `UNI-QR-2026-${formData.code}`}
                size={140}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-left bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Token:</p>
              <p className="font-mono text-xs font-bold text-slate-800 break-all">{formData.qrToken}</p>
            </div>

            <div className="pt-5 flex flex-col gap-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                icon={CheckCircle}
                className="w-full shadow-md shadow-brand-600/20"
              >
                Lưu Thay Đổi
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate(`/devices/${id}`)}
                disabled={submitting}
                className="w-full"
              >
                Hủy Bỏ
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
