import TopNavigation from '../components/TopNavigation'
import { useDashboardData } from '../hooks/useDashboardData'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

const categoryIcon = (category: string): string => {
  const key = category.trim().toUpperCase()
  if (key.includes('FOOD')) return '🍔'
  if (key.includes('TRANSPORT') || key.includes('TRAVEL')) return '🚌'
  if (key.includes('SUBSCRIPTION')) return '📺'
  if (key.includes('SALARY')) return '💼'
  if (key.includes('FREELANCE')) return '🧑‍💻'
  return '💸'
}

export default function HomePage() {
  const { isLoadingData, dataError, profile, incomes, expenses, totalIncome, totalExpense, netBalance } = useDashboardData()

  const displayName = profile?.name?.trim() || profile?.email?.split('@')[0] || 'User'

  const recentTransactions = [...incomes.map((item) => ({ ...item, id: `income-${item.id}`, type: 'income' as const })), ...expenses.map((item) => ({ ...item, id: `expense-${item.id}`, type: 'expense' as const }))]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />

        <header className="mobile-header single-column">
          <div className="mobile-greeting">
            <p className="mobile-kicker">Welcome back</p>
            <h1>Hi, {displayName}</h1>
          </div>
        </header>

        <section className="balance-glass">
          <div className="balance-head">
            <p>Total Balance</p>
            <strong className={netBalance >= 0 ? 'balance-positive' : 'balance-negative'}>
              ₹{money.format(Math.abs(netBalance))}
            </strong>
          </div>
          <div className="balance-grid">
            <article>
              <span>Income</span>
              <h3 className="income">₹{money.format(totalIncome)}</h3>
            </article>
            <article>
              <span>Expense</span>
              <h3 className="expense">₹{money.format(totalExpense)}</h3>
            </article>
          </div>
        </section>

        {isLoadingData ? <p className="entry-loading">Loading dashboard...</p> : null}
        {!isLoadingData && dataError ? <p className="entry-message error">{dataError}</p> : null}

        {!isLoadingData && !dataError ? (
          <section className="entry-list-card recent-transactions">
            <div className="list-head">
              <h2>Recent Transactions</h2>
              <span>{recentTransactions.length} items</span>
            </div>
            {recentTransactions.length === 0 ? <p>No transactions yet.</p> : null}
            {recentTransactions.length > 0 ? (
              <ul>
                {recentTransactions.map((transaction) => (
                  <li key={transaction.id}>
                    <div className={`tx-icon ${transaction.type}`}>{categoryIcon(transaction.category)}</div>
                    <div className="tx-meta">
                      <strong>{transaction.category}</strong>
                      <span>
                        {new Date(transaction.date).toLocaleDateString()} {transaction.note ? `• ${transaction.note}` : ''}
                      </span>
                    </div>
                    <strong className={transaction.type === 'income' ? 'tx-amount income' : 'tx-amount expense'}>
                      {transaction.type === 'income' ? '+' : '-'}₹{money.format(transaction.amount)}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>
    </section>
  )
}
