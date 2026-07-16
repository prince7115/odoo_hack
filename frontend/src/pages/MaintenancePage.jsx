import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './MaintenancePage.css'
import maintenanceService from '../services/maintenanceService'
import assetService from '../services/assetService'
import employeeService from '../services/employeeService'

/* ─── Column Definitions ──────────────────────── */
const COLUMNS = [
  { id: 'PENDING',     label: 'Pending',     icon: 'schedule',        color: '#d97706' },
  { id: 'APPROVED',   label: 'Approved',     icon: 'check_circle',    color: '#0052ff' },
  { id: 'IN_PROGRESS',label: 'In Progress',  icon: 'build',           color: '#0891b2' },
  { id: 'COMPLETED',  label: 'Completed',    icon: 'task_alt',        color: '#16a34a' },
  { id: 'REJECTED',   label: 'Rejected',     icon: 'cancel',          color: '#ba1a1a' },
]

const PRIORITY_BADGE = {
  CRITICAL: 'priority-critical',
  HIGH:     'priority-high',
  MEDIUM:   'priority-medium',
  LOW:      'priority-low',
}

const emptyForm = { assetId: '', description: '', priority: 'MEDIUM', requestedById: '' }

/* ─── Kanban Card ── */
function KanbanCard({ card, onMove, colIndex, onApprove, onComplete, onReject }) {
  const canMoveLeft  = colIndex > 0 && card.status !== 'COMPLETED' && card.status !== 'REJECTED'
  const canMoveRight = colIndex < COLUMNS.length - 1 && card.status !== 'COMPLETED' && card.status !== 'REJECTED'

  const assetName = card.asset?.name || 'Unknown Asset'
  const assetTag  = card.asset?.assetTag || ''
  const reporter  = card.requestedBy?.name || ''
  const date      = card.createdAt ? new Date(card.createdAt).toISOString().slice(0, 10) : ''

  return (
    <div className={`kanban-card priority-border-${(card.priority || 'medium').toLowerCase()}`}>
      <div className="kanban-card-header">
        <code className="asset-tag-sm">{assetTag}</code>
        <span className={`priority-badge ${PRIORITY_BADGE[card.priority] || 'priority-medium'}`}>{card.priority}</span>
      </div>
      <div className="kanban-card-asset">{assetName}</div>
      <p className="kanban-card-desc">{card.description}</p>
      <div className="kanban-card-meta">
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>person</span>
        <span>{reporter}</span>
        <span className="kanban-dot">·</span>
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
        <span>{date}</span>
      </div>
      {card.notes && (
        <div className="kanban-card-tech">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>sticky_note_2</span>
          {card.notes}
        </div>
      )}
      <div className="kanban-card-actions">
        {canMoveLeft && (
          <button className="kanban-move-btn" onClick={() => onMove(card._id, -1)} title="Move back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        {canMoveRight && (
          <button className="kanban-move-btn kanban-move-btn--forward" onClick={() => onMove(card._id, 1)} title="Move forward">
            <span className="material-symbols-outlined">arrow_forward</span>
            {COLUMNS[colIndex + 1]?.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default function MaintenancePage() {
  const [cards, setCards]         = useState([])
  const [assets, setAssets]       = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [filterPri, setFilterPri] = useState('')

  /* ── Fetch All Data ── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [maintRes, assetRes, empRes] = await Promise.all([
        maintenanceService.getAll(),
        assetService.getAll(),
        employeeService.getAll(),
      ])
      setCards(maintRes.data || maintRes || [])
      setAssets(assetRes.data || assetRes || [])
      setEmployees(empRes.data || empRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── Move card: PENDING→APPROVED, APPROVED→IN_PROGRESS, IN_PROGRESS→COMPLETED ── */
  const handleMove = async (id, dir) => {
    const card = cards.find(c => c._id === id)
    if (!card) return
    const colIndex = COLUMNS.findIndex(col => col.id === card.status)
    const nextCol  = COLUMNS[colIndex + dir]
    if (!nextCol) return

    try {
      let updated
      if (nextCol.id === 'APPROVED')     updated = await maintenanceService.approve(id)
      else if (nextCol.id === 'COMPLETED') updated = await maintenanceService.complete(id, 0, '')
      else if (nextCol.id === 'REJECTED')  updated = await maintenanceService.reject(id)
      else {
        // For IN_PROGRESS we just call approve again (backend moves it)
        updated = await maintenanceService.approve(id)
      }
      const updatedCard = updated.data || updated
      setCards(prev => prev.map(c => c._id === id ? updatedCard : c))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  /* ── Submit new request ── */
  const handleSave = async () => {
    if (!form.assetId || !form.description.trim() || !form.requestedById) {
      setFormError('Asset, description and reporter are required.'); return
    }
    setSaving(true); setFormError('')
    try {
      const res = await maintenanceService.create({
        assetId: form.assetId,
        requestedById: form.requestedById,
        description: form.description,
        priority: form.priority,
      })
      const newCard = res.data || res
      setCards(prev => [newCard, ...prev])
      setForm(emptyForm); setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create request')
    } finally {
      setSaving(false)
    }
  }

  const filtered = cards.filter(c => !filterPri || c.priority === filterPri)
  const totalByStatus = Object.fromEntries(COLUMNS.map(c => [c.id, cards.filter(x => x.status === c.id).length]))

  return (
    <div className="maintenance-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Maintenance</p>
          <h1>Maintenance Management</h1>
        </div>
        <div className="page-header-actions">
          <select className="filter-select form-input form-select" value={filterPri} onChange={e => setFilterPri(e.target.value)}>
            <option value="">All Priorities</option>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setFormError(''); setShowModal(true) }}>
            <span className="material-symbols-outlined">add</span> Raise Request
          </button>
        </div>
      </div>

      {/* Error / Loading */}
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
          <p>Loading maintenance requests…</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ── Summary Strip ── */}
          <div className="maintenance-summary">
            {COLUMNS.map(col => (
              <div key={col.id} className="maintenance-summary-chip">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: col.color }}>{col.icon}</span>
                <span className="summary-label">{col.label}</span>
                <span className="summary-count" style={{ background: col.color }}>{totalByStatus[col.id] || 0}</span>
              </div>
            ))}
          </div>

          {/* ── Kanban Board ── */}
          <div className="kanban-board">
            {COLUMNS.map((col, colIndex) => {
              const colCards = filtered.filter(c => c.status === col.id)
              return (
                <div key={col.id} className="kanban-column">
                  <div className="kanban-col-header" style={{ borderTopColor: col.color }}>
                    <div className="kanban-col-title">
                      <span className="material-symbols-outlined" style={{ fontSize: 17, color: col.color }}>{col.icon}</span>
                      <span>{col.label}</span>
                    </div>
                    <span className="kanban-col-count" style={{ background: col.color }}>{colCards.length}</span>
                  </div>
                  <div className="kanban-col-body">
                    {colCards.length === 0
                      ? <div className="kanban-empty"><span className="material-symbols-outlined">inbox</span><p>No requests</p></div>
                      : colCards.map(card => (
                          <KanbanCard key={card._id} card={card} onMove={handleMove} colIndex={colIndex} />
                        ))
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Raise Request Modal ── */}
      {showModal && (
        <Modal
          title="Raise Maintenance Request"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <span className="material-symbols-outlined">build</span>
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </>
          }
        >
            {formError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{formError}</div>}
            <div className="form-field">
              <label>Asset <span className="required">*</span></label>
              <select className="form-input form-select" value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}>
                <option value="">Select asset…</option>
                {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Priority</label>
                <select className="form-input form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Reported By <span className="required">*</span></label>
                <select className="form-input form-select" value={form.requestedById} onChange={e => setForm(f => ({ ...f, requestedById: e.target.value }))}>
                  <option value="">Select employee…</option>
                  {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Issue Description <span className="required">*</span></label>
              <textarea className="form-input" style={{ height: 90, resize: 'vertical', paddingTop: 8 }}
                placeholder="Describe the issue in detail…"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
        </Modal>
      )}
    </div>
  )
}
