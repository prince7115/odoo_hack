import { useState } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './AllocationPage.css'

/* ─── Seed Data ─────────────────────────────── */
const seedAllocations = [
  { id: 1,  asset: 'Dell Laptop XPS 15',        tag: 'AF-0114', employee: 'Priya Shah',   dept: 'IT Dept',       allocated: '2024-03-01', expectedReturn: '2025-03-01', status: 'Active',    conditionNotes: 'Good condition at allocation', initials: 'PS', color: 'rose' },
  { id: 2,  asset: 'Toyota Innova',              tag: 'AF-0078', employee: 'Rohan Mehta',  dept: 'Facilities',    allocated: '2023-11-15', expectedReturn: '2024-11-15', status: 'Active',    conditionNotes: 'Minor scratch on rear bumper', initials: 'RM', color: 'teal' },
  { id: 3,  asset: 'iPhone 14 Pro (Company)',    tag: 'AF-0105', employee: 'Aditi Rao',    dept: 'Engineering',   allocated: '2024-01-10', expectedReturn: '2025-01-10', status: 'Active',    conditionNotes: '', initials: 'AR', color: 'blue' },
  { id: 4,  asset: 'Spectrum Analyzer R&S',      tag: 'AF-0088', employee: 'Arjun Nair',   dept: 'Engineering',   allocated: '2024-02-20', expectedReturn: '2024-08-20', status: 'Overdue',   conditionNotes: 'Lab equipment — handle with care', initials: 'AN', color: 'orange' },
  { id: 5,  asset: 'Canon DSLR EOS 90D',         tag: 'AF-0007', employee: 'Vikram Das',   dept: 'Procurement',   allocated: '2023-05-01', expectedReturn: '2024-05-01', status: 'Returned',  conditionNotes: 'Returned in good condition', initials: 'VD', color: 'blue' },
]

const seedTransfers = [
  { id: 1, asset: 'Dell Laptop XPS 15',       tag: 'AF-0114', from: 'Priya Shah',   to: 'Arjun Nair',   reason: 'Department reassignment',    status: 'Pending',  date: '2024-07-10' },
  { id: 2, asset: 'Epson Projector EB-S41',   tag: 'AF-0062', from: 'Rohan Mehta',  to: 'Sana Iqbal',   reason: 'Field Ops needs projector',  status: 'Approved', date: '2024-07-08' },
  { id: 3, asset: 'LG 32" Monitor 4K',        tag: 'AF-0022', from: 'Aditi Rao',    to: 'Vikram Das',   reason: 'Design Studio to Procurement', status: 'Reallocated', date: '2024-07-01' },
  { id: 4, asset: 'Cisco IP Phone 8841',      tag: 'AF-0130', from: 'Reception',    to: 'Aditi Rao',    reason: 'Reception desk cleared',     status: 'Rejected', date: '2024-06-28' },
]

const EMPLOYEES = ['Priya Shah', 'Rohan Mehta', 'Aditi Rao', 'Arjun Nair', 'Vikram Das', 'Sana Iqbal']
const ASSETS_AVAILABLE = [
  { tag: 'AF-0062', name: 'Epson Projector EB-S41' },
  { tag: 'AF-0031', name: 'Herman Miller Aeron Chair' },
  { tag: 'AF-0011', name: 'Boardroom Table — 12 Seat' },
  { tag: 'AF-0130', name: 'Cisco IP Phone 8841' },
  { tag: 'AF-0022', name: 'LG 32" Monitor 4K' },
]

const allocStatusBadge = { Active: 'badge-success', Overdue: 'badge-error', Returned: 'badge-inactive' }
const transferStatusBadge = { Pending: 'badge-warning', Approved: 'badge-success', Reallocated: 'badge-info', Rejected: 'badge-error' }
const transferStatusIcon  = { Pending: 'schedule', Approved: 'check_circle', Reallocated: 'swap_horiz', Rejected: 'cancel' }

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''
}

const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'rose']
const randomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

const emptyAllocForm    = { assetTag: '', assetName: '', employee: '', dept: '', expectedReturn: '', conditionNotes: '' }
const emptyTransferForm = { assetTag: '', assetName: '', from: '', to: '', reason: '' }

