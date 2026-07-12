import api from './api'

const employeeService = {
  getAll: () => api.get('/api/employees').then((res) => res.data),

  getById: (id) => api.get(`/api/employees/${id}`).then((res) => res.data),

  update: (id, data) =>
    api.put(`/api/employees/${id}`, data).then((res) => res.data),

  promoteRole: (id, role) =>
    api.patch(`/api/employees/${id}/role`, { role }).then((res) => res.data),
}

export default employeeService
