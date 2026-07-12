import { useState } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'

/* ─── Seed Data ─────────────────────────────── */
const seedDepartments = [
  { id: 1, name: 'Engineering',      head: 'Aditi Rao',    parent: '—',        status: 'Active' },
  { id: 2, name: 'Facilities',       head: 'Rohan Mehta',  parent: '—',        status: 'Active' },
  { id: 3, name: 'Field Ops (East)', head: 'Sana Iqbal',   parent: 'Field Ops', status: 'Inactive' },
  { id: 4, name: 'Procurement',      head: 'Vikram Das',   parent: '—',        status: 'Active' },
]

const seedCategories = [
  { id: 1, name: 'Electronics',  customFields: 'Warranty Period',      count: 54 },
  { id: 2, name: 'Furniture',    customFields: '—',                    count: 38 },
  { id: 3, name: 'Vehicles',     customFields: 'License Plate, Insurance Expiry', count: 12 },
  { id: 4, name: 'Lab Equipment',customFields: 'Calibration Due Date', count: 9  },
]

const seedEmployees = [
  { id: 1, name: 'Aditi Rao',   email: 'aditi@assetflow.in',   dept: 'Engineering',  role: 'Department Head', status: 'Active',   initials: 'AR', color: 'blue' },
  { id: 2, name: 'Rohan Mehta', email: 'rohan@assetflow.in',   dept: 'Facilities',   role: 'Asset Manager',   status: 'Active',   initials: 'RM', color: 'teal' },
  { id: 3, name: 'Sana Iqbal',  email: 'sana@assetflow.in',    dept: 'Field Ops',    role: 'Department Head', status: 'Inactive', initials: 'SI', color: 'purple' },
  { id: 4, name: 'Priya Shah',  email: 'priya@assetflow.in',   dept: 'IT',           role: 'Employee',        status: 'Active',   initials: 'PS', color: 'rose' },
  { id: 5, name: 'Arjun Nair',  email: 'arjun@assetflow.in',   dept: 'Engineering',  role: 'Employee',        status: 'Active',   initials: 'AN', color: 'orange' },
  { id: 6, name: 'Vikram Das',  email: 'vikram@assetflow.in',  dept: 'Procurement',  role: 'Asset Manager',   status: 'Active',   initials: 'VD', color: 'blue' },
]

const ROLES = ['Employee', 'Department Head', 'Asset Manager']

/* ─── Sub-components ────────────────────────── */

