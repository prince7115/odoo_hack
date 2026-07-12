import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import '../components/shared.css'
import departmentService from '../services/departmentService'
import categoryService from '../services/categoryService'
import employeeService from '../services/employeeService'

/* ─── Role mapping helpers ─────────────────── */
const BACKEND_ROLES = ['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN']
const ROLE_LABELS = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'Asset Manager',
  DEPARTMENT_HEAD: 'Department Head',
  EMPLOYEE: 'Employee',
}
const labelToBackend = (label) =>
  Object.entries(ROLE_LABELS).find(([, v]) => v === label)?.[0] || label
const backendToLabel = (role) => ROLE_LABELS[role] || role

/* ─── Reusable Loading / Error ─────────────── */
function LoadingSpinner() {
  return (
    <div className="empty-state">
      <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
      <p>Loading…</p>
    </div>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: 'var(--error-container)', color: 'var(--error)',
      padding: '12px 16px', borderRadius: 'var(--radius-default)', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 8, fontSize: 13
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
      {message}
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginLeft: 'auto' }}>
          Retry
        </button>
      )}
    </div>
  )
}

/* ─── Departments Tab ──────────────────────── */
function DepartmentsTab() {
  const [departments, setDepartments] = useState([])
  const [search, setSearch]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [form, setForm]               = useState({ name: '', code: '', description: '', parentDepartmentId: '' })
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await departmentService.getAll()
      setDepartments(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDepartments() }, [fetchDepartments])

  const filtered = departments.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.headName?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditItem(null)
    setForm({ name: '', code: '', description: '', parentDepartmentId: '' })
    setShowModal(true)
  }
  const openEdit = (d) => {
    setEditItem(d)
    setForm({ name: d.name, code: d.code || '', description: d.description || '', parentDepartmentId: d.parentDepartmentId || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editItem) {
        await departmentService.update(editItem.id, {
          name: form.name,
          description: form.description,
        })
      } else {
        await departmentService.create({
          name: form.name,
          code: form.code,
          description: form.description,
          parentDepartmentId: form.parentDepartmentId ? Number(form.parentDepartmentId) : null,
        })
      }
      setShowModal(false)
      await fetchDepartments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save department')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (id) => {
    try {
      await departmentService.delete(id)
      await fetchDepartments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={fetchDepartments} />}
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
              <th>Code</th>
              <th>Head</th>
              <th>Parent Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><LoadingSpinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <span className="material-symbols-outlined">domain</span>
                  <p>No departments found</p>
                </div>
              </td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td>
                <td><code style={{ fontSize: 12 }}>{d.code}</code></td>
                <td>{d.headName || <span style={{ color: 'var(--outline)' }}>—</span>}</td>
                <td style={{ color: !d.parentDepartmentName ? 'var(--outline)' : 'inherit' }}>
                  {d.parentDepartmentName || '—'}
                </td>
                <td>
                  <span className={`badge ${d.active ? 'badge-success' : 'badge-inactive'}`}>
                    {d.active ? 'Active' : 'Inactive'}
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
                      title={d.active ? 'Deactivate' : 'Activate'}
                      style={{ color: d.active ? 'var(--error)' : 'var(--success)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {d.active ? 'block' : 'check_circle'}
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
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Create Department'}
              </button>
            </>
          }
        >
          <div className="form-field">
            <label>Department Name <span className="required">*</span></label>
            <input className="form-input" placeholder="e.g. Engineering" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          {!editItem && (
            <div className="form-field">
              <label>Department Code <span className="required">*</span></label>
              <input className="form-input" placeholder="e.g. ENG" value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            </div>
          )}
          <div className="form-field">
            <label>Description</label>
            <input className="form-input" placeholder="Brief description" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          {!editItem && (
            <div className="form-field">
              <label>Parent Department</label>
              <select className="form-input form-select" value={form.parentDepartmentId}
                onChange={e => setForm(p => ({ ...p, parentDepartmentId: e.target.value }))}>
                <option value="">None (top-level)</option>
                {departments.filter(d => !editItem || d.id !== editItem.id).map(d =>
                  <option key={d.id} value={d.id}>{d.name}</option>
                )}
              </select>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}

/* ─── Categories Tab ───────────────────────── */
function CategoriesTab() {
  const [categories, setCategories] = useState([])
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState({ name: '', description: '', customFieldsJson: '' })
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await categoryService.getAll()
      setCategories(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditItem(null); setForm({ name: '', description: '', customFieldsJson: '' }); setShowModal(true) }
  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name, description: c.description || '', customFieldsJson: c.customFieldsJson || '' }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editItem) {
        await categoryService.update(editItem.id, form)
      } else {
        await categoryService.create(form)
      }
      setShowModal(false)
      await fetchCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await categoryService.delete(id)
      await fetchCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category')
    }
  }

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={fetchCategories} />}
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
              <th>Description</th>
              <th>Custom Fields</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}><LoadingSpinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4}>
                <div className="empty-state">
                  <span className="material-symbols-outlined">category</span>
                  <p>No categories found</p>
                </div>
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td style={{ fontSize: 13, color: !c.description ? 'var(--outline)' : 'inherit' }}>
                  {c.description || '—'}
                </td>
                <td style={{ color: !c.customFieldsJson ? 'var(--outline)' : 'inherit', fontSize: 13 }}>
                  {c.customFieldsJson || '—'}
                </td>
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
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Create Category'}
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
            <label>Description</label>
            <input className="form-input" placeholder="Brief description" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-field">
            <label>Custom Fields <span style={{ color: 'var(--outline)', fontWeight: 400 }}>(comma-separated)</span></label>
            <input className="form-input" placeholder="e.g. Warranty Period, Serial No." value={form.customFieldsJson}
              onChange={e => setForm(p => ({ ...p, customFieldsJson: e.target.value }))} />
          </div>
        </Modal>
      )}
    </>
  )
}

