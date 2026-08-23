import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Grid, Filter, RefreshCw, AlertTriangle, ShieldCheck, 
  Activity, ArrowUpRight, Eye, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { masterDataService } from '../../services/masterDataService';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const RiskMatrixPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);

  const [filters, setFilters] = useState({
    departmentId: '',
    locationId: '',
    riskStatus: '',
    priorityStatus: '',
  });

  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    loadMasterData();
    loadMatrixData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [deptRes, locRes] = await Promise.all([
        masterDataService.getDepartments(),
        masterDataService.getLocations(),
      ]);
      setDepartments(deptRes.data?.departments || deptRes.data || []);
      setLocations(locRes.data?.locations || locRes.data || []);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const loadMatrixData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.locationId) params.locationId = filters.locationId;
      if (filters.riskStatus) params.riskStatus = filters.riskStatus;
      if (filters.priorityStatus) params.priorityStatus = filters.priorityStatus;

      const res = await api.get('/analytics/risk-matrix', { params });
      setMatrixData(res.data || res || []);
    } catch (err) {
      showError(err.message || 'Không thể tải dữ liệu ma trận rủi ro');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  const applyFilters = () => {
    loadMatrixData();
  };

  // Phân bổ 4 Quadrants
  const quadrants = {
    critical: matrixData.filter(d => Number(d.health_score) < 60 && Number(d.risk_score) >= 50),
    monitor: matrixData.filter(d => Number(d.health_score) >= 60 && Number(d.risk_score) >= 50),
    maintenance: matrixData.filter(d => Number(d.health_score) < 60 && Number(d.risk_score) < 50),
    healthy: matrixData.filter(d => Number(d.health_score) >= 60 && Number(d.risk_score) < 50),
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Grid className="w-6 h-6 text-brand-600" />
            Ma Trận Rủi Ro Thiết Bị (Risk Matrix Dashboard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Phân bố không gian 4 phân vùng giữa Sức khỏe (Health Score) và Nguy cơ sự cố (Failure Risk)
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadMatrixData} loading={loading}>
          Làm Mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Khoa / Đơn vị</label>
            <Select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            >
              <option value="">-- Tất cả khoa / phòng --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Vị trí / Tòa nhà</label>
            <Select
              value={filters.locationId}
              onChange={(e) => handleFilterChange('locationId', e.target.value)}
            >
              <option value="">-- Tất cả vị trí --</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.room_name} ({l.building_name})</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Mức độ rủi ro (Risk)</label>
            <Select
              value={filters.riskStatus}
              onChange={(e) => handleFilterChange('riskStatus', e.target.value)}
            >
              <option value="">-- Tất cả rủi ro --</option>
              <option value="CRITICAL">Nguy cấp (Critical)</option>
              <option value="HIGH">Cao (High)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="LOW">Thấp (Low)</option>
              <option value="VERY_LOW">Rất thấp (Very Low)</option>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="primary" size="sm" icon={Filter} onClick={applyFilters} className="w-full">
              Lọc Dữ Liệu
            </Button>
          </div>
        </div>
      </Card>

      {/* 4 Quadrants Matrix Layout */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrant 1: CRITICAL (Low Health + High Risk) */}
          <Card className="p-5 border-2 border-rose-200 bg-rose-50/30 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
                <h3 className="font-bold text-rose-900 text-sm">
                  1. NGUY CẤP (CRITICAL) — {quadrants.critical.length} Thiết bị
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                Health Thấp & Risk Cao
              </span>
            </div>
            <p className="text-xs text-rose-800 my-2">
              Thiết bị có nguy cơ hỏng rất cao và đã xuống cấp. Cần can thiệp sửa chữa ngay lập tức!
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {quadrants.critical.map(d => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/devices/${d.id}`)}
                  className="p-3 bg-white border border-rose-200 hover:border-rose-400 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{d.name} ({d.code})</span>
                    <span className="text-slate-500 text-[11px]">{d.room_name} • {d.department_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-600 block">Risk: {Math.round(d.risk_score)}%</span>
                    <span className="text-[10px] text-slate-400">Health: {Math.round(d.health_score)}</span>
                  </div>
                </div>
              ))}
              {quadrants.critical.length === 0 && (
                <div className="text-center py-6 text-xs text-rose-400 italic">Không có thiết bị trong vùng nguy cấp.</div>
              )}
            </div>
          </Card>

          {/* Quadrant 2: MONITOR (High Health + High Risk) */}
          <Card className="p-5 border-2 border-orange-200 bg-orange-50/30 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-orange-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <h3 className="font-bold text-orange-900 text-sm">
                  2. GIÁM SÁT (MONITOR) — {quadrants.monitor.length} Thiết bị
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                Health Cao & Risk Cao
              </span>
            </div>
            <p className="text-xs text-orange-800 my-2">
              Thiết bị còn mới/tốt nhưng xuất hiện sự cố bất thường gần đây. Cần theo dõi sát sao.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {quadrants.monitor.map(d => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/devices/${d.id}`)}
                  className="p-3 bg-white border border-orange-200 hover:border-orange-400 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{d.name} ({d.code})</span>
                    <span className="text-slate-500 text-[11px]">{d.room_name} • {d.department_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-orange-600 block">Risk: {Math.round(d.risk_score)}%</span>
                    <span className="text-[10px] text-slate-400">Health: {Math.round(d.health_score)}</span>
                  </div>
                </div>
              ))}
              {quadrants.monitor.length === 0 && (
                <div className="text-center py-6 text-xs text-orange-400 italic">Không có thiết bị trong vùng giám sát.</div>
              )}
            </div>
          </Card>

          {/* Quadrant 3: MAINTENANCE (Low Health + Low Risk) */}
          <Card className="p-5 border-2 border-amber-200 bg-amber-50/30 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h3 className="font-bold text-amber-900 text-sm">
                  3. BẢO DƯỠNG (MAINTENANCE) — {quadrants.maintenance.length} Thiết bị
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                Health Thấp & Risk Thấp
              </span>
            </div>
            <p className="text-xs text-amber-800 my-2">
              Hao mòn theo thời gian sử dụng nhưng chưa có nguy cơ đột biến. Bảo dưỡng định kỳ.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {quadrants.maintenance.map(d => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/devices/${d.id}`)}
                  className="p-3 bg-white border border-amber-200 hover:border-amber-400 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{d.name} ({d.code})</span>
                    <span className="text-slate-500 text-[11px]">{d.room_name} • {d.department_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-600 block">Health: {Math.round(d.health_score)}</span>
                    <span className="text-[10px] text-slate-400">Risk: {Math.round(d.risk_score)}%</span>
                  </div>
                </div>
              ))}
              {quadrants.maintenance.length === 0 && (
                <div className="text-center py-6 text-xs text-amber-400 italic">Không có thiết bị trong vùng bảo dưỡng.</div>
              )}
            </div>
          </Card>

          {/* Quadrant 4: HEALTHY (High Health + Low Risk) */}
          <Card className="p-5 border-2 border-emerald-200 bg-emerald-50/30 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="font-bold text-emerald-900 text-sm">
                  4. TỐI ƯU (HEALTHY) — {quadrants.healthy.length} Thiết bị
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Health Cao & Risk Thấp
              </span>
            </div>
            <p className="text-xs text-emerald-800 my-2">
              Thiết bị vận hành hoàn hảo, độ tin cậy tối đa, không cần can thiệp đặc biệt.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {quadrants.healthy.map(d => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/devices/${d.id}`)}
                  className="p-3 bg-white border border-emerald-200 hover:border-emerald-400 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{d.name} ({d.code})</span>
                    <span className="text-slate-500 text-[11px]">{d.room_name} • {d.department_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 block">Health: {Math.round(d.health_score)}</span>
                    <span className="text-[10px] text-slate-400">Risk: {Math.round(d.risk_score)}%</span>
                  </div>
                </div>
              ))}
              {quadrants.healthy.length === 0 && (
                <div className="text-center py-6 text-xs text-emerald-400 italic">Không có dữ liệu thiết bị.</div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
