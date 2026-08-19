import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { dashboardService } from '../../services/dashboardService';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import {
  FileSpreadsheet, FileText, Printer, Download, Filter, RotateCcw,
  Calendar, Building2, MapPin, Laptop, Wrench, ShieldAlert,
  Clock, DollarSign, CheckCircle2, Search, ChevronLeft, ChevronRight,
  Sparkles, Layers, Award, UserCheck
} from 'lucide-react';

const REPORT_TYPES = [
  {
    id: 'device-inventory',
    title: '1. Kiểm Kê Thiết Bị & Tài Sản',
    desc: 'Toàn bộ danh mục thiết bị, vị trí phòng, nhà cung cấp, nguyên giá và hạn bảo hành',
    icon: Laptop,
    color: 'text-brand-600 bg-brand-50 border-brand-200',
  },
  {
    id: 'maintenance',
    title: '2. Tổng Hợp Sự Cố & Bảo Trì',
    desc: 'Lịch sử tiếp nhận, xử lý, phân công KTV, thời gian hoàn thành và chi phí',
    icon: Wrench,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'maintenance-cost',
    title: '3. Chi Phí Bảo Trì & Linh Kiện',
    desc: 'Chi tiết linh kiện thay thế, số lượng, đơn giá và tổng chi phí sửa chữa',
    icon: DollarSign,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'technician-performance',
    title: '4. Hiệu Suất Kỹ Thuật Viên',
    desc: 'Đánh giá số lượng phiếu hoàn thành, tỷ lệ hoàn thành, thời gian xử lý và chi phí',
    icon: UserCheck,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'device-incident-frequency',
    title: '5. Tần Suất Sự Cố Theo Thiết Bị',
    desc: 'Thống kê số lần báo hỏng của từng thiết bị, mức độ tin cậy và tổng chi phí',
    icon: ShieldAlert,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'warranty-expiration',
    title: '6. Thời Hạn Bảo Hành Thiết Bị',
    desc: 'Danh sách thiết bị còn hạn, sắp hết hạn trong 30 ngày hoặc đã hết hạn',
    icon: Award,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  },
  {
    id: 'scheduled-maintenance',
    title: '7. Kế Hoạch Bảo Dưỡng Định Kỳ',
    desc: 'Lịch bảo trì phòng ngừa hỏng hóc, chu kỳ lặp lại và trạng thái tiến độ',
    icon: Calendar,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
];

export const ReportsPage = () => {
  const { user } = useAuth();

  const [selectedReport, setSelectedReport] = useState('device-inventory');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    buildingId: '',
    locationId: '',
    deviceTypeId: '',
    technicianId: '',
    status: '',
    priority: '',
  });

  const [filterMeta, setFilterMeta] = useState({ buildings: [], locations: [], deviceTypes: [] });
  const [technicians, setTechnicians] = useState([]);
  const [tableSearch, setTableSearch] = useState('');

  // Pagination for preview
  const [previewPage, setPreviewPage] = useState(1);
  const [previewLimit] = useState(15);

  useEffect(() => {
    // Load metadata for filters
    const loadMeta = async () => {
      try {
        const [dashMeta, techMeta] = await Promise.all([
          dashboardService.getFilterOptions(),
          maintenanceService.getActiveTechnicians(),
        ]);
        if (dashMeta?.success) setFilterMeta(dashMeta.data);
        if (techMeta?.success) setTechnicians(techMeta.data);
      } catch (err) {
        console.warn('Lỗi tải danh mục:', err);
      }
    };
    loadMeta();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      Object.keys(filters).forEach((k) => {
        if (filters[k]) params[k] = filters[k];
      });

      const res = await reportService.previewReport(selectedReport, params);
      if (res?.success && res?.data) {
        setReportData(res.data);
        setPreviewPage(1);
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'buildingId' ? { locationId: '' } : {}),
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      buildingId: '',
      locationId: '',
      deviceTypeId: '',
      technicianId: '',
      status: '',
      priority: '',
    });
    setTableSearch('');
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setError('');
      const params = {};
      Object.keys(filters).forEach((k) => {
        if (filters[k]) params[k] = filters[k];
      });
      await reportService.downloadReport(selectedReport, format, params);
    } catch (err) {
      setError(err?.message || 'Lỗi khi xuất file báo cáo');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter client-side preview rows by search
  const filteredRows = (reportData?.data || []).filter((row) => {
    if (!tableSearch.trim()) return true;
    const term = tableSearch.toLowerCase();
    return Object.values(row).some(
      (val) => val && String(val).toLowerCase().includes(term)
    );
  });

  const totalPreviewPages = Math.ceil(filteredRows.length / previewLimit) || 1;
  const currentRows = filteredRows.slice(
    (previewPage - 1) * previewLimit,
    previewPage * previewLimit
  );

  const currentReportObj = REPORT_TYPES.find((r) => r.id === selectedReport);

  return (
    <div className="space-y-6">
      {/* Printable Letterhead & Report View (Only Visible During Window.Print) */}
      <div className="hidden print:block text-black p-4 space-y-4">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div className="text-center">
            <h4 className="font-bold text-xs uppercase">BỘ GIAO THÔNG VẬN TẢI</h4>
            <h3 className="font-black text-sm uppercase">TRƯỜNG ĐẠI HỌC CÔNG NGHỆ GIAO THÔNG VẬN TẢI</h3>
            <p className="text-[10px] italic">Phòng Quản Trị Thiết Bị & Cơ Sở Vật Chất (UTT)</p>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
            <p className="font-bold text-xs underline">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-[10px] italic mt-1">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
          </div>
        </div>

        <div className="text-center py-2">
          <h2 className="text-lg font-black uppercase tracking-wider">{reportData?.title}</h2>
          <p className="text-xs italic text-slate-600">
            (Tổng số bản ghi: {filteredRows.length} | Thời gian xuất: {new Date().toLocaleString('vi-VN')})
          </p>
        </div>

        <table className="w-full text-[11px] border-collapse border border-slate-800">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-800 p-1 text-center w-8">STT</th>
              {reportData?.columns.map((col) => (
                <th key={col.key} className="border border-slate-800 p-1 text-left">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr key={idx}>
                <td className="border border-slate-800 p-1 text-center">{idx + 1}</td>
                {reportData?.columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td key={col.key} className="border border-slate-800 p-1">
                      {col.isCurrency && val !== null && val !== undefined
                        ? `${Number(val).toLocaleString('vi-VN')} đ`
                        : col.isDate && val
                        ? new Date(val).toLocaleDateString('vi-VN')
                        : col.isDateTime && val
                        ? new Date(val).toLocaleString('vi-VN')
                        : val || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-3 text-center text-xs pt-12">
          <div>
            <p className="font-bold uppercase">Người Lập Báo Cáo</p>
            <p className="text-[10px] italic">(Ký và ghi rõ họ tên)</p>
            <div className="h-16" />
            <p className="font-bold">{user?.fullName || user?.username}</p>
          </div>
          <div>
            <p className="font-bold uppercase">Trưởng Ban Quản Trị TB</p>
            <p className="text-[10px] italic">(Ký và ghi rõ họ tên)</p>
            <div className="h-16" />
            <p className="font-bold">Ban Quản Lý Cơ Sở Vật Chất</p>
          </div>
          <div>
            <p className="font-bold uppercase">Ban Giám Hiệu Phê Duyệt</p>
            <p className="text-[10px] italic">(Ký tên và đóng dấu)</p>
            <div className="h-16" />
            <p className="font-bold">Đại Diện Ban Giám Hiệu</p>
          </div>
        </div>
      </div>

      {/* Screen Interface (Hidden when printing) */}
      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <FileSpreadsheet className="w-7 h-7 text-brand-600" />
              Trung Tâm Báo Cáo & Xuất Dữ Liệu (Reporting & Analytics Center)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              7 mẫu báo cáo chuyên sâu, hỗ trợ xem trước, xuất file Excel (.xlsx), CSV tiếng Việt và in ấn biên bản khổ A4.
            </p>
          </div>

          {/* Export Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="md"
              icon={Printer}
              onClick={handlePrint}
              disabled={loading || filteredRows.length === 0}
              className="border-slate-300 hover:bg-slate-100 text-slate-700"
            >
              In A4 / PDF
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={() => handleExport('csv')}
              disabled={loading || exporting || filteredRows.length === 0}
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              Xuất CSV
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={FileSpreadsheet}
              loading={exporting}
              onClick={() => handleExport('xlsx')}
              disabled={loading || filteredRows.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
            >
              Xuất Excel (.xlsx)
            </Button>
          </div>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* 7 Report Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {REPORT_TYPES.map((rep) => {
            const Icon = rep.icon;
            const isSelected = selectedReport === rep.id;

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep.id)}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/70 shadow-md ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-brand-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-2 rounded-xl border ${rep.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 ring-2 ring-brand-200" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{rep.title}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight">{rep.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Multi-Dimensional Filter Bar */}
        <Card className="p-4 bg-white shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-brand-600" />
              Bộ Lọc Dữ Liệu Báo Cáo
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Từ ngày</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Đến ngày</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            {/* Building */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tòa nhà</label>
              <select
                name="buildingId"
                value={filters.buildingId}
                onChange={handleFilterChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Tất cả tòa --</option>
                {filterMeta.buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phòng học</label>
              <select
                name="locationId"
                value={filters.locationId}
                onChange={handleFilterChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Tất cả phòng --</option>
                {filterMeta.locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.room_name}</option>
                ))}
              </select>
            </div>

            {/* Technician */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kỹ thuật viên</label>
              <select
                name="technicianId"
                value={filters.technicianId}
                onChange={handleFilterChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Tất cả KTV --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trạng thái</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="ACTIVE">Hoạt động tốt (ACTIVE)</option>
                <option value="BROKEN">Hỏng hóc (BROKEN)</option>
                <option value="MAINTENANCE">Đang bảo trì (MAINTENANCE)</option>
                <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
                <option value="CLOSED">Đã đóng phiếu (CLOSED)</option>
                <option value="EXPIRING_SOON">Sắp hết bảo hành (30 ngày)</option>
                <option value="EXPIRED">Đã hết bảo hành</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Preview Table Header & Search */}
        <Card className="bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/75">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                {reportData?.title || 'Xem Trước Dữ Liệu Báo Cáo'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hiển thị <strong>{filteredRows.length}</strong> kết quả phù hợp
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhanh trong bảng xem trước..."
                value={tableSearch}
                onChange={(e) => { setTableSearch(e.target.value); setPreviewPage(1); }}
                className="block w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Không có dữ liệu báo cáo nào</h4>
              <p className="text-xs text-slate-500">Hãy thử thay đổi điều kiện lọc hoặc chọn mẫu báo cáo khác.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-3 text-center w-10">STT</th>
                    {reportData?.columns.map((col) => (
                      <th key={col.key} className="py-3 px-3">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRows.map((row, idx) => {
                    const rowNumber = (previewPage - 1) * previewLimit + idx + 1;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                          {rowNumber}
                        </td>
                        {reportData?.columns.map((col) => {
                          const val = row[col.key];

                          return (
                            <td key={col.key} className="py-2.5 px-3">
                              {col.isCurrency && val !== null && val !== undefined ? (
                                <span className="font-mono font-bold text-emerald-700">
                                  {Number(val).toLocaleString('vi-VN')} đ
                                </span>
                              ) : col.isDate && val ? (
                                <span className="font-mono text-slate-700">
                                  {new Date(val).toLocaleDateString('vi-VN')}
                                </span>
                              ) : col.isDateTime && val ? (
                                <span className="font-mono text-[11px] text-slate-600">
                                  {new Date(val).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                                  {new Date(val).toLocaleDateString('vi-VN')}
                                </span>
                              ) : (
                                <span className="text-slate-800">{val || '-'}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPreviewPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Trang {previewPage} / {totalPreviewPages} (Tổng cộng {filteredRows.length} bản ghi)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={previewPage <= 1}
                  onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={previewPage >= totalPreviewPages}
                  onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
