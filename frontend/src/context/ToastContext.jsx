import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message, title = 'Thành công') => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((message, title = 'Lỗi') => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const warning = useCallback((message, title = 'Cảnh báo') => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const info = useCallback((message, title = 'Thông báo') => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      {/* Toast Floating Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${
                isSuccess
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                  : isError
                  ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                  : isWarning
                  ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                  : 'bg-sky-50/95 border-sky-200 text-sky-900'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-600" />}
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && <h4 className="text-sm font-semibold mb-0.5">{toast.title}</h4>}
                <p className="text-xs sm:text-sm font-normal opacity-90 leading-relaxed break-words">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
};

export default ToastContext;
