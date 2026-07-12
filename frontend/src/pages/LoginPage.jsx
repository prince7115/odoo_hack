import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // TODO: integrate with Spring Boot auth API
    // For now, navigate directly to dashboard
    navigate('/dashboard')
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
              {/* Email */}
              <div className="login-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Forgot Password */}
              <div className="login-forgot">
                <a href="#">Forgot password</a>
              </div>

              {/* Login Button */}
              <button type="submit" className="login-btn-primary">
                Login
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
              <button className="login-btn-secondary">
                Create Account
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
