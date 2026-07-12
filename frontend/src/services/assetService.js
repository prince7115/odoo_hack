import api from './api'

const assetService = {
  getAll: () => api.get('/api/assets').then((res) => res.data),

  getById: (id) => api.get(`/api/assets/${id}`).then((res) => res.data),

  search: (criteria) => api.get('/api/assets/search', { params: criteria }).then((res) => res.data),

  create: (data) => api.post('/api/assets', data).then((res) => res.data),

  update: (id, data) => api.put(`/api/assets/${id}`, data).then((res) => res.data),

  updateStatus: (id, status) => api.patch(`/api/assets/${id}/status`, null, { params: { status } }).then((res) => res.data),

  delete: (id) => api.delete(`/api/assets/${id}`).then((res) => res.data),
}

export default assetService
