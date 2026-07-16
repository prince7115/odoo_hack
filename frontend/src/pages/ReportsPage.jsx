import { useState, useEffect, useCallback } from 'react'
import '../components/shared.css'
import './ReportsPage.css'
import assetService from '../services/assetService'
import allocationService from '../services/allocationService'
import bookingService from '../services/bookingService'
import maintenanceService from '../services/maintenanceService'

/* ── Mini Bar Chart per category ── */
function UtilizationBar({ row }) {
  const total = row.total || 1
  const pctAlloc  = Math.round(row.allocated   / total * 100)
  const pctMaint  = Math.round(row.maintenance / total * 100)
  const pctAvail  = Math.round(row.available   / total * 100)
  return (
    <div className="util-row">
      <div className="util-category">{row.category}</div>
      <div className="util-bar-track">
        <div className="util-seg util-allocated"  style={{ width: `${pctAlloc}%` }}  title={`Allocated: ${row.allocated}`} />
        <div className="util-seg util-maintenance" style={{ width: `${pctMaint}%` }} title={`Maintenance: ${row.maintenance}`} />
        <div className="util-seg util-available"  style={{ width: `${pctAvail}%` }}  title={`Available: ${row.available}`} />
      </div>
      <div className="util-numbers">
        <span className="util-num allocated">{row.allocated} allocated</span>
        <span className="util-num maintenance">{row.maintenance} maint.</span>
        <span className="util-num available">{row.available} free</span>
      </div>
    </div>
  )
}

