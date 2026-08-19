import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

/**
 * ErrorState Component
 */
export const ErrorState = ({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-rose-50/50 rounded-2xl border border-rose-100 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-rose-100/80 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-700/80 max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 bg-white hover:bg-rose-50 border-rose-200 text-rose-700">
          <RotateCcw className="w-4 h-4" />
          Thử lại
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
