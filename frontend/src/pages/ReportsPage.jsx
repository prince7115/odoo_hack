import { useState } from 'react'
import '../components/shared.css'
import './ReportsPage.css'

/* ─── Data ─────────────────────────────── */
const utilizationData = [
  { category: 'Electronics',  total: 54, allocated: 42, maintenance: 3,  available: 9  },
  { category: 'Furniture',    total: 38, allocated: 18, maintenance: 1,  available: 19 },
  { category: 'Vehicles',     total: 6,  allocated: 4,  maintenance: 2,  available: 0  },
  { category: 'Lab Equipment',total: 9,  allocated: 7,  maintenance: 1,  available: 1  },
]

const maintenanceFrequency = [
  { asset: 'Forklift Komatsu FG25T',     tag: 'AF-0055', count: 8, lastDate: '2026-07-09' },
  { asset: 'Toyota Innova',              tag: 'AF-0078', count: 6, lastDate: '2026-07-07' },
  { asset: 'Oscilloscope Rigol DS1054Z', tag: 'AF-0093', count: 5, lastDate: '2026-07-10' },
  { asset: 'Epson Projector EB-S41',     tag: 'AF-0062', count: 4, lastDate: '2026-07-08' },
  { asset: 'Dell Laptop XPS 15',         tag: 'AF-0114', count: 2, lastDate: '2026-07-11' },
]

const mostUsed = [
  { asset: 'Epson Projector EB-S41',    tag: 'AF-0062', bookings: 34, category: 'Electronics' },
  { asset: 'Boardroom Table — 12 Seat', tag: 'AF-0011', bookings: 28, category: 'Furniture'   },
  { asset: 'Toyota Innova',             tag: 'AF-0078', bookings: 22, category: 'Vehicles'    },
]

const idleAssets = [
  { asset: 'Canon DSLR EOS 90D',   tag: 'AF-0007', idleDays: 182, category: 'Electronics', status: 'Retired'  },
  { asset: 'LG 32" Monitor 4K',    tag: 'AF-0022', idleDays: 45,  category: 'Electronics', status: 'Available' },
  { asset: 'Cisco IP Phone 8841',  tag: 'AF-0130', idleDays: 31,  category: 'Electronics', status: 'Available' },
]

const monthlyBookings = [
  { month: 'Feb', count: 18 },
  { month: 'Mar', count: 24 },
  { month: 'Apr', count: 31 },
  { month: 'May', count: 27 },
  { month: 'Jun', count: 38 },
  { month: 'Jul', count: 19 },
]

const statusSummary = [
  { label: 'Available',    value: 29,  color: '#16a34a', pct: 23 },
  { label: 'Allocated',    value: 71,  color: '#0052ff', pct: 57 },
  { label: 'Maintenance',  value: 7,   color: '#d97706', pct: 6  },
  { label: 'Retired',      value: 18,  color: '#737688', pct: 14 },
]

const totalAssets = statusSummary.reduce((s, i) => s + i.value, 0)

/* ── Mini Bar Chart ── */
function UtilizationBar({ row }) {
  const pctAlloc   = Math.round(row.allocated   / row.total * 100)
  const pctMaint   = Math.round(row.maintenance / row.total * 100)
  const pctAvail   = Math.round(row.available   / row.total * 100)
  return (
    <div className="util-row">
      <div className="util-category">{row.category}</div>
      <div className="util-bar-track">
        <div className="util-seg util-allocated" style={{ width: `${pctAlloc}%` }} title={`Allocated: ${row.allocated}`} />
        <div className="util-seg util-maintenance" style={{ width: `${pctMaint}%` }} title={`Maintenance: ${row.maintenance}`} />
        <div className="util-seg util-available" style={{ width: `${pctAvail}%` }} title={`Available: ${row.available}`} />
      </div>
      <div className="util-numbers">
        <span className="util-num allocated">{row.allocated} allocated</span>
        <span className="util-num maintenance">{row.maintenance} maint.</span>
        <span className="util-num available">{row.available} free</span>
      </div>
    </div>
  )
}

