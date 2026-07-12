import { useState } from 'react'
import '../components/shared.css'
import './NotificationsPage.css'

/* ─── Seed Data ─────────────────────────────── */
const seedNotifications = [
  { id: 1,  type: 'Alert',    icon: 'warning',          color: '#d97706', title: '3 assets overdue for return',                      body: 'AF-0078, AF-0093, AF-0088 are past their expected return date.',                     time: '2 min ago',   read: false, actor: 'System' },
  { id: 2,  type: 'Approval', icon: 'swap_horiz',       color: '#0052ff', title: 'Transfer request pending approval',                 body: 'Priya Shah requested transfer of Dell Laptop XPS 15 (AF-0114) to Arjun Nair.',       time: '15 min ago',  read: false, actor: 'Priya Shah' },
  { id: 3,  type: 'Booking',  icon: 'event_available',  color: '#16a34a', title: 'Resource booking confirmed',                        body: 'Boardroom Table (AF-0011) booked by Aditi Rao — Today 14:00 to 16:00.',              time: '1 hour ago',  read: false, actor: 'Aditi Rao' },
  { id: 4,  type: 'Alert',    icon: 'build',            color: '#d97706', title: 'Maintenance request raised',                        body: 'Oscilloscope Rigol DS1054Z (AF-0093) — "Display flickering" — Priority: High.',      time: '2 hours ago', read: true,  actor: 'Arjun Nair' },
  { id: 5,  type: 'Approval', icon: 'check_circle',     color: '#16a34a', title: 'Transfer request approved',                        body: 'Epson Projector EB-S41 (AF-0062) transfer to Sana Iqbal was approved.',              time: '3 hours ago', read: true,  actor: 'Rohan Mehta' },
  { id: 6,  type: 'Booking',  icon: 'event_busy',       color: '#ba1a1a', title: 'Booking cancelled',                                body: 'Rohan Mehta cancelled Boardroom booking for today 10:00–11:30.',                    time: '4 hours ago', read: true,  actor: 'Rohan Mehta' },
  { id: 7,  type: 'Alert',    icon: 'fact_check',       color: '#7c3aed', title: 'Audit cycle started: Q3 2026 Partial',              body: 'IT + Facilities audit started. Assigned auditors: Priya Shah, Rohan Mehta.',        time: 'Yesterday',   read: true,  actor: 'Admin' },
  { id: 8,  type: 'Approval', icon: 'assignment_ind',   color: '#0052ff', title: 'New asset allocated',                              body: 'iPhone 14 Pro (AF-0105) allocated to Aditi Rao until 2025-01-10.',                  time: 'Yesterday',   read: true,  actor: 'Vikram Das' },
  { id: 9,  type: 'Alert',    icon: 'task_alt',         color: '#16a34a', title: 'Maintenance resolved',                             body: 'Canon DSLR EOS 90D (AF-0007) — Shutter issue resolved by TechCare.',               time: '2 days ago',  read: true,  actor: 'TechCare' },
  { id: 10, type: 'Booking',  icon: 'event',            color: '#16a34a', title: 'Resource booking confirmed',                       body: 'Toyota Innova (AF-0078) booked by Sana Iqbal — Jul 13, 08:00 to 12:00.',            time: '2 days ago',  read: true,  actor: 'Sana Iqbal' },
]

const seedActivityLog = [
  { id: 1,  user: 'Priya Shah',   initials: 'PS', color: 'rose',   action: 'Requested transfer',    entity: 'Dell Laptop XPS 15',         entityType: 'asset',    time: '2026-07-12 10:35', detail: 'Transfer to Arjun Nair' },
  { id: 2,  user: 'Aditi Rao',    initials: 'AR', color: 'blue',   action: 'Booked resource',        entity: 'Boardroom Table — 12 Seat',  entityType: 'booking',  time: '2026-07-12 09:22', detail: '14:00–16:00 today' },
  { id: 3,  user: 'Arjun Nair',   initials: 'AN', color: 'orange', action: 'Raised maintenance',     entity: 'Oscilloscope Rigol DS1054Z', entityType: 'maintenance', time: '2026-07-12 08:47', detail: 'Priority: High' },
  { id: 4,  user: 'Rohan Mehta',  initials: 'RM', color: 'teal',   action: 'Approved transfer',      entity: 'Epson Projector EB-S41',     entityType: 'transfer', time: '2026-07-12 07:30', detail: 'Transfer to Sana Iqbal' },
  { id: 5,  user: 'Rohan Mehta',  initials: 'RM', color: 'teal',   action: 'Cancelled booking',      entity: 'Boardroom Table — 12 Seat',  entityType: 'booking',  time: '2026-07-12 06:15', detail: '10:00–11:30 slot' },
  { id: 6,  user: 'Admin',        initials: 'AD', color: 'purple', action: 'Started audit cycle',    entity: 'Q3 2026 Partial Audit',      entityType: 'audit',    time: '2026-07-11 18:00', detail: 'IT + Facilities' },
  { id: 7,  user: 'Vikram Das',   initials: 'VD', color: 'blue',   action: 'Allocated asset',        entity: 'iPhone 14 Pro (Company)',    entityType: 'allocation', time: '2026-07-11 15:22', detail: 'To Aditi Rao' },
  { id: 8,  user: 'TechCare',     initials: 'TC', color: 'teal',   action: 'Resolved maintenance',   entity: 'Canon DSLR EOS 90D',         entityType: 'maintenance', time: '2026-07-10 14:10', detail: 'Shutter mechanism fixed' },
  { id: 9,  user: 'Sana Iqbal',   initials: 'SI', color: 'purple', action: 'Booked resource',        entity: 'Toyota Innova',              entityType: 'booking',  time: '2026-07-10 11:05', detail: 'Jul 13, 08:00–12:00' },
  { id: 10, user: 'Priya Shah',   initials: 'PS', color: 'rose',   action: 'Registered asset',       entity: 'LG 32" Monitor 4K',          entityType: 'asset',    time: '2026-07-09 09:30', detail: 'New asset AF-0022' },
]

