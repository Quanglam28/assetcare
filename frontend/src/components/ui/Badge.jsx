import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-brand-50 text-brand-700 border-brand-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-medium',
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
          'inline-flex items-center rounded-full border font-medium leading-none',
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
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-rose-500',
            variant === 'info' && 'bg-sky-500',
            variant === 'primary' && 'bg-brand-500',
            variant === 'default' && 'bg-slate-400'
          )}
        />
      )}
      {children}
    </span>
  );
};
