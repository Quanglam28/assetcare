import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Navigation Component
 * @param {Array<{ label: string, path?: string }>} items
 */
export const Breadcrumb = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs sm:text-sm text-slate-500 mb-4 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5">
        <li className="flex items-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only">Trang chủ</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1 sm:gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="text-slate-500 hover:text-slate-800 transition-colors font-medium truncate max-w-[150px] sm:max-w-[200px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold truncate max-w-[180px] sm:max-w-[300px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