const ENTITY_TYPE_ICON = {
  asset:       { icon: 'inventory_2', color: '#0052ff' },
  booking:     { icon: 'event',       color: '#16a34a' },
  maintenance: { icon: 'build',       color: '#d97706' },
  transfer:    { icon: 'swap_horiz',  color: '#7c3aed' },
  allocation:  { icon: 'assignment_ind', color: '#0052ff' },
  audit:       { icon: 'fact_check',  color: '#0891b2' },
}

const FILTER_TYPES = ['All', 'Alerts', 'Approvals', 'Bookings']

export default function NotificationsPage() {
  const [activeTab, setActiveTab]       = useState('notifications')
  const [notifications, setNotifications] = useState(seedNotifications)
  const [filterType, setFilterType]     = useState('All')
  const [activitySearch, setActivitySearch] = useState('')

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'All')       return true
    if (filterType === 'Alerts')    return n.type === 'Alert'
    if (filterType === 'Approvals') return n.type === 'Approval'
    if (filterType === 'Bookings')  return n.type === 'Booking'
    return true
  })

  const filteredActivity = seedActivityLog.filter(a => {
    const q = activitySearch.toLowerCase()
    return !q || a.user.toLowerCase().includes(q) || a.action.toLowerCase().includes(q) || a.entity.toLowerCase().includes(q)
  })

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div className="notifications-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Activity & Notifications</p>
          <h1>Activity Logs & Notifications</h1>
        </div>
        <div className="page-header-actions">
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>
              <span className="material-symbols-outlined">done_all</span> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>notifications</span>
          Notifications
          {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>history</span>
          Activity Log
        </button>
      </div>

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === 'notifications' && (
        <>
          {/* Filter Pills */}
          <div className="notif-filter-bar">
            {FILTER_TYPES.map(type => (
              <button
                key={type}
                className={`notif-filter-pill ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type}
                {type !== 'All' && (
                  <span className="pill-count">
                    {type === 'Alerts' ? notifications.filter(n => n.type === 'Alert').length
                      : type === 'Approvals' ? notifications.filter(n => n.type === 'Approval').length
                      : notifications.filter(n => n.type === 'Booking').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notification Feed */}
          <div className="notif-feed">
            {filteredNotifs.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined">notifications_off</span>
                <p>No notifications in this category.</p>
              </div>
            ) : filteredNotifs.map(notif => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.read ? 'notif-unread' : ''}`}
                onClick={() => markRead(notif.id)}
              >
                <div className="notif-icon-wrap" style={{ background: notif.color + '20', color: notif.color }}>
                  <span className="material-symbols-outlined icon-filled">{notif.icon}</span>
                </div>
                <div className="notif-content">
                  <div className="notif-title">
                    {!notif.read && <span className="notif-unread-dot" />}
                    {notif.title}
                  </div>
                  <p className="notif-body">{notif.body}</p>
                  <div className="notif-meta">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                    {notif.time}
                    <span className="notif-meta-sep">·</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>person</span>
                    {notif.actor}
                    <span className={`notif-type-tag notif-type-${notif.type.toLowerCase()}`}>{notif.type}</span>
                  </div>
                </div>
                {!notif.read && (
                  <button className="btn btn-ghost btn-sm notif-read-btn" onClick={e => { e.stopPropagation(); markRead(notif.id) }} title="Mark as read">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ACTIVITY LOG TAB ── */}
      {activeTab === 'activity' && (
        <>
          <div className="table-search" style={{ maxWidth: 340 }}>
            <span className="material-symbols-outlined">search</span>
            <input
              placeholder="Search by user, action, entity…"
              value={activitySearch}
              onChange={e => setActivitySearch(e.target.value)}
            />
            {activitySearch && (
              <button className="btn-ghost" style={{ padding: '2px' }} onClick={() => setActivitySearch('')}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            )}
          </div>

          <div className="activity-feed">
            {filteredActivity.map((entry, idx) => {
              const entityMeta = ENTITY_TYPE_ICON[entry.entityType] || ENTITY_TYPE_ICON.asset
              return (
                <div key={entry.id} className="activity-item">
                  {/* Timeline line */}
                  <div className="activity-timeline">
                    <div className={`avatar avatar-${entry.color}`} style={{ fontSize: 11 }}>{entry.initials}</div>
                    {idx < filteredActivity.length - 1 && <div className="timeline-connector" />}
                  </div>

                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-user">{entry.user}</span>
                      <span className="activity-action">{entry.action}</span>
                    </div>
                    <div className="activity-entity">
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: entityMeta.color }}>{entityMeta.icon}</span>
                      <span className="activity-entity-name">{entry.entity}</span>
                      {entry.detail && <span className="activity-detail">— {entry.detail}</span>}
                    </div>
                    <div className="activity-time">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
                      {entry.time}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredActivity.length === 0 && (
              <div className="empty-state">
                <span className="material-symbols-outlined">history</span>
                <p>No activity matches your search.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
