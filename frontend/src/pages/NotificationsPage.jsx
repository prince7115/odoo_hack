import { useState, useEffect, useCallback } from 'react'
import '../components/shared.css'
import './NotificationsPage.css'
import allocationService from '../services/allocationService'
import bookingService from '../services/bookingService'
import maintenanceService from '../services/maintenanceService'
import assetService from '../services/assetService'

const ENTITY_TYPE_ICON = {
  booking:     { icon: 'event',          color: '#16a34a' },
  maintenance: { icon: 'build',          color: '#d97706' },
  allocation:  { icon: 'assignment_ind', color: '#0052ff' },
  asset:       { icon: 'inventory_2',    color: '#0052ff' },
  transfer:    { icon: 'swap_horiz',     color: '#7c3aed' },
}

function timeAgo(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?' }
const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'rose']
const getColor = (str) => AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length]

const FILTER_TYPES = ['All', 'Bookings', 'Maintenance', 'Allocations']

export default function NotificationsPage() {
  const [activeTab, setActiveTab]   = useState('notifications')
  const [filterType, setFilterType] = useState('All')
  const [activitySearch, setActivitySearch] = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  /* Raw data from API */
  const [bookings, setBookings]         = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [allocations, setAllocations]   = useState([])
  const [assets, setAssets]             = useState([])

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [bRes, mRes, aRes, asRes] = await Promise.all([
        bookingService.getAll(),
        maintenanceService.getAll(),
        allocationService.getAll(),
        assetService.getAll(),
      ])
      setBookings(bRes.data || bRes || [])
      setMaintenances(mRes.data || mRes || [])
      setAllocations(aRes.data || aRes || [])
      setAssets(asRes.data || asRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── Build unified notification/activity feed from real data ── */
  const notifications = [
    ...bookings.map(b => ({
      _id: `booking-${b._id}`,
      type: 'Booking',
      icon: b.status === 'CANCELLED' || b.status === 'REJECTED' ? 'event_busy' : 'event_available',
      color: b.status === 'APPROVED' ? '#16a34a' : b.status === 'PENDING' ? '#d97706' : '#737688',
      title: `Booking ${b.status.toLowerCase()}: ${b.asset?.name || 'Asset'}`,
      body: `${b.bookedBy?.name || 'Someone'} booked ${b.asset?.name || 'an asset'} (${b.asset?.assetTag || ''})`,
      time: timeAgo(b.createdAt),
      rawDate: b.createdAt,
      actor: b.bookedBy?.name || 'System',
      entityType: 'booking',
    })),
    ...maintenances.map(m => ({
      _id: `maint-${m._id}`,
      type: 'Maintenance',
      icon: m.status === 'COMPLETED' ? 'task_alt' : m.status === 'REJECTED' ? 'cancel' : 'build',
      color: m.status === 'COMPLETED' ? '#16a34a' : m.status === 'PENDING' ? '#d97706' : '#0052ff',
      title: `Maintenance ${m.status.toLowerCase()}: ${m.asset?.name || 'Asset'}`,
      body: `${m.requestedBy?.name || 'Someone'} raised maintenance for ${m.asset?.name || 'an asset'} (${m.asset?.assetTag || ''}) — Priority: ${m.priority}`,
      time: timeAgo(m.createdAt),
      rawDate: m.createdAt,
      actor: m.requestedBy?.name || 'System',
      entityType: 'maintenance',
    })),
    ...allocations.map(a => ({
      _id: `alloc-${a._id}`,
      type: 'Allocation',
      icon: a.status === 'RETURNED' ? 'assignment_return' : 'assignment_ind',
      color: a.status === 'ACTIVE' ? '#0052ff' : a.status === 'RETURNED' ? '#16a34a' : '#737688',
      title: `Asset ${a.status === 'RETURNED' ? 'returned' : 'allocated'}: ${a.asset?.name || 'Asset'}`,
      body: `${a.asset?.name || 'An asset'} (${a.asset?.assetTag || ''}) ${a.status === 'RETURNED' ? 'returned by' : 'allocated to'} ${a.employee?.name || 'employee'}`,
      time: timeAgo(a.createdAt),
      rawDate: a.createdAt,
      actor: a.employee?.name || 'System',
      entityType: 'allocation',
    })),
  ].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))

  /* Build activity log from the same data */
  const activityLog = [
    ...bookings.map(b => ({
      _id: `b-${b._id}`,
      user: b.bookedBy?.name || 'System',
      action: `Booked resource`,
      entity: b.asset?.name || 'Asset',
      entityType: 'booking',
      time: b.createdAt ? new Date(b.createdAt).toLocaleString() : '',
      detail: `Status: ${b.status}`,
    })),
    ...maintenances.map(m => ({
      _id: `m-${m._id}`,
      user: m.requestedBy?.name || 'System',
      action: `Raised maintenance`,
      entity: m.asset?.name || 'Asset',
      entityType: 'maintenance',
      time: m.createdAt ? new Date(m.createdAt).toLocaleString() : '',
      detail: `Priority: ${m.priority} · Status: ${m.status}`,
    })),
    ...allocations.map(a => ({
      _id: `a-${a._id}`,
      user: a.employee?.name || 'System',
      action: a.status === 'RETURNED' ? `Returned asset` : `Received allocation`,
      entity: a.asset?.name || 'Asset',
      entityType: 'allocation',
      time: a.createdAt ? new Date(a.createdAt).toLocaleString() : '',
      detail: `Status: ${a.status}`,
    })),
    ...assets.map(a => ({
      _id: `as-${a._id}`,
      user: 'Admin',
      action: 'Registered asset',
      entity: a.name,
      entityType: 'asset',
      time: a.createdAt ? new Date(a.createdAt).toLocaleString() : '',
      detail: `Tag: ${a.assetTag} · Status: ${a.status}`,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time))

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'All')        return true
    if (filterType === 'Bookings')   return n.type === 'Booking'
    if (filterType === 'Maintenance') return n.type === 'Maintenance'
    if (filterType === 'Allocations') return n.type === 'Allocation'
    return true
  })

  const filteredActivity = activityLog.filter(a => {
    const q = activitySearch.toLowerCase()
    return !q || a.user.toLowerCase().includes(q) || a.action.toLowerCase().includes(q) || a.entity.toLowerCase().includes(q)
  })

  return (
    <div className="notifications-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Activity & Notifications</p>
          <h1>Activity Logs & Notifications</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={fetchData}>
            <span className="material-symbols-outlined">refresh</span> Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'var(--error-container)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-default)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          {error}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="notif-tabs">
        <button className={`notif-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
          <span className="material-symbols-outlined">notifications</span>
          Notifications
          {notifications.length > 0 && <span className="notif-count">{notifications.length}</span>}
        </button>
        <button className={`notif-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
          <span className="material-symbols-outlined">history</span>
          Activity Log
        </button>
      </div>

      {loading && (
        <div className="empty-state">
          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
          <p>Loading activity…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && (
            <div className="notif-layout">
              {/* Filter Sidebar */}
              <aside className="notif-sidebar">
                <p className="notif-sidebar-title">Filter By</p>
                {FILTER_TYPES.map(t => (
                  <button key={t} className={`notif-filter-btn ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
                    {t}
                    <span className="notif-filter-count">
                      {t === 'All' ? notifications.length :
                       t === 'Bookings' ? bookings.length :
                       t === 'Maintenance' ? maintenances.length :
                       allocations.length}
                    </span>
                  </button>
                ))}
              </aside>

              {/* Notification Feed */}
              <div className="notif-feed">
                {filteredNotifs.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-symbols-outlined">notifications_none</span>
                    <p>No notifications in this category.</p>
                  </div>
                ) : (
                  filteredNotifs.map(n => (
                    <div key={n._id} className="notif-item">
                      <div className="notif-icon-wrap" style={{ background: `${n.color}1a` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: n.color }}>{n.icon}</span>
                      </div>
                      <div className="notif-body">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-desc">{n.body}</div>
                        <div className="notif-meta">
                          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
                          {n.time}
                          <span className="notif-actor">· {n.actor}</span>
                        </div>
                      </div>
                      <span className={`notif-type-badge type-${n.type.toLowerCase()}`}>{n.type}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── ACTIVITY LOG TAB ── */}
          {activeTab === 'activity' && (
            <div className="activity-section">
              <div className="activity-toolbar">
                <div className="search-box">
                  <span className="material-symbols-outlined">search</span>
                  <input className="search-input" type="text" placeholder="Search by user, action or entity…"
                    value={activitySearch} onChange={e => setActivitySearch(e.target.value)} />
                </div>
              </div>
              <div className="activity-list-card">
                {filteredActivity.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-symbols-outlined">history</span>
                    <p>No activity found.</p>
                  </div>
                ) : (
                  filteredActivity.map(a => {
                    const ei = ENTITY_TYPE_ICON[a.entityType] || { icon: 'circle', color: '#737688' }
                    return (
                      <div key={a._id} className="activity-row">
                        <div className={`avatar avatar-${getColor(a.user)}`}>{initials(a.user)}</div>
                        <div className="activity-content">
                          <div className="activity-action">
                            <strong>{a.user}</strong> {a.action}
                          </div>
                          <div className="activity-entity">
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: ei.color }}>{ei.icon}</span>
                            {a.entity}
                            {a.detail && <span className="activity-detail"> · {a.detail}</span>}
                          </div>
                        </div>
                        <div className="activity-time">{a.time}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
