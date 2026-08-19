import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { 
  UserPlus, ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, 
  Shield, Building2, Image, CheckCircle, Info
} from 'lucide-react';

export const UserCreatePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: 'password123',
    fullName: '',
    phone: '',
    roleId: '',
    departmentId: '',
    status: 'ACTIVE',
    avatarUrl: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [masterData, setMasterData] = useState({ roles: [], departments: [] });
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoadingData(true);
        const res = await userService.getMasterData();
        if (res?.success && res?.data) {
          setMasterData(res.data);
          // Gán mặc định role là USER nếu có
          const userRole = res.data.roles?.find(r => r.code === 'USER');
          if (userRole) {
            setFormData(prev => ({ ...prev, roleId: userRole.id }));
          }
        }
      } catch (err) {
        setError(err?.message || 'Không thể nạp danh mục vai trò & phòng ban');
      } finally {
        setLoadingData(false);
      }
    };

    fetchMasterData();
  }, []);

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

    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (!formData.roleId) {
      setError('Vui lòng chọn vai trò cho tài khoản');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim() || null,
        roleId: Number(formData.roleId),
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        status: formData.status,
        avatarUrl: formData.avatarUrl.trim() || null,
      };

      const res = await userService.createUser(payload);
      setSuccess(`Tạo tài khoản ${res.data?.full_name || formData.username} thành công!`);
      setTimeout(() => {
        navigate('/users');
      }, 1200);
    } catch (err) {
      setError(err?.message || err?.error || 'Tạo người dùng thất bại. Vui lòng kiểm tra lại thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between">
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
            <UserPlus className="w-7 h-7 text-brand-600" />
            Tạo Tài Khoản Người Dùng Mới
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

      {/* Form Card */}
      <Card className="p-6 bg-white shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin tài khoản đăng nhập */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600" />
              1. Thông Tin Đăng Nhập & Phân Quyền
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="VD: user_nam, giangvien_an..."
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Vai trò (Role) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vai trò hệ thống (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  required
                >
                  <option value="">-- Chọn vai trò --</option>
                  {masterData.roles?.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
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
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Chưa kích hoạt (INACTIVE)</option>
                  <option value="SUSPENDED">Tạm khóa (SUSPENDED)</option>
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
                  placeholder="VD: TS. Nguyễn Văn A..."
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
                    placeholder="email@university.edu.vn"
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
                    placeholder="0901234567"
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
                    placeholder="https://example.com/avatar.jpg"
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
              Tạo Người Dùng
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
