import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './BookingPage.css'
import bookingService from '../services/bookingService'
import assetService from '../services/assetService'
import employeeService from '../services/employeeService'

function todayStr() { return new Date().toISOString().slice(0, 10) }
function timeToMin(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function formatDateStr(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}
function initials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '' }

const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'rose']
const getColor = (str) => AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length]

const statusBadge = {
  APPROVED: 'badge-success', PENDING: 'badge-warning',
  CANCELLED: 'badge-inactive', REJECTED: 'badge-error', COMPLETED: 'badge-info'
}

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8) // 08:00–17:00
const TOTAL_MINS = 9 * 60

/* ── Timeline Row for one asset ── */
function TimelineRow({ asset, bookings, onSlotClick }) {
  const assetBookings = bookings.filter(b =>
    b.asset?._id === asset._id && b.status !== 'CANCELLED' && b.status !== 'REJECTED'
  )
  return (
    <div className="timeline-row">
      <div className="timeline-asset-label">
        <span className="material-symbols-outlined timeline-icon">inventory_2</span>
        <div>
          <div className="timeline-asset-name">{asset.name}</div>
          <div className="timeline-asset-loc">{asset.location || asset.assetTag}</div>
        </div>
      </div>
      <div className="timeline-track" onClick={onSlotClick}>
        {HOURS.map(h => (
          <div key={h} className="timeline-hour-line" style={{ left: `${((h - 8) / 9) * 100}%` }}>
            <span className="timeline-hour-label">{String(h).padStart(2, '0')}:00</span>
          </div>
        ))}
        {assetBookings.map(b => {
          const start = formatTime(b.startTime)
          const end   = formatTime(b.endTime)
          const startMins = timeToMin(start) - 480
          const durMins   = timeToMin(end) - timeToMin(start)
          if (startMins < 0 || durMins <= 0) return null
          const left  = `${(startMins / TOTAL_MINS) * 100}%`
          const width = `${(durMins   / TOTAL_MINS) * 100}%`
          return (
            <div
              key={b._id}
              className={`booking-block booking-block--${(b.status || '').toLowerCase()}`}
              style={{ left, width }}
              title={`${b.bookedBy?.name} · ${start}–${end}`}
            >
              <span className="booking-block-text">{b.bookedBy?.name}</span>
              <span className="booking-block-time">{start}–{end}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const emptyForm = { assetId: '', bookedById: '', date: todayStr(), start: '09:00', end: '10:00', purpose: '' }

export default function BookingPage() {
  const [bookings, setBookings]         = useState([])
  const [bookableAssets, setBookableAssets] = useState([])
  const [employees, setEmployees]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [saving, setSaving]             = useState(false)

  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [filterAsset, setFilterAsset]   = useState('')
  const [view, setView]                 = useState('timeline')
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [formError, setFormError]       = useState('')

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [bookRes, assetRes, empRes] = await Promise.all([
        bookingService.getAll(),
        assetService.getAll(),
        employeeService.getAll(),
      ])
      setBookings(bookRes.data || bookRes || [])
      const allAssets = assetRes.data || assetRes || []
      setBookableAssets(allAssets.filter(a => a.bookable))
      setEmployees(empRes.data || empRes || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ── Filter ── */
  const dayBookings = bookings.filter(b => formatDateStr(b.startTime) === selectedDate)

  const listBookings = bookings.filter(b => {
    const matchDate  = !selectedDate || formatDateStr(b.startTime) === selectedDate
    const matchAsset = !filterAsset  || b.asset?._id === filterAsset
    return matchDate && matchAsset
  })

  /* ── Save Booking ── */
  const handleSave = async () => {
    if (!form.assetId || !form.bookedById || !form.date || !form.start || !form.end) {
      setFormError('All fields are required.'); return
    }
    if (timeToMin(form.end) <= timeToMin(form.start)) {
      setFormError('End time must be after start time.'); return
    }
    setSaving(true); setFormError('')
    try {
      const startTime = new Date(`${form.date}T${form.start}:00`).toISOString()
      const endTime   = new Date(`${form.date}T${form.end}:00`).toISOString()
      const res = await bookingService.create({
        assetId:    form.assetId,
        bookedById: form.bookedById,
        startTime,
        endTime,
        purpose: form.purpose || 'Booking',
      })
      const newBooking = res.data || res
      setBookings(prev => [newBooking, ...prev])
      setForm(emptyForm); setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setSaving(false)
    }
  }

  /* ── Cancel Booking ── */
  const handleCancel = async (id) => {
    try {
      const res = await bookingService.cancel(id)
      const updated = res.data || res
      setBookings(prev => prev.map(b => b._id === id ? updated : b))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking')
    }
  }

  /* ── Approve ── */
  const handleApprove = async (id) => {
    try {
      const res = await bookingService.approve(id)
      const updated = res.data || res
      setBookings(prev => prev.map(b => b._id === id ? updated : b))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking')
    }
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
          <button className="btn btn-primary" onClick={() => { setForm({ ...emptyForm, date: selectedDate }); setFormError(''); setShowModal(true) }}>
            <span className="material-symbols-outlined">add</span> Book Resource
          </button>
        </div>
      </div>

      {/* Error/Loading */}
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
          <p>Loading bookings…</p>
        </div>
      )}

      {!loading && (
        <>
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
              <span className={`badge ${dayBookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED').length > 0 ? 'badge-info' : 'badge-inactive'}`}>
                {dayBookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'REJECTED').length} bookings
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
                {bookableAssets.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-symbols-outlined">inventory_2</span>
                    <p>No bookable assets found. Mark assets as "Bookable" in the Assets page.</p>
                  </div>
                ) : (
                  bookableAssets.map(asset => (
                    <TimelineRow
                      key={asset._id}
                      asset={asset}
                      bookings={dayBookings}
                      onSlotClick={() => { setForm({ ...emptyForm, assetId: asset._id, date: selectedDate }); setFormError(''); setShowModal(true) }}
                    />
                  ))
                )}
              </div>
              <div className="timeline-legend">
                <span className="legend-item"><span className="legend-dot legend-approved" />Approved</span>
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
                  {bookableAssets.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
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
                      <th>Purpose</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {listBookings.length === 0 ? (
                      <tr><td colSpan={7}><div className="empty-state"><span className="material-symbols-outlined">event</span><p>No bookings for this day.</p></div></td></tr>
                    ) : listBookings.map(b => {
                      const startStr = formatTime(b.startTime)
                      const endStr   = formatTime(b.endTime)
                      const dur = timeToMin(endStr) - timeToMin(startStr)
                      const hrs = Math.floor(dur / 60), mins = dur % 60
                      const bookerName = b.bookedBy?.name || ''
                      const color = getColor(bookerName)
                      return (
                        <tr key={b._id}>
                          <td>
                            <div>
                              <code className="asset-tag">{b.asset?.assetTag}</code>
                              <div style={{ fontWeight: 500, marginTop: 4, fontSize: 13 }}>{b.asset?.name}</div>
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-avatar">
                              <div className={`avatar avatar-${color}`}>{initials(bookerName)}</div>
                              <span className="name">{bookerName}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: formatDateStr(b.startTime) === todayStr() ? 'var(--primary)' : 'inherit', fontWeight: formatDateStr(b.startTime) === todayStr() ? 600 : 400 }}>
                            {formatDateStr(b.startTime) === todayStr() ? 'Today' : formatDateStr(b.startTime)}
                          </td>
                          <td>
                            <div className="time-slot-cell">
                              <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--outline)' }}>schedule</span>
                              {startStr} – {endStr}
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{b.purpose || '—'}</td>
                          <td><span className={`badge ${statusBadge[b.status] || 'badge-inactive'}`}>{b.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {b.status === 'PENDING' && (
                                <button className="btn btn-ghost btn-sm" title="Approve" onClick={() => handleApprove(b._id)}>
                                  <span className="material-symbols-outlined">check_circle</span>
                                </button>
                              )}
                              {(b.status === 'APPROVED' || b.status === 'PENDING') && (
                                <button className="btn btn-ghost btn-sm" title="Cancel booking" onClick={() => handleCancel(b._id)}>
                                  <span className="material-symbols-outlined">event_busy</span>
                                </button>
                              )}
                              {b.status !== 'PENDING' && b.status !== 'APPROVED' && <span style={{ color: 'var(--outline)' }}>—</span>}
                            </div>
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
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <span className="material-symbols-outlined">event_available</span>
                {saving ? 'Booking…' : 'Confirm Booking'}
              </button>
            </>
          }
        >
            {formError && (
              <div className="form-error-msg">
                <span className="material-symbols-outlined">warning</span>
                {formError}
              </div>
            )}

            <div className="form-field">
              <label>Resource <span className="required">*</span></label>
              <select className="form-input form-select" value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}>
                <option value="">Select bookable resource…</option>
                {bookableAssets.map(a => <option key={a._id} value={a._id}>{a.assetTag} — {a.name} ({a.location || 'N/A'})</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Booked By <span className="required">*</span></label>
              <select className="form-input form-select" value={form.bookedById} onChange={e => setForm(f => ({ ...f, bookedById: e.target.value }))}>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Purpose</label>
              <input className="form-input" type="text" placeholder="e.g. Team meeting, Client demo…"
                value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
            </div>

            <div className="form-field">
              <label>Date <span className="required">*</span></label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Start Time <span className="required">*</span></label>
                <input className="form-input" type="time" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>End Time <span className="required">*</span></label>
                <input className="form-input" type="time" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
              </div>
            </div>

            {form.assetId && form.date && (
              <div className="conflict-notice">
                <span className="material-symbols-outlined icon-filled">info</span>
                <div>
                  <strong>Existing bookings for this resource on {form.date}:</strong>
                  <ul style={{ marginTop: 4, paddingLeft: 16, fontSize: 12 }}>
                    {bookings.filter(b =>
                      b.asset?._id === form.assetId &&
                      formatDateStr(b.startTime) === form.date &&
                      b.status !== 'CANCELLED' && b.status !== 'REJECTED'
                    ).length === 0
                      ? <li>No bookings — this slot is free!</li>
                      : bookings.filter(b =>
                          b.asset?._id === form.assetId &&
                          formatDateStr(b.startTime) === form.date &&
                          b.status !== 'CANCELLED' && b.status !== 'REJECTED'
                        ).map(b => (
                          <li key={b._id}>{formatTime(b.startTime)}–{formatTime(b.endTime)} · {b.bookedBy?.name} ({b.status})</li>
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
