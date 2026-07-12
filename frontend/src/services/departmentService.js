import api from './api'

const departmentService = {
  getAll: () => api.get('/api/departments').then((res) => res.data),

  getById: (id) => api.get(`/api/departments/${id}`).then((res) => res.data),

  create: (data) => api.post('/api/departments', data).then((res) => res.data),

  update: (id, data) =>
    api.put(`/api/departments/${id}`, data).then((res) => res.data),

  delete: (id) => api.delete(`/api/departments/${id}`).then((res) => res.data),

  assignHead: (id, headId) =>
    api
      .patch(`/api/departments/${id}/head`, { headId })
      .then((res) => res.data),
}

export default departmentService
