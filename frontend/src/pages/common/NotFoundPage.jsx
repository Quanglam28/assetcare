import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-extrabold text-brand-600 tracking-tight">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-800">Không tìm thấy trang yêu cầu</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được di chuyển sang địa chỉ khác trong hệ thống.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Về Trang Chủ Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
