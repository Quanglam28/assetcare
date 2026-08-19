import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { PWAInstallPrompt } from '../components/pwa/PWAInstallPrompt';
import { OfflineBanner } from '../components/pwa/OfflineBanner';

export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Offline Status Top Banner */}
      <OfflineBanner />

      {/* Sidebar (Desktop / Tablet Drawer) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Page Outlet with bottom padding on mobile for MobileBottomNav */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Desktop Footer (Hidden on mobile) */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* PWA Install Floating Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};
