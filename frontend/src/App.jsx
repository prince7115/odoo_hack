import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrgSetupPage from './pages/OrgSetupPage'
import AssetsPage from './pages/AssetsPage'
import AllocationPage from './pages/AllocationPage'
import BookingPage from './pages/BookingPage'
import MaintenancePage from './pages/MaintenancePage'
import AuditPage from './pages/AuditPage'
import ReportsPage from './pages/ReportsPage'
import NotificationsPage from './pages/NotificationsPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes with sidebar layout */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<DashboardPage />} />
        <Route path="org-setup"      element={<OrgSetupPage />} />
        <Route path="assets"         element={<AssetsPage />} />
        <Route path="allocation"     element={<AllocationPage />} />
        <Route path="booking"        element={<BookingPage />} />
        <Route path="maintenance"    element={<MaintenancePage />} />
        <Route path="audit"          element={<AuditPage />} />
        <Route path="reports"        element={<ReportsPage />} />
        <Route path="notifications"  element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
