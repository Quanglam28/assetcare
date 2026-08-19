import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      // Ping health check or origin
      const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        setIsOnline(true);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isOnline) return null;

  return (
    <aside 
      aria-label="Cảnh báo kết nối ngoại tuyến"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-2 text-xs shadow-lg flex items-center justify-between transition-all animate-in slide-in-from-top-full duration-300"
    >
      <div className="flex items-center gap-2 max-w-xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" />
          <span className="font-semibold">
            Bạn đang ngoại tuyến. Một số tính năng gửi phiếu cần kết nối mạng.
          </span>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isChecking}
          className="flex items-center gap-1 bg-amber-700/80 hover:bg-amber-800 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all disabled:opacity-50 shrink-0 ml-2"
        >
          <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Đang thử...' : 'Thử lại'}
        </button>
      </div>
    </aside>
  );
};
