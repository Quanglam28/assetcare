import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-sky-50 text-sky-700',
  purple: 'bg-violet-50 text-violet-700',
  // Status-specific
  active: 'bg-emerald-50 text-emerald-700',
  maintenance: 'bg-amber-50 text-amber-800',
  broken: 'bg-red-50 text-red-700',
  retired: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-50 text-amber-800',
  assigned: 'bg-sky-50 text-sky-700',
  'in-progress': 'bg-blue-50 text-blue-700',
  'waiting-part': 'bg-orange-50 text-orange-800',
  completed: 'bg-indigo-50 text-indigo-700',
  closed: 'bg-emerald-50 text-emerald-700',
  reopened: 'bg-rose-50 text-rose-700',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px] font-medium',
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-xs font-medium',
};

const dotColors = {
  default: 'bg-slate-400',
  primary: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  purple: 'bg-violet-500',
  active: 'bg-emerald-500',
  maintenance: 'bg-amber-500',
  broken: 'bg-red-500',
  retired: 'bg-slate-400',
  pending: 'bg-amber-500',
  assigned: 'bg-sky-500',
  'in-progress': 'bg-blue-500',
  'waiting-part': 'bg-orange-500',
  completed: 'bg-indigo-500',
  closed: 'bg-emerald-500',
  reopened: 'bg-rose-500',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  dot = false,
  ...props
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-md border border-transparent font-medium leading-none',
          variants[variant] || variants.default,
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5 shrink-0', dotColors[variant] || dotColors.default)} />
      )}
      {children}
    </span>
  );
};

export default Badge;