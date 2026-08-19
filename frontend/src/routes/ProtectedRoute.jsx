import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { savePendingRedirect } from '../utils/redirectUtil';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-medium text-slate-500 animate-pulse">
          Đang xác thực phiên đăng nhập...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search;
    savePendingRedirect(fullPath);
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(fullPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};
