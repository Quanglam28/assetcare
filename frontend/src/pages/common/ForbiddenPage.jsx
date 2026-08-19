import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Home } from 'lucide-react';

export const ForbiddenPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-9 h-9" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">403 - Không Có Quyền Truy Cập</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Tài khoản hiện tại của bạn không có đủ thẩm quyền để xem hoặc thực hiện thao tác trên trang này theo quy định phân quyền.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Quay Lại Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
