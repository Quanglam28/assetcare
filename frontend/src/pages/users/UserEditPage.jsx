import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Edit3, ArrowLeft, User, Mail, Phone, Shield, Building2, 
  Image, CheckCircle, AlertTriangle, KeyRound 
} from 'lucide-react';
import { ResetPasswordModal } from '../../components/users/ResetPasswordModal';

export const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    roleId: '',
    departmentId: '',
    status: 'ACTIVE',
    avatarUrl: '',
  });

  const [targetUser, setTargetUser] = useState(null);
  const [masterData, setMasterData] = useState({ roles: [], departments: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const isSelf = Number(id) === Number(currentUser?.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, masterRes] = await Promise.all([
          userService.getUserById(id),
          userService.getMasterData(),
        ]);

        if (userRes?.success && userRes?.data) {
          const u = userRes.data;
          setTargetUser(u);
          setFormData({
            username: u.username || '',
            email: u.email || '',
            fullName: u.full_name || '',
            phone: u.phone || '',
            roleId: u.role_id || '',
            departmentId: u.department_id || '',
            status: u.status || 'ACTIVE',
            avatarUrl: u.avatar_url || '',
          });
        }

        if (masterRes?.success && masterRes?.data) {
          setMasterData(masterRes.data);
        }
      } catch (err) {
        setError(err?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        roleId: Number(formData.roleId),
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        status: formData.status,
        avatarUrl: formData.avatarUrl.trim() || null,
      };

      const res = await userService.updateUser(id, payload);
      setSuccess(`Cập nhật tài khoản ${res.data?.full_name || formData.username} thành công!`);
      setTimeout(() => {
        navigate('/users');
      }, 1200);
    } catch (err) {
      setError(err?.message || err?.error || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back Button */}
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
            <Edit3 className="w-7 h-7 text-brand-600" />
            Chỉnh Sửa Tài Khoản: {targetUser?.full_name}
          </h1>
        </div>

        <Button
          type="button"
          variant="outline"
          icon={KeyRound}
          onClick={() => setResetModalOpen(true)}
        >
          Đặt Lại Mật Khẩu
        </Button>
      </div>

      {isSelf && (
        <Alert type="warning" className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertTriangle className="w-4 h-4 mr-1.5 inline" />
          <strong>Lưu ý:</strong> Bạn đang chỉnh sửa tài khoản cá nhân của chính mình. Theo quy định bảo mật, bạn không thể tự thay đổi vai trò (Role) hoặc tự khóa tài khoản.
        </Alert>
      )}

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

      {/* Form Card */}
      <Card className="p-6 bg-white shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin tài khoản đăng nhập */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" />
              1. Thông Tin Tài Khoản & Vai Trò
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username (Disabled) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đăng nhập (Username) <span className="text-xs text-slate-400 font-normal">(Cố định)</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    className="block w-full rounded-lg border border-slate-200 bg-slate-100 pl-9 pr-3 py-2 text-sm text-slate-600 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái tài khoản <span className="text-rose-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSelf}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Chưa kích hoạt (INACTIVE)</option>
                  <option value="SUSPENDED">Tạm khóa (SUSPENDED)</option>
                </select>
              </div>

              {/* Vai trò (Role) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vai trò hệ thống (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  disabled={isSelf}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  required
                >
                  {masterData.roles?.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin cá nhân & Đơn vị */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              2. Thông Tin Cá Nhân & Đơn Vị Trực Thuộc
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khoa / Phòng ban trực thuộc
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">-- Toàn trường / Không phân khoa --</option>
                    {masterData.departments?.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ảnh đại diện (URL ảnh)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Image className="h-4 w-4" />
                  </div>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/users')}
              disabled={submitting}
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={CheckCircle}
              className="shadow-md shadow-brand-600/20"
            >
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </Card>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        user={targetUser}
      />
    </div>
  );
};
