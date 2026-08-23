import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-slate-100/80 text-slate-700 border-slate-200/80',
  primary: 'bg-brand-50 text-brand-700 border-brand-200/80',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  info: 'bg-sky-50 text-sky-700 border-sky-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
};

const sizes = {
  xs: 'px-2 py-0.5 text-[10px] font-semibold',
  sm: 'px-2.5 py-0.5 text-xs font-semibold',
  md: 'px-3 py-1 text-xs font-semibold',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full border leading-none tracking-tight transition-colors',
          variants[variant] || variants.default,
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full mr-1.5 shrink-0',
            variant === 'success' && 'bg-emerald-500 ring-2 ring-emerald-200',
            variant === 'warning' && 'bg-amber-500 ring-2 ring-amber-200',
            variant === 'danger' && 'bg-rose-500 ring-2 ring-rose-200',
            variant === 'info' && 'bg-sky-500 ring-2 ring-sky-200',
            variant === 'primary' && 'bg-brand-500 ring-2 ring-brand-200',
            variant === 'purple' && 'bg-purple-500 ring-2 ring-purple-200',
            variant === 'default' && 'bg-slate-400'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;

