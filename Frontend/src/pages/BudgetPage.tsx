import TopNavigation from '../components/TopNavigation'
import { useDashboardData } from '../hooks/useDashboardData'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export default function BudgetPage() {
  const { isLoadingData, dataError, totalIncome, totalExpense, netBalance, expenseTotals } = useDashboardData()

  const topExpenseCategories = Object.entries(expenseTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  const maxExpenseCategory = Math.max(...topExpenseCategories.map((item) => item.amount), 1)

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />

        <header className="mobile-header single-column">
          <div className="mobile-greeting">
            <p className="mobile-kicker">SpendWise</p>
            <h1>Budget</h1>
          </div>
        </header>

        {isLoadingData ? <p className="entry-loading">Loading budget...</p> : null}
        {!isLoadingData && dataError ? <p className="entry-message error">{dataError}</p> : null}

        {!isLoadingData && !dataError ? (
          <>
            <section className="entry-overview-grid metric-grid">
              <article className="entry-card stat">
                <h3>Total Income</h3>
                <p className="income">₹{money.format(totalIncome)}</p>
              </article>
              <article className="entry-card stat">
                <h3>Total Expense</h3>
                <p className="expense">₹{money.format(totalExpense)}</p>
              </article>
              <article className="entry-card stat">
                <h3>Net Balance</h3>
                <p className={netBalance >= 0 ? 'income' : 'expense'}>₹{money.format(Math.abs(netBalance))}</p>
              </article>
            </section>

            <section className="entry-card budget-list-card">
              <div className="list-head">
                <h2>Top Expense Categories</h2>
                <span>{topExpenseCategories.length} categories</span>
              </div>
              {topExpenseCategories.length === 0 ? <p>No expense data yet.</p> : null}
              {topExpenseCategories.length > 0 ? (
                <ul className="budget-list">
                  {topExpenseCategories.map((item) => (
                    <li key={item.category}>
                      <div className="budget-row-head">
                        <strong>{item.category}</strong>
                        <span>₹{money.format(item.amount)}</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(item.amount / maxExpenseCategory) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </section>
  )
}
