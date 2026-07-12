import api from './api'

const maintenanceService = {
  getAll: () => api.get('/api/maintenance').then((res) => res.data),

  getMyRequests: () => api.get('/api/maintenance/my').then((res) => res.data),

  create: (data) => api.post('/api/maintenance', data).then((res) => res.data),

  approve: (id) => api.patch(`/api/maintenance/${id}/approve`).then((res) => res.data),

  complete: (id, cost, notes) => api.patch(`/api/maintenance/${id}/complete`, { cost, notes }).then((res) => res.data),

  reject: (id) => api.patch(`/api/maintenance/${id}/reject`).then((res) => res.data),
}

export default maintenanceService
