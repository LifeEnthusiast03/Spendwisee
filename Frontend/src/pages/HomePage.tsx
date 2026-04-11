import { useMemo } from 'react'
import TopNavigation from '../components/TopNavigation'
import { useAppSelector } from '../store/hooks'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

const categoryIcon = (category: string): string => {
  const key = category.trim().toUpperCase()
  if (key.includes('FOOD')) return '🍔'
  if (key.includes('TRANSPORT') || key.includes('TRAVEL')) return '🚌'
  if (key.includes('SUBSCRIPTION')) return '📺'
  if (key.includes('SALARY')) return '💼'
  if (key.includes('FREELANCE')) return '🧑‍💻'
  if (key.includes('RENT')) return '🏠'
  if (key.includes('SHOPPING')) return '🛍️'
  if (key.includes('ENTERTAINMENT')) return '🎮'
  if (key.includes('BILLS')) return '📄'
  if (key.includes('BUSINESS')) return '📈'
  if (key.includes('INVESTMENT')) return '💹'
  if (key.includes('GIFT')) return '🎁'
  return '💸'
}

export default function HomePage() {
  const { user } = useAppSelector((s) => s.auth)
  const { incomes, totals: incomeTotals, isLoading: incomeLoading } = useAppSelector((s) => s.income)
  const { expenses, totals: expenseTotals, isLoading: expenseLoading } = useAppSelector((s) => s.expense)
  const { goals } = useAppSelector((s) => s.goal)

  const isLoading = incomeLoading || expenseLoading

  const totalIncome = useMemo(() => Object.values(incomeTotals).reduce((s, a) => s + a, 0), [incomeTotals])
  const totalExpense = useMemo(() => Object.values(expenseTotals).reduce((s, a) => s + a, 0), [expenseTotals])
  const netBalance = totalIncome - totalExpense

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User'

  const recentTransactions = useMemo(() => {
    return [
      ...incomes.map((i) => ({ ...i, id: `income-${i.id}`, type: 'income' as const })),
      ...expenses.map((e) => ({ ...e, id: `expense-${e.id}`, type: 'expense' as const })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [incomes, expenses])

  const activeGoals = goals.filter((g) => g.isActive)
  const totalGoalSaved = activeGoals.reduce((s, g) => s + g.totalMoney, 0)

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
            <article>
              <span>Goals Saved</span>
              <h3 className="goals-saved">₹{money.format(totalGoalSaved)}</h3>
            </article>
          </div>
        </section>

        {isLoading ? <div className="skeleton-card pulse" /> : null}

        {!isLoading ? (
          <>
            {activeGoals.length > 0 && (
              <section className="entry-list-card goals-preview-card">
                <div className="list-head">
                  <h2>🎯 Active Goals</h2>
                  <span>{activeGoals.length} goals</span>
                </div>
                <div className="goals-preview-grid">
                  {activeGoals.slice(0, 3).map((goal) => {
                    const pct = goal.amount > 0 ? Math.min((goal.totalMoney / goal.amount) * 100, 100) : 0
                    return (
                      <div key={goal.id} className="goal-preview-item">
                        <div className="goal-preview-head">
                          <strong>{goal.name}</strong>
                          <span>{Math.round(pct)}%</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill goal-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="goal-preview-footer">
                          <small>₹{money.format(goal.totalMoney)} / ₹{money.format(goal.amount)}</small>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="entry-list-card recent-transactions">
              <div className="list-head">
                <h2>Recent Transactions</h2>
                <span>{recentTransactions.length} items</span>
              </div>
              {recentTransactions.length === 0 ? <p className="empty-state">No transactions yet. Start by adding income or expense!</p> : null}
              {recentTransactions.length > 0 ? (
                <ul>
                  {recentTransactions.map((tx) => (
                    <li key={tx.id}>
                      <div className={`tx-icon ${tx.type}`}>{categoryIcon(tx.category)}</div>
                      <div className="tx-meta">
                        <strong>{tx.category}</strong>
                        <span>
                          {new Date(tx.date).toLocaleDateString()} {tx.note ? `• ${tx.note}` : ''}
                        </span>
                      </div>
                      <strong className={tx.type === 'income' ? 'tx-amount income' : 'tx-amount expense'}>
                        {tx.type === 'income' ? '+' : '-'}₹{money.format(tx.amount)}
                      </strong>
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
