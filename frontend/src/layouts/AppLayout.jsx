import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './AppLayout.css'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/org-setup': 'Organization Setup',
  '/assets': 'Assets',
  '/allocation': 'Allocation & Transfer',
  '/booking': 'Resource Booking',
  '/maintenance': 'Maintenance',
  '/audit': 'Audit',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
}

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = pageTitles[location.pathname] || 'AssetFlow'

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <p className="topbar-breadcrumb">
              AssetFlow / <span>{pageTitle}</span>
            </p>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon-btn" title="Search" onClick={() => navigate('/assets')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                search
              </span>
            </button>
            <button className="topbar-icon-btn" title="Notifications" onClick={() => navigate('/notifications')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                notifications
              </span>
              <span className="dot"></span>
            </button>
            <button className="topbar-icon-btn" title="Settings" onClick={() => navigate('/org-setup')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                settings
              </span>
            </button>
          </div>
        </header>

        {/* Page Content — each route renders here */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