/* ── Bar Chart for bookings per month ── */
function BookingChart({ data }) {
  const maxCount = Math.max(...data.map(m => m.count), 1)
  return (
    <div className="booking-chart">
      {data.map(m => (
        <div key={m.month} className="booking-chart-bar-wrap">
          <div className="booking-chart-bar" style={{ height: `${(m.count / maxCount) * 100}%` }}>
            <span className="booking-chart-val">{m.count}</span>
          </div>
          <span className="booking-chart-label">{m.month}</span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [assets, setAssets]           = useState([])
  const [allocations, setAllocations] = useState([])
  const [bookings, setBookings]       = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [asRes, alRes, bRes, mRes] = await Promise.all([
        assetService.getAll(),
        allocationService.getAll(),
        bookingService.getAll(),
        maintenanceService.getAll(),
      ])
      setAssets(asRes.data || asRes || [])
      setAllocations(alRes.data || alRes || [])
      setBookings(bRes.data || bRes || [])
      setMaintenances(mRes.data || mRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── Compute all analytics from live data ── */

  // Status summary
  const statusSummary = [
    { label: 'Available',   value: assets.filter(a => a.status === 'AVAILABLE').length,         color: '#16a34a' },
    { label: 'Allocated',   value: assets.filter(a => a.status === 'ALLOCATED').length,          color: '#0052ff' },
    { label: 'Maintenance', value: assets.filter(a => a.status === 'UNDER_MAINTENANCE').length,  color: '#d97706' },
    { label: 'Disposed',    value: assets.filter(a => a.status === 'DISPOSED').length,            color: '#737688' },
  ]
  const totalAssets = assets.length

  // Utilization by category
  const categoryMap = {}
  assets.forEach(a => {
    const cat = a.category?.name || 'Uncategorized'
    if (!categoryMap[cat]) categoryMap[cat] = { category: cat, total: 0, allocated: 0, maintenance: 0, available: 0 }
    categoryMap[cat].total++
    if (a.status === 'ALLOCATED')        categoryMap[cat].allocated++
    else if (a.status === 'UNDER_MAINTENANCE') categoryMap[cat].maintenance++
    else if (a.status === 'AVAILABLE')   categoryMap[cat].available++
  })
  const utilizationData = Object.values(categoryMap).sort((a, b) => b.total - a.total)

  // Maintenance frequency by asset
  const maintFreqMap = {}
  maintenances.forEach(m => {
    const name = m.asset?.name || 'Unknown'
    const tag  = m.asset?.assetTag || ''
    const key  = m.asset?._id || name
    if (!maintFreqMap[key]) maintFreqMap[key] = { asset: name, tag, count: 0, lastDate: null }
    maintFreqMap[key].count++
    const d = m.createdAt
    if (!maintFreqMap[key].lastDate || d > maintFreqMap[key].lastDate) maintFreqMap[key].lastDate = d
  })
  const maintenanceFrequency = Object.values(maintFreqMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(m => ({ ...m, lastDate: m.lastDate ? new Date(m.lastDate).toISOString().slice(0, 10) : '—' }))

  // Most booked assets
  const bookingCountMap = {}
  bookings.forEach(b => {
    const name = b.asset?.name || 'Unknown'
    const tag  = b.asset?.assetTag || ''
    const cat  = b.asset?.category?.name || 'Unknown'
    const key  = b.asset?._id || name
    if (!bookingCountMap[key]) bookingCountMap[key] = { asset: name, tag, category: cat, bookings: 0 }
    bookingCountMap[key].bookings++
  })
  const mostUsed = Object.values(bookingCountMap)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5)

  // Monthly bookings (last 6 months)
  const monthlyBookings = (() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        count: 0,
      })
    }
    bookings.forEach(b => {
      const d = new Date(b.createdAt)
      const m = months.find(mo => mo.year === d.getFullYear() && mo.monthNum === d.getMonth())
      if (m) m.count++
    })
    return months
  })()

  // Idle/available assets sorted by last allocation date
  const allocationDateMap = {}
  allocations.forEach(a => {
    const key = a.asset?._id
    if (!key) return
    const d = a.createdAt
    if (!allocationDateMap[key] || d > allocationDateMap[key]) allocationDateMap[key] = d
  })
  const idleAssets = assets
    .filter(a => a.status === 'AVAILABLE')
    .map(a => {
      const lastUsed = allocationDateMap[a._id]
      const idleDays = lastUsed ? Math.floor((Date.now() - new Date(lastUsed)) / 86400000) : 999
      return { asset: a.name, tag: a.assetTag, category: a.category?.name || 'N/A', status: a.status, idleDays }
    })
    .sort((a, b) => b.idleDays - a.idleDays)
    .slice(0, 8)

  // Summary KPIs
  const activeAllocations = allocations.filter(a => a.status === 'ACTIVE').length
  const pendingBookings    = bookings.filter(b => b.status === 'PENDING').length
  const openMaintenance    = maintenances.filter(m => ['PENDING', 'APPROVED', 'IN_PROGRESS'].includes(m.status)).length

  return (
    <div className="reports-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Reports</p>
          <h1>Reports & Analytics</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={fetchData}>
            <span className="material-symbols-outlined">refresh</span> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--error-container)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-default)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
          <p>Loading reports…</p>
        </div>
      ) : (
        <>
          {/* ── KPI Strip ── */}
          <div className="reports-kpi-grid">
            <div className="reports-kpi-card">
              <span className="material-symbols-outlined" style={{ color: '#0052ff' }}>inventory_2</span>
              <div><div className="reports-kpi-val">{totalAssets}</div><div className="reports-kpi-label">Total Assets</div></div>
            </div>
            <div className="reports-kpi-card">
              <span className="material-symbols-outlined" style={{ color: '#0052ff' }}>assignment_ind</span>
              <div><div className="reports-kpi-val">{activeAllocations}</div><div className="reports-kpi-label">Active Allocations</div></div>
            </div>
            <div className="reports-kpi-card">
              <span className="material-symbols-outlined" style={{ color: '#d97706' }}>event_available</span>
              <div><div className="reports-kpi-val">{pendingBookings}</div><div className="reports-kpi-label">Pending Bookings</div></div>
            </div>
            <div className="reports-kpi-card">
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>build</span>
              <div><div className="reports-kpi-val">{openMaintenance}</div><div className="reports-kpi-label">Open Maintenance</div></div>
            </div>
          </div>

          {/* ── Row 1: Status Donut + Utilization by Category ── */}
          <div className="reports-row">

            {/* Status breakdown */}
            <div className="section-card reports-card">
              <div className="section-card-header">Asset Status Distribution</div>
              <div className="status-donut-wrap">
                <svg viewBox="0 0 120 120" className="status-donut">
                  {(() => {
                    let offset = 0
                    const circumference = 2 * Math.PI * 40
                    return statusSummary.map(s => {
                      const pct = totalAssets > 0 ? s.value / totalAssets : 0
                      const dash = pct * circumference
                      const el = (
                        <circle key={s.label} cx="60" cy="60" r="40"
                          fill="none" stroke={s.color} strokeWidth="18"
                          strokeDasharray={`${dash} ${circumference - dash}`}
                          strokeDashoffset={-offset * circumference}
                          transform="rotate(-90 60 60)"
                        />
                      )
                      offset += pct
                      return el
                    })
                  })()}
                  <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--on-surface)">{totalAssets}</text>
                  <text x="60" y="70" textAnchor="middle" fontSize="9" fill="var(--on-surface-variant)">Total Assets</text>
                </svg>
                <div className="donut-legend">
                  {statusSummary.map(s => (
                    <div key={s.label} className="donut-legend-item">
                      <span className="donut-dot" style={{ background: s.color }} />
                      <span>{s.label}</span>
                      <span className="donut-val">{s.value}</span>
                      <span className="donut-pct">{totalAssets > 0 ? Math.round(s.value / totalAssets * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Utilization by category */}
            <div className="section-card reports-card">
              <div className="section-card-header">
                Utilization by Category
                <div className="util-legend-inline">
                  <span className="util-dot util-allocated" /> Allocated
                  <span className="util-dot util-maintenance" /> Maintenance
                  <span className="util-dot util-available" /> Available
                </div>
              </div>
              <div className="util-body">
                {utilizationData.length === 0 ? (
                  <div className="empty-state"><span className="material-symbols-outlined">category</span><p>No category data</p></div>
                ) : (
                  utilizationData.map(row => <UtilizationBar key={row.category} row={row} />)
                )}
              </div>
            </div>
          </div>

          {/* ── Row 2: Monthly Bookings + Most Used ── */}
          <div className="reports-row">
            <div className="section-card reports-card">
              <div className="section-card-header">Monthly Booking Trend</div>
              {bookings.length === 0 ? (
                <div className="empty-state"><span className="material-symbols-outlined">event</span><p>No bookings yet</p></div>
              ) : (
                <BookingChart data={monthlyBookings} />
              )}
            </div>

            <div className="section-card reports-card">
              <div className="section-card-header">Most Booked Resources</div>
              {mostUsed.length === 0 ? (
                <div className="empty-state"><span className="material-symbols-outlined">event_available</span><p>No booking data yet</p></div>
              ) : (
                <div className="most-used-list">
                  {mostUsed.map((m, idx) => (
                    <div key={m.tag} className="most-used-row">
                      <span className="most-used-rank">#{idx + 1}</span>
                      <div className="most-used-info">
                        <code className="asset-tag-sm">{m.tag}</code>
                        <span className="most-used-name">{m.asset}</span>
                        <span className="badge badge-inactive">{m.category}</span>
                      </div>
                      <div className="most-used-bar-wrap">
                        <div className="most-used-bar" style={{ width: `${(m.bookings / (mostUsed[0]?.bookings || 1)) * 100}%` }} />
                      </div>
                      <span className="most-used-count">{m.bookings} bookings</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Row 3: Maintenance Frequency + Idle Assets ── */}
          <div className="reports-row">
            <div className="section-card reports-card">
              <div className="section-card-header">Maintenance Frequency</div>
              {maintenanceFrequency.length === 0 ? (
                <div className="empty-state"><span className="material-symbols-outlined">build</span><p>No maintenance records yet</p></div>
              ) : (
                <div className="table-card" style={{ boxShadow: 'none', border: 'none', marginTop: 0 }}>
                  <table>
                    <thead>
                      <tr><th>Asset</th><th>Tag</th><th>Incidents</th><th>Last Date</th></tr>
                    </thead>
                    <tbody>
                      {maintenanceFrequency.map(m => (
                        <tr key={m.tag}>
                          <td style={{ fontWeight: 500, fontSize: 13 }}>{m.asset}</td>
                          <td><code className="asset-tag-sm">{m.tag}</code></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--surface-container)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(m.count / (maintenanceFrequency[0]?.count || 1)) * 100}%`, background: '#d97706', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontWeight: 600, color: '#d97706' }}>{m.count}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{m.lastDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="section-card reports-card">
              <div className="section-card-header">Idle / Unallocated Assets</div>
              {idleAssets.length === 0 ? (
                <div className="empty-state"><span className="material-symbols-outlined">inventory_2</span><p>All assets are in use!</p></div>
              ) : (
                <div className="table-card" style={{ boxShadow: 'none', border: 'none', marginTop: 0 }}>
                  <table>
                    <thead>
                      <tr><th>Asset</th><th>Category</th><th>Idle Days</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {idleAssets.map(a => (
                        <tr key={a.tag}>
                          <td>
                            <code className="asset-tag-sm">{a.tag}</code>
                            <div style={{ fontWeight: 500, fontSize: 13, marginTop: 2 }}>{a.asset}</div>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{a.category}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: a.idleDays > 90 ? '#ba1a1a' : a.idleDays > 30 ? '#d97706' : '#16a34a' }}>
                              {a.idleDays === 999 ? 'Never used' : `${a.idleDays}d`}
                            </span>
                          </td>
                          <td><span className="badge badge-success">{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
