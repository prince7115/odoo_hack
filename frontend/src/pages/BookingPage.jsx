import { useState } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './BookingPage.css'

/* ─── Seed Data ─────────────────────────────── */
const BOOKABLE_ASSETS = [
  { tag: 'AF-0062', name: 'Epson Projector EB-S41',    category: 'Electronics', location: 'Conference B' },
  { tag: 'AF-0011', name: 'Boardroom Table — 12 Seat', category: 'Furniture',   location: 'Boardroom' },
  { tag: 'AF-0078', name: 'Toyota Innova',              category: 'Vehicles',    location: 'Parking Lot A' },
]

const EMPLOYEES = ['Priya Shah', 'Rohan Mehta', 'Aditi Rao', 'Arjun Nair', 'Vikram Das', 'Sana Iqbal']

function todayStr() { return new Date().toISOString().slice(0, 10) }
function nowStr()   {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const seedBookings = [
  { id: 1,  asset: 'Epson Projector EB-S41',    tag: 'AF-0062', bookedBy: 'Priya Shah',   date: todayStr(), start: '09:00', end: '10:30', status: 'Confirmed', initials: 'PS', color: 'rose' },
  { id: 2,  asset: 'Boardroom Table — 12 Seat', tag: 'AF-0011', bookedBy: 'Aditi Rao',    date: todayStr(), start: '14:00', end: '16:00', status: 'Confirmed', initials: 'AR', color: 'blue' },
  { id: 3,  asset: 'Toyota Innova',             tag: 'AF-0078', bookedBy: 'Rohan Mehta',  date: todayStr(), start: '11:00', end: '13:00', status: 'Pending',   initials: 'RM', color: 'teal' },
  { id: 4,  asset: 'Epson Projector EB-S41',    tag: 'AF-0062', bookedBy: 'Arjun Nair',   date: todayStr(), start: '15:00', end: '17:00', status: 'Confirmed', initials: 'AN', color: 'orange' },
  { id: 5,  asset: 'Boardroom Table — 12 Seat', tag: 'AF-0011', bookedBy: 'Vikram Das',   date: todayStr(), start: '10:00', end: '11:30', status: 'Cancelled', initials: 'VD', color: 'blue' },
  { id: 6,  asset: 'Toyota Innova',             tag: 'AF-0078', bookedBy: 'Sana Iqbal',   date: '2026-07-13', start: '08:00', end: '12:00', status: 'Confirmed', initials: 'SI', color: 'purple' },
  { id: 7,  asset: 'Epson Projector EB-S41',    tag: 'AF-0062', bookedBy: 'Priya Shah',   date: '2026-07-13', start: '09:00', end: '11:00', status: 'Confirmed', initials: 'PS', color: 'rose' },
]

const statusBadge = { Confirmed: 'badge-success', Pending: 'badge-warning', Cancelled: 'badge-inactive' }
const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'rose']

function timeToMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '' }
function randomColor() { return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] }

/* ── Timeline Column for one asset ── */
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8) // 08:00–17:00
const TOTAL_MINS = 9 * 60

