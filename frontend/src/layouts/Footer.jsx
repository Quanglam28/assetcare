import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-3 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>
        © 2026 <strong>Trường Đại học Công nghệ Giao thông Vận tải (UTT)</strong> • Hệ thống Quản lý Tài sản & Bảo trì QR Code
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <span>Hỗ trợ kỹ thuật: 024-3854-4264</span>
        <span>•</span>
        <span>Phòng Quản trị Thiết bị & CSVC</span>
      </div>
    </footer>
  );
};
