import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Spinner } from '../components/ui/Spinner';
import { ROLES } from '../utils/constants';

// Lazy load pages to reduce initial bundle size for ultra-fast mobile loading
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const UserListPage = lazy(() => import('../pages/users/UserListPage').then(m => ({ default: m.UserListPage })));
const UserCreatePage = lazy(() => import('../pages/users/UserCreatePage').then(m => ({ default: m.UserCreatePage })));
const UserDetailPage = lazy(() => import('../pages/users/UserDetailPage').then(m => ({ default: m.UserDetailPage })));
const UserEditPage = lazy(() => import('../pages/users/UserEditPage').then(m => ({ default: m.UserEditPage })));
const DeviceListPage = lazy(() => import('../pages/devices/DeviceListPage').then(m => ({ default: m.DeviceListPage })));
const DeviceDetailPage = lazy(() => import('../pages/devices/DeviceDetailPage').then(m => ({ default: m.DeviceDetailPage })));
const DeviceCreatePage = lazy(() => import('../pages/devices/DeviceCreatePage').then(m => ({ default: m.DeviceCreatePage })));
const DeviceEditPage = lazy(() => import('../pages/devices/DeviceEditPage').then(m => ({ default: m.DeviceEditPage })));
const DeviceQRCodePage = lazy(() => import('../pages/devices/DeviceQRCodePage').then(m => ({ default: m.DeviceQRCodePage })));
const PublicDevicePage = lazy(() => import('../pages/public/PublicDevicePage').then(m => ({ default: m.PublicDevicePage })));
const QRScannerPage = lazy(() => import('../pages/qr/QRScannerPage').then(m => ({ default: m.QRScannerPage })));
const ReportIncidentPage = lazy(() => import('../pages/maintenance/ReportIncidentPage').then(m => ({ default: m.ReportIncidentPage })));
const MyTicketsPage = lazy(() => import('../pages/maintenance/MyTicketsPage').then(m => ({ default: m.MyTicketsPage })));
const TicketDetailPage = lazy(() => import('../pages/maintenance/TicketDetailPage').then(m => ({ default: m.TicketDetailPage })));
const TechnicianDashboardPage = lazy(() => import('../pages/technician/TechnicianDashboardPage').then(m => ({ default: m.TechnicianDashboardPage })));
const SchedulesPage = lazy(() => import('../pages/schedules/SchedulesPage').then(m => ({ default: m.SchedulesPage })));
const NotificationPage = lazy(() => import('../pages/notifications/NotificationPage').then(m => ({ default: m.NotificationPage })));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const RiskMatrixPage = lazy(() => import('../pages/matrix/RiskMatrixPage').then(m => ({ default: m.RiskMatrixPage })));
const WorkOrderListPage = lazy(() => import('../pages/workorders/WorkOrderListPage').then(m => ({ default: m.WorkOrderListPage })));
const LocationsPage = lazy(() => import('../pages/master/LocationsPage').then(m => ({ default: m.LocationsPage })));
const DeviceTypesPage = lazy(() => import('../pages/master/DeviceTypesPage').then(m => ({ default: m.DeviceTypesPage })));
const SuppliersPage = lazy(() => import('../pages/master/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const NotFoundPage = lazy(() => import('../pages/common/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ForbiddenPage = lazy(() => import('../pages/common/ForbiddenPage').then(m => ({ default: m.ForbiddenPage })));

const PageFallback = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <Spinner size="md" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* 1. Public Standalone Pages (Mobile Camera Scan & Auth) */}
        <Route path="/device/:token" element={<PublicDevicePage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* 2. Protected Routes inside MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* QR Code Scanner (In-App Camera) */}
          <Route path="/qr-scanner" element={<QRScannerPage />} />

          {/* Notifications Page (Module 10) */}
          <Route path="/notifications" element={<NotificationPage />} />

          {/* Maintenance / Incident Ticket Routes (Module 6, 7 & 8) */}
          <Route path="/report-issue" element={<ReportIncidentPage />} />
          <Route path="/maintenance" element={<MyTicketsPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/maintenance/:id" element={<TicketDetailPage />} />
          <Route
            path="/technician/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]}>
                <TechnicianDashboardPage />
              </RoleProtectedRoute>
            }
          />
          {/* MODULE 9: Scheduled Maintenance (Lịch bảo trì định kỳ) */}
          <Route
            path="/schedules"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]}>
                <SchedulesPage />
              </RoleProtectedRoute>
            }
          />

          {/* MODULE 12: Reports & Analytics Center (Báo cáo & Thống kê xuất Excel/CSV/A4) */}
          <Route
            path="/reports"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]}>
                <ReportsPage />
              </RoleProtectedRoute>
            }
          />

          {/* PHASE 3: Risk Matrix Dashboard (Ma trận rủi ro 4 phân vùng) */}
          <Route
            path="/risk-matrix"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]}>
                <RiskMatrixPage />
              </RoleProtectedRoute>
            }
          />

          {/* PHASE 3: Maintenance Work Orders (Lệnh công tác bảo trì) */}
          <Route
            path="/work-orders"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]}>
                <WorkOrderListPage />
              </RoleProtectedRoute>
            }
          />

          {/* Device & Asset Management Routes */}
          <Route path="/devices" element={<DeviceListPage />} />
          <Route
            path="/devices/create"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <DeviceCreatePage />
              </RoleProtectedRoute>
            }
          />
          <Route path="/devices/:id" element={<DeviceDetailPage />} />
          <Route
            path="/devices/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <DeviceEditPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/devices/:id/qr"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <DeviceQRCodePage />
              </RoleProtectedRoute>
            }
          />

          {/* Master Data / Categories Routes */}
          <Route
            path="/locations"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <LocationsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/device-types"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <DeviceTypesPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <SuppliersPage />
              </RoleProtectedRoute>
            }
          />

          {/* User Management Routes */}
          <Route
            path="/users"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <UserListPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/users/create"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <UserCreatePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
                <UserDetailPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <UserEditPage />
              </RoleProtectedRoute>
            }
          />

          {/* Error Pages inside MainLayout */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
        </Route>

        {/* Global 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
