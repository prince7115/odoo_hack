import api from './api'

const dashboardService = {
  getStats: () => api.get('/api/dashboard/stats').then((res) => res.data),
}

export default dashboardService