function DepartmentsTab() {
  const [departments, setDepartments] = useState(seedDepartments)
  const [search, setSearch]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [form, setForm]               = useState({ name: '', head: '', parent: '', status: 'Active' })

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd  = () => { setEditItem(null); setForm({ name: '', head: '', parent: '', status: 'Active' }); setShowModal(true) }
  const openEdit = (d) => { setEditItem(d); setForm({ name: d.name, head: d.head, parent: d.parent, status: d.status }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editItem) {
      setDepartments(prev => prev.map(d => d.id === editItem.id ? { ...d, ...form } : d))
    } else {
      setDepartments(prev => [...prev, { id: Date.now(), ...form, parent: form.parent || '—' }])
    }
    setShowModal(false)
  }

  const toggleStatus = (id) =>
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d))

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search departments…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <span className="material-symbols-outlined">add</span>
            Add Department
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Head</th>
              <th>Parent Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="empty-state">
                  <span className="material-symbols-outlined">domain</span>
                  <p>No departments found</p>
                </div>
              </td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td>
                <td>{d.head}</td>
                <td style={{ color: d.parent === '—' ? 'var(--outline)' : 'inherit' }}>{d.parent}</td>
                <td>
                  <span className={`badge ${d.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                    {d.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)} title="Edit">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleStatus(d.id)}
                      title={d.status === 'Active' ? 'Deactivate' : 'Activate'}
                      style={{ color: d.status === 'Active' ? 'var(--error)' : 'var(--success)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {d.status === 'Active' ? 'block' : 'check_circle'}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editItem ? 'Edit Department' : 'Add Department'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editItem ? 'Save Changes' : 'Create Department'}
              </button>
            </>
          }
        >
          <div className="form-field">
            <label>Department Name <span className="required">*</span></label>
            <input className="form-input" placeholder="e.g. Engineering" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Department Head</label>
              <input className="form-input" placeholder="Employee name" value={form.head}
                onChange={e => setForm(p => ({ ...p, head: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Parent Department</label>
              <select className="form-input form-select" value={form.parent}
                onChange={e => setForm(p => ({ ...p, parent: e.target.value }))}>
                <option value="">None (top-level)</option>
                {departments.filter(d => !editItem || d.id !== editItem.id).map(d =>
                  <option key={d.id} value={d.name}>{d.name}</option>
                )}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select className="form-input form-select" value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  )
}

function CategoriesTab() {
  const [categories, setCategories] = useState(seedCategories)
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState({ name: '', customFields: '' })

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd  = () => { setEditItem(null); setForm({ name: '', customFields: '' }); setShowModal(true) }
  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name, customFields: c.customFields === '—' ? '' : c.customFields }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name.trim()) return
    const entry = { ...form, customFields: form.customFields || '—' }
    if (editItem) {
      setCategories(prev => prev.map(c => c.id === editItem.id ? { ...c, ...entry } : c))
    } else {
      setCategories(prev => [...prev, { id: Date.now(), count: 0, ...entry }])
    }
    setShowModal(false)
  }

  const handleDelete = (id) => setCategories(prev => prev.filter(c => c.id !== id))

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <span className="material-symbols-outlined">add</span>
            Add Category
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Custom Fields</th>
              <th>Asset Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td style={{ color: c.customFields === '—' ? 'var(--outline)' : 'inherit', fontSize: 13 }}>{c.customFields}</td>
                <td><span className="badge badge-info">{c.count} assets</span></td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} title="Edit">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)} title="Delete"
                      style={{ color: 'var(--error)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editItem ? 'Edit Category' : 'Add Category'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editItem ? 'Save Changes' : 'Create Category'}
              </button>
            </>
          }
        >
          <div className="form-field">
            <label>Category Name <span className="required">*</span></label>
            <input className="form-input" placeholder="e.g. Electronics" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Custom Fields <span style={{ color: 'var(--outline)', fontWeight: 400 }}>(comma-separated)</span></label>
            <input className="form-input" placeholder="e.g. Warranty Period, Serial No." value={form.customFields}
              onChange={e => setForm(p => ({ ...p, customFields: e.target.value }))} />
          </div>
        </Modal>
      )}
    </>
  )
}

function EmployeeDirectoryTab() {
  const [employees, setEmployees] = useState(seedEmployees)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState({ name: '', email: '', dept: '', role: 'Employee', status: 'Active' })

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd  = () => { setEditItem(null); setForm({ name: '', email: '', dept: '', role: 'Employee', status: 'Active' }); setShowModal(true) }
  const openEdit = (e) => { setEditItem(e); setForm({ name: e.name, email: e.email, dept: e.dept, role: e.role, status: e.status }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const colors   = ['blue','teal','purple','rose','orange']
    if (editItem) {
      setEmployees(prev => prev.map(e => e.id === editItem.id ? { ...e, ...form, initials } : e))
    } else {
      setEmployees(prev => [...prev, { id: Date.now(), ...form, initials, color: colors[Math.floor(Math.random() * colors.length)] }])
    }
    setShowModal(false)
  }

  const handlePromote = (id, role) =>
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, role } : e))

  const roleBadge = (role) => {
    if (role === 'Department Head') return 'badge-warning'
    if (role === 'Asset Manager')   return 'badge-info'
    return 'badge-inactive'
  }

  return (
    <>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search by name, email or department…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <span className="material-symbols-outlined">person_add</span>
            Add Employee
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id}>
                <td>
                  <div className="cell-with-avatar">
                    <div className={`avatar avatar-${emp.color}`}>{emp.initials}</div>
                    <span className="name">{emp.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{emp.email}</td>
                <td>{emp.dept}</td>
                <td><span className={`badge ${roleBadge(emp.role)}`}>{emp.role}</span></td>
                <td>
                  <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEdit(emp)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </button>
                    {/* Role promotion dropdown */}
                    <select
                      className="btn btn-secondary btn-sm"
                      style={{ cursor: 'pointer', paddingRight: 24 }}
                      value={emp.role}
                      onChange={e => handlePromote(emp.id, e.target.value)}
                      title="Promote / change role"
                    >
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editItem ? 'Edit Employee' : 'Add Employee'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editItem ? 'Save Changes' : 'Add Employee'}
              </button>
            </>
          }
        >
          <div className="form-grid-2">
            <div className="form-field">
              <label>Full Name <span className="required">*</span></label>
              <input className="form-input" placeholder="Priya Shah" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Email <span className="required">*</span></label>
              <input className="form-input" type="email" placeholder="priya@company.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Department</label>
              <select className="form-input form-select" value={form.dept}
                onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}>
                <option value="">Select department</option>
                {seedDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Role <span style={{ color: 'var(--outline)', fontWeight: 400 }}>(Admin assigns)</span></label>
              <select className="form-input form-select" value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select className="form-input form-select" value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ─── Main Page ─────────────────────────────── */
const TABS = [
  { id: 'departments', label: 'Departments',       icon: 'domain' },
  { id: 'categories',  label: 'Asset Categories',  icon: 'category' },
  { id: 'employees',   label: 'Employee Directory', icon: 'people' },
]

export default function OrgSetupPage() {
  const [activeTab, setActiveTab] = useState('departments')

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="breadcrumb">Settings / Organization</div>
          <h1>Organization Setup</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--error-container)', color: 'var(--error)',
          padding: '6px 14px', borderRadius: 'var(--radius-default)', fontSize: 13, fontWeight: 500 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>admin_panel_settings</span>
          Admin Only
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'departments' && <DepartmentsTab />}
      {activeTab === 'categories'  && <CategoriesTab />}
      {activeTab === 'employees'   && <EmployeeDirectoryTab />}
    </div>
  )
}
