import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const BACKEND_URL = 'http://localhost:3000'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchParams] = useSearchParams()
  const errorFromServer = searchParams.get('error')

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero auth-hero-image">
        <p className="auth-eyebrow">Spendwise</p>
        <h1>Manage income and expenses with a dashboard built for clarity.</h1>
        <p className="auth-copy">
          Spendwise gives you real-time visibility into your financial activity with category insights, totals, and
          a smooth workflow from data entry to analysis.
        </p>
        <div className="auth-stat-grid">
          <div className="auth-stat">
            <strong>Unified View</strong>
            <span>Income, expense, and balance in one place.</span>
          </div>
          <div className="auth-stat">
            <strong>Smart Insights</strong>
            <span>Category breakdowns with quick visual charts.</span>
          </div>
        </div>
        <div className="auth-points">
          <div>
            <strong>Instant start</strong>
            <span>Sign in with Google or continue with your email.</span>
          </div>
          <div>
            <strong>Clean dashboard flow</strong>
            <span>Move from overview to form pages without friction.</span>
          </div>
          <div>
            <strong>Secure session handling</strong>
            <span>Authenticated routes keep your financial data private.</span>
          </div>
        </div>
        <p className="auth-trust-row">Built for focused personal finance tracking and daily review habits.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs" aria-label="Authentication pages">
          <Link className="auth-tab active" to="/login">
            Login
          </Link>
          <Link className="auth-tab" to="/signup">
            Sign up
          </Link>
        </div>

        <div className="auth-panel-head">
          <h2>Welcome back</h2>
          <p>Login to continue tracking your financial progress.</p>
        </div>

        <button className="google-button" onClick={handleGoogleLogin} type="button">
          <span className="google-mark">G</span>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form
          action={`${BACKEND_URL}/auth/login`}
          className="auth-form"
          method="post"
          onSubmit={() => setIsSubmitting(true)}
        >
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
              autoComplete="current-password"
              minLength={6}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </label>

          {errorFromServer ? (
            <p className="auth-message error">{errorFromServer}</p>
          ) : null}

          <button className="submit-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Please wait...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Need an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  )
}