/* ─── Employee Directory Tab ───────────────── */
function EmployeeDirectoryTab() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState({ name: '', phone: '', designation: '' })
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await employeeService.getAll()
      setEmployees(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    (e.departmentName || '').toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (e) => {
    setEditItem(e)
    setForm({ name: e.name, phone: e.phone || '', designation: e.designation || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await employeeService.update(editItem.id, form)
      setShowModal(false)
      await fetchEmployees()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save employee')
    } finally {
      setSaving(false)
    }
  }

  const handlePromote = async (id, backendRole) => {
    try {
      await employeeService.promoteRole(id, backendRole)
      await fetchEmployees()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role')
    }
  }

  const roleBadge = (role) => {
    if (role === 'DEPARTMENT_HEAD') return 'badge-warning'
    if (role === 'ASSET_MANAGER') return 'badge-info'
    if (role === 'ADMIN') return 'badge-success'
    return 'badge-inactive'
  }

  const getInitials = (name) =>
    (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const avatarColors = ['blue', 'teal', 'purple', 'rose', 'orange']
  const getColor = (id) => avatarColors[id % avatarColors.length]

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={fetchEmployees} />}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search by name, email or department…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
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
            {loading ? (
              <tr><td colSpan={6}><LoadingSpinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <span className="material-symbols-outlined">people</span>
                  <p>No employees found — employees are created when they sign in via Google OAuth</p>
                </div>
              </td></tr>
            ) : filtered.map(emp => (
              <tr key={emp.id}>
                <td>
                  <div className="cell-with-avatar">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    ) : (
                      <div className={`avatar avatar-${getColor(emp.id)}`}>{getInitials(emp.name)}</div>
                    )}
                    <span className="name">{emp.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{emp.email}</td>
                <td>{emp.departmentName || <span style={{ color: 'var(--outline)' }}>—</span>}</td>
                <td><span className={`badge ${roleBadge(emp.role)}`}>{backendToLabel(emp.role)}</span></td>
                <td>
                  <span className={`badge ${emp.active ? 'badge-success' : 'badge-inactive'}`}>
                    {emp.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEdit(emp)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </button>
                    <select
                      className="btn btn-secondary btn-sm"
                      style={{ cursor: 'pointer', paddingRight: 24 }}
                      value={emp.role}
                      onChange={e => handlePromote(emp.id, e.target.value)}
                      title="Promote / change role"
                    >
                      {BACKEND_ROLES.map(r => <option key={r} value={r}>{backendToLabel(r)}</option>)}
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
          title="Edit Employee"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="form-field">
            <label>Full Name <span className="required">*</span></label>
            <input className="form-input" placeholder="Priya Shah" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Phone</label>
              <input className="form-input" placeholder="+91 98765 43210" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Designation</label>
              <input className="form-input" placeholder="e.g. Senior Engineer" value={form.designation}
                onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
            </div>
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
