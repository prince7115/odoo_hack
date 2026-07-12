import api from './api'

const categoryService = {
  getAll: () => api.get('/api/categories').then((res) => res.data),

  getById: (id) => api.get(`/api/categories/${id}`).then((res) => res.data),

  create: (data) => api.post('/api/categories', data).then((res) => res.data),

  update: (id, data) =>
    api.put(`/api/categories/${id}`, data).then((res) => res.data),

  delete: (id) =>
    api.delete(`/api/categories/${id}`).then((res) => res.data),
}

export default categoryService
