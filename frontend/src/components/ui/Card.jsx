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
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200',
          hoverable && 'hover:shadow-md hover:border-slate-300',
          className
        )
      )}
      {...props}
    >
      {(title || action) && (
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100/90 flex items-center justify-between gap-3">
          <div>
            {title && <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
      {footer && <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-600">{footer}</div>}
    </div>
  );
};

export default Card;

