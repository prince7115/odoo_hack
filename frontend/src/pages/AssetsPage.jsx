import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import './AssetsPage.css'
import assetService from '../services/assetService'
import categoryService from '../services/categoryService'
import departmentService from '../services/departmentService'

const CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']
const STATUSES   = ['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'DISPOSED']

const statusBadge = { AVAILABLE: 'badge-success', ALLOCATED: 'badge-info', UNDER_MAINTENANCE: 'badge-warning', DISPOSED: 'badge-inactive' }
const conditionBadge = { NEW: 'badge-success', GOOD: 'badge-success', FAIR: 'badge-info', POOR: 'badge-warning', DAMAGED: 'badge-error' }

const AVATAR_COLORS = ['blue', 'teal', 'purple', 'orange', 'rose']

function initials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''
}

const emptyForm = {
  name: '', description: '', categoryId: '', departmentId: '', serialNumber: '', location: '', 
  status: 'AVAILABLE', condition: 'NEW', purchaseCost: '', purchaseDate: ''
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
              <div className="drawer-detail-item"><span>Category</span><strong>{asset.categoryName}</strong></div>
              <div className="drawer-detail-item"><span>Serial No.</span><strong>{asset.serialNumber}</strong></div>
              <div className="drawer-detail-item"><span>Location</span><strong>{asset.location}</strong></div>
              <div className="drawer-detail-item"><span>Acquired</span><strong>{asset.purchaseDate}</strong></div>
              <div className="drawer-detail-item"><span>Cost</span><strong>₹{Number(asset.purchaseCost || 0).toLocaleString('en-IN')}</strong></div>
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
  const [assets, setAssets]           = useState([])
  const [categories, setCategories]   = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)

  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCond, setFilterCond]   = useState('')
  
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(emptyForm)
  const [formError, setFormError]     = useState('')
  const [selectedAsset, setSelectedAsset] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assetsRes, catsRes, deptsRes] = await Promise.all([
        assetService.getAll(),
        categoryService.getAll(),
        departmentService.getAll()
      ])
      setAssets(assetsRes.data || [])
      setCategories(catsRes.data || [])
      setDepartments(deptsRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* Filtering */
  const filtered = assets.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.assetTag?.toLowerCase().includes(q) || a.serialNumber?.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q)
    const matchCat    = !filterCat    || String(a.categoryId) === filterCat
    const matchStatus = !filterStatus || a.status    === filterStatus
    const matchCond   = !filterCond   || a.assetCondition === filterCond
    return matchSearch && matchCat && matchStatus && matchCond
  })

  /* KPI counts */
  const counts = { AVAILABLE: 0, ALLOCATED: 0, UNDER_MAINTENANCE: 0, DISPOSED: 0 }
  assets.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++ })

  /* Save new asset */
  const handleSave = async () => {
    if (!form.name.trim() || !form.categoryId || !form.serialNumber.trim() || !form.location) {
      setFormError('Please fill in all required fields.')
      return
    }
    try {
      await assetService.create({
        name: form.name,
        description: form.description,
        categoryId: Number(form.categoryId),
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        serialNumber: form.serialNumber,
        location: form.location,
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
        purchaseDate: form.purchaseDate || null
      })
      await fetchData()
      setForm(emptyForm)
      setFormError('')
      setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create asset')
    }
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
                <td><code className="asset-tag">{asset.assetTag}</code></td>
                <td>
                  <div className="asset-name-cell">
                    <span className="material-symbols-outlined asset-icon">inventory_2</span>
                    <span className="asset-name">{asset.name}</span>
                  </div>
                </td>
                <td><span className="category-chip">{asset.categoryName}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>location_on</span>
                    {asset.location}
                  </div>
                </td>
                <td><span className={`badge ${statusBadge[asset.status]}`}>{asset.status}</span></td>
                <td><span className={`badge ${conditionBadge[asset.assetCondition]}`}>{asset.assetCondition}</span></td>
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
                <td>₹{Number(asset.purchaseCost || 0).toLocaleString('en-IN')}</td>
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
                <select className="form-input form-select" value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}>
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <input className="form-input" placeholder="e.g. DL-XPS-2291" value={form.serialNumber} onChange={e => handleChange('serialNumber', e.target.value)} />
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
                <input className="form-input" type="date" value={form.purchaseDate} onChange={e => handleChange('purchaseDate', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Cost (₹)</label>
                <input className="form-input" type="number" placeholder="e.g. 85000" value={form.purchaseCost} onChange={e => handleChange('purchaseCost', e.target.value)} />
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
