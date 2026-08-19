import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user_info');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);

  /**
   * Khởi tạo và kiểm tra tính hợp lệ của token khi nạp ứng dụng
   */
  const initAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      try {
        const res = await authService.getMe();
        if (res?.success && res?.data) {
          setUser(res.data);
          localStorage.setItem('user_info', JSON.stringify(res.data));
        } else {
          // Token không còn hợp lệ
          logout();
        }
      } catch {
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  /**
   * Đăng nhập (hỗ trợ username hoặc email)
   */
  const login = async (usernameOrEmail, password) => {
    const res = await authService.login(usernameOrEmail, password);
    if (res?.success && res?.data) {
      const { token: accessToken, user: userInfo } = res.data;
      setToken(accessToken);
      setUser(userInfo);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      return userInfo;
    }
    throw new Error(res?.message || 'Đăng nhập không thành công');
  };

  /**
   * Đăng ký tài khoản mới kèm Auto-Login
   */
  const register = async (registerData) => {
    const res = await authService.register(registerData);
    if (res?.success && res?.data) {
      const { token: accessToken, user: userInfo } = res.data;
      setToken(accessToken);
      setUser(userInfo);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      return userInfo;
    }
    throw new Error(res?.message || 'Đăng ký không thành công');
  };

  /**
   * Đăng xuất
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Bỏ qua lỗi network khi logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
    }
  };

  /**
   * Đổi mật khẩu
   */
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    const res = await authService.changePassword(oldPassword, newPassword, confirmPassword);
    return res;
  };

  /**
   * Cập nhật lại thông tin user trong Context
   */
  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res?.success && res?.data) {
        setUser(res.data);
        localStorage.setItem('user_info', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Lỗi khi tải lại thông tin user:', err);
    }
  };

  // Helper flags kiểm tra vai trò
  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const isTechnician = user?.role === ROLES.TECHNICIAN;
  const isUser = user?.role === ROLES.USER;

  /**
   * Kiểm tra người dùng có quyền trong danh sách role hay không
   */
  const hasRole = (...allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin,
    isManager,
    isTechnician,
    isUser,
    hasRole,
    login,
    register,
    logout,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
