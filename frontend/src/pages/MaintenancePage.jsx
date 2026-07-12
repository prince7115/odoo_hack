import { useState } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './MaintenancePage.css'

/* ─── Seed Data ─────────────────────────────── */
const COLUMNS = [
  { id: 'Pending',    label: 'Pending',     icon: 'schedule',        color: '#d97706' },
  { id: 'Approved',  label: 'Approved',     icon: 'check_circle',    color: '#0052ff' },
  { id: 'Assigned',  label: 'Assigned',     icon: 'assignment_ind',  color: '#7c3aed' },
  { id: 'InProgress',label: 'In Progress',  icon: 'build',           color: '#0891b2' },
  { id: 'Resolved',  label: 'Resolved',     icon: 'task_alt',        color: '#16a34a' },
]

const seedCards = [
  { id: 1,  asset: 'Oscilloscope Rigol DS1054Z', tag: 'AF-0093', desc: 'Display flickering intermittently during measurements', priority: 'High',   status: 'Pending',    technician: null,          reportedBy: 'Arjun Nair',  date: '2026-07-10', photo: false },
  { id: 2,  asset: 'Forklift Komatsu FG25T',     tag: 'AF-0055', desc: 'Hydraulic lift not reaching full height, possible leak', priority: 'Critical',status:'Approved',   technician: null,          reportedBy: 'Rohan Mehta', date: '2026-07-09', photo: false },
  { id: 3,  asset: 'Epson Projector EB-S41',     tag: 'AF-0062', desc: 'Lamp needs replacement, brightness below threshold',      priority: 'Medium', status: 'Assigned',   technician: 'Ravi Kumar',  reportedBy: 'Priya Shah',  date: '2026-07-08', photo: false },
  { id: 4,  asset: 'Toyota Innova',              tag: 'AF-0078', desc: 'Engine warning light on, requires diagnostic scan',       priority: 'High',   status: 'InProgress', technician: 'Suresh Auto', reportedBy: 'Vikram Das',  date: '2026-07-07', photo: false },
  { id: 5,  asset: 'Canon DSLR EOS 90D',         tag: 'AF-0007', desc: 'Shutter mechanism jammed, unable to take photos',         priority: 'Low',    status: 'Resolved',   technician: 'TechCare',    reportedBy: 'Aditi Rao',   date: '2026-07-05', photo: false },
  { id: 6,  asset: 'Dell Laptop XPS 15',         tag: 'AF-0114', desc: 'Battery not charging beyond 40%, possible battery wear',  priority: 'Medium', status: 'Pending',    technician: null,          reportedBy: 'Priya Shah',  date: '2026-07-11', photo: false },
  { id: 7,  asset: 'Cisco IP Phone 8841',        tag: 'AF-0130', desc: 'Audio distortion on incoming calls, crackle noise',       priority: 'Low',    status: 'InProgress', technician: 'Ravi Kumar',  reportedBy: 'Sana Iqbal',  date: '2026-07-06', photo: false },
]

const PRIORITY_BADGE = {
  Critical: 'priority-critical',
  High:     'priority-high',
  Medium:   'priority-medium',
  Low:      'priority-low',
}

const ASSETS = [
  'Dell Laptop XPS 15 (AF-0114)', 'Epson Projector EB-S41 (AF-0062)',
  'Toyota Innova (AF-0078)', 'Oscilloscope Rigol DS1054Z (AF-0093)',
  'Forklift Komatsu FG25T (AF-0055)', 'Canon DSLR EOS 90D (AF-0007)',
  'Cisco IP Phone 8841 (AF-0130)',
]
const REPORTERS = ['Priya Shah', 'Rohan Mehta', 'Aditi Rao', 'Arjun Nair', 'Vikram Das', 'Sana Iqbal']
const TECHNICIANS = ['Ravi Kumar', 'Suresh Auto', 'TechCare', 'InHouse IT', 'ExternalVendor']

const emptyForm = { asset: '', tag: '', desc: '', priority: 'Medium', reportedBy: '' }

