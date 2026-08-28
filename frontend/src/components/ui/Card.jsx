import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  footer,
  hoverable = false,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded border border-slate-200 shadow-panel',
          hoverable && 'hover:shadow-panel-hover hover:border-slate-300 transition-shadow',
          className
        )
      )}
      {...props}
    >
      {(title || action) && (
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 min-h-[44px]">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-slate-800 truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {padding ? <div className="p-4">{children}</div> : children}
      {footer && <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">{footer}</div>}
    </div>
  );
};

export default Card;