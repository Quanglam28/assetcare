import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import Button from './Button';

/**
 * EmptyState Component
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại chưa có bản ghi nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-200 ${className}`}>
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
