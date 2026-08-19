import React from 'react';
import { clsx } from 'clsx';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-brand-500 border-t-transparent',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    />
  );
};