/* ─── Kanban Card ── */
function KanbanCard({ card, onMove, colIndex }) {
  const canMoveLeft  = colIndex > 0
  const canMoveRight = colIndex < COLUMNS.length - 1

  return (
    <div className={`kanban-card priority-border-${card.priority.toLowerCase()}`}>
      <div className="kanban-card-header">
        <code className="asset-tag-sm">{card.tag}</code>
        <span className={`priority-badge ${PRIORITY_BADGE[card.priority]}`}>{card.priority}</span>
      </div>
      <div className="kanban-card-asset">{card.asset}</div>
      <p className="kanban-card-desc">{card.desc}</p>
      <div className="kanban-card-meta">
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>person</span>
        <span>{card.reportedBy}</span>
        <span className="kanban-dot">·</span>
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
        <span>{card.date}</span>
      </div>
      {card.technician && (
        <div className="kanban-card-tech">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>engineering</span>
          {card.technician}
        </div>
      )}
      <div className="kanban-card-actions">
        {canMoveLeft && (
          <button className="kanban-move-btn" onClick={() => onMove(card.id, -1)} title="Move back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        {canMoveRight && (
          <button className="kanban-move-btn kanban-move-btn--forward" onClick={() => onMove(card.id, 1)} title="Move forward">
            <span className="material-symbols-outlined">arrow_forward</span>
            {COLUMNS[colIndex + 1]?.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default function MaintenancePage() {
  const [cards, setCards]         = useState(seedCards)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [filterPri, setFilterPri] = useState('')

  const filtered = cards.filter(c => !filterPri || c.priority === filterPri)

  const handleMove = (id, dir) => {
    setCards(prev => prev.map(c => {
      if (c.id !== id) return c
      const colIndex = COLUMNS.findIndex(col => col.id === c.status)
      const nextCol  = COLUMNS[colIndex + dir]
      if (!nextCol) return c
      return { ...c, status: nextCol.id }
    }))
  }

  const handleSave = () => {
    if (!form.asset || !form.desc.trim() || !form.reportedBy) {
      setFormError('Asset, description and reporter are required.'); return
    }
    const parts = form.asset.match(/\(([^)]+)\)/)
    const tag   = parts ? parts[1] : 'AF-0000'
    const name  = form.asset.replace(/\s*\([^)]+\)/, '')
    setCards(prev => [...prev, {
      id: Date.now(), asset: name, tag, desc: form.desc,
      priority: form.priority, status: 'Pending',
      technician: null, reportedBy: form.reportedBy,
      date: new Date().toISOString().slice(0, 10), photo: false,
    }])
    setForm(emptyForm); setFormError(''); setShowModal(false)
  }

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
            {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setFormError(''); setShowModal(true) }}>
            <span className="material-symbols-outlined">add</span> Raise Request
          </button>
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="maintenance-summary">
        {COLUMNS.map(col => (
          <div key={col.id} className="maintenance-summary-chip">
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: col.color }}>{col.icon}</span>
            <span className="summary-label">{col.label}</span>
            <span className="summary-count" style={{ background: col.color }}>{totalByStatus[col.id]}</span>
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
                      <KanbanCard key={card.id} card={card} onMove={handleMove} colIndex={colIndex} />
                    ))
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Raise Request Modal ── */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h2>Raise Maintenance Request</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="modal-body">
            {formError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{formError}</div>}
            <div className="form-field">
              <label>Asset <span className="required">*</span></label>
              <select className="form-input form-select" value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))}>
                <option value="">Select asset…</option>
                {ASSETS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Priority</label>
                <select className="form-input form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Reported By <span className="required">*</span></label>
                <select className="form-input form-select" value={form.reportedBy} onChange={e => setForm(f => ({ ...f, reportedBy: e.target.value }))}>
                  <option value="">Select employee…</option>
                  {REPORTERS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Issue Description <span className="required">*</span></label>
              <textarea className="form-input" style={{ height: 90, resize: 'vertical', paddingTop: 8 }}
                placeholder="Describe the issue in detail…"
                value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <span className="material-symbols-outlined">build</span> Submit Request
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
