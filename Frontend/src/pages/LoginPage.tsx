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
      <section className="auth-hero">
        <p className="auth-eyebrow">Spendwise</p>
        <h1>Track spending with one clean sign-in flow.</h1>
        <p className="auth-copy">
          Use Google for one-click access or continue with email and password.
        </p>
        <div className="auth-points">
          <div>
            <strong>Fast onboarding</strong>
            <span>Create an account in a few seconds.</span>
          </div>
          <div>
            <strong>Local + Google auth</strong>
            <span>Pick the sign-in method that fits your workflow.</span>
          </div>
          <div>
            <strong>Backend ready</strong>
            <span>Requests are wired to your Express auth endpoints.</span>
          </div>
        </div>
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
          <p>Login with your email and password.</p>
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
