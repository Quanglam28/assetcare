import React, { useRef, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Button } from '../ui/Button';
import { Download, Printer, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import { PrintLabelModal } from './PrintLabelModal';

export const QRCodeCard = ({ device, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const canvasRef = useRef(null);

  if (!device) return null;

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const baseHost = isLocalhost 
    ? `${window.location.protocol}//192.168.42.111:${window.location.port || '5173'}` 
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const qrToken = device.qr_token || device.code || `UNI-QR-2026-${device.id}`;
  const qrValue = `${baseHost}/device/${qrToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `QR_${device.code || device.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      <div className={`p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center ${className}`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-brand-600" />
            Mã QR Định Danh
          </span>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
            {device.code}
          </span>
        </div>

        {/* QR Visual */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 inline-block mx-auto mb-3">
          <QRCodeSVG
            value={qrValue}
            size={160}
            level="H"
            includeMargin={true}
            className="mx-auto"
          />
        </div>

        {/* Hidden canvas for downloading image */}
        <div ref={canvasRef} className="hidden">
          <QRCodeCanvas
            value={qrValue}
            size={400}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Token string */}
        <div className="mb-4">
          <p className="text-[11px] text-slate-400 mb-1">Mã Token Xác Thực:</p>
          <div className="flex items-center justify-center gap-1.5 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
            <span className="font-mono text-xs font-bold text-slate-800 select-all truncate max-w-[170px]">
              {qrValue}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
              title="Sao chép mã QR"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            icon={Download}
            className="w-full text-xs"
          >
            Tải File Ảnh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setPrintModalOpen(true)}
            icon={Printer}
            className="w-full text-xs"
          >
            In Tem QR
          </Button>
        </div>
      </div>

      {/* Print Label Modal */}
      <PrintLabelModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        device={device}
      />
    </>
  );
};
