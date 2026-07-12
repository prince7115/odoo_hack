import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrgSetupPage from './pages/OrgSetupPage'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes with sidebar layout */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="org-setup" element={<OrgSetupPage />} />
        {/* Future screens will be added here:
        <Route path="assets" element={<AssetsPage />} />
        <Route path="allocation" element={<AllocationPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
