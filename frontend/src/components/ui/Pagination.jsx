import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (total === 0) return null;

  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  // Tính toán dãy số trang hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      pages.push(i);
    }

    if (page - delta > 2) {
      pages.unshift('...');
    }
    if (page + delta < totalPages - 1) {
      pages.push('...');
    }

    pages.unshift(1);
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-white rounded-b-xl ${className}`}>
      {/* Hiển thị số lượng */}
      <div className="text-xs text-slate-500">
        Hiển thị <span className="font-semibold text-slate-700">{start}</span> -{' '}
        <span className="font-semibold text-slate-700">{end}</span> trong tổng số{' '}
        <span className="font-semibold text-slate-700">{total}</span> kết quả
      </div>

      {/* Điều hướng trang */}
      <div className="flex items-center gap-1">
        {/* Nút Trước */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Các số trang */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-slate-400">
                ...
              </span>
            );
          }

          const isActive = p === page;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Nút Tiếp */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang tiếp"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
