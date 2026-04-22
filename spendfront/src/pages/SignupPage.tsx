import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'
import api, { API_BASE } from '../store/api'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`
  }

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/register', { name, email, password })
      toast.success(response.data.message ?? 'Registered successfully!')
      setName('')
      setEmail('')
      setPassword('')
      window.setTimeout(() => navigate('/login'), 900)
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message ?? 'Something went wrong' : 'Something went wrong'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero-content">
          <p className="auth-eyebrow">Spendwise</p>
          <h1>Start your financial journey with confidence.</h1>
          <p className="auth-copy">
            Create your account to unlock a professional personal finance dashboard. Track income, analyze expenses, and build smarter money habits starting today.
          </p>
          <div className="auth-stat-grid">
            <div className="auth-stat">
              <strong>Simple Setup</strong>
              <span>Create your account in less than a minute.</span>
            </div>
            <div className="auth-stat">
              <strong>Powerful Analytics</strong>
              <span>Convert every entry into actionable financial insights.</span>
            </div>
          </div>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">💰</span>
              <div>
                <strong>Complete Control</strong>
                <span>Add, edit, and delete transactions with full control over your financial records.</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">📈</span>
              <div>
                <strong>Weekly & Monthly Reports</strong>
                <span>Track spending trends, average daily expenses, and income patterns at multiple time scales.</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">⚡</span>
              <div>
                <strong>Quick Insights</strong>
                <span>Spend-to-income ratio, top expenses, transaction counts, and more at your fingertips.</span>
              </div>
            </div>
          </div>
          <p className="auth-trust-row">✨ Get started today and take control of your financial story with Spendwise.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs" aria-label="Authentication pages">
          <Link className="auth-tab" to="/login">Login</Link>
          <Link className="auth-tab active" to="/signup">Sign up</Link>
        </div>

        <div className="auth-panel-head">
          <h2>Create your account</h2>
          <p>Sign up with your name, email, and password to get started.</p>
        </div>

        <button className="google-button" onClick={handleGoogleLogin} type="button" id="google-signup-btn">
          <span className="google-mark">G</span>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or continue with email</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full name</span>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                autoComplete="name"
                name="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                required
                type="text"
                value={name}
                id="signup-name"
              />
            </div>
          </label>
          <label>
            <span>Email</span>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                autoComplete="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
                id="signup-email"
              />
            </div>
          </label>
          <label>
            <span>Password</span>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                autoComplete="new-password"
                minLength={6}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                id="signup-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error ? <p className="auth-message error">{error}</p> : null}
          <button className="submit-button" disabled={isSubmitting} type="submit" id="signup-submit-btn">
            {isSubmitting ? 'Please wait...' : (
              <>
                Create account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  )
}
