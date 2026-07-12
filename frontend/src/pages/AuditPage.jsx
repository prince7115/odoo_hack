import { useState } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './AuditPage.css'

/* ─── Seed Data ─────────────────────────────── */
const seedCycles = [
  { id: 1, name: 'Q2 2026 Full Audit',       scope: 'All Departments',  start: '2026-04-01', end: '2026-04-15', status: 'Completed', auditors: ['Priya Shah', 'Arjun Nair'],  total: 120, verified: 115, missing: 3, damaged: 2 },
  { id: 2, name: 'Engineering Spot Check',   scope: 'Engineering Dept', start: '2026-06-10', end: '2026-06-12', status: 'Completed', auditors: ['Aditi Rao'],               total: 34,  verified: 32,  missing: 1, damaged: 1 },
  { id: 3, name: 'Q3 2026 Partial Audit',    scope: 'IT + Facilities',  start: '2026-07-01', end: '2026-07-20', status: 'In Progress', auditors: ['Priya Shah', 'Rohan Mehta'], total: 58, verified: 41, missing: 0, damaged: 2 },
  { id: 4, name: 'Vehicle Fleet Audit',      scope: 'Vehicles',         start: '2026-07-15', end: '2026-07-16', status: 'Scheduled',  auditors: ['Vikram Das'],              total: 6,   verified: 0,   missing: 0, damaged: 0 },
]

const seedItems = [
  { id: 1, cycleId: 3, tag: 'AF-0114', asset: 'Dell Laptop XPS 15',       location: 'IT Dept',         expected: 'IT Dept',       status: 'Verified',  notes: '' },
  { id: 2, cycleId: 3, tag: 'AF-0062', asset: 'Epson Projector EB-S41',   location: 'Storage Room',    expected: 'Conference B',  status: 'Damaged',   notes: 'Outer casing cracked, lens intact' },
  { id: 3, cycleId: 3, tag: 'AF-0031', asset: 'Herman Miller Aeron Chair',location: 'Engineering',     expected: 'Engineering',   status: 'Verified',  notes: '' },
  { id: 4, cycleId: 3, tag: 'AF-0088', asset: 'Spectrum Analyzer R&S',    location: 'Lab Room 1',      expected: 'Lab Room 1',    status: 'Verified',  notes: '' },
  { id: 5, cycleId: 3, tag: 'AF-0105', asset: 'iPhone 14 Pro (Company)',  location: null,              expected: 'HR Dept',       status: 'Missing',   notes: 'Not found at expected location' },
  { id: 6, cycleId: 3, tag: 'AF-0022', asset: 'LG 32" Monitor 4K',        location: 'Design Studio',   expected: 'Design Studio', status: 'Verified',  notes: '' },
  { id: 7, cycleId: 3, tag: 'AF-0130', asset: 'Cisco IP Phone 8841',      location: 'Reception',       expected: 'Reception',     status: 'Verified',  notes: '' },
  { id: 8, cycleId: 3, tag: 'AF-0011', asset: 'Boardroom Table — 12 Seat',location: 'Boardroom',       expected: 'Boardroom',     status: 'Pending',   notes: '' },
]

