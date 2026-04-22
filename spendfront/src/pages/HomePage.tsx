import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((s) => s.auth)
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User'
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <section className="home-shell">
      <div className="home-container">
        <header className="home-header">
          <div className="home-greeting">
            <p className="home-kicker">Welcome back</p>
            <h1>Hi, {displayName} 👋</h1>
          </div>
          <div className="home-header-actions">
            <Link to="/profile" className="home-avatar-btn">
              <span className="home-avatar">{displayName.charAt(0).toUpperCase()}</span>
            </Link>
            <button
              className="logout-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Logout"
              id="logout-btn"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="home-balance-card">
          <div className="balance-card-inner">
            <div className="balance-label">Total Balance</div>
            <div className="balance-amount">
              <span className="currency">₹</span>
              <span className="amount">0</span>
            </div>
            <div className="balance-trend">
              <span className="trend-badge neutral">
                <TrendingUp size={14} />
                Start tracking
              </span>
            </div>
          </div>
          <div className="balance-stats">
            <div className="balance-stat income-stat">
              <div className="stat-icon-wrap income-icon">
                <TrendingUp size={18} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Income</span>
                <strong className="stat-value income-value">₹0</strong>
              </div>
            </div>
            <div className="balance-stat-divider" />
            <div className="balance-stat expense-stat">
              <div className="stat-icon-wrap expense-icon">
                <TrendingDown size={18} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Expense</span>
                <strong className="stat-value expense-value">₹0</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="home-quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-action-grid">
            <Link to="/income-form" className="quick-action-card income-action">
              <div className="qa-icon">
                <TrendingUp size={22} />
              </div>
              <span>Add Income</span>
              <ArrowRight size={16} className="qa-arrow" />
            </Link>
            <Link to="/expense-form" className="quick-action-card expense-action">
              <div className="qa-icon">
                <TrendingDown size={22} />
              </div>
              <span>Add Expense</span>
              <ArrowRight size={16} className="qa-arrow" />
            </Link>
            <Link to="/budget" className="quick-action-card budget-action">
              <div className="qa-icon">
                <Wallet size={22} />
              </div>
              <span>Budgets</span>
              <ArrowRight size={16} className="qa-arrow" />
            </Link>
            <Link to="/goals" className="quick-action-card goals-action">
              <div className="qa-icon">
                <Target size={22} />
              </div>
              <span>Goals</span>
              <ArrowRight size={16} className="qa-arrow" />
            </Link>
          </div>
        </div>

        <div className="home-recent">
          <div className="section-header">
            <h2 className="section-title">Recent Transactions</h2>
            <Link to="/analytics" className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="empty-transactions">
            <div className="empty-icon">
              <Wallet size={48} />
            </div>
            <h3>No transactions yet</h3>
            <p>Start by adding your first income or expense to see your financial activity here.</p>
            <div className="empty-actions">
              <Link to="/income-form" className="empty-action-btn income-btn">
                <TrendingUp size={16} />
                Add Income
              </Link>
              <Link to="/expense-form" className="empty-action-btn expense-btn">
                <TrendingDown size={16} />
                Add Expense
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
