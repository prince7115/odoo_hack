import '../components/shared.css'
import './DashboardPage.css'

const kpiData = [
  { label: 'Available', value: '128', icon: 'check_circle' },
  { label: 'Allocated', value: '76', icon: 'assignment_ind' },
  { label: 'Under Maintenance', value: '4', icon: 'build' },
  { label: 'Upcoming Returns', value: '12', icon: 'event_upcoming' },
  { label: 'Pending Transfers', value: '3', icon: 'swap_horiz', className: 'alert' },
  { label: 'Active Bookings', value: '9', icon: 'event_available' },
]

const recentActivity = [
  { icon: 'laptop', text: 'Laptop AF-0114 — allocated to Priya Shah — IT dept' },
  { icon: 'meeting_room', text: 'Room B2 — booking confirmed — 2:00 to 3:00 PM' },
  { icon: 'handyman', text: 'Projector AF-0062 — maintenance resolved' },
]

export default function DashboardPage() {
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

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className={`kpi-card ${kpi.className || ''}`}>
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      <div className="alert-banner">
        <span className="material-symbols-outlined icon-filled">warning</span>
        3 assets overdue for return — flagged for follow-up
      </div>

      {/* Recent Activity */}
      <div className="section-card">
        <div className="section-card-header">Recent Activity</div>
        <ul className="activity-list">
          {recentActivity.map((item, idx) => (
            <li key={idx} className="activity-item">
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
