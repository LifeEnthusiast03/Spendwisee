import TopNavigation from '../components/TopNavigation'
import { useDashboardData } from '../hooks/useDashboardData'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export default function ProfilePage() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const { isLoadingData, dataError, profile, profileError, totalIncome, totalExpense, netBalance, incomes, expenses } = useDashboardData()

  const displayName = profile?.name?.trim() || profile?.email?.split('@')[0] || 'User'
  const profileInitial = displayName.charAt(0).toUpperCase()
  const totalTransactions = incomes.length + expenses.length
  const spendRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0

  const handleLogout = async () => {
    setLogoutError('')
    setIsLoggingOut(true)

    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        setLogoutError('Logout failed. Please try again.')
        return
      }

      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Network error while logging out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />

        <header className="mobile-header single-column">
          <div className="mobile-greeting">
            <p className="mobile-kicker">SpendWise</p>
            <h1>Profile</h1>
          </div>
        </header>

        {isLoadingData ? <p className="entry-loading">Loading profile...</p> : null}
        {!isLoadingData && (dataError || profileError) ? (
          <p className="entry-message error">{dataError || profileError}</p>
        ) : null}

        {!isLoadingData && !dataError && !profileError ? (
          <section className="entry-card profile-page-card">
            <div className="profile-hero-strip">
              <div className="profile-head profile-head-large">
                <div className="profile-avatar profile-avatar-xl">{profileInitial}</div>
                <div>
                  <p className="profile-label">SpendWise Member</p>
                  <h2>{displayName}</h2>
                  <p className="profile-email">{profile?.email}</p>
                </div>
              </div>

              <div className="profile-summary-pill">
                <span>Active transactions</span>
                <strong>{totalTransactions}</strong>
              </div>
            </div>

            <div className="profile-meta-grid">
              <article>
                <span>Display Name</span>
                <strong>{displayName}</strong>
              </article>
              <article>
                <span>Email Address</span>
                <strong>{profile?.email ?? 'N/A'}</strong>
              </article>
            </div>

            <div className="profile-stats-grid">
              <article>
                <span>Income</span>
                <strong className="income">₹{money.format(totalIncome)}</strong>
              </article>
              <article>
                <span>Expense</span>
                <strong className="expense">₹{money.format(totalExpense)}</strong>
              </article>
              <article>
                <span>Balance</span>
                <strong className={netBalance >= 0 ? 'income' : 'expense'}>₹{money.format(Math.abs(netBalance))}</strong>
              </article>
            </div>

            <div className="profile-insight-row">
              <div>
                <span>Spend / Income</span>
                <strong>{spendRatio.toFixed(1)}%</strong>
              </div>
              <div>
                <span>Status</span>
                <strong className={netBalance >= 0 ? 'income' : 'expense'}>
                  {netBalance >= 0 ? 'Healthy cashflow' : 'Review spending'}
                </strong>
              </div>
            </div>

            {logoutError ? <p className="entry-message error">{logoutError}</p> : null}

            <div className="profile-actions">
              <button className="logout-button" disabled={isLoggingOut} onClick={handleLogout} type="button">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}
