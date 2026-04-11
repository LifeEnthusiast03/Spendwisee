import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import TopNavigation from '../components/TopNavigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export default function ProfilePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { user } = useAppSelector((s) => s.auth)
  const { incomes, totals: incomeTotals, isLoading } = useAppSelector((s) => s.income)
  const { expenses, totals: expenseTotals } = useAppSelector((s) => s.expense)
  const { goals } = useAppSelector((s) => s.goal)

  const totalIncome = Object.values(incomeTotals).reduce((s, a) => s + a, 0)
  const totalExpense = Object.values(expenseTotals).reduce((s, a) => s + a, 0)
  const netBalance = totalIncome - totalExpense
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User'
  const profileInitial = displayName.charAt(0).toUpperCase()
  const totalTransactions = incomes.length + expenses.length
  const spendRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0
  const activeGoals = goals.filter((g) => g.isActive)
  const totalGoalSaved = activeGoals.reduce((s, g) => s + g.totalMoney, 0)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const result = await dispatch(logout())
    if (logout.fulfilled.match(result)) {
      toast.success('Logged out successfully')
      navigate('/login', { replace: true })
    } else {
      toast.error('Logout failed. Please try again.')
    }
    setIsLoggingOut(false)
  }

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />
        <header className="mobile-header single-column">
          <div className="mobile-greeting"><p className="mobile-kicker">SpendWise</p><h1>Profile</h1></div>
        </header>

        {isLoading ? <div className="skeleton-card pulse" /> : (
          <section className="entry-card profile-page-card">
            <div className="profile-hero-strip">
              <div className="profile-head profile-head-large">
                <div className="profile-avatar profile-avatar-xl">{profileInitial}</div>
                <div>
                  <p className="profile-label">SpendWise Member</p>
                  <h2>{displayName}</h2>
                  <p className="profile-email">{user?.email}</p>
                </div>
              </div>
              <div className="profile-summary-pill"><span>Active transactions</span><strong>{totalTransactions}</strong></div>
            </div>

            <div className="profile-meta-grid">
              <article><span>Display Name</span><strong>{displayName}</strong></article>
              <article><span>Email Address</span><strong>{user?.email ?? 'N/A'}</strong></article>
            </div>

            <div className="profile-stats-grid">
              <article><span>Income</span><strong className="income">₹{money.format(totalIncome)}</strong></article>
              <article><span>Expense</span><strong className="expense">₹{money.format(totalExpense)}</strong></article>
              <article><span>Balance</span><strong className={netBalance >= 0 ? 'income' : 'expense'}>₹{money.format(Math.abs(netBalance))}</strong></article>
              <article><span>Goals Saved</span><strong className="goals-saved">₹{money.format(totalGoalSaved)}</strong></article>
            </div>

            <div className="profile-insight-row">
              <div><span>Spend / Income</span><strong>{spendRatio.toFixed(1)}%</strong></div>
              <div><span>Active Goals</span><strong>{activeGoals.length}</strong></div>
              <div><span>Status</span><strong className={netBalance >= 0 ? 'income' : 'expense'}>{netBalance >= 0 ? 'Healthy cashflow' : 'Review spending'}</strong></div>
            </div>

            <div className="profile-actions">
              <button className="logout-button" disabled={isLoggingOut} onClick={handleLogout} type="button">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}
