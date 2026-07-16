import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './AuditPage.css'
import assetService from '../services/assetService'
import employeeService from '../services/employeeService'

/* ─── Status Config ─────────────────────────── */
const STATUS_BADGE = {
  Completed:    'badge-success',
  'In Progress': 'badge-info',
  Scheduled:    'badge-warning',
  Cancelled:    'badge-inactive',
}

const ITEM_STATUS_BADGE = {
  Verified: 'item-verified',
  Missing:  'item-missing',
  Damaged:  'item-damaged',
  Pending:  'item-pending',
}

const ITEM_STATUS_ICON = {
  Verified: 'check_circle',
  Missing:  'search_off',
  Damaged:  'broken_image',
  Pending:  'radio_button_unchecked',
}

export default function AuditPage() {
  const [assets, setAssets]         = useState([])
  const [employees, setEmployees]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  /* Audit cycles stored locally (no backend endpoint yet) */
  const [cycles, setCycles]         = useState([])
  const [auditItems, setAuditItems] = useState([]) // { cycleId, assetId, assetName, assetTag, location, expectedLocation, status, notes }
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [filterItem, setFilterItem] = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState({ name: '', scope: '', start: '', end: '', auditors: '' })
  const [formError, setFormError]   = useState('')

  /* ── Fetch assets and employees ── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [asRes, empRes] = await Promise.all([
        assetService.getAll(),
        employeeService.getAll(),
      ])
      setAssets(asRes.data || asRes || [])
      setEmployees(empRes.data || empRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load asset data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── Computed ── */
  const cycleItems = auditItems.filter(i => i.cycleId === selectedCycle?.id)
  const filteredItems = cycleItems.filter(i => {
    const q = filterItem.toLowerCase()
    return !q || i.assetTag.toLowerCase().includes(q) || i.assetName.toLowerCase().includes(q) || i.status.toLowerCase().includes(q)
  })

  const verifyCounts = {
    Verified: cycleItems.filter(i => i.status === 'Verified').length,
    Missing:  cycleItems.filter(i => i.status === 'Missing').length,
    Damaged:  cycleItems.filter(i => i.status === 'Damaged').length,
    Pending:  cycleItems.filter(i => i.status === 'Pending').length,
  }
  const progress = cycleItems.length > 0
    ? Math.round((verifyCounts.Verified + verifyCounts.Missing + verifyCounts.Damaged) / cycleItems.length * 100)
    : 0

  const updateItemStatus = (id, newStatus) => {
    setAuditItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }

  /* ── Create new audit cycle and auto-populate with current assets ── */
  const handleSaveCycle = () => {
    if (!form.name.trim() || !form.scope.trim() || !form.start || !form.end) {
      setFormError('All fields except auditors are required.'); return
    }
    const newCycle = {
      id: Date.now(),
      name: form.name,
      scope: form.scope,
      start: form.start,
      end: form.end,
      status: 'In Progress',
      auditors: form.auditors ? form.auditors.split(',').map(s => s.trim()) : [],
      total: assets.length,
      verified: 0, missing: 0, damaged: 0,
    }
    setCycles(prev => [newCycle, ...prev])
    // Auto-populate audit items from all current assets
    const items = assets.map(a => ({
      id: `${newCycle.id}-${a._id}`,
      cycleId: newCycle.id,
      assetId: a._id,
      assetTag: a.assetTag,
      assetName: a.name,
      expectedLocation: a.location || a.department?.name || 'Unknown',
      location: null,
      status: 'Pending',
      notes: '',
    }))
    setAuditItems(prev => [...prev, ...items])
    setSelectedCycle(newCycle)
    setForm({ name: '', scope: '', start: '', end: '', auditors: '' })
    setFormError(''); setShowModal(false)
  }

  return (
    <div className="audit-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Asset Audit</p>
          <h1>Asset Audit</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => { setForm({ name: '', scope: '', start: '', end: '', auditors: '' }); setFormError(''); setShowModal(true) }}>
            <span className="material-symbols-outlined">add</span> New Audit Cycle
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--error-container)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-default)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          {error}
          <button className="btn btn-secondary btn-sm" onClick={fetchData} style={{ marginLeft: 'auto' }}>Retry</button>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
          <p>Loading asset inventory…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Live asset summary banner */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Assets', value: assets.length, color: '#0052ff', icon: 'inventory_2' },
              { label: 'Available', value: assets.filter(a => a.status === 'AVAILABLE').length, color: '#16a34a', icon: 'check_circle' },
              { label: 'Allocated', value: assets.filter(a => a.status === 'ALLOCATED').length, color: '#0052ff', icon: 'assignment_ind' },
              { label: 'Maintenance', value: assets.filter(a => a.status === 'UNDER_MAINTENANCE').length, color: '#d97706', icon: 'build' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-default)', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ color: s.color, fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="audit-layout">
            {/* ── Left: Cycle List ── */}
            <aside className="audit-sidebar">
              <div className="audit-sidebar-title">Audit Cycles</div>
              {cycles.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>fact_check</span>
                  No audit cycles yet.<br />
                  Create one to begin auditing your {assets.length} assets.
                </div>
              ) : (
                cycles.map(cycle => (
                  <button
                    key={cycle.id}
                    className={`audit-cycle-item ${selectedCycle?.id === cycle.id ? 'active' : ''}`}
                    onClick={() => setSelectedCycle(cycle)}
                  >
                    <div className="audit-cycle-item-top">
                      <span className="audit-cycle-name">{cycle.name}</span>
                      <span className={`badge ${STATUS_BADGE[cycle.status]}`} style={{ fontSize: 11 }}>{cycle.status}</span>
                    </div>
                    <div className="audit-cycle-meta">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>corporate_fare</span>
                      {cycle.scope}
                    </div>
                    <div className="audit-cycle-meta">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_today</span>
                      {cycle.start} → {cycle.end}
                    </div>
                    {cycle.total > 0 && (
                      <div className="audit-cycle-stats">
                        <span className="stat-verified">✓ {auditItems.filter(i => i.cycleId === cycle.id && i.status === 'Verified').length}</span>
                        <span className="stat-missing">✗ {auditItems.filter(i => i.cycleId === cycle.id && i.status === 'Missing').length}</span>
                        <span className="stat-damaged">⚠ {auditItems.filter(i => i.cycleId === cycle.id && i.status === 'Damaged').length}</span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </aside>

            {/* ── Right: Checklist ── */}
            <div className="audit-main">
              {selectedCycle ? (
                <>
                  {/* Cycle Header */}
                  <div className="audit-checklist-header">
                    <div>
                      <h2>{selectedCycle.name}</h2>
                      <div className="audit-checklist-meta">
                        <span className={`badge ${STATUS_BADGE[selectedCycle.status]}`}>{selectedCycle.status}</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>people</span>
                        <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{selectedCycle.auditors.join(', ') || 'No auditors assigned'}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="audit-progress-block">
                      <div className="audit-progress-bar-wrap">
                        <div className="audit-progress-bar" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="audit-progress-labels">
                        <span className="progress-label verified"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>{verifyCounts.Verified} Verified</span>
                        <span className="progress-label missing"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>search_off</span>{verifyCounts.Missing} Missing</span>
                        <span className="progress-label damaged"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>broken_image</span>{verifyCounts.Damaged} Damaged</span>
                        <span className="progress-label pending"><span className="material-symbols-outlined" style={{ fontSize: 14 }}>radio_button_unchecked</span>{verifyCounts.Pending} Pending</span>
                      </div>
                      <span className="progress-pct">{progress}% complete</span>
                    </div>
                  </div>

                  {/* Filter */}
                  <div className="table-search" style={{ maxWidth: 340, marginBottom: 12 }}>
                    <span className="material-symbols-outlined">search</span>
                    <input placeholder="Search by tag, asset, status…" value={filterItem} onChange={e => setFilterItem(e.target.value)} />
                    {filterItem && <button className="btn-ghost" style={{ padding: '2px' }} onClick={() => setFilterItem('')}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span></button>}
                  </div>

                  {/* Checklist Table */}
                  <div className="table-card">
                    <table>
                      <thead>
                        <tr>
                          <th>Asset Tag</th>
                          <th>Asset Name</th>
                          <th>Expected Location</th>
                          <th>Status</th>
                          <th>Notes</th>
                          <th>Mark As</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.length === 0
                          ? <tr><td colSpan={6}><div className="empty-state"><span className="material-symbols-outlined">fact_check</span><p>No audit items match your search.</p></div></td></tr>
                          : filteredItems.map(item => (
                              <tr key={item.id}>
                                <td><code className="asset-tag">{item.assetTag}</code></td>
                                <td style={{ fontWeight: 500 }}>{item.assetName}</td>
                                <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{item.expectedLocation}</td>
                                <td>
                                  <span className={`audit-item-status ${ITEM_STATUS_BADGE[item.status]}`}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{ITEM_STATUS_ICON[item.status]}</span>
                                    {item.status}
                                  </span>
                                </td>
                                <td style={{ fontSize: 12, color: 'var(--on-surface-variant)', maxWidth: 180 }}>{item.notes || '—'}</td>
                                <td>
                                  {item.status === 'Pending' && (
                                    <div className="row-actions">
                                      <button className="audit-action-btn verified" onClick={() => updateItemStatus(item.id, 'Verified')} title="Mark Verified">
                                        <span className="material-symbols-outlined">check</span>
                                      </button>
                                      <button className="audit-action-btn missing" onClick={() => updateItemStatus(item.id, 'Missing')} title="Mark Missing">
                                        <span className="material-symbols-outlined">search_off</span>
                                      </button>
                                      <button className="audit-action-btn damaged" onClick={() => updateItemStatus(item.id, 'Damaged')} title="Mark Damaged">
                                        <span className="material-symbols-outlined">broken_image</span>
                                      </button>
                                    </div>
                                  )}
                                  {item.status !== 'Pending' && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => updateItemStatus(item.id, 'Pending')} title="Reset to Pending">
                                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>undo</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>
                    {filteredItems.length > 0 && (
                      <div className="table-footer">
                        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} · {progress}% audited
                      </div>
                    )}
                  </div>

                  {/* Discrepancy Report */}
                  {(verifyCounts.Missing > 0 || verifyCounts.Damaged > 0) && (
                    <div className="discrepancy-report">
                      <div className="discrepancy-title">
                        <span className="material-symbols-outlined icon-filled">warning</span>
                        Discrepancy Report
                      </div>
                      {cycleItems.filter(i => i.status === 'Missing' || i.status === 'Damaged').map(item => (
                        <div key={item.id} className={`discrepancy-item ${item.status === 'Missing' ? 'discrepancy-missing' : 'discrepancy-damaged'}`}>
                          <code className="asset-tag-sm">{item.assetTag}</code>
                          <span style={{ fontWeight: 500, fontSize: 13 }}>{item.assetName}</span>
                          <span className={`audit-item-status ${ITEM_STATUS_BADGE[item.status]}`} style={{ marginLeft: 'auto' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{ITEM_STATUS_ICON[item.status]}</span>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state" style={{ paddingTop: 80 }}>
                  <span className="material-symbols-outlined">fact_check</span>
                  <p>Create a new audit cycle to start auditing your <strong>{assets.length}</strong> assets.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── New Audit Cycle Modal ── */}
      {showModal && (
        <Modal
          title="New Audit Cycle"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCycle}>
                <span className="material-symbols-outlined">fact_check</span> Create Cycle
              </button>
            </>
          }
        >
            {formError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{formError}</div>}
            <div style={{ background: 'var(--surface-container-low)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>info</span>
              This cycle will auto-populate with all <strong>{assets.length}</strong> assets currently in the system.
            </div>
            <div className="form-field">
              <label>Cycle Name <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Q3 2026 Full Audit" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Scope <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. All Departments / Engineering / Vehicles" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Start Date <span className="required">*</span></label>
                <input className="form-input" type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>End Date <span className="required">*</span></label>
                <input className="form-input" type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
              </div>
            </div>
            <div className="form-field">
              <label>Auditors</label>
              <select className="form-input form-select" multiple size={Math.min(employees.length + 1, 5)}
                onChange={e => setForm(f => ({ ...f, auditors: Array.from(e.target.selectedOptions).map(o => o.value).join(', ') }))}>
                {employees.map(emp => <option key={emp._id} value={emp.name}>{emp.name}</option>)}
              </select>
              <span style={{ fontSize: 11, color: 'var(--outline)', marginTop: 4 }}>Hold Ctrl/Cmd to select multiple</span>
            </div>
        </Modal>
      )}
    </div>
  )
}
