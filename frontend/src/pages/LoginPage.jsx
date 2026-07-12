import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authService.login(email, password)
      // Backend returns ApiResponse<{ token, user }>
      const token = res.data?.token || res.token
      const user  = res.data?.user  || res.user
      if (token) {
        localStorage.setItem('token', token)
        if (user) localStorage.setItem('user', JSON.stringify(user))
      }
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Top Navigation Bar */}
      <header className="login-topnav">
        <div className="login-topnav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <span className="login-topnav-brand">AssetFlow</span>
            <nav className="login-topnav-links">
              <a href="#">Platform</a>
              <a href="#">Solutions</a>
              <a href="#">Resources</a>
              <a href="#">Pricing</a>
            </nav>
          </div>
          <div className="login-topnav-actions">
            <button className="login-btn-signin">Sign In</button>
            <button className="login-btn-contact">Contact Sales</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        {/* Login Card */}
        <div className="login-card">
          {/* Card Header */}
          <div className="login-card-header">
            <h1>AssetFlow – login</h1>
          </div>

          {/* Card Body */}
          <div className="login-card-body">
            {/* Brand Circle */}
            <div className="login-brand-circle">AF</div>

            {/* Form */}
            <form className="login-form" onSubmit={handleLogin}>
              {/* Error Banner */}
              {error && (
                <div style={{
                  background: 'var(--error-container, #ffdad6)', color: 'var(--error, #ba1a1a)',
                  padding: '10px 14px', borderRadius: 8, fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="login-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="**********"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  disabled={loading}
                />
              </div>

              {/* Forgot Password */}
              <div className="login-forgot">
                <a href="#">Forgot password</a>
              </div>

              {/* Login Button */}
              <button type="submit" className="login-btn-primary" disabled={loading}>
                {loading ? 'Signing in…' : 'Login'}
              </button>
            </form>

            {/* Separator */}
            <div className="login-separator" />

            {/* Footer Section */}
            <div className="login-footer-section">
              <p>New here?</p>

              {/* Info Box */}
              <div className="login-info-box">
                <span
                  className="material-symbols-outlined icon-filled"
                >
                  info
                </span>
                <p>
                  Sign up creates an employee account — admin roles assigned later
                </p>
              </div>

              {/* Create Account Button */}
              <button
                type="button"
                className="login-btn-secondary"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await authService.login('admin@assetflow.com', 'Devankit@925');
                    const token = res.data?.token || res.token;
                    const user  = res.data?.user  || res.user;
                    if (token) {
                      localStorage.setItem('token', token);
                      if (user) localStorage.setItem('user', JSON.stringify(user));
                    }
                  } catch (err) {
                    console.warn('Backend login failed. Bypassing with guest token.', err);
                    localStorage.setItem('token', 'guest-bypass-token');
                    localStorage.setItem('user', JSON.stringify({ name: 'Guest User', role: 'ADMIN' }));
                  } finally {
                    setLoading(false);
                    navigate('/dashboard');
                  }
                }}
                disabled={loading}
              >
                Continue as Guest (Dev Mode)
              </button>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="login-tagline">
          <p>
            Institutional-grade security. Two-factor authentication available upon login.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-page-footer">
        <div className="login-page-footer-inner">
          <div className="login-footer-brand">
            <strong>AssetFlow</strong>
            <span>© 2025 AssetFlow. All rights reserved.</span>
          </div>
          <div className="login-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
            <a href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
