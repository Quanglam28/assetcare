import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // Check if user dismissed prompt recently (within 7 days)
    const dismissedAt = localStorage.getItem('assetcare_pwa_dismissed');
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 7) return;
    }

    // Detect iOS
    const isIosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not installed, show after 3 seconds
    if (isIosDevice && !isRunningStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('assetcare_pwa_dismissed', Date.now().toString());
    setShowPrompt(false);
    setShowIOSGuide(false);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <aside 
        aria-label="Cài đặt ứng dụng AssetCare"
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 max-w-md z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md bg-slate-900/95"
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-brand-600 rounded-xl text-white shrink-0 shadow-md shadow-brand-600/30">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Cài Đặt Ứng Dụng AssetCare
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Cài đặt lên màn hình chính để mở nhanh, quét mã QR mượt mà và nhận thông báo sự cố tức thì.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Download}
                onClick={handleInstallClick}
                className="text-xs py-1.5 px-3 font-semibold shadow-md shadow-brand-600/20"
              >
                Cài Đặt Ngay
              </Button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[11px] text-slate-400 hover:text-slate-200 font-medium px-2 py-1"
              >
                Để sau
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-slate-900 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">Cài Đặt AssetCare Trên iPhone</h3>
              <p className="text-xs text-slate-500">
                Thực hiện 2 bước đơn giản trên trình duyệt Safari để cài đặt ứng dụng:
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <p className="text-slate-700">
                  Nhấn vào biểu tượng <strong className="inline-flex items-center gap-0.5 text-brand-700"><Share2 className="w-3.5 h-3.5 inline" /> Chia sẻ (Share)</strong> ở thanh công cụ dưới Safari.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <p className="text-slate-700">
                  Cuộn xuống và chọn <strong className="inline-flex items-center gap-0.5 text-brand-700"><PlusSquare className="w-3.5 h-3.5 inline" /> Thêm vào MH chính (Add to Home Screen)</strong>.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleDismiss}
              className="w-full"
            >
              Đã Hiểu
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
