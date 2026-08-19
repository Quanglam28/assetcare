import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, QrCode, Building2, MapPin, Tag } from 'lucide-react';

export const PrintLabelModal = ({ isOpen, onClose, device }) => {
  if (!device) return null;

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const baseHost = isLocalhost 
    ? `${window.location.protocol}//192.168.42.111:${window.location.port || '5173'}` 
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const qrToken = device.qr_token || device.code || `UNI-QR-2026-${device.id}`;
  const qrValue = `${baseHost}/device/${qrToken}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="In Nhãn / Tem Quản Lý Thiết Bị (QR Code Sticker)"
      size="md"
    >
      <div className="space-y-6">
        <p className="text-xs text-slate-500 text-center">
          Nhãn dán chuẩn dùng để in decal dán trực tiếp lên thiết bị trong khuôn viên trường đại học.
        </p>

        {/* Printable Label Box */}
        <div className="print-area max-w-sm mx-auto p-4 bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-md">
          {/* Header */}
          <div className="text-center pb-2.5 border-b-2 border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 leading-tight">
              TRƯỜNG ĐẠI HỌC CÔNG NGHỆ
            </h4>
            <p className="text-[10px] font-bold text-brand-700 tracking-tight">
              TEM QUẢN LÝ TÀI SẢN & BẢO TRÌ THIẾT BỊ
            </p>
          </div>

          {/* Body: QR Code + Meta */}
          <div className="py-3 flex items-center gap-3.5">
            <div className="p-1.5 bg-white border border-slate-200 rounded-lg shrink-0">
              <QRCodeSVG
                value={qrValue}
                size={95}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-1 text-left">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Mã Thiết Bị:</span>
                <p className="font-mono font-black text-sm text-slate-900 leading-none">{device.code}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Tên Thiết Bị:</span>
                <p className="font-bold text-xs text-slate-800 truncate leading-tight">{device.name}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Vị Trí Đặt:</span>
                <p className="text-[11px] font-semibold text-slate-700 leading-none">
                  {device.room_name || 'Phòng học'} ({device.building_name || 'Tòa nhà'})
                </p>
              </div>
            </div>
          </div>

          {/* Footer Token */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>QR: {device.qr_token || device.code}</span>
            <span>Đại Học 2026</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button type="button" variant="primary" onClick={handlePrint} icon={Printer}>
            Thực Hiện In Tem (Print)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
