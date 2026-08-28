import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard, Laptop, CheckCircle2, AlertTriangle, Wrench,
  Clock, ShieldAlert, DollarSign, Filter, RotateCcw, Calendar,
  Building2, MapPin, Layers, TrendingUp, BarChart3, PieChart as PieIcon,
  Award, AlertCircle, Zap, Sparkles, Flame, RefreshCw, FileText,
  HeartPulse, ArrowRight
} from 'lucide-react';
import { MAINTENANCE_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  ASSIGNED: '#0ea5e9',
  IN_PROGRESS: '#3b82f6',
  WAITING_PART: '#f97316',
  COMPLETED: '#6366f1',
  CLOSED: '#10b981',
  REOPENED: '#f43f5e',
};

const PRIORITY_COLORS = {
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

const TYPE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#f97316', '#64748b'];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isManager, isTechnician } = useAuth();

  useEffect(() => {
    if (user?.role === 'TECHNICIAN') {
      navigate('/technician/dashboard', { replace: true });
    } else if (user?.role === 'USER') {
      navigate('/my-tickets', { replace: true });
    }
  }, [user, navigate]);

  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [healthDist, setHealthDist] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [topAtRisk, setTopAtRisk] = useState([]);
  const [predictiveAlerts, setPredictiveAlerts] = useState(null);
  const [topDegrading, setTopDegrading] = useState([]);
  const [filterMeta, setFilterMeta] = useState({ buildings: [], locations: [], deviceTypes: [] });
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [recalcSuccess, setRecalcSuccess] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    buildingId: '',
    locationId: '',
    deviceTypeId: '',
    status: '',
    priority: '',
  });

  const loadFilterOptions = async () => {
    if (!isAdmin && !isManager) return;
    try {
      const res = await dashboardService.getFilterOptions();
      if (res?.success && res?.data) {
        setFilterMeta(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải danh mục lọc:', err);
    }
  };

  const fetchDashboardData = async () => {
    if (!isAdmin && !isManager) return;
    try {
      setLoading(true);
      setError('');
      const params = {};
      Object.keys(filters).forEach(k => {
        if (filters[k]) params[k] = filters[k];
      });

      // 1. Tải nhanh tầng 1: KPI Stats, Biểu đồ chính, SLA Stats (Hiển thị ngay cho người dùng)
      const [statsRes, chartsRes, slaRes] = await Promise.all([
        dashboardService.getOverviewStats(params).catch(() => null),
        dashboardService.getAllCharts(params).catch(() => null),
        dashboardService.getSlaStats(params).catch(() => null),
      ]);

      if (statsRes?.data?.success) setStats(statsRes.data.data);
      else if (statsRes?.data) setStats(statsRes.data);

      if (chartsRes?.data?.success) setCharts(chartsRes.data.data);
      else if (chartsRes?.data) setCharts(chartsRes.data);

      if (slaRes?.data?.success) setSlaData(slaRes.data.data);
      else if (slaRes?.data) setSlaData(slaRes.data);

      // Kết thúc loading sớm để người dùng xem được ngay các thẻ KPI và biểu đồ
      setLoading(false);

      // 2. Tải song song tầng 2: Phân tích sức khỏe, rủi ro và mô phỏng dự báo
      Promise.all([
        dashboardService.getHealthDistribution().catch(() => null),
        dashboardService.getMaintenanceRiskSummary().catch(() => null),
        dashboardService.getTopAtRiskAssets(10).catch(() => null),
        dashboardService.getPredictiveAlerts(30).catch(() => null),
        dashboardService.getTopDegrading(30, 10).catch(() => null),
      ]).then(([healthDistRes, riskSumRes, topRiskRes, predAlertsRes, topDegradingRes]) => {
        if (healthDistRes?.data?.success) setHealthDist(healthDistRes.data.data);
        else if (healthDistRes?.data) setHealthDist(healthDistRes.data);

        if (riskSumRes?.data?.success) setRiskSummary(riskSumRes.data.data);
        else if (riskSumRes?.data) setRiskSummary(riskSumRes.data);

        if (topRiskRes?.data?.success) setTopAtRisk(topRiskRes.data.data || []);
        else if (topRiskRes?.data) setTopAtRisk(topRiskRes.data || []);

        if (predAlertsRes?.data) setPredictiveAlerts(predAlertsRes.data);
        if (topDegradingRes?.data) setTopDegrading(topDegradingRes.data);
      });
    } catch (err) {
      setError(err?.message || 'Không thể tải dữ liệu bảng điều khiển');
      setLoading(false);
    }
  };

  const handleRecalculateAll = async () => {
    try {
      setRecalculating(true);
      const res = await dashboardService.recalculateAllAssets();
      setRecalcSuccess('Đã cập nhật và tính toán lại điểm sức khỏe toàn bộ thiết bị thành công!');
      setTimeout(() => setRecalcSuccess(''), 4000);
      fetchDashboardData();
    } catch (err) {
      setError('Lỗi khi tính toán lại: ' + (err?.message || 'Lỗi server'));
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isManager) {
      loadFilterOptions();
    }
  }, [isAdmin, isManager]);

  useEffect(() => {
    if (isAdmin || isManager) {
      fetchDashboardData();
    }
  }, [filters, isAdmin, isManager]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
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
      status: '',
      priority: '',
    });
  };

  // Filter locations by building if selected
  const availableLocations = filters.buildingId
    ? filterMeta.locations.filter(l => String(l.building_id) === String(filters.buildingId))
    : filterMeta.locations;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dữ liệu tổng hợp về thiết bị, bảo trì và chỉ số vận hành
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              loading={recalculating}
              onClick={handleRecalculateAll}
            >
              Tính lại sức khỏe
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={fetchDashboardData}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {recalcSuccess && (
        <Alert type="success" onClose={() => setRecalcSuccess('')}>
          {recalcSuccess}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-600">Bộ lọc</span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Xóa lọc
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Date from */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-500 font-mono shadow-2xs transition-all"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-500 font-mono shadow-2xs transition-all"
            />
          </div>

          {/* Building */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tòa nhà</label>
            <select
              name="buildingId"
              value={filters.buildingId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            >
              <option value="">-- Tất cả tòa --</option>
              {filterMeta.buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Phòng / Địa điểm</label>
            <select
              name="locationId"
              value={filters.locationId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            >
              <option value="">-- Tất cả phòng --</option>
              {availableLocations.map(l => (
                <option key={l.id} value={l.id}>{l.room_name}</option>
              ))}
            </select>
          </div>

          {/* Device Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Loại thiết bị</label>
            <select
              name="deviceTypeId"
              value={filters.deviceTypeId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            >
              <option value="">-- Tất cả loại --</option>
              {filterMeta.deviceTypes.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Mức ưu tiên</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            >
              <option value="">-- Tất cả ưu tiên --</option>
              <option value="LOW">Thấp (Low)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="HIGH">Cao (High)</option>
              <option value="URGENT">Khẩn cấp (Urgent)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-500 mb-1">Tổng thiết bị</div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalDevices}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">tài sản đang quản lý</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-medium text-emerald-600 mb-1">Đang hoạt động</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.activeDevices}</div>
            <div className="text-[11px] text-emerald-500 mt-0.5">{stats.activeDevices && stats.totalDevices ? Math.round(stats.activeDevices/stats.totalDevices*100) : 0}% tổng số</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-medium text-red-600 mb-1">Hỏng / Bảo trì</div>
            <div className="text-2xl font-bold text-red-600">{stats.brokenDevices + stats.maintenanceDevices}</div>
            <div className="text-[11px] text-red-500 mt-0.5">{stats.brokenDevices} hỏng + {stats.maintenanceDevices} bảo trì</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-medium text-amber-600 mb-1">Chờ xử lý</div>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingTickets}</div>
            <div className="text-[11px] text-amber-500 mt-0.5">{stats.overdueTickets} phiếu quá hạn</div>
          </div>
        </div>
      )}

      {/* 8 Interactive Charts Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : charts ? (
        <div className="space-y-6">
          {/* Row 1: Requests Trend & Cost by Month */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Requests by Month */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  1. Xu Hướng Báo Cáo Sự Cố Theo Tháng
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">12 tháng gần nhất</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.requestsByMonth}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="count" name="Tổng sự cố phát sinh" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
                    <Area type="monotone" dataKey="resolved_count" name="Đã giải quyết xong" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 6: Maintenance Cost by Month */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  6. Chi Phí Bảo Trì & Linh Kiện Theo Tháng (VNĐ)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Đơn vị: VNĐ</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.costByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toLocaleString('vi-VN')}k`} />
                    <Tooltip
                      formatter={(val) => [`${Number(val).toLocaleString('vi-VN')} VNĐ`, 'Chi phí bảo trì']}
                      contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                    />
                    <Bar dataKey="total_cost" name="Chi phí thực tế" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Row 2: Status Breakdown & Priority Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chart 2: Requests by Status */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <PieIcon className="w-4 h-4 text-brand-600" />
                2. Phân Bổ Sự Cố Theo Trạng Thái
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.requestsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {charts.requestsByStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 3: Requests by Priority */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                3. Sự Cố Theo Mức Độ Ưu Tiên
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.requestsByPriority}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Số lượng phiếu" radius={[4, 4, 0, 0]}>
                      {charts.requestsByPriority.map((entry) => (
                        <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 4: Devices by Type */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3 sm:col-span-2 lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-purple-600" />
                4. Cơ Cấu Thiết Bị Theo Loại
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.devicesByType}
                      dataKey="count"
                      nameKey="type_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {charts.devicesByType.map((entry, index) => (
                        <Cell key={`type-${entry.id}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Row 3: Devices by Building & Top Incident Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 5: Devices by Building */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                5. Phân Bổ Thiết Bị Theo Tòa Nhà (Hoạt Động / Hỏng)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.devicesByBuilding}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="building_name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="active_count" name="Hoạt động tốt" fill="#10b981" stackId="a" />
                    <Bar dataKey="broken_count" name="Hỏng hóc" fill="#f43f5e" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 8: Top Locations with Most Incidents */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                8. Top Địa Điểm / Phòng Học Phát Sinh Nhiều Sự Cố Nhất
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <th className="py-2">Phòng Học / Địa Điểm</th>
                      <th className="py-2">Tòa Nhà</th>
                      <th className="py-2 text-center">Số Lần Sự Cố</th>
                      <th className="py-2 text-right">Tổng Chi Phí Sửa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {charts.topLocations.slice(0, 6).map((loc, idx) => (
                      <tr key={loc.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          {loc.room_name}
                        </td>
                        <td className="py-2.5 text-slate-500">{loc.building_name}</td>
                        <td className="py-2.5 text-center font-bold font-mono text-rose-600">
                          {loc.incident_count}
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-emerald-700">
                          {Number(loc.total_cost).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Row 4: Top 10 Devices with Most Incidents */}
          <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                7. Top 10 Thiết Bị Gặp Nhiều Sự Cố Nhất Cần Lưu Ý
              </h3>
              <span className="text-[11px] text-slate-500">Xếp hạng theo tần suất báo hỏng hóc</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2">Hạng</th>
                    <th className="py-2">Mã Thiết Bị</th>
                    <th className="py-2">Tên Thiết Bị / Model</th>
                    <th className="py-2">Loại Thiết Bị</th>
                    <th className="py-2">Vị Trí</th>
                    <th className="py-2 text-center">Số Sự Cố</th>
                    <th className="py-2 text-right">Tổng Chi Phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {charts.topDevices.map((dev, idx) => (
                    <tr key={dev.id} className="hover:bg-slate-50">
                      <td className="py-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-rose-500 text-white' : idx < 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-brand-700">{dev.device_code}</td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        {dev.device_name}
                        {dev.device_model && <span className="text-slate-400 block text-[11px]">{dev.device_model}</span>}
                      </td>
                      <td className="py-2.5 text-slate-600">{dev.device_type_name}</td>
                      <td className="py-2.5 text-slate-600">{dev.room_name} ({dev.building_name})</td>
                      <td className="py-2.5 text-center font-mono font-bold text-rose-600">
                        {dev.incident_count} lần
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-700">
                        {Number(dev.total_cost).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Row 4.5: PREDICTIVE MAINTENANCE & ASSET HEALTH ENGINE (MODULE 14) */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-600" />
                  Dự Báo Nguy Cơ Sự Cố & Sức Khỏe Tài Sản (Predictive Maintenance & Asset Health Engine)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hệ thống hỗ trợ ra quyết định bảo trì phòng ngừa dựa trên quy tắc chuyên gia định lượng (Rule-based Risk Engine)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/devices')}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Xem toàn bộ 50 thiết bị &rarr;
                </button>
              </div>
            </div>

            {/* 4 Health & Risk Key Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Healthy Assets */}
              <Card className="p-4 bg-emerald-50/40 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Sức Khỏe Tốt (GOOD)</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">{healthDist?.goodCount || 0}</p>
                <span className="text-[11px] text-emerald-600 font-medium">thiết bị ổn định (80-100đ)</span>
              </Card>

              {/* Warning Assets */}
              <Card className="p-4 bg-yellow-50/40 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Cần Theo Dõi (FAIR/WARN)</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                </div>
                <p className="text-2xl font-black text-yellow-700 mt-2 font-mono">
                  {(Number(healthDist?.fairCount) || 0) + (Number(healthDist?.warningCount) || 0)}
                </p>
                <span className="text-[11px] text-yellow-600 font-medium">có dấu hiệu hao mòn (40-79đ)</span>
              </Card>

              {/* Critical At-Risk Assets */}
              <Card className="p-4 bg-orange-50/40 border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Nguy Cơ Cao (HIGH RISK)</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                </div>
                <p className="text-2xl font-black text-orange-700 mt-2 font-mono">{riskSummary?.highRiskCount || 0}</p>
                <span className="text-[11px] text-orange-600 font-medium">dự báo nguy cơ sự cố tăng</span>
              </Card>

              {/* Replacement / Critical */}
              <Card className="p-4 bg-rose-50/40 border border-rose-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Đề Xuất Thay Mới (REPLACE)</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                </div>
                <p className="text-2xl font-black text-rose-700 mt-2 font-mono">{riskSummary?.considerReplacementCount || 0}</p>
                <span className="text-[11px] text-rose-600 font-medium">chi phí sửa &gt; 60% giá máy</span>
              </Card>
            </div>

            {/* Health Distribution Chart & Risk Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart: Health Distribution Donut */}
              <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-emerald-600" />
                    Phân Bổ Điểm Sức Khỏe Toàn Trường
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Tổng: {healthDist?.totalAssessed || 50} TB</span>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tốt (80-100)', value: Number(healthDist?.goodCount || 0), color: '#10b981' },
                          { name: 'Khá (60-79)', value: Number(healthDist?.fairCount || 0), color: '#eab308' },
                          { name: 'Cần lưu ý (40-59)', value: Number(healthDist?.warningCount || 0), color: '#f97316' },
                          { name: 'Nguy cấp (<40)', value: Number(healthDist?.criticalCount || 0), color: '#ef4444' },
                          { name: 'Chưa đủ dữ liệu', value: Number(healthDist?.insufficientCount || 0), color: '#94a3b8' },
                        ].filter(item => item.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {[
                          { color: '#10b981' },
                          { color: '#eab308' },
                          { color: '#f97316' },
                          { color: '#ef4444' },
                          { color: '#94a3b8' },
                        ].map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Table: Top 10 Assets At Risk */}
              <Card className="lg:col-span-2 p-5 bg-white shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-600" />
                    Top 10 Thiết Bị Có Nguy Cơ Sự Cố Cao Nhất (Top At-Risk Assets)
                  </h4>
                  <span className="text-[11px] text-slate-400">Xếp hạng theo điểm Failure Risk %</span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-white shadow-xs">
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <th className="py-2">Hạng</th>
                        <th className="py-2">Mã & Tên Thiết Bị</th>
                        <th className="py-2">Vị Trí</th>
                        <th className="py-2 text-center">Sức Khỏe</th>
                        <th className="py-2 text-center">Nguy Cơ (Risk)</th>
                        <th className="py-2">Khuyến Nghị</th>
                        <th className="py-2 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topAtRisk.map((dev, idx) => {
                        const hScore = Math.round(Number(dev.health_score) || 100);
                        const rScore = Math.round(Number(dev.risk_score) || 0);

                        return (
                          <tr key={dev.device_id || idx} className="hover:bg-slate-50">
                            <td className="py-2.5">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                idx === 0 ? 'bg-rose-500 text-white' : idx < 3 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 font-semibold text-slate-900">
                              <span
                                onClick={() => navigate(`/devices/${dev.device_id}`)}
                                className="cursor-pointer hover:text-brand-600 block truncate max-w-[150px]"
                                title={dev.device_name}
                              >
                                {dev.device_name}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 block">{dev.device_code}</span>
                            </td>
                            <td className="py-2.5 text-slate-600 truncate max-w-[120px]">
                              {dev.room_name} ({dev.building_name})
                            </td>
                            <td className="py-2.5 text-center font-mono font-bold">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${
                                hScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                hScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                hScore >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {hScore}đ
                              </span>
                            </td>
                            <td className="py-2.5 text-center font-mono font-black text-xs">
                              <span className={`px-2 py-0.5 rounded ${
                                rScore > 60 ? 'bg-rose-100 text-rose-800' :
                                rScore > 40 ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {rScore}%
                              </span>
                            </td>
                            <td className="py-2.5 text-[11px] font-medium text-slate-700">
                              {dev.recommendation_action === 'CONSIDER_REPLACEMENT' ? (
                                <span className="text-rose-700 font-bold">🔴 Xem xét thay mới</span>
                              ) : dev.recommendation_action === 'SCHEDULE_MAINTENANCE' ? (
                                <span className="text-amber-700 font-bold">🟠 Lập lịch bảo dưỡng</span>
                              ) : dev.recommendation_action === 'INSPECT_ASSET' ? (
                                <span className="text-orange-700 font-bold">🟠 Kiểm tra (7 ngày)</span>
                              ) : (
                                <span className="text-emerald-700 font-medium">🟢 Duy trì ổn định</span>
                              )}
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => navigate(`/devices/${dev.device_id}`)}
                                className="px-2.5 py-1 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold"
                              >
                                Chi Tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Top 5 Priority Assets Table (Phase 3) */}
            <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    Top 5 Thiết Bị Ưu Tiên Can Thiệp Kỹ Thuật (Top Priority Assets)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Xếp hạng theo Priority Score chuẩn hóa từ Risk (50%), Nghiệp vụ (20%), Nguyên giá (15%), Downtime (15%)
                  </p>
                </div>
                <Button size="xs" variant="outline" onClick={() => navigate('/risk-matrix')}>
                  Xem Ma Trận Rủi Ro
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] bg-slate-50/70">
                      <th className="p-2.5">Ưu Tiên</th>
                      <th className="p-2.5">Mã & Tên Thiết Bị</th>
                      <th className="p-2.5">Vị Trí & Đơn Vị</th>
                      <th className="p-2.5 text-center">Độ Quan Trọng</th>
                      <th className="p-2.5 text-center">Failure Risk</th>
                      <th className="p-2.5 text-center">Priority Score</th>
                      <th className="p-2.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topAtRisk.slice(0, 5).map((dev, idx) => {
                      const rScore = Math.round(Number(dev.risk_score) || 0);
                      const pScore = Math.round(rScore * 0.5 + 50 * 0.2 + 20 * 0.15 + 10 * 0.15);

                      return (
                        <tr key={dev.device_id || idx} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0 ? 'bg-rose-600 text-white' : idx < 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-900">
                            <span className="block truncate max-w-[180px]">{dev.device_name}</span>
                            <span className="font-mono text-[10px] text-slate-400">{dev.device_code}</span>
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px]">
                            {dev.room_name} ({dev.building_name})
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                              MEDIUM
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded text-[11px] ${
                              rScore >= 80 ? 'bg-rose-100 text-rose-800' :
                              rScore >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {rScore}%
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-black text-xs text-purple-700">
                            <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                              {pScore} / 100
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <Button
                              size="xs"
                              variant="primary"
                              onClick={() => navigate(`/devices/${dev.device_id}`)}
                            >
                              Xem Thiết Bị
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Predictive Maintenance Alerts Widget (Phase 4) */}
            {predictiveAlerts && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <Card className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 font-black text-xl font-mono shrink-0">
                    {predictiveAlerts.criticalTransitionCount || 0}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-950 block">Nguy cơ chuyển CRITICAL (30d)</span>
                    <span className="text-[11px] text-rose-700">Thiết bị dự kiến vượt ngưỡng 80đ ưu tiên</span>
                  </div>
                </Card>

                <Card className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-100 text-orange-700 font-black text-xl font-mono shrink-0">
                    {predictiveAlerts.highRiskSurgeCount || 0}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-orange-950 block">Rủi ro tăng đột biến &gt; 20%</span>
                    <span className="text-[11px] text-orange-700">Nguy cơ hỏng tăng mạnh do quá hạn</span>
                  </div>
                </Card>

                <Card className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-black text-xl font-mono shrink-0">
                    {predictiveAlerts.healthDropCount || 0}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">Sức khỏe sụt giảm &gt; 10đ</span>
                    <span className="text-[11px] text-amber-700">Khấu hao kỹ thuật nhanh nếu không bảo dưỡng</span>
                  </div>
                </Card>
              </div>
            )}

            {/* Top 10 Degrading Assets Table (Phase 4) */}
            {topDegrading.length > 0 && (
              <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3 mt-4 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Top 10 Thiết Bị Có Nguy Cơ Xấu Đi Nhanh Nhất (Top Degrading Assets)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mô phỏng What-If trong 30 ngày không bảo trì (Xếp hạng theo độ tăng điểm ưu tiên $\Delta$ Priority)
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                    30 ngày không bảo trì
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] bg-slate-50/70">
                        <th className="p-2.5">Hạng</th>
                        <th className="p-2.5">Mã & Tên Thiết Bị</th>
                        <th className="p-2.5">Vị Trí</th>
                        <th className="p-2.5 text-center">Sức Khỏe Hiện Tại ➔ Dự Kiến</th>
                        <th className="p-2.5 text-center">Failure Risk Hiện Tại ➔ Dự Kiến</th>
                        <th className="p-2.5 text-center">Priority Hiện Tại ➔ Dự Kiến</th>
                        <th className="p-2.5 text-center">Khuyến Nghị</th>
                        <th className="p-2.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topDegrading.map((dev, idx) => (
                        <tr key={dev.deviceId || idx} className="hover:bg-slate-50">
                          <td className="p-2.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0 ? 'bg-rose-600 text-white' : idx < 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="p-2.5 font-semibold text-slate-900">
                            <span className="block truncate max-w-[170px]">{dev.deviceName}</span>
                            <span className="font-mono text-[10px] text-slate-400">{dev.deviceCode}</span>
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px] truncate max-w-[120px]">
                            {dev.roomName} ({dev.buildingName})
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            <span className="text-slate-600">{dev.currentHealth}đ</span>
                            <span className="mx-1 text-slate-300">➔</span>
                            <span className={dev.projectedHealth < 60 ? 'text-rose-600' : 'text-amber-600'}>
                              {dev.projectedHealth}đ
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-bold">
                            <span className="text-slate-600">{dev.currentRisk}%</span>
                            <span className="mx-1 text-slate-300">➔</span>
                            <span className={dev.projectedRisk >= 60 ? 'text-rose-600' : 'text-orange-600'}>
                              {dev.projectedRisk}%
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-black">
                            <span className="text-purple-700">{dev.currentPriority}đ</span>
                            <span className="mx-1 text-slate-300">➔</span>
                            <span className={`px-2 py-0.5 rounded ${
                              dev.projectedPriority >= 80 ? 'bg-rose-100 text-rose-800' :
                              dev.projectedPriority >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {dev.projectedPriority}đ (+{dev.priorityDelta})
                            </span>
                          </td>
                          <td className="p-2.5 text-center text-[11px] font-bold">
                            <span className={dev.priorityDelta >= 15 ? 'text-rose-700' : 'text-amber-700'}>
                              {dev.recommendation}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => navigate(`/devices/${dev.deviceId}`)}
                            >
                              Mô Phỏng
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>

          {/* Row 5: SLA Management & Compliance Analytics (MODULE 13) */}
          {slaData && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-600" />
                    Quản Lý Cam Kết Mức Độ Dịch Vụ (SLA Management & Compliance)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quy chuẩn SLA: LOW = 72h | MEDIUM = 24h | HIGH = 8h | URGENT = 4h
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Tỷ lệ tuân thủ toàn trường:</span>
                    <span className="ml-1.5 text-base font-black text-emerald-700 font-mono">
                      {stats?.slaComplianceRate || 100}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 SLA Priority Standard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {slaData.byPriority.map((item) => {
                  const prioConf = PRIORITY_CONFIG[item.priority] || { label: item.priority, bg: 'bg-slate-100' };

                  return (
                    <Card key={item.priority} className="p-4 bg-white border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${prioConf.bg}`}>
                          {prioConf.label} ({item.slaHours}h)
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {item.totalTickets} phiếu
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Tuân thủ SLA:</span>
                          <span className="font-bold text-emerald-700 font-mono">{item.complianceRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${item.complianceRate >= 90 ? 'bg-emerald-500' : item.complianceRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, item.complianceRate)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Đúng hạn:</span>
                          <span className="font-bold font-mono text-emerald-700">{item.onTimeTickets} phiếu</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Quá hạn:</span>
                          <span className="font-bold font-mono text-rose-600">{item.currentlyOverdueTickets + item.overdueCompletedTickets} phiếu</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Technician SLA Leaderboard Table */}
              <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Đánh Giá Tuân Thủ SLA Theo Kỹ Thuật Viên
                  </h4>
                  <span className="text-[11px] text-slate-400">Hiệu suất và thời gian giải quyết thực tế</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <th className="py-2">Kỹ Thuật Viên</th>
                        <th className="py-2 text-center">Tổng Phiếu Được Giao</th>
                        <th className="py-2 text-center">Đã Xử Lý Xong</th>
                        <th className="py-2 text-center">Đúng Hạn SLA</th>
                        <th className="py-2 text-center">Đang Quá Hạn</th>
                        <th className="py-2 text-center">TG Xử Lý TB</th>
                        <th className="py-2 text-right">Tỷ Lệ Tuân Thủ SLA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {slaData.byTechnician.map((tech) => (
                        <tr key={tech.technicianId} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-800">
                            {tech.technicianName}
                            <span className="text-slate-400 font-normal block text-[11px]">@{tech.technicianUsername}</span>
                          </td>
                          <td className="py-2.5 text-center font-mono font-semibold">{tech.totalAssignedTickets}</td>
                          <td className="py-2.5 text-center font-mono text-emerald-700 font-semibold">{tech.completedTickets}</td>
                          <td className="py-2.5 text-center font-mono text-emerald-700 font-bold">{tech.onTimeTickets}</td>
                          <td className="py-2.5 text-center font-mono text-rose-600 font-bold">{tech.currentlyOverdueTickets}</td>
                          <td className="py-2.5 text-center font-mono text-slate-600">{tech.avgResolutionHours}h</td>
                          <td className="py-2.5 text-right font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              tech.complianceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : tech.complianceRate >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {tech.complianceRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