/* ── Monthly Booking Bars ── */
function BookingChart() {
  const maxCount = Math.max(...monthlyBookings.map(m => m.count))
  return (
    <div className="booking-chart">
      {monthlyBookings.map(m => (
        <div key={m.month} className="booking-chart-bar-wrap">
          <div className="booking-chart-bar" style={{ height: `${(m.count / maxCount) * 100}%` }}>
            <span className="booking-chart-val">{m.count}</span>
          </div>
          <span className="booking-chart-month">{m.month}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Donut Chart (CSS) ── */
function DonutChart() {
  let offset = 0
  const circumference = 2 * Math.PI * 40
  const segments = statusSummary.map(s => {
    const dash = (s.pct / 100) * circumference
    const gap  = circumference - dash
    const seg  = { ...s, dash, gap, offset }
    offset += dash
    return seg
  })

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-container)" strokeWidth="18" />
        {segments.map((s, i) => (
          <circle key={i} cx="50" cy="50" r="40" fill="none"
            stroke={s.color} strokeWidth="18"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        ))}
        <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--on-surface)">{totalAssets}</text>
        <text x="50" y="57" textAnchor="middle" fontSize="6"  fill="var(--on-surface-variant)">Total Assets</text>
      </svg>
      <div className="donut-legend">
        {statusSummary.map(s => (
          <div key={s.label} className="donut-legend-item">
            <span className="donut-legend-dot" style={{ background: s.color }} />
            <span className="donut-legend-label">{s.label}</span>
            <span className="donut-legend-value">{s.value} <span style={{ color: 'var(--outline)' }}>({s.pct}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('overview')

  const REPORTS = [
    { id: 'overview',     label: 'Overview',         icon: 'dashboard' },
    { id: 'utilization',  label: 'Utilization',       icon: 'bar_chart' },
    { id: 'maintenance',  label: 'Maintenance',       icon: 'build' },
    { id: 'bookings',     label: 'Booking Trends',   icon: 'event' },
  ]

  return (
    <div className="reports-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Reports</p>
          <h1>Reports & Analytics</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">
            <span className="material-symbols-outlined">download</span> Export CSV
          </button>
          <button className="btn btn-secondary">
            <span className="material-symbols-outlined">picture_as_pdf</span> Export PDF
          </button>
        </div>
      </div>

      {/* ── Report Tabs ── */}
      <div className="tabs">
        {REPORTS.map(r => (
          <button key={r.id} className={`tab-btn ${activeReport === r.id ? 'active' : ''}`} onClick={() => setActiveReport(r.id)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeReport === 'overview' && (
        <div className="reports-content">
          {/* KPI Cards */}
          <div className="reports-kpi-grid">
            <div className="report-kpi-card">
              <span className="material-symbols-outlined report-kpi-icon" style={{ color: '#0052ff' }}>inventory_2</span>
              <div>
                <div className="report-kpi-value">{totalAssets}</div>
                <div className="report-kpi-label">Total Assets</div>
              </div>
            </div>
            <div className="report-kpi-card">
              <span className="material-symbols-outlined report-kpi-icon" style={{ color: '#16a34a' }}>assignment_ind</span>
              <div>
                <div className="report-kpi-value">71</div>
                <div className="report-kpi-label">Active Allocations</div>
              </div>
            </div>
            <div className="report-kpi-card">
              <span className="material-symbols-outlined report-kpi-icon" style={{ color: '#d97706' }}>build</span>
              <div>
                <div className="report-kpi-value">7</div>
                <div className="report-kpi-label">Under Maintenance</div>
              </div>
            </div>
            <div className="report-kpi-card">
              <span className="material-symbols-outlined report-kpi-icon" style={{ color: '#7c3aed' }}>event</span>
              <div>
                <div className="report-kpi-value">157</div>
                <div className="report-kpi-label">Total Bookings (YTD)</div>
              </div>
            </div>
          </div>

          <div className="reports-two-col">
            {/* Donut Chart */}
            <div className="report-card">
              <div className="report-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>donut_large</span>
                Asset Status Distribution
              </div>
              <DonutChart />
            </div>

            {/* Idle Assets */}
            <div className="report-card">
              <div className="report-card-header">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--warning)' }}>schedule</span>
                Long-Idle Assets
              </div>
              <div className="report-list">
                {idleAssets.map(a => (
                  <div key={a.tag} className="report-list-item">
                    <div>
                      <code className="asset-tag-sm">{a.tag}</code>
                      <div style={{ fontWeight: 500, fontSize: 13, marginTop: 4 }}>{a.asset}</div>
                    </div>
                    <div className="idle-badge">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>hourglass_empty</span>
                      {a.idleDays}d idle
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UTILIZATION ── */}
      {activeReport === 'utilization' && (
        <div className="reports-content">
          <div className="report-card" style={{ maxWidth: 800 }}>
            <div className="report-card-header">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>bar_chart</span>
              Asset Utilization by Category
            </div>
            <div className="util-legend">
              <span className="util-legend-item"><span className="util-dot allocated" />Allocated</span>
              <span className="util-legend-item"><span className="util-dot maintenance" />Maintenance</span>
              <span className="util-legend-item"><span className="util-dot available" />Available</span>
            </div>
            <div className="util-chart">
              {utilizationData.map(row => <UtilizationBar key={row.category} row={row} />)}
            </div>
          </div>

          <div className="report-card" style={{ maxWidth: 800 }}>
            <div className="report-card-header">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#16a34a' }}>trending_up</span>
              Most Utilized Resources (Bookings)
            </div>
            <div className="report-list">
              {mostUsed.map((a, i) => (
                <div key={a.tag} className="report-list-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="rank-badge">{i + 1}</span>
                    <div>
                      <code className="asset-tag-sm">{a.tag}</code>
                      <div style={{ fontWeight: 500, fontSize: 13, marginTop: 3 }}>{a.asset}</div>
                    </div>
                  </div>
                  <div className="booking-count-badge">{a.bookings} bookings</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAINTENANCE ── */}
      {activeReport === 'maintenance' && (
        <div className="reports-content">
          <div className="report-card" style={{ maxWidth: 700 }}>
            <div className="report-card-header">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#d97706' }}>build</span>
              Maintenance Frequency (All Time)
            </div>
            <div className="report-list">
              {maintenanceFrequency.map((a, i) => {
                const maxCount = maintenanceFrequency[0].count
                const pct = Math.round(a.count / maxCount * 100)
                return (
                  <div key={a.tag} className="maint-freq-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span className="rank-badge">{i + 1}</span>
                      <div>
                        <code className="asset-tag-sm">{a.tag}</code>
                        <div style={{ fontWeight: 500, fontSize: 13, marginTop: 3 }}>{a.asset}</div>
                      </div>
                    </div>
                    <div className="maint-freq-right">
                      <div className="maint-freq-bar-wrap">
                        <div className="maint-freq-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="maint-count">{a.count}×</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="table-footer" style={{ marginTop: 0 }}>Last maintenance records from 2026</div>
          </div>
        </div>
      )}

      {/* ── BOOKINGS ── */}
      {activeReport === 'bookings' && (
        <div className="reports-content">
          <div className="report-card" style={{ maxWidth: 700 }}>
            <div className="report-card-header">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#7c3aed' }}>event</span>
              Monthly Booking Volume (2026)
            </div>
            <BookingChart />
            <div className="booking-chart-legend">
              <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Feb – Jul 2026 · Total bookings: {monthlyBookings.reduce((s, m) => s + m.count, 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
