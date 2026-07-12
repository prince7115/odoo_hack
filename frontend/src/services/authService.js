import api from './api'

const authService = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }).then((res) => res.data),

  signup: (data) =>
    api.post('/api/auth/signup', data).then((res) => res.data),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
}

export default authService
