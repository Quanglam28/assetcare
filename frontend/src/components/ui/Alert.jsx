import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

const types = {
  info: {
    bg: 'bg-sky-50 border-sky-200 text-sky-800',
    icon: Info,
    iconColor: 'text-sky-500',
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-800',
    icon: AlertCircle,
    iconColor: 'text-rose-500',
  },
};

export const Alert = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const current = types[type] || types.info;
  const IconComponent = current.icon;

  return (
    <div
      className={clsx(
        'rounded-xl border p-4 flex items-start gap-3 text-sm transition-all',
        current.bg,
        className
      )}
    >
      <IconComponent className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', current.iconColor)} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors -mr-1 -mt-1 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
