import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'
import api, { API_BASE } from '../store/api'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, LayoutDashboard, BarChart3, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import Logo from '../components/Logo'

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

  const handleSignup = async (event: React.SyntheticEvent<HTMLFormElement>) => {
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
        <div className="auth-hero-bg"></div>
        <div className="auth-hero-content">
          <Logo variant="full" size={28} theme="dark" className="auth-eyebrow" />
          <h1>Start your financial journey with confidence.</h1>
          <p className="auth-copy">
            Create your account to unlock a professional personal finance dashboard. Track income, analyze expenses, and build smarter money habits starting today.
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><LayoutDashboard size={20} /></span>
              <div className="auth-feature-text">
                <strong>Real-time Dashboard</strong>
                <span>View income, expenses, and balance instantly.</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><BarChart3 size={20} /></span>
              <div className="auth-feature-text">
                <strong>Smart Analytics</strong>
                <span>Category breakdowns, trends, and weekly insights.</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><ShieldCheck size={20} /></span>
              <div className="auth-feature-text">
                <strong>Secure & Private</strong>
                <span>Your financial data is encrypted and protected.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs" aria-label="Authentication pages">
          <Link className="auth-tab" to="/login">Login</Link>
          <Link className="auth-tab active" to="/signup">Sign up</Link>
        </div>

        <div className="auth-panel-head">
          <h2>Create account</h2>
          <p>Join SpendWise and take control of your money.</p>
        </div>

        <button className="google-button" onClick={handleGoogleLogin} type="button" id="google-signup-btn">
          <span className="google-mark">
            <svg viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </span>
          Sign up with Google
        </button>

        <div className="auth-divider"><span>or continue with email</span></div>

        <form className="auth-form" onSubmit={handleSignup}>
          <label>
            <span>Full Name</span>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                type="text"
                value={name}
                id="signup-name"
              />
            </div>
          </label>
          <label>
            <span>Email address</span>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                autoComplete="email"
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
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
          
          <div className="auth-error-wrap">
            {error && (
              <p className="auth-message error">
                <AlertCircle size={16} />
                {error}
              </p>
            )}
          </div>

          <button className="submit-button" disabled={isSubmitting} type="submit" id="signup-submit-btn">
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
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
