import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';

/**
 * Route guard bảo vệ truy cập theo vai trò (Role-Based Protected Route)
 */
export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không có quyền trong allowedRoles
  if (!user || (allowedRoles.length > 0 && !hasRole(...allowedRoles))) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
