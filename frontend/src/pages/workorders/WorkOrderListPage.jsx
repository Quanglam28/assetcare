import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { 
  ClipboardList, Plus, Search, Filter, RefreshCw, 
  CheckCircle2, Clock, AlertTriangle, UserCheck, Eye, Play, CheckSquare, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const STATUS_BADGE = {
  OPEN: { label: 'Chờ xử lý', bg: 'bg-slate-100 text-slate-800 border-slate-200' },
  ASSIGNED: { label: 'Đã phân công', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  WAITING_PARTS: { label: 'Chờ linh kiện', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
  COMPLETED: { label: 'Đã hoàn thành', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
};

const PRIORITY_BADGE = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800 font-semibold',
  HIGH: 'bg-orange-100 text-orange-800 font-bold',
  CRITICAL: 'bg-rose-100 text-rose-800 font-black animate-pulse',
};

export const WorkOrderListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({});

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);

      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/work-orders?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/work-orders/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const listData = await listRes.json();
      const statsData = await statsRes.json();

      setWorkOrders(listData.data || []);
      setStats(statsData.data || {});
    } catch (err) {
      showError('Lỗi tải danh sách lệnh công tác');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/work-orders/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể bắt đầu công việc');
      showSuccess('Đã chuyển trạng thái sang Đang thực hiện');
      loadData();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-brand-600" />
            Lệnh Công Tác Bảo Trì (Maintenance Work Orders)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý vòng đời phiếu lệnh công tác kỹ thuật, điều phối và nghiệm thu chi phí thực tế
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} loading={loading}>
          Làm Mới
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-slate-400 uppercase text-[10px] font-bold block">Tổng số phiếu</span>
          <span className="text-xl font-black font-mono text-slate-900">{stats.totalCount || 0}</span>
        </Card>
        <Card className="p-4 bg-amber-50/50 border border-amber-200">
          <span className="text-amber-700 uppercase text-[10px] font-bold block">Đang xử lý</span>
          <span className="text-xl font-black font-mono text-amber-700">
            {(stats.inProgressCount || 0) + (stats.assignedCount || 0) + (stats.openCount || 0)}
          </span>
        </Card>
        <Card className="p-4 bg-emerald-50/50 border border-emerald-200">
          <span className="text-emerald-700 uppercase text-[10px] font-bold block">Đã hoàn thành</span>
          <span className="text-xl font-black font-mono text-emerald-700">{stats.completedCount || 0}</span>
        </Card>
        <Card className="p-4 bg-blue-50/50 border border-blue-200">
          <span className="text-blue-700 uppercase text-[10px] font-bold block">Chi phí thực tế</span>
          <span className="text-lg font-black font-mono text-blue-700 truncate block">
            {Number(stats.totalActualCost || 0).toLocaleString('vi-VN')} đ
          </span>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <Input
              placeholder="Tìm theo mã, tên thiết bị..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              icon={Search}
            />
          </div>

          <div>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="OPEN">Chờ xử lý (Open)</option>
              <option value="ASSIGNED">Đã phân công (Assigned)</option>
              <option value="IN_PROGRESS">Đang thực hiện (In Progress)</option>
              <option value="WAITING_PARTS">Chờ linh kiện (Waiting Parts)</option>
              <option value="COMPLETED">Đã hoàn thành (Completed)</option>
              <option value="CANCELLED">Đã hủy (Cancelled)</option>
            </Select>
          </div>

          <div>
            <Select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">-- Mức độ ưu tiên --</option>
              <option value="CRITICAL">Khẩn cấp (Critical)</option>
              <option value="HIGH">Cao (High)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="LOW">Thấp (Low)</option>
            </Select>
          </div>

          <div>
            <Button variant="primary" size="sm" icon={Filter} onClick={loadData} className="w-full">
              Lọc Danh Sách
            </Button>
          </div>
        </div>
      </Card>

      {/* Work Orders Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : (
        <Card className="overflow-hidden border border-slate-200 rounded-2xl shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mã Lệnh</th>
                  <th className="p-3.5">Tiêu đề & Thiết bị</th>
                  <th className="p-3.5">Phân loại</th>
                  <th className="p-3.5">Ưu tiên</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5">Kỹ thuật viên</th>
                  <th className="p-3.5">Ngày tạo</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((wo) => {
                  const sBadge = STATUS_BADGE[wo.status] || STATUS_BADGE.OPEN;

                  return (
                    <tr key={wo.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand-700 whitespace-nowrap">
                        {wo.work_order_code}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{wo.title}</span>
                        <span className="text-slate-500 text-[11px] font-medium">
                          {wo.device_name} ({wo.device_code}) • {wo.room_name}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-medium text-slate-600">
                        {wo.type}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${PRIORITY_BADGE[wo.priority] || PRIORITY_BADGE.MEDIUM}`}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${sBadge.bg}`}>
                          {sBadge.label}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {wo.assigned_technician_name ? (
                          <span className="font-medium text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            {wo.assigned_technician_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa phân công</span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono">
                        {new Date(wo.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                        {wo.status === 'ASSIGNED' && (user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
                          <Button size="xs" variant="primary" icon={Play} onClick={() => handleStart(wo.id)}>
                            Bắt đầu
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          icon={Eye}
                          onClick={() => navigate(`/devices/${wo.device_id}`)}
                        >
                          Thiết bị
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {workOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-xs text-slate-400 italic">
                      Không tìm thấy lệnh công tác nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
