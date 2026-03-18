import axios from 'axios'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BACKEND_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
})

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`
  }

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/register', { name, email, password })
      setSuccess(response.data.message ?? 'Registered successfully')
      setName('')
      setEmail('')
      setPassword('')
      window.setTimeout(() => navigate('/login'), 900)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Request failed')
      } else {
        setError('Something went wrong')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero auth-hero-image">
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
        <div className="auth-points">
          <div>
            <strong>💰 Complete Control</strong>
            <span>Add, edit, and delete transactions with full control over your financial records.</span>
          </div>
          <div>
            <strong>📈 Weekly & Monthly Reports</strong>
            <span>Track spending trends, average daily expenses, and income patterns at multiple time scales.</span>
          </div>
          <div>
            <strong>⚡ Quick Insights</strong>
            <span>Spend-to-income ratio, top expenses, transaction counts, and more at your fingertips.</span>
          </div>
        </div>
        <p className="auth-trust-row">✨ Get started today and take control of your financial story with Spendwise.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs" aria-label="Authentication pages">
          <Link className="auth-tab" to="/login">
            Login
          </Link>
          <Link className="auth-tab active" to="/signup">
            Sign up
          </Link>
        </div>

        <div className="auth-panel-head">
          <h2>Create your account</h2>
          <p>Sign up with your name, email, and password to get started.</p>
        </div>

        <button className="google-button" onClick={handleGoogleLogin} type="button">
          <span className="google-mark">G</span>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full name</span>
            <input
              autoComplete="name"
              name="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              required
              type="text"
              value={name}
            />
          </label>

          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete="new-password"
              minLength={6}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="auth-message error">{error}</p> : null}
          {success ? <p className="auth-message success">{success}</p> : null}

          <button className="submit-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Please wait...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  )
}