export default function AllocationPage() {
  const [activeTab, setActiveTab] = useState('allocations')
  const [allocations, setAllocations]   = useState(seedAllocations)
  const [transfers, setTransfers]       = useState(seedTransfers)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  /* Allocation modal */
  const [showAllocModal, setShowAllocModal] = useState(false)
  const [allocForm, setAllocForm]           = useState(emptyAllocForm)
  const [allocError, setAllocError]         = useState('')

  /* Transfer modal */
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferForm, setTransferForm]           = useState(emptyTransferForm)
  const [transferError, setTransferError]         = useState('')

  /* ── Filter Data ── */
  const filteredAlloc = allocations.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.asset.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.employee.toLowerCase().includes(q)
    const matchStatus = !filterStatus || a.status === filterStatus
    return matchSearch && matchStatus
  })

  const filteredTransfers = transfers.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.asset.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q) || t.from.toLowerCase().includes(q) || t.to.toLowerCase().includes(q)
    const matchStatus = !filterStatus || t.status === filterStatus
    return matchSearch && matchStatus
  })

  /* ── Save Allocation ── */
  const handleSaveAlloc = () => {
    if (!allocForm.assetTag || !allocForm.employee || !allocForm.expectedReturn) {
      setAllocError('Asset, employee, and return date are required.')
      return
    }
    const color = randomColor()
    setAllocations(prev => [...prev, {
      id: Date.now(), asset: allocForm.assetName, tag: allocForm.assetTag,
      employee: allocForm.employee, dept: allocForm.dept || 'N/A',
      allocated: new Date().toISOString().slice(0, 10),
      expectedReturn: allocForm.expectedReturn,
      status: 'Active', conditionNotes: allocForm.conditionNotes,
      initials: initials(allocForm.employee), color,
    }])
    setAllocForm(emptyAllocForm); setAllocError(''); setShowAllocModal(false)
  }

  /* ── Save Transfer ── */
  const handleSaveTransfer = () => {
    if (!transferForm.assetTag || !transferForm.from || !transferForm.to || !transferForm.reason.trim()) {
      setTransferError('All fields are required.')
      return
    }
    if (transferForm.from === transferForm.to) {
      setTransferError('From and To employee must be different.')
      return
    }
    setTransfers(prev => [...prev, {
      id: Date.now(), asset: transferForm.assetName, tag: transferForm.assetTag,
      from: transferForm.from, to: transferForm.to, reason: transferForm.reason,
      status: 'Pending', date: new Date().toISOString().slice(0, 10),
    }])
    setTransferForm(emptyTransferForm); setTransferError(''); setShowTransferModal(false)
  }

  /* ── Approve / Reject Transfer ── */
  const handleTransferAction = (id, action) => {
    const nextStatus = action === 'approve' ? 'Approved' : 'Rejected'
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t))
  }

  const allocationStatuses = ['Active', 'Overdue', 'Returned']
  const transferStatuses   = ['Pending', 'Approved', 'Reallocated', 'Rejected']

  return (
    <div className="allocation-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Allocation & Transfer</p>
          <h1>Allocation & Transfer</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => { setShowTransferModal(true); setTransferError('') }}>
            <span className="material-symbols-outlined">swap_horiz</span> Request Transfer
          </button>
          <button className="btn btn-primary" onClick={() => { setShowAllocModal(true); setAllocError('') }}>
            <span className="material-symbols-outlined">assignment_ind</span> Allocate Asset
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'allocations' ? 'active' : ''}`} onClick={() => { setActiveTab('allocations'); setSearch(''); setFilterStatus('') }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment_ind</span>
          Allocations <span className="tab-count">{allocations.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => { setActiveTab('transfers'); setSearch(''); setFilterStatus('') }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
          Transfer Requests <span className="tab-count">{transfers.filter(t => t.status === 'Pending').length > 0 ? <span className="tab-badge">{transfers.filter(t => t.status === 'Pending').length}</span> : transfers.length}</span>
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="assets-toolbar">
        <div className="table-search" style={{ flex: 1, maxWidth: 340 }}>
          <span className="material-symbols-outlined">search</span>
          <input placeholder={activeTab === 'allocations' ? 'Search by asset, employee…' : 'Search by asset, from/to…'} value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="btn-ghost" style={{ padding: '2px' }} onClick={() => setSearch('')}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span></button>}
        </div>
        <select className="filter-select form-input form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {(activeTab === 'allocations' ? allocationStatuses : transferStatuses).map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterStatus) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus('') }}>
            <span className="material-symbols-outlined">filter_list_off</span> Clear
          </button>
        )}
      </div>

      {/* ── Allocations Tab ── */}
      {activeTab === 'allocations' && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Assigned To</th>
                <th>Department</th>
                <th>Allocated On</th>
                <th>Expected Return</th>
                <th>Status</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredAlloc.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><span className="material-symbols-outlined">assignment_ind</span><p>No allocations found.</p></div></td></tr>
              ) : filteredAlloc.map(alloc => (
                <tr key={alloc.id}>
                  <td>
                    <div>
                      <code className="asset-tag">{alloc.tag}</code>
                      <div style={{ fontWeight: 500, marginTop: 4, fontSize: 13 }}>{alloc.asset}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-avatar">
                      <div className={`avatar avatar-${alloc.color}`}>{alloc.initials}</div>
                      <div>
                        <div className="name">{alloc.employee}</div>
                        <div className="sub">{alloc.dept}</div>
                      </div>
                    </div>
                  </td>
                  <td>{alloc.dept}</td>
                  <td>{alloc.allocated}</td>
                  <td>
                    <span style={{ color: alloc.status === 'Overdue' ? 'var(--error)' : 'inherit', fontWeight: alloc.status === 'Overdue' ? 600 : 400 }}>
                      {alloc.expectedReturn}
                      {alloc.status === 'Overdue' && <span className="overdue-flag"> ⚠ Overdue</span>}
                    </span>
                  </td>
                  <td><span className={`badge ${allocStatusBadge[alloc.status]}`}>{alloc.status}</span></td>
                  <td><span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{alloc.conditionNotes || '—'}</span></td>
                  <td>
                    <div className="row-actions">
                      {alloc.status === 'Active' && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => setTransfers(prev => [...prev, { id: Date.now(), asset: alloc.asset, tag: alloc.tag, from: alloc.employee, to: '', reason: '', status: 'Pending', date: new Date().toISOString().slice(0, 10) }])}>
                            <span className="material-symbols-outlined">swap_horiz</span>
                          </button>
                          <button className="btn btn-ghost btn-sm">
                            <span className="material-symbols-outlined">assignment_return</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAlloc.length > 0 && (
            <div className="table-footer">Showing <strong>{filteredAlloc.length}</strong> of <strong>{allocations.length}</strong> allocations</div>
          )}
        </div>
      )}

      {/* ── Transfers Tab ── */}
      {activeTab === 'transfers' && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><span className="material-symbols-outlined">swap_horiz</span><p>No transfer requests found.</p></div></td></tr>
              ) : filteredTransfers.map(t => (
                <tr key={t.id}>
                  <td>
                    <div>
                      <code className="asset-tag">{t.tag}</code>
                      <div style={{ fontWeight: 500, marginTop: 4, fontSize: 13 }}>{t.asset}</div>
                    </div>
                  </td>
                  <td>
                    <div className="transfer-person">
                      <div className="avatar avatar-blue">{initials(t.from)}</div>
                      <span>{t.from}</span>
                    </div>
                  </td>
                  <td>
                    <div className="transfer-person">
                      <div className="avatar avatar-teal">{initials(t.to)}</div>
                      <span>{t.to || <span style={{ color: 'var(--outline)' }}>TBD</span>}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--on-surface-variant)' }}>{t.reason}</td>
                  <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{t.date}</td>
                  <td>
                    <span className={`badge ${transferStatusBadge[t.status]}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{transferStatusIcon[t.status]}</span>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.status === 'Pending' && (
                      <div className="row-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => handleTransferAction(t.id, 'approve')}>
                          <span className="material-symbols-outlined">check</span> Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleTransferAction(t.id, 'reject')}>
                          <span className="material-symbols-outlined">close</span> Reject
                        </button>
                      </div>
                    )}
                    {t.status !== 'Pending' && <span style={{ color: 'var(--outline)', fontSize: 13 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransfers.length > 0 && (
            <div className="table-footer">Showing <strong>{filteredTransfers.length}</strong> of <strong>{transfers.length}</strong> requests</div>
          )}
        </div>
      )}

      {/* ── Allocate Asset Modal ── */}
      {showAllocModal && (
        <Modal onClose={() => setShowAllocModal(false)}>
          <div className="modal-header">
            <h2>Allocate Asset</h2>
            <button className="modal-close" onClick={() => setShowAllocModal(false)}><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="modal-body">
            {allocError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{allocError}</div>}
            <div className="form-field">
              <label>Asset <span className="required">*</span></label>
              <select className="form-input form-select" value={allocForm.assetTag} onChange={e => {
                const a = ASSETS_AVAILABLE.find(x => x.tag === e.target.value)
                setAllocForm(f => ({ ...f, assetTag: e.target.value, assetName: a?.name || '' }))
              }}>
                <option value="">Select available asset…</option>
                {ASSETS_AVAILABLE.map(a => <option key={a.tag} value={a.tag}>{a.tag} — {a.name}</option>)}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Assign To <span className="required">*</span></label>
                <select className="form-input form-select" value={allocForm.employee} onChange={e => setAllocForm(f => ({ ...f, employee: e.target.value }))}>
                  <option value="">Select employee…</option>
                  {EMPLOYEES.map(emp => <option key={emp}>{emp}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Department</label>
                <input className="form-input" placeholder="e.g. Engineering" value={allocForm.dept} onChange={e => setAllocForm(f => ({ ...f, dept: e.target.value }))} />
              </div>
            </div>
            <div className="form-field">
              <label>Expected Return Date <span className="required">*</span></label>
              <input className="form-input" type="date" value={allocForm.expectedReturn} onChange={e => setAllocForm(f => ({ ...f, expectedReturn: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Condition Notes</label>
              <textarea className="form-input" style={{ height: 72, resize: 'vertical', paddingTop: 8 }} placeholder="Describe the asset condition at time of allocation…" value={allocForm.conditionNotes} onChange={e => setAllocForm(f => ({ ...f, conditionNotes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAllocModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveAlloc}>
              <span className="material-symbols-outlined">assignment_ind</span> Allocate
            </button>
          </div>
        </Modal>
      )}

      {/* ── Request Transfer Modal ── */}
      {showTransferModal && (
        <Modal onClose={() => setShowTransferModal(false)}>
          <div className="modal-header">
            <h2>Request Asset Transfer</h2>
            <button className="modal-close" onClick={() => setShowTransferModal(false)}><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="modal-body">
            {transferError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{transferError}</div>}
            <div className="form-field">
              <label>Asset <span className="required">*</span></label>
              <select className="form-input form-select" value={transferForm.assetTag} onChange={e => {
                const a = ASSETS_AVAILABLE.find(x => x.tag === e.target.value)
                setTransferForm(f => ({ ...f, assetTag: e.target.value, assetName: a?.name || '' }))
              }}>
                <option value="">Select asset…</option>
                {ASSETS_AVAILABLE.map(a => <option key={a.tag} value={a.tag}>{a.tag} — {a.name}</option>)}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Transfer From <span className="required">*</span></label>
                <select className="form-input form-select" value={transferForm.from} onChange={e => setTransferForm(f => ({ ...f, from: e.target.value }))}>
                  <option value="">Select employee…</option>
                  {EMPLOYEES.map(emp => <option key={emp}>{emp}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Transfer To <span className="required">*</span></label>
                <select className="form-input form-select" value={transferForm.to} onChange={e => setTransferForm(f => ({ ...f, to: e.target.value }))}>
                  <option value="">Select employee…</option>
                  {EMPLOYEES.filter(e => e !== transferForm.from).map(emp => <option key={emp}>{emp}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Reason for Transfer <span className="required">*</span></label>
              <textarea className="form-input" style={{ height: 80, resize: 'vertical', paddingTop: 8 }} placeholder="Describe why this transfer is needed…" value={transferForm.reason} onChange={e => setTransferForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            <div className="conflict-notice">
              <span className="material-symbols-outlined icon-filled">info</span>
              Transfer requests go to the Asset Manager for approval before taking effect.
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveTransfer}>
              <span className="material-symbols-outlined">swap_horiz</span> Submit Request
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
