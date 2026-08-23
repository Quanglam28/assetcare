import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
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
import { ResetPasswordModal } from '../../components/users/ResetPasswordModal';
import { 
  Users, UserPlus, Search, Filter, RotateCcw, Eye, Edit2, 
  Lock, Unlock, KeyRound, Shield, Building2, Phone, Mail, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

export const UserListPage = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getUsers({
        page,
        limit,
        search,
        role: roleFilter,
        status: statusFilter,
      });

      if (res?.success) {
        setUsers(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total || 0);
          setTotalPages(res.meta.totalPages || 1);
        }
      }
    } catch (err) {
      setError(err?.message || err?.error || 'Không thể tải danh sách người dùng');
      toast.error(err?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  // Khóa / Mở khóa trạng thái người dùng
  const handleConfirmToggleStatus = async () => {
    if (!userToToggle) return;
    if (userToToggle.id === currentUser?.id) {
      toast.warning('Bạn không thể tự khóa tài khoản của chính mình');
      setUserToToggle(null);
      return;
    }

    const nextStatus = userToToggle.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionName = nextStatus === 'SUSPENDED' ? 'khóa' : 'mở khóa';

    try {
      setToggling(true);
      await userService.updateStatus(userToToggle.id, nextStatus);
      toast.success(`Đã ${actionName} tài khoản "${userToToggle.full_name}" thành công!`);
      setUserToToggle(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || err?.error || `Không thể ${actionName} tài khoản`);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Hệ thống' },
          { label: 'Tài khoản người dùng' },
        ]}
      />

      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-600" />
            Tài Khoản Người Dùng & Phân Quyền
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị danh sách tài khoản, phân quyền vai trò (RBAC) và theo dõi trạng thái hoạt động
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => navigate('/users/create')}
            className="shadow-md shadow-brand-600/20"
          >
            Thêm Người Dùng Mới
          </Button>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="p-4 bg-white shadow-sm border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo họ tên, username, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">-- Tất cả vai trò --</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
              <option value="MANAGER">Quản lý tài sản (MANAGER)</option>
              <option value="TECHNICIAN">Kỹ thuật viên (TECHNICIAN)</option>
              <option value="USER">Người dùng / GV (USER)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="INACTIVE">Chưa kích hoạt</option>
              <option value="SUSPENDED">Đang bị khóa (SUSPENDED)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 flex items-center gap-2">
            <Button type="submit" variant="primary" size="md" className="flex-1">
              Tìm kiếm
            </Button>
            {(search || roleFilter || statusFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-100 transition-colors"
                title="Xóa bộ lọc"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={5} cols={6} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Không tìm thấy người dùng nào"
            description="Không có tài khoản nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại."
            actionText={search || roleFilter || statusFilter ? 'Xóa bộ lọc tìm kiếm' : undefined}
            onAction={handleResetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Họ và Tên / Tài khoản</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Số Điện Thoại</th>
                  <th className="py-3.5 px-4">Vai Trò</th>
                  <th className="py-3.5 px-4">Khoa / Phòng Ban</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const roleStyle = ROLE_COLORS[u.role_code] || 'bg-slate-100 text-slate-700';
                  const statusStyle = STATUS_COLORS[u.status] || 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'}
                            alt={u.full_name}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-500/20"
                          />
                          <div>
                            <span
                              onClick={() => navigate(`/users/${u.id}`)}
                              className="font-semibold text-slate-900 hover:text-brand-600 cursor-pointer block leading-tight"
                            >
                              {u.full_name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {u.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{u.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-sans">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <Badge className={`${roleStyle} text-[11px] font-bold px-2 py-0.5 border`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {ROLE_LABELS[u.role_code] || u.role_code}
                        </Badge>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {u.department_name ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.department_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Toàn trường / Chưa gán</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge className={`${statusStyle} text-[11px] font-semibold px-2 py-0.5 border`}>
                          {u.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {u.status === 'SUSPENDED' && <XCircle className="w-3 h-3 mr-1" />}
                          {STATUS_LABELS[u.status] || u.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail */}
                          <button
                            type="button"
                            onClick={() => navigate(`/users/${u.id}`)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit (Admin only) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => navigate(`/users/${u.id}/edit`)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reset Password (Admin only) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setSelectedUserForReset(u)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Đặt lại mật khẩu"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}

                          {/* Lock / Unlock Toggle (Admin only, cannot toggle self) */}
                          {isAdmin && u.id !== currentUser?.id && (
                            <button
                              type="button"
                              onClick={() => setUserToToggle(u)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.status === 'ACTIVE'
                                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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

        {/* Pagination Footer */}
        {!loading && users.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Modal Đặt lại mật khẩu */}
      <ResetPasswordModal
        isOpen={!!selectedUserForReset}
        onClose={() => setSelectedUserForReset(null)}
        user={selectedUserForReset}
        onSuccess={() => {
          setSelectedUserForReset(null);
          toast.success('Mật khẩu người dùng đã được đặt lại thành công!');
        }}
      />

      {/* Confirm Dialog Khóa / Mở khóa */}
      <ConfirmDialog
        isOpen={!!userToToggle}
        onClose={() => setUserToToggle(null)}
        onConfirm={handleConfirmToggleStatus}
        title={userToToggle?.status === 'ACTIVE' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
        message={`Bạn có chắc chắn muốn ${userToToggle?.status === 'ACTIVE' ? 'khóa quyền truy cập của' : 'mở khóa cho'} tài khoản "${userToToggle?.full_name}" (@${userToToggle?.username})?`}
        confirmText={userToToggle?.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa ngay'}
        variant={userToToggle?.status === 'ACTIVE' ? 'danger' : 'primary'}
        loading={toggling}
      />
    </div>
  );
};

export default UserListPage;
