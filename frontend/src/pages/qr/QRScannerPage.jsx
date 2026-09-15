import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { 
  QrCode, Camera, CameraOff, ArrowRight, ShieldAlert, 
  HelpCircle, RefreshCw, Smartphone, Keyboard, AlertTriangle
} from 'lucide-react';

export const QRScannerPage = () => {
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';

  // Lấy danh sách camera khả dụng
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Thiết bị hoặc trình duyệt không hỗ trợ camera.');
      return;
    }

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Ưu tiên camera sau (back/environment camera) nếu có
          const backCamera = devices.find(
            (c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('sau') || c.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setCameraError('Thiết bị hoặc trình duyệt không hỗ trợ camera.');
        }
      })
      .catch((err) => {
        console.warn('Lỗi lấy danh sách camera:', err);
        setCameraError('Bạn cần cấp quyền camera để quét mã QR.');
      });

    return () => {
      stopScanning();
    };
  }, []);

  const handleScanSuccess = (decodedText) => {
    stopScanning();

    if (!decodedText || typeof decodedText !== 'string') {
      setError('Mã QR không hợp lệ.');
      return;
    }

    // Phân tích decodedText: Nếu là URL (VD: http://localhost:5173/device/UNI-QR-2026-0001)
    let token = decodedText.trim();
    if (token.includes('/device/')) {
      const parts = token.split('/device/');
      token = parts[parts.length - 1].split('?')[0];
    }

    if (token) {
      navigate(`/device/${token}`);
    } else {
      setError('Mã QR không hợp lệ.');
    }
  };

  const startScanning = async () => {
    setError('');
    setCameraError('');

    if (!navigator.onLine) {
      setError('Không thể kết nối máy chủ. Bạn đang ngoại tuyến.');
      return;
    }

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      // Tối ưu hóa kích thước vùng quét QR (chiếm 70% min edge của viewfinder)
      const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxEdge = Math.floor(minEdge * 0.70);
        return {
          width: Math.max(qrboxEdge, 220),
          height: Math.max(qrboxEdge, 220),
        };
      };

      const config = {
        fps: 15,
        qrbox: qrboxFunction,
        disableFlip: false,
      };

      const cameraIdOrConfig = selectedCameraId 
        ? { deviceId: { exact: selectedCameraId } } 
        : { facingMode: 'environment' };

      await html5QrCodeRef.current.start(
        cameraIdOrConfig,
        config,
        handleScanSuccess,
        (errorMessage) => {
          // Bỏ qua log nhận diện khung hình bình thường
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Lỗi khởi động camera scanner:', err);
      if (err?.name === 'NotAllowedError' || String(err).includes('Permission')) {
        setCameraError('Bạn cần cấp quyền camera để quét mã QR.');
      } else {
        setCameraError('Thiết bị hoặc trình duyệt không hỗ trợ camera.');
      }
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Lỗi khi dừng scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setError('Vui lòng nhập mã QR Token hoặc mã thiết bị');
      return;
    }

    let token = manualToken.trim();
    if (token.includes('/device/')) {
      const parts = token.split('/device/');
      token = parts[parts.length - 1];
    }

    navigate(`/device/${token}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* QR Video Viewport CSS Overrides */}
      <style>{`
        #qr-reader-container {
          width: 100% !important;
          height: 100% !important;
          min-height: 360px !important;
          position: relative !important;
          border: none !important;
          padding: 0 !important;
          background: transparent !important;
          overflow: hidden !important;
          border-radius: 1rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        #qr-reader-container video {
          width: 100% !important;
          height: 100% !important;
          min-height: 360px !important;
          max-height: 520px !important;
          object-fit: cover !important;
          border-radius: 1rem !important;
          display: block !important;
        }
        #qr-reader-container canvas {
          display: none !important;
        }
        #qr-shaded-region {
          border-radius: 1rem !important;
        }
      `}</style>

      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2.5">
          <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600" />
          Quét Mã QR Code Thiết Bị
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Hướng Camera vào tem mã QR dán trên thân máy để tra cứu thông tin và báo hỏng tức thì
        </p>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {cameraError && (
        <Alert type="warning" onClose={() => setCameraError('')}>
          {cameraError}
        </Alert>
      )}

      {/* Camera Viewport Card - Tối ưu khung rộng toàn diện */}
      <Card className="p-4 sm:p-6 bg-white shadow-md border border-slate-200 text-center rounded-2xl overflow-hidden">
        {/* Scanner Container - Mở rộng chiều cao và chiều rộng tối đa */}
        <div className="relative rounded-2xl bg-slate-950 overflow-hidden w-full h-[380px] sm:h-[460px] md:h-[500px] flex items-center justify-center shadow-inner">
          <div 
            id={scannerContainerId} 
            className="w-full h-full min-h-[360px] overflow-hidden"
          />

          {!isScanning && (
            <div className="p-8 sm:p-12 text-center space-y-4 z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 text-brand-400 flex items-center justify-center mx-auto shadow-inner border border-slate-700/50">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white">Camera Đang Tắt</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Bấm nút bên dưới để bật Camera và quét trực tiếp tem mã QR dán trên thân thiết bị trường UTT.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={startScanning}
                icon={Camera}
                className="shadow-xl shadow-brand-600/30 font-bold px-6 py-2.5 text-sm"
              >
                Bật Camera Quét Mã
              </Button>
            </div>
          )}

          {/* Controls khi đang quét */}
          {isScanning && (
            <>
              {/* Nút Tắt Camera nổi ở góc trên bên phải */}
              <div className="absolute top-3.5 right-3.5 z-20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={stopScanning}
                  icon={CameraOff}
                  className="bg-slate-900/85 hover:bg-slate-900 text-white border-slate-700/80 backdrop-blur-md shadow-lg text-xs font-semibold px-3 py-1.5"
                >
                  Tắt Camera
                </Button>
              </div>

              {/* Hướng dẫn căn chỉnh ở cạnh dưới */}
              <div className="absolute bottom-3.5 inset-x-4 sm:inset-x-8 z-20 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur-md text-white text-xs py-2 px-4 rounded-xl border border-slate-700/60 shadow-lg text-center flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-medium">Căn chỉnh mã QR vào giữa vùng quét trên màn hình</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Camera Switcher (chọn ống kính khi thiết bị có nhiều camera) */}
        {cameras.length > 1 && (
          <div className="pt-3.5 text-left">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
              Chọn ống kính camera ({cameras.length} ống kính):
            </label>
            <select
              value={selectedCameraId}
              onChange={(e) => {
                setSelectedCameraId(e.target.value);
                if (isScanning) {
                  stopScanning().then(() => startScanning());
                }
              }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${cameras.indexOf(c) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* Manual Input Fallback */}
      <Card className="p-4 sm:p-5 bg-white shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Keyboard className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Hoặc Nhập Mã Token / Mã Thiết Bị Thủ Công
          </h3>
        </div>

        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="VD: UNI-QR-2026-0001 hoặc DEV-2026-0001..."
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-mono placeholder:font-sans focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <Button type="submit" variant="primary" icon={ArrowRight} size="md" className="font-bold sm:w-auto w-full justify-center">
            Tra Cứu
          </Button>
        </form>
      </Card>

      {/* Quick Demo Scan Shortcuts */}
      <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
        <span className="font-bold text-slate-700 block flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-brand-600" />
          Mẹo Thử Nghiệm Nhanh (Demo Tokens):
        </span>
        <div className="flex flex-wrap gap-2 pt-0.5">
          {['UNI-QR-2026-0001', 'UNI-QR-2026-0004', 'UNI-QR-2026-0007', 'UNI-QR-2026-0021'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => navigate(`/device/${t}`)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-mono text-[11px] font-semibold text-brand-700 hover:bg-brand-50 hover:border-brand-300 transition-all shadow-2xs"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