function TimelineRow({ asset, bookings, onSlotClick }) {
  const assetBookings = bookings.filter(b => b.tag === asset.tag && b.status !== 'Cancelled')

  return (
    <div className="timeline-row">
      <div className="timeline-asset-label">
        <span className="material-symbols-outlined timeline-icon">inventory_2</span>
        <div>
          <div className="timeline-asset-name">{asset.name}</div>
          <div className="timeline-asset-loc">{asset.location}</div>
        </div>
      </div>
      <div className="timeline-track" onClick={onSlotClick}>
        {/* Hour grid lines */}
        {HOURS.map(h => (
          <div key={h} className="timeline-hour-line" style={{ left: `${((h - 8) / 9) * 100}%` }}>
            <span className="timeline-hour-label">{String(h).padStart(2, '0')}:00</span>
          </div>
        ))}
        {/* Booking blocks */}
        {assetBookings.map(b => {
          const startMins = timeToMin(b.start) - 480
          const durMins   = timeToMin(b.end) - timeToMin(b.start)
          const left  = `${(startMins / TOTAL_MINS) * 100}%`
          const width = `${(durMins   / TOTAL_MINS) * 100}%`
          return (
            <div
              key={b.id}
              className={`booking-block booking-block--${b.status.toLowerCase()}`}
              style={{ left, width }}
              title={`${b.bookedBy} · ${b.start}–${b.end}`}
            >
              <span className="booking-block-text">{b.bookedBy}</span>
              <span className="booking-block-time">{b.start}–{b.end}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const emptyForm = { assetTag: '', assetName: '', bookedBy: '', date: todayStr(), start: '', end: '' }

export default function BookingPage() {
  const [bookings, setBookings]         = useState(seedBookings)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [filterAsset, setFilterAsset]   = useState('')
  const [view, setView]                 = useState('timeline') // 'timeline' | 'list'
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [formError, setFormError]       = useState('')
  const [conflict, setConflict]         = useState(null)

  /* Day bookings for timeline */
  const dayBookings = bookings.filter(b => b.date === selectedDate)

  /* List view filtered */
  const listBookings = bookings.filter(b => {
    const matchDate  = !selectedDate || b.date === selectedDate
    const matchAsset = !filterAsset  || b.tag  === filterAsset
    return matchDate && matchAsset
  })

  /* ── Conflict Check ── */
  const checkConflict = (assetTag, date, start, end, excludeId = null) => {
    const existing = bookings.filter(b =>
      b.tag === assetTag && b.date === date && b.status !== 'Cancelled' && b.id !== excludeId
    )
    return existing.find(b => {
      const newS = timeToMin(start), newE = timeToMin(end)
      const exS  = timeToMin(b.start), exE = timeToMin(b.end)
      return newS < exE && newE > exS
    })
  }

  /* ── Save Booking ── */
  const handleSave = () => {
    if (!form.assetTag || !form.bookedBy || !form.date || !form.start || !form.end) {
      setFormError('All fields are required.'); return
    }
    if (timeToMin(form.end) <= timeToMin(form.start)) {
      setFormError('End time must be after start time.'); return
    }
    const existing = checkConflict(form.assetTag, form.date, form.start, form.end)
    if (existing) {
      setConflict(existing)
      setFormError(`⚠ Conflict! This asset is already booked by ${existing.bookedBy} from ${existing.start}–${existing.end}.`)
      return
    }
    const color = randomColor()
    setBookings(prev => [...prev, {
      id: Date.now(), asset: form.assetName, tag: form.assetTag,
      bookedBy: form.bookedBy, date: form.date, start: form.start, end: form.end,
      status: 'Confirmed', initials: initials(form.bookedBy), color,
    }])
    setForm(emptyForm); setFormError(''); setConflict(null); setShowModal(false)
  }

  const handleFormChange = (field, value) => {
    setForm(f => {
      const updated = { ...f, [field]: value }
      if (field === 'assetTag') {
        const asset = BOOKABLE_ASSETS.find(a => a.tag === value)
        updated.assetName = asset?.name || ''
      }
      return updated
    })
    setFormError(''); setConflict(null)
  }

  /* ── Cancel Booking ── */
  const handleCancel = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b))
  }

  return (
    <div className="booking-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Resource Booking</p>
          <h1>Resource Booking</h1>
        </div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button className={`view-btn ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>
              <span className="material-symbols-outlined">view_timeline</span> Timeline
            </button>
            <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <span className="material-symbols-outlined">list</span> List
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm({ ...emptyForm, date: selectedDate }); setFormError(''); setConflict(null); setShowModal(true) }}>
            <span className="material-symbols-outlined">add</span> Book Resource
          </button>
        </div>
      </div>

      {/* ── Date Picker Bar ── */}
      <div className="booking-date-bar">
        <button className="btn btn-ghost" onClick={() => {
          const d = new Date(selectedDate); d.setDate(d.getDate() - 1)
          setSelectedDate(d.toISOString().slice(0, 10))
        }}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="booking-date-display">
          <span className="material-symbols-outlined">calendar_today</span>
          <input type="date" className="date-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <button className="btn btn-ghost" onClick={() => {
          const d = new Date(selectedDate); d.setDate(d.getDate() + 1)
          setSelectedDate(d.toISOString().slice(0, 10))
        }}>
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(todayStr())}>Today</button>
        <div className="booking-day-summary">
          <span className={`badge ${dayBookings.filter(b => b.status !== 'Cancelled').length > 0 ? 'badge-info' : 'badge-inactive'}`}>
            {dayBookings.filter(b => b.status !== 'Cancelled').length} bookings today
          </span>
        </div>
      </div>

      {/* ── TIMELINE VIEW ── */}
      {view === 'timeline' && (
        <div className="timeline-card">
          <div className="timeline-header">
            <span className="timeline-header-label">Resource</span>
            <span className="timeline-time-label">08:00</span>
            <span className="timeline-time-label">12:00</span>
            <span className="timeline-time-label">17:00</span>
          </div>
          <div className="timeline-body">
            {BOOKABLE_ASSETS.map(asset => (
              <TimelineRow
                key={asset.tag}
                asset={asset}
                bookings={dayBookings}
                onSlotClick={() => { setForm({ ...emptyForm, assetTag: asset.tag, assetName: asset.name, date: selectedDate }); setFormError(''); setConflict(null); setShowModal(true) }}
              />
            ))}
          </div>
          <div className="timeline-legend">
            <span className="legend-item"><span className="legend-dot legend-confirmed" />Confirmed</span>
            <span className="legend-item"><span className="legend-dot legend-pending" />Pending</span>
            <span className="legend-item"><span className="legend-dot legend-free" />Available — Click to Book</span>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <>
          <div className="assets-toolbar">
            <select className="filter-select form-input form-select" value={filterAsset} onChange={e => setFilterAsset(e.target.value)}>
              <option value="">All Resources</option>
              {BOOKABLE_ASSETS.map(a => <option key={a.tag} value={a.tag}>{a.name}</option>)}
            </select>
            {filterAsset && (
              <button className="btn btn-ghost btn-sm" onClick={() => setFilterAsset('')}>
                <span className="material-symbols-outlined">filter_list_off</span> Clear
              </button>
            )}
          </div>

          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Booked By</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listBookings.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><span className="material-symbols-outlined">event</span><p>No bookings for this day.</p></div></td></tr>
                ) : listBookings.map(b => {
                  const dur = timeToMin(b.end) - timeToMin(b.start)
                  const hrs = Math.floor(dur / 60), mins = dur % 60
                  return (
                    <tr key={b.id}>
                      <td>
                        <div>
                          <code className="asset-tag">{b.tag}</code>
                          <div style={{ fontWeight: 500, marginTop: 4, fontSize: 13 }}>{b.asset}</div>
                        </div>
                      </td>
                      <td>
                        <div className="cell-with-avatar">
                          <div className={`avatar avatar-${b.color}`}>{b.initials}</div>
                          <span className="name">{b.bookedBy}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: b.date === todayStr() ? 'var(--primary)' : 'inherit', fontWeight: b.date === todayStr() ? 600 : 400 }}>
                        {b.date === todayStr() ? 'Today' : b.date}
                      </td>
                      <td>
                        <div className="time-slot-cell">
                          <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--outline)' }}>schedule</span>
                          {b.start} – {b.end}
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                        {hrs > 0 ? `${hrs}h ` : ''}{mins > 0 ? `${mins}m` : ''}
                      </td>
                      <td><span className={`badge ${statusBadge[b.status]}`}>{b.status}</span></td>
                      <td>
                        {b.status === 'Confirmed' || b.status === 'Pending' ? (
                          <button className="btn btn-ghost btn-sm" title="Cancel booking" onClick={() => handleCancel(b.id)}>
                            <span className="material-symbols-outlined">event_busy</span>
                          </button>
                        ) : <span style={{ color: 'var(--outline)' }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {listBookings.length > 0 && (
              <div className="table-footer">Showing <strong>{listBookings.length}</strong> booking{listBookings.length !== 1 ? 's' : ''}</div>
            )}
          </div>
        </>
      )}

      {/* ── Book Resource Modal ── */}
      {showModal && (
        <Modal
          title="Book a Resource"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <span className="material-symbols-outlined">event_available</span> Confirm Booking
              </button>
            </>
          }
        >
            {formError && (
              <div className={`form-error-msg ${conflict ? 'form-error-conflict' : ''}`}>
                <span className="material-symbols-outlined">{conflict ? 'warning' : 'error'}</span>
                {formError}
              </div>
            )}

            <div className="form-field">
              <label>Resource <span className="required">*</span></label>
              <select className="form-input form-select" value={form.assetTag} onChange={e => handleFormChange('assetTag', e.target.value)}>
                <option value="">Select bookable resource…</option>
                {BOOKABLE_ASSETS.map(a => <option key={a.tag} value={a.tag}>{a.tag} — {a.name} ({a.location})</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Booked By <span className="required">*</span></label>
              <select className="form-input form-select" value={form.bookedBy} onChange={e => handleFormChange('bookedBy', e.target.value)}>
                <option value="">Select employee…</option>
                {EMPLOYEES.map(emp => <option key={emp}>{emp}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Date <span className="required">*</span></label>
              <input className="form-input" type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} />
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Start Time <span className="required">*</span></label>
                <input className="form-input" type="time" value={form.start} onChange={e => handleFormChange('start', e.target.value)} />
              </div>
              <div className="form-field">
                <label>End Time <span className="required">*</span></label>
                <input className="form-input" type="time" value={form.end} onChange={e => handleFormChange('end', e.target.value)} />
              </div>
            </div>

            {form.assetTag && form.date && (
              <div className="conflict-notice">
                <span className="material-symbols-outlined icon-filled">info</span>
                <div>
                  <strong>Existing bookings for this resource on {form.date}:</strong>
                  <ul style={{ marginTop: 4, paddingLeft: 16, fontSize: 12 }}>
                    {bookings.filter(b => b.tag === form.assetTag && b.date === form.date && b.status !== 'Cancelled').length === 0
                      ? <li>No bookings — this slot is free!</li>
                      : bookings.filter(b => b.tag === form.assetTag && b.date === form.date && b.status !== 'Cancelled').map(b => (
                          <li key={b.id}>{b.start}–{b.end} · {b.bookedBy}</li>
                        ))
                    }
                  </ul>
                </div>
              </div>
            )}
        </Modal>
      )}
    </div>
  )
}
