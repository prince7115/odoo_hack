import api from './api'

const bookingService = {
  getAll: () => api.get('/api/bookings').then((res) => res.data),

  getMyBookings: () => api.get('/api/bookings/my').then((res) => res.data),

  getByAsset: (assetId) => api.get(`/api/bookings/asset/${assetId}`).then((res) => res.data),

  create: (data) => api.post('/api/bookings', data).then((res) => res.data),

  approve: (id) => api.patch(`/api/bookings/${id}/approve`).then((res) => res.data),

  reject: (id) => api.patch(`/api/bookings/${id}/reject`).then((res) => res.data),

  cancel: (id) => api.patch(`/api/bookings/${id}/cancel`).then((res) => res.data),
}

export default bookingService
