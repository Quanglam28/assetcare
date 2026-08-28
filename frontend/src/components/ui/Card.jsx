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
          'bg-white rounded-lg border border-slate-200 shadow-panel overflow-hidden transition-all duration-150',
          hoverable && 'hover:shadow-panel-hover hover:border-slate-300',
          className
        )
      )}
      {...props}
    >
      {(title || action) && (
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 min-h-[52px]">
          <div className="min-w-0">
            {title && <h3 className="font-semibold text-slate-900 text-sm tracking-tight truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {padding ? <div className="p-5">{children}</div> : children}
      {footer && <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500">{footer}</div>}
    </div>
  );
};

export default Card;