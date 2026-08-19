import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { 
  User, ArrowLeft, Edit2, KeyRound, Lock, Unlock, Shield, 
  Building2, Phone, Mail, Calendar, CheckCircle2, Clock, Wrench, FileText
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import { ResetPasswordModal } from '../../components/users/ResetPasswordModal';

export const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getUserById(id);
      if (res?.success && res?.data) {
        setUser(res.data);
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải thông tin chi tiết người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const isSelf = Number(id) === Number(currentUser?.id);
  const isSuspended = user?.status === 'SUSPENDED';

  const handleToggleStatus = async () => {
    if (isSelf) {
      setError('Bạn không thể tự khóa tài khoản của chính mình');
      return;
    }

    const nextStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
    const actionName = nextStatus === 'SUSPENDED' ? 'khóa' : 'mở khóa';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản "${user.full_name}"?`)) {
      return;
    }

    try {
      setToggling(true);
      setError('');
      await userService.updateStatus(user.id, nextStatus);
      setSuccess(`Đã ${actionName} tài khoản thành công!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUser();
    } catch (err) {
      setError(err?.message || err?.error || `Không thể ${actionName} tài khoản`);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy người dùng</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/users')} className="mt-3">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Quay lại danh sách người dùng
          </button>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <User className="w-7 h-7 text-brand-600" />
            Hồ Sơ Tài Khoản: {user.full_name}
          </h1>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={KeyRound}
              onClick={() => setResetModalOpen(true)}
            >
              Reset Mật Khẩu
            </Button>

            {!isSelf && (
              <Button
                variant={isSuspended ? 'success' : 'danger'}
                icon={isSuspended ? Unlock : Lock}
                loading={toggling}
                onClick={handleToggleStatus}
              >
                {isSuspended ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản'}
              </Button>
            )}

            <Button
              variant="primary"
              icon={Edit2}
              onClick={() => navigate(`/users/${user.id}/edit`)}
            >
              Chỉnh Sửa
            </Button>
          </div>
        )}
      </div>

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

      {/* Main Profile Info Card */}
      <Card className="p-6 bg-white shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}
            alt={user.full_name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
              <Badge variant={ROLE_COLORS[user.role_code] || 'secondary'}>
                {ROLE_LABELS[user.role_code] || user.role_code}
              </Badge>
              <Badge variant={STATUS_COLORS[user.status] || 'secondary'}>
                {STATUS_LABELS[user.status] || user.status}
              </Badge>
            </div>

            <p className="text-sm font-mono text-slate-500">@{user.username}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user.phone}
                </span>
              )}
              {user.department_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {user.department_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detail Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Mã định danh ID:</span>
            <span className="font-mono font-bold text-slate-800 text-sm">#{user.id}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Ngày tạo tài khoản:</span>
            <span className="font-medium text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {user.created_at ? new Date(user.created_at).toLocaleString('vi-VN') : '---'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Cập nhật lần cuối:</span>
            <span className="font-medium text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {user.updated_at ? new Date(user.updated_at).toLocaleString('vi-VN') : '---'}
            </span>
          </div>
        </div>
      </Card>

      {/* Activity / Statistics Section */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600" />
          Thống Kê Hoạt Động & Phiếu Sự Cố
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Phiếu đã gửi</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {user.stats?.totalReportedRequests || 0}
            </p>
            <span className="text-[10px] text-slate-400">Yêu cầu bảo trì tạo bởi user</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Phiếu được giao</span>
              <Wrench className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {user.stats?.totalAssignedRequests || 0}
            </p>
            <span className="text-[10px] text-slate-400">Được chỉ định xử lý (KTV)</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Đang xử lý</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {user.stats?.activeAssignedRequests || 0}
            </p>
            <span className="text-[10px] text-slate-400">Chưa hoàn thành</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Đã hoàn tất</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {user.stats?.totalCompletedRequests || 0}
            </p>
            <span className="text-[10px] text-slate-400">Đã sửa chữa xong</span>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        user={user}
        onSuccess={fetchUser}
      />
    </div>
  );
};