const STATUS_BADGE = {
  Completed:   'badge-success',
  'In Progress': 'badge-info',
  Scheduled:   'badge-warning',
  Cancelled:   'badge-inactive',
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

const AUDITORS = ['Priya Shah', 'Rohan Mehta', 'Aditi Rao', 'Arjun Nair', 'Vikram Das', 'Sana Iqbal']

export default function AuditPage() {
  const [cycles, setCycles]           = useState(seedCycles)
  const [items, setItems]             = useState(seedItems)
  const [selectedCycle, setSelectedCycle] = useState(seedCycles[2]) // default to In Progress
  const [filterItem, setFilterItem]   = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState({ name: '', scope: '', start: '', end: '', auditors: '' })
  const [formError, setFormError]     = useState('')

  const cycleItems = items.filter(i => i.cycleId === selectedCycle?.id)
  const filteredItems = cycleItems.filter(i => {
    const q = filterItem.toLowerCase()
    return !q || i.tag.toLowerCase().includes(q) || i.asset.toLowerCase().includes(q) || i.status.toLowerCase().includes(q)
  })

  const verifyCounts = {
    Verified: cycleItems.filter(i => i.status === 'Verified').length,
    Missing:  cycleItems.filter(i => i.status === 'Missing').length,
    Damaged:  cycleItems.filter(i => i.status === 'Damaged').length,
    Pending:  cycleItems.filter(i => i.status === 'Pending').length,
  }
  const progress = cycleItems.length > 0 ? Math.round((verifyCounts.Verified + verifyCounts.Missing + verifyCounts.Damaged) / cycleItems.length * 100) : 0

  const updateItemStatus = (id, newStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }

  const handleSaveCycle = () => {
    if (!form.name.trim() || !form.scope.trim() || !form.start || !form.end) {
      setFormError('All fields except auditors are required.'); return
    }
    const newCycle = {
      id: Date.now(), name: form.name, scope: form.scope, start: form.start, end: form.end,
      status: 'Scheduled', auditors: form.auditors ? form.auditors.split(',').map(s => s.trim()) : [],
      total: 0, verified: 0, missing: 0, damaged: 0,
    }
    setCycles(prev => [...prev, newCycle])
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
          <button className="btn btn-secondary">
            <span className="material-symbols-outlined">download</span> Export Report
          </button>
          <button className="btn btn-primary" onClick={() => { setForm({ name: '', scope: '', start: '', end: '', auditors: '' }); setFormError(''); setShowModal(true) }}>
            <span className="material-symbols-outlined">add</span> New Audit Cycle
          </button>
        </div>
      </div>

      <div className="audit-layout">
        {/* ── Left: Cycle List ── */}
        <aside className="audit-sidebar">
          <div className="audit-sidebar-title">Audit Cycles</div>
          {cycles.map(cycle => (
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
              {cycle.status !== 'Scheduled' && cycle.total > 0 && (
                <div className="audit-cycle-stats">
                  <span className="stat-verified">✓ {cycle.verified}</span>
                  <span className="stat-missing">✗ {cycle.missing}</span>
                  <span className="stat-damaged">⚠ {cycle.damaged}</span>
                </div>
              )}
            </button>
          ))}
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
                      <th>Found At</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Mark As</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0
                      ? <tr><td colSpan={7}><div className="empty-state"><span className="material-symbols-outlined">fact_check</span><p>No audit items match your search.</p></div></td></tr>
                      : filteredItems.map(item => (
                          <tr key={item.id}>
                            <td><code className="asset-tag">{item.tag}</code></td>
                            <td style={{ fontWeight: 500 }}>{item.asset}</td>
                            <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{item.expected}</td>
                            <td style={{ fontSize: 13 }}>
                              {item.location
                                ? <span style={{ color: item.location === item.expected ? 'var(--success)' : 'var(--warning)' }}>{item.location}</span>
                                : <span style={{ color: 'var(--error)', fontStyle: 'italic' }}>Not found</span>
                              }
                            </td>
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
                      <code className="asset-tag-sm">{item.tag}</code>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{item.asset}</span>
                      <span className={`audit-item-status ${ITEM_STATUS_BADGE[item.status]}`} style={{ marginLeft: 'auto' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{ITEM_STATUS_ICON[item.status]}</span>
                        {item.status}
                      </span>
                      {item.notes && <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>— {item.notes}</span>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ paddingTop: 80 }}>
              <span className="material-symbols-outlined">fact_check</span>
              <p>Select an audit cycle to view its checklist.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── New Audit Cycle Modal ── */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h2>New Audit Cycle</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="modal-body">
            {formError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{formError}</div>}
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
              <input className="form-input" placeholder="e.g. Priya Shah, Rohan Mehta" value={form.auditors} onChange={e => setForm(f => ({ ...f, auditors: e.target.value }))} />
              <span style={{ fontSize: 11, color: 'var(--outline)', marginTop: 4 }}>Comma-separated names</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveCycle}>
              <span className="material-symbols-outlined">fact_check</span> Create Cycle
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
