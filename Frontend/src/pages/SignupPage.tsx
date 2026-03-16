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
        <h1>Start building smarter money habits from your first entry.</h1>
        <p className="auth-copy">
          Create your Spendwise account to unlock a professional dashboard for tracking, comparing, and understanding
          your day-to-day financial activity.
        </p>
        <div className="auth-stat-grid">
          <div className="auth-stat">
            <strong>Simple Setup</strong>
            <span>Register in less than a minute.</span>
          </div>
          <div className="auth-stat">
            <strong>Actionable Data</strong>
            <span>Convert entries into meaningful visual insights.</span>
          </div>
        </div>
        <div className="auth-points">
          <div>
            <strong>Personalized profile</strong>
            <span>Use your name and account identity across the app.</span>
          </div>
          <div>
            <strong>Local + Google authentication</strong>
            <span>Choose the sign-up method that matches your workflow.</span>
          </div>
          <div>
            <strong>Category-first analytics</strong>
            <span>Visualize top earning and spending areas right from home.</span>
          </div>
        </div>
        <p className="auth-trust-row">Designed for people who want clarity, consistency, and confidence with money.</p>
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
