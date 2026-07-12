import { useState } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './AssetsPage.css'

/* ─── Seed Data ─────────────────────────────── */
const seedAssets = [
  { id: 1,  tag: 'AF-0114', name: 'Dell Laptop XPS 15',         category: 'Electronics',  serial: 'DL-XPS-2291',   location: 'IT Dept',        condition: 'Good',       status: 'Allocated',    bookable: false, cost: 85000, acquired: '2023-04-10', assignee: 'Priya Shah',   initials: 'PS', color: 'rose' },
  { id: 2,  tag: 'AF-0062', name: 'Epson Projector EB-S41',     category: 'Electronics',  serial: 'EP-S41-0882',   location: 'Conference B',   condition: 'Good',       status: 'Available',    bookable: true,  cost: 32000, acquired: '2022-11-05', assignee: null,           initials: '', color: '' },
  { id: 3,  tag: 'AF-0031', name: 'Herman Miller Aeron Chair',  category: 'Furniture',    serial: 'HM-AC-1134',    location: 'Engineering',    condition: 'Excellent',  status: 'Available',    bookable: false, cost: 42000, acquired: '2023-01-20', assignee: null,           initials: '', color: '' },
  { id: 4,  tag: 'AF-0078', name: 'Toyota Innova (MH-12-AB-9021)',category:'Vehicles',   serial: 'VH-INN-0078',   location: 'Parking Lot A',  condition: 'Good',       status: 'Allocated',    bookable: true,  cost: 1850000, acquired: '2021-08-15', assignee: 'Rohan Mehta', initials: 'RM', color: 'teal' },
  { id: 5,  tag: 'AF-0093', name: 'Oscilloscope Rigol DS1054Z', category: 'Lab Equipment',serial: 'RG-DS10-0093',  location: 'Lab Room 2',     condition: 'Fair',       status: 'Maintenance',  bookable: false, cost: 28000, acquired: '2020-06-01', assignee: null,           initials: '', color: '' },
  { id: 6,  tag: 'AF-0105', name: 'iPhone 14 Pro (Company)',    category: 'Electronics',  serial: 'AP-I14P-0105',  location: 'HR Dept',        condition: 'Good',       status: 'Allocated',    bookable: false, cost: 120000, acquired: '2023-09-20', assignee: 'Aditi Rao',   initials: 'AR', color: 'blue' },
  { id: 7,  tag: 'AF-0011', name: 'Boardroom Table — 12 Seat',  category: 'Furniture',    serial: 'FN-BT-0011',    location: 'Boardroom',      condition: 'Excellent',  status: 'Available',    bookable: true,  cost: 95000, acquired: '2019-03-14', assignee: null,           initials: '', color: '' },
  { id: 8,  tag: 'AF-0130', name: 'Cisco IP Phone 8841',        category: 'Electronics',  serial: 'CS-8841-0130',  location: 'Reception',      condition: 'Good',       status: 'Available',    bookable: false, cost: 18000, acquired: '2022-05-22', assignee: null,           initials: '', color: '' },
  { id: 9,  tag: 'AF-0055', name: 'Forklift Komatsu FG25T',     category: 'Vehicles',     serial: 'KM-FG25-0055',  location: 'Warehouse',      condition: 'Fair',       status: 'Maintenance',  bookable: false, cost: 450000, acquired: '2018-10-05', assignee: null,           initials: '', color: '' },
  { id: 10, tag: 'AF-0088', name: 'Spectrum Analyzer R&S',      category: 'Lab Equipment',serial: 'RS-SA-0088',    location: 'Lab Room 1',     condition: 'Good',       status: 'Allocated',    bookable: false, cost: 380000, acquired: '2021-12-01', assignee: 'Arjun Nair',  initials: 'AN', color: 'orange' },
  { id: 11, tag: 'AF-0022', name: 'LG 32" Monitor 4K',          category: 'Electronics',  serial: 'LG-32M-0022',   location: 'Design Studio',  condition: 'Excellent',  status: 'Available',    bookable: false, cost: 45000, acquired: '2023-07-18', assignee: null,           initials: '', color: '' },
  { id: 12, tag: 'AF-0007', name: 'Canon DSLR EOS 90D',         category: 'Electronics',  serial: 'CN-90D-0007',   location: 'Storage Room',   condition: 'Good',       status: 'Retired',      bookable: false, cost: 95000, acquired: '2017-02-10', assignee: null,           initials: '', color: '' },
]

