import { useState, useEffect } from 'react'
import '../components/shared.css'
import './DashboardPage.css'
import dashboardService from '../services/dashboardService'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await dashboardService.getStats()
        setStats(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const kpiData = stats
    ? [
        { label: 'Total Assets', value: String(stats.totalAssets), icon: 'inventory_2' },
        { label: 'Available', value: String(stats.availableAssets), icon: 'check_circle' },
        { label: 'Allocated', value: String(stats.allocatedAssets), icon: 'assignment_ind' },
        { label: 'Under Maintenance', value: String(stats.underMaintenanceAssets), icon: 'build' },
        { label: 'Active Bookings', value: String(stats.activeBookings), icon: 'event_available' },
        { label: 'Pending Bookings', value: String(stats.pendingBookings), icon: 'pending_actions', className: stats.pendingBookings > 0 ? 'alert' : '' },
      ]
    : []

  const summaryCards = stats
    ? [
        { label: 'Employees', value: String(stats.totalEmployees), icon: 'people' },
        { label: 'Departments', value: String(stats.totalDepartments), icon: 'domain' },
        { label: 'Categories', value: String(stats.totalCategories), icon: 'category' },
      ]
    : []

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Today's Overview</h1>
        <div className="dashboard-header-actions">
          <button className="btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Register Asset
          </button>
          <button className="btn-outline">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>event</span>
            Book Resource
          </button>
          <button className="btn-outline">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>report_problem</span>
            Raise Request
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert-banner" style={{ background: 'var(--error-container)', color: 'var(--error)' }}>
          <span className="material-symbols-outlined icon-filled">error</span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div className="empty-state">
            <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
            <p>Loading dashboard…</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {!loading && stats && (
        <>
          <div className="kpi-grid">
            {kpiData.map((kpi) => (
              <div key={kpi.label} className={`kpi-card ${kpi.className || ''}`}>
                <span className="kpi-label">{kpi.label}</span>
                <span className="kpi-value">{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="section-card">
            <div className="section-card-header">Organization Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '16px 20px' }}>
              {summaryCards.map((card) => (
                <div key={card.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 'var(--radius-default)',
                  background: 'var(--surface-container-low)'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--primary)' }}>
                    {card.icon}
                  </span>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{card.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{card.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Banner */}
          {stats.pendingBookings > 0 && (
            <div className="alert-banner">
              <span className="material-symbols-outlined icon-filled">warning</span>
              {stats.pendingBookings} booking{stats.pendingBookings > 1 ? 's' : ''} pending approval
            </div>
          )}

          {stats.underMaintenanceAssets > 0 && (
            <div className="alert-banner">
              <span className="material-symbols-outlined icon-filled">build</span>
              {stats.underMaintenanceAssets} asset{stats.underMaintenanceAssets > 1 ? 's' : ''} currently under maintenance
            </div>
          )}
        </>
      )}

      {/* Empty state when no data */}
      {!loading && stats && stats.totalAssets === 0 && stats.totalEmployees === 0 && (
        <div className="section-card">
          <div className="section-card-header">Getting Started</div>
          <ul className="activity-list">
            <li className="activity-item">
              <span className="material-symbols-outlined">domain</span>
              Go to <strong>Organization Setup</strong> to create departments and categories
            </li>
            <li className="activity-item">
              <span className="material-symbols-outlined">person_add</span>
              Employees are auto-created when they sign in via Google OAuth
            </li>
            <li className="activity-item">
              <span className="material-symbols-outlined">inventory_2</span>
              Then register your first assets from the <strong>Assets</strong> page
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
