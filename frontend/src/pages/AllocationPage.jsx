import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './AllocationPage.css'
import allocationService from '../services/allocationService'
import assetService from '../services/assetService'
import employeeService from '../services/employeeService'

/* ─── Constants ─────────────────────────────── */
const allocStatusBadge = { ACTIVE: 'badge-success', OVERDUE: 'badge-error', RETURNED: 'badge-inactive', Active: 'badge-success', Overdue: 'badge-error', Returned: 'badge-inactive' }
const transferStatusBadge = { PENDING: 'badge-warning', APPROVED: 'badge-success', COMPLETED: 'badge-info', REJECTED: 'badge-error', Pending: 'badge-warning', Approved: 'badge-success', Reallocated: 'badge-info', Rejected: 'badge-error' }
const transferStatusIcon  = { PENDING: 'schedule', APPROVED: 'check_circle', COMPLETED: 'swap_horiz', REJECTED: 'cancel', Pending: 'schedule', Approved: 'check_circle', Reallocated: 'swap_horiz', Rejected: 'cancel' }

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''
}

const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'rose']
const randomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
const getColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]

const emptyAllocForm    = { assetId: '', employeeId: '', expectedReturn: '', conditionNotes: '' }
const emptyTransferForm = { allocationId: '', toEmployeeId: '', reason: '' }