const CATEGORIES = ['Electronics', 'Furniture', 'Vehicles', 'Lab Equipment']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']
const STATUSES   = ['Available', 'Allocated', 'Maintenance', 'Retired']
const LOCATIONS  = ['IT Dept', 'Conference B', 'Engineering', 'Parking Lot A', 'Lab Room 1', 'Lab Room 2', 'HR Dept', 'Boardroom', 'Reception', 'Warehouse', 'Design Studio', 'Storage Room']

const statusBadge = { Available: 'badge-success', Allocated: 'badge-info', Maintenance: 'badge-warning', Retired: 'badge-inactive' }
const conditionBadge = { Excellent: 'badge-success', Good: 'badge-info', Fair: 'badge-warning', Poor: 'badge-error' }

const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'rose']

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''
}

const emptyForm = {
  name: '', category: '', serial: '', location: '', condition: 'Good',
  status: 'Available', bookable: false, cost: '', acquired: ''
}

/* ─── Detail Drawer ─────────────────────────── */
function AssetDrawer({ asset, onClose }) {
  if (!asset) return null
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="asset-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <p className="drawer-tag">{asset.tag}</p>
            <h2 className="drawer-title">{asset.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-badges">
            <span className={`badge ${statusBadge[asset.status]}`}>{asset.status}</span>
            <span className={`badge ${conditionBadge[asset.condition]}`}>{asset.condition}</span>
            {asset.bookable && <span className="badge badge-success">Bookable</span>}
          </div>

          <div className="drawer-section">
            <p className="drawer-section-title">Asset Details</p>
            <div className="drawer-detail-grid">
              <div className="drawer-detail-item"><span>Category</span><strong>{asset.category}</strong></div>
              <div className="drawer-detail-item"><span>Serial No.</span><strong>{asset.serial}</strong></div>
              <div className="drawer-detail-item"><span>Location</span><strong>{asset.location}</strong></div>
              <div className="drawer-detail-item"><span>Acquired</span><strong>{asset.acquired}</strong></div>
              <div className="drawer-detail-item"><span>Cost</span><strong>₹{Number(asset.cost).toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          {asset.assignee && (
            <div className="drawer-section">
              <p className="drawer-section-title">Currently Assigned</p>
              <div className="cell-with-avatar">
                <div className={`avatar avatar-${asset.color}`}>{initials(asset.assignee)}</div>
                <div>
                  <div className="name">{asset.assignee}</div>
                  <div className="sub">Employee</div>
                </div>
              </div>
            </div>
          )}

          <div className="drawer-section">
            <p className="drawer-section-title">Quick Actions</p>
            <div className="drawer-actions">
              <button className="btn btn-primary btn-sm">
                <span className="material-symbols-outlined">assignment_ind</span> Allocate
              </button>
              <button className="btn btn-secondary btn-sm">
                <span className="material-symbols-outlined">swap_horiz</span> Transfer
              </button>
              <button className="btn btn-secondary btn-sm">
                <span className="material-symbols-outlined">build</span> Maintenance
              </button>
              <button className="btn btn-secondary btn-sm">
                <span className="material-symbols-outlined">edit</span> Edit
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────── */
export default function AssetsPage() {
  const [assets, setAssets]           = useState(seedAssets)
  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCond, setFilterCond]   = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(emptyForm)
  const [formError, setFormError]     = useState('')
  const [selectedAsset, setSelectedAsset] = useState(null)

  /* Filtering */
  const filtered = assets.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.serial.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
    const matchCat    = !filterCat    || a.category  === filterCat
    const matchStatus = !filterStatus || a.status    === filterStatus
    const matchCond   = !filterCond   || a.condition === filterCond
    return matchSearch && matchCat && matchStatus && matchCond
  })

  /* KPI counts */
  const counts = { Available: 0, Allocated: 0, Maintenance: 0, Retired: 0 }
  assets.forEach(a => counts[a.status]++)

  /* Save new asset */
  const handleSave = () => {
    if (!form.name.trim() || !form.category || !form.serial.trim() || !form.location) {
      setFormError('Please fill in all required fields.')
      return
    }
    const newTag = `AF-${String(assets.length + 1).padStart(4, '0')}`
    const color  = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    setAssets(prev => [...prev, { id: Date.now(), tag: newTag, ...form, bookable: form.bookable, cost: Number(form.cost) || 0, assignee: null, initials: '', color }])
    setForm(emptyForm)
    setFormError('')
    setShowModal(false)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setFormError('')
  }

  return (
    <div className="assets-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="breadcrumb">AssetFlow / Asset Directory</p>
          <h1>Asset Registry</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => {}}>
            <span className="material-symbols-outlined">download</span> Export
          </button>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setFormError(''); setShowModal(true) }}>
            <span className="material-symbols-outlined">add</span> Register Asset
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="assets-kpi-strip">
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            className={`assets-kpi-chip ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(prev => prev === status ? '' : status)}
          >
            <span className={`kpi-dot kpi-dot--${status.toLowerCase()}`} />
            <span className="kpi-chip-label">{status}</span>
            <span className="kpi-chip-count">{count}</span>
          </button>
        ))}
        <div className="kpi-total">
          <span className="material-symbols-outlined">inventory_2</span>
          {assets.length} total assets
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="assets-toolbar">
        <div className="table-search" style={{ flex: 1, maxWidth: 360 }}>
          <span className="material-symbols-outlined">search</span>
          <input
            placeholder="Search by name, tag, serial, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn-ghost" style={{ padding: '2px' }} onClick={() => setSearch('')}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          )}
        </div>
        <div className="assets-filters">
          <select className="filter-select form-input form-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="filter-select form-input form-select" value={filterCond} onChange={e => setFilterCond(e.target.value)}>
            <option value="">All Conditions</option>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {(search || filterCat || filterStatus || filterCond) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterCat(''); setFilterStatus(''); setFilterCond('') }}>
            <span className="material-symbols-outlined">filter_list_off</span> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Assigned To</th>
              <th>Bookable</th>
              <th>Cost</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">
                    <span className="material-symbols-outlined">inventory_2</span>
                    <p>No assets match your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map(asset => (
              <tr key={asset.id} className="asset-row" onClick={() => setSelectedAsset(asset)}>
                <td><code className="asset-tag">{asset.tag}</code></td>
                <td>
                  <div className="asset-name-cell">
                    <span className="material-symbols-outlined asset-icon">inventory_2</span>
                    <span className="asset-name">{asset.name}</span>
                  </div>
                </td>
                <td><span className="category-chip">{asset.category}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>location_on</span>
                    {asset.location}
                  </div>
                </td>
                <td><span className={`badge ${statusBadge[asset.status]}`}>{asset.status}</span></td>
                <td><span className={`badge ${conditionBadge[asset.condition]}`}>{asset.condition}</span></td>
                <td>
                  {asset.assignee
                    ? <div className="cell-with-avatar">
                        <div className={`avatar avatar-${asset.color}`}>{initials(asset.assignee)}</div>
                        <span className="name">{asset.assignee}</span>
                      </div>
                    : <span style={{ color: 'var(--outline)' }}>—</span>
                  }
                </td>
                <td>
                  {asset.bookable
                    ? <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--success)', fontSize: 20 }}>check_circle</span>
                    : <span style={{ color: 'var(--outline)' }}>—</span>}
                </td>
                <td>₹{Number(asset.cost).toLocaleString('en-IN')}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" title="View details" onClick={() => setSelectedAsset(asset)}>
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Edit">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="table-footer">
            Showing <strong>{filtered.length}</strong> of <strong>{assets.length}</strong> assets
          </div>
        )}
      </div>

      {/* ── Register Asset Modal ── */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h2>Register New Asset</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="modal-body">
            {formError && <div className="form-error-msg"><span className="material-symbols-outlined">error</span>{formError}</div>}

            <div className="form-field">
              <label>Asset Name <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. Dell Laptop XPS 15" value={form.name} onChange={e => handleChange('name', e.target.value)} />
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Category <span className="required">*</span></label>
                <select className="form-input form-select" value={form.category} onChange={e => handleChange('category', e.target.value)}>
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Condition</label>
                <select className="form-input form-select" value={form.condition} onChange={e => handleChange('condition', e.target.value)}>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Serial Number <span className="required">*</span></label>
                <input className="form-input" placeholder="e.g. DL-XPS-2291" value={form.serial} onChange={e => handleChange('serial', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Location <span className="required">*</span></label>
                <select className="form-input form-select" value={form.location} onChange={e => handleChange('location', e.target.value)}>
                  <option value="">Select…</option>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>Acquisition Date</label>
                <input className="form-input" type="date" value={form.acquired} onChange={e => handleChange('acquired', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Cost (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 85000" value={form.cost} onChange={e => handleChange('cost', e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.bookable} onChange={e => handleChange('bookable', e.target.checked)} />
                <span>This asset is bookable by employees</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <span className="material-symbols-outlined">add</span> Register Asset
            </button>
          </div>
        </Modal>
      )}

      {/* ── Asset Detail Drawer ── */}
      <AssetDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  )
}
