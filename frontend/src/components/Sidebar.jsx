import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { label: 'Organization Setup', icon: 'domain', path: '/org-setup' },
  { label: 'Assets', icon: 'inventory_2', path: '/assets' },
  { label: 'Allocation & Transfer', icon: 'swap_horiz', path: '/allocation' },
  { label: 'Resource Booking', icon: 'event', path: '/booking' },
  { label: 'Maintenance', icon: 'build', path: '/maintenance' },
  { label: 'Audit', icon: 'fact_check', path: '/audit' },
  { label: 'Reports', icon: 'bar_chart', path: '/reports' },
  { label: 'Notifications', icon: 'notifications', path: '/notifications', badge: 3 },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">AF</div>
        <span className="sidebar-brand-text">AssetFlow</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">PS</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Priya Shah</div>
            <div className="sidebar-user-role">Asset Manager</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