export default function AllocationPage() {
  const [activeTab, setActiveTab] = useState('allocations')
  const [allocations, setAllocations]   = useState([])
  const [transfers, setTransfers]       = useState([])
  const [assets, setAssets]             = useState([])
  const [employees, setEmployees]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  /* Allocation modal */
  const [showAllocModal, setShowAllocModal] = useState(false)
  const [allocForm, setAllocForm]           = useState(emptyAllocForm)
  const [allocError, setAllocError]         = useState('')
  const [saving, setSaving]                 = useState(false)

  /* Transfer modal */
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferForm, setTransferForm]           = useState(emptyTransferForm)
  const [transferError, setTransferError]         = useState('')

  /* ── Fetch Data ── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [allocRes, assetRes, empRes] = await Promise.all([
        allocationService.getAll(),
        assetService.getAll(),
        employeeService.getAll(),
      ])
      setAllocations(allocRes.data || allocRes || [])
      setAssets(assetRes.data || assetRes || [])
      setEmployees(empRes.data || empRes || [])
    } catch (err) {
      console.error('Failed to load allocation data:', err)
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── Filter Data ── */
  const filteredAlloc = allocations.filter(a => {
    const q = search.toLowerCase()
    const assetName = a.assetName || a.asset || ''
    const empName = a.employeeName || a.employee || ''
    const tag = a.assetTag || a.tag || ''
    const matchSearch = !q || assetName.toLowerCase().includes(q) || tag.toLowerCase().includes(q) || empName.toLowerCase().includes(q)
    const matchStatus = !filterStatus || a.status === filterStatus
    return matchSearch && matchStatus
  })

  const filteredTransfers = transfers.filter(t => {
    const q = search.toLowerCase()
    const assetName = t.assetName || t.asset || ''
    const tag = t.assetTag || t.tag || ''
    const fromName = t.fromEmployeeName || t.from || ''
    const toName = t.toEmployeeName || t.to || ''
    const matchSearch = !q || assetName.toLowerCase().includes(q) || tag.toLowerCase().includes(q) || fromName.toLowerCase().includes(q) || toName.toLowerCase().includes(q)
    const matchStatus = !filterStatus || t.status === filterStatus
    return matchSearch && matchStatus
  })

  /* ── Save Allocation ── */
  const handleSaveAlloc = async () => {
    if (!allocForm.assetId || !allocForm.employeeId || !allocForm.expectedReturn) {
      setAllocError('Asset, employee, and return date are required.')
      return
    }
    setSaving(true)
    try {
      await allocationService.allocate({
        assetId: Number(allocForm.assetId),
        employeeId: Number(allocForm.employeeId),
        expectedReturnDate: allocForm.expectedReturn,
        conditionNotes: allocForm.conditionNotes,
      })
      setAllocForm(emptyAllocForm); setAllocError(''); setShowAllocModal(false)
      await fetchData()
    } catch (err) {
      setAllocError(err.response?.data?.message || 'Failed to allocate asset')
    } finally {
      setSaving(false)
    }
  }

  /* ── Save Transfer ── */
  const handleSaveTransfer = async () => {
    if (!transferForm.allocationId || !transferForm.toEmployeeId || !transferForm.reason.trim()) {
      setTransferError('All fields are required.')
      return
    }
    setSaving(true)
    try {
      await allocationService.transfer(transferForm.allocationId, {
        toEmployeeId: Number(transferForm.toEmployeeId),
        reason: transferForm.reason,
      })
      setTransferForm(emptyTransferForm); setTransferError(''); setShowTransferModal(false)
      await fetchData()
    } catch (err) {
      setTransferError(err.response?.data?.message || 'Failed to submit transfer')
    } finally {
      setSaving(false)
    }
  }

  /* ── Return Asset ── */
  const handleReturn = async (id) => {
    try {
      await allocationService.returnAsset(id, 'GOOD', 'Returned by user')
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return asset')
    }
  }

  /* ── Transfer Action (Approve/Reject) ── */
  const handleTransferAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await allocationService.transfer(id, { approved: true })
      } else {
        await allocationService.transfer(id, { approved: false })
      }
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} transfer`)
    }
  }

  const allocationStatuses = ['ACTIVE', 'OVERDUE', 'RETURNED', 'Active', 'Overdue', 'Returned']
  const transferStatuses   = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'Pending', 'Approved', 'Reallocated', 'Rejected']

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
              ) : filteredAlloc.map(alloc => {
                const empName = alloc.employeeName || alloc.employee || ''
                const assetName = alloc.assetName || alloc.asset || ''
                const tag = alloc.assetTag || alloc.tag || ''
                const dept = alloc.departmentName || alloc.dept || ''
                const allocDate = alloc.allocationDate || alloc.allocated || ''
                const retDate = alloc.expectedReturnDate || alloc.expectedReturn || ''
                const isOverdue = alloc.status === 'Overdue' || alloc.status === 'OVERDUE'
                const isActive = alloc.status === 'Active' || alloc.status === 'ACTIVE'
                return (
                <tr key={alloc.id}>
                  <td>
                    <div>
                      <code className="asset-tag">{tag}</code>
                      <div style={{ fontWeight: 500, marginTop: 4, fontSize: 13 }}>{assetName}</div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-avatar">
                      <div className={`avatar avatar-${getColor(alloc.id)}`}>{initials(empName)}</div>
                      <div>
                        <div className="name">{empName}</div>
                        <div className="sub">{dept}</div>
                      </div>
                    </div>
                  </td>
                  <td>{dept}</td>
                  <td>{allocDate}</td>
                  <td>
                    <span style={{ color: isOverdue ? 'var(--error)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                      {retDate}
                      {isOverdue && <span className="overdue-flag"> ⚠ Overdue</span>}
                    </span>
                  </td>
                  <td><span className={`badge ${allocStatusBadge[alloc.status] || 'badge-inactive'}`}>{alloc.status}</span></td>
                  <td><span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{alloc.conditionNotes || '—'}</span></td>
                  <td>
                    <div className="row-actions">
                      {isActive && (
                        <>
                          <button className="btn btn-secondary btn-sm" title="Transfer" onClick={() => { setTransferForm({ allocationId: alloc.id, toEmployeeId: '', reason: '' }); setTransferError(''); setShowTransferModal(true) }}>
                            <span className="material-symbols-outlined">swap_horiz</span>
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Return" onClick={() => handleReturn(alloc.id)}>
                            <span className="material-symbols-outlined">assignment_return</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
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
        <Modal
          title="Allocate Asset"
          onClose={() => setShowAllocModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAllocModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveAlloc} disabled={saving}>
                <span className="material-symbols-outlined">assignment_ind</span> {saving ? 'Allocating…' : 'Allocate'}
              </button>
            </>
          }
        >
            {allocError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{allocError}</div>}
            <div className="form-field">
              <label>Asset <span className="required">*</span></label>
              <select className="form-input form-select" value={allocForm.assetId} onChange={e => setAllocForm(f => ({ ...f, assetId: e.target.value }))}>
                <option value="">Select available asset…</option>
                {assets.filter(a => a.status === 'AVAILABLE').map(a => <option key={a.id} value={a.id}>{a.assetTag || a.id} — {a.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Assign To <span className="required">*</span></label>
              <select className="form-input form-select" value={allocForm.employeeId} onChange={e => setAllocForm(f => ({ ...f, employeeId: e.target.value }))}>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Expected Return Date <span className="required">*</span></label>
              <input className="form-input" type="date" value={allocForm.expectedReturn} onChange={e => setAllocForm(f => ({ ...f, expectedReturn: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Condition Notes</label>
              <textarea className="form-input" style={{ height: 72, resize: 'vertical', paddingTop: 8 }} placeholder="Describe the asset condition at time of allocation…" value={allocForm.conditionNotes} onChange={e => setAllocForm(f => ({ ...f, conditionNotes: e.target.value }))} />
            </div>
        </Modal>
      )}

      {/* ── Request Transfer Modal ── */}
      {showTransferModal && (
        <Modal
          title="Request Asset Transfer"
          onClose={() => setShowTransferModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveTransfer} disabled={saving}>
                <span className="material-symbols-outlined">swap_horiz</span> {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </>
          }
        >
            {transferError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{transferError}</div>}
            <div className="form-field">
              <label>Transfer Allocation <span className="required">*</span></label>
              <select className="form-input form-select" value={transferForm.allocationId} onChange={e => setTransferForm(f => ({ ...f, allocationId: e.target.value }))}>
                <option value="">Select active allocation…</option>
                {allocations.filter(a => a.status === 'ACTIVE' || a.status === 'Active').map(a => <option key={a.id} value={a.id}>{a.assetTag || a.tag} — {a.assetName || a.asset} (→ {a.employeeName || a.employee})</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Transfer To <span className="required">*</span></label>
              <select className="form-input form-select" value={transferForm.toEmployeeId} onChange={e => setTransferForm(f => ({ ...f, toEmployeeId: e.target.value }))}>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Reason for Transfer <span className="required">*</span></label>
              <textarea className="form-input" style={{ height: 80, resize: 'vertical', paddingTop: 8 }} placeholder="Describe why this transfer is needed…" value={transferForm.reason} onChange={e => setTransferForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            <div className="conflict-notice">
              <span className="material-symbols-outlined icon-filled">info</span>
              Transfer requests go to the Asset Manager for approval before taking effect.
            </div>
        </Modal>
      )}
    </div>
  )
}
