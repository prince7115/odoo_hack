import api from './api'

const allocationService = {
  getAll: () => api.get('/api/allocations').then((res) => res.data),

  getByAsset: (assetId) => api.get(`/api/allocations/asset/${assetId}`).then((res) => res.data),

  getByEmployee: (employeeId) => api.get(`/api/allocations/employee/${employeeId}`).then((res) => res.data),

  allocate: (data) => api.post('/api/allocations', data).then((res) => res.data),

  returnAsset: (id, condition, notes) => api.post(`/api/allocations/${id}/return`, { condition, notes }).then((res) => res.data),

  transfer: (id, data) => api.post(`/api/allocations/${id}/transfer`, data).then((res) => res.data),
}

export default allocationService
