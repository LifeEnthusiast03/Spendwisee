import { TrendingUp, TrendingDown, Wallet, Target, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { useIncomes, useExpenses } from '../hooks/useTransactionQueries'

export default function HomePage() {
  const { user } = useAppSelector((s) => s.auth)
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User'

  // ── React Query – cached, shared fetches ─────────────────────────────────
  const { data: incomes = [], isLoading: loadingInc } = useIncomes()
  const { data: expenses = [], isLoading: loadingExp } = useExpenses()

  const loading = loadingInc || loadingExp

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense

  const recentIncomes = [...incomes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  return (
    <div className="page-content">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <p className="page-kicker">Welcome back 👋</p>
          <h1 className="page-title">Hi, {displayName}</h1>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="stats-row">
        <div className="stat-card stat-card--balance">
          <div className="stat-card-label">Net Balance</div>
          <div className="stat-card-value">₹{fmt(balance)}</div>
          <div className="stat-card-sub">
            {balance >= 0 ? "You're on track 🎯" : 'Overspent this period'}
          </div>
        </div>
        <div className="stat-card stat-card--income">
          <div className="stat-card-icon"><TrendingUp size={22} /></div>
          <div className="stat-card-label">Total Income</div>
          <div className="stat-card-value">₹{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card stat-card--expense">
          <div className="stat-card-icon"><TrendingDown size={22} /></div>
          <div className="stat-card-label">Total Expenses</div>
          <div className="stat-card-value">₹{fmt(totalExpense)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="home-section">
        <h2 className="section-heading">Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/transactions" className="quick-action income-action">
            <TrendingUp size={20} />
            <span>Add Income</span>
          </Link>
          <Link to="/transactions" className="quick-action expense-action">
            <TrendingDown size={20} />
            <span>Add Expense</span>
          </Link>
          <Link to="/budgets" className="quick-action budget-action">
            <Wallet size={20} />
            <span>Budgets</span>
          </Link>
          <Link to="/goals" className="quick-action goals-action">
            <Target size={20} />
            <span>Goals</span>
          </Link>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="home-section">
        <div className="section-header-row">
          <h2 className="section-heading">Recent Transactions</h2>
          <Link to="/analytics" className="view-all-link">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : recentIncomes.length === 0 && recentExpenses.length === 0 ? (
          <div className="empty-state">
            <Wallet size={40} className="empty-icon" />
            <p>No transactions yet. <Link to="/transactions">Add your first one →</Link></p>
          </div>
        ) : (
          <div className="txn-list">
            {[
              ...recentIncomes.map((t) => ({ ...t, type: 'income' as const })),
              ...recentExpenses.map((t) => ({ ...t, type: 'expense' as const })),
            ]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 8)
              .map((t) => (
                <div key={`${t.type}-${t.id}`} className={`txn-row txn-row--${t.type}`}>
                  <div className={`txn-dot txn-dot--${t.type}`} />
                  <div className="txn-info">
                    <span className="txn-category">{t.category}</span>
                    {t.note && <span className="txn-note">{t.note}</span>}
                  </div>
                  <span className="txn-date">{fmtDate(t.date)}</span>
                  <span className={`txn-amount txn-amount--${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}₹{fmt(t.amount)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
