import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TopNavigation from '../components/TopNavigation'
import { useDashboardData } from '../hooks/useDashboardData'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
type TransactionType = 'income' | 'expense'
type TypeFilter = 'all' | TransactionType
type SortBy = 'date' | 'amount' | 'category'
type SortOrder = 'asc' | 'desc'
type BudgetType = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

interface IncomeGoal {
  id: number
  amount: number
  type: BudgetType
  createdAt: string
  userId: number
}

interface ExpenseBudget {
  id: number
  amount: number
  type: BudgetType
  createdAt: string
  userId: number
}

export default function BudgetPage() {
  const navigate = useNavigate()
  const { isLoadingData, dataError, totalIncome, totalExpense, netBalance, expenseTotals, incomes, expenses } = useDashboardData()
  const [incomeGoals, setIncomeGoals] = useState<IncomeGoal[]>([])
  const [expenseBudgets, setExpenseBudgets] = useState<ExpenseBudget[]>([])
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    fetchGoalsAndBudgets()
  }, [])

  const fetchGoalsAndBudgets = async () => {
    try {
      setGoalsLoading(true)
      const [goalsRes, budgetsRes] = await Promise.all([
        axios.get('http://localhost:3000/incomegoal', { withCredentials: true }),
        axios.get('http://localhost:3000/expensebudget', { withCredentials: true }),
      ])
      setIncomeGoals(goalsRes.data)
      setExpenseBudgets(budgetsRes.data)
    } catch (err) {
      console.error('Failed to fetch goals and budgets:', err)
    } finally {
      setGoalsLoading(false)
    }
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  const getYearStart = (date: Date) => {
    return new Date(date.getFullYear(), 0, 1)
  }

  const currentIncome = useMemo(() => {
    const now = new Date()
    return {
      weekly: incomes.reduce((sum, item) => {
        const itemDate = new Date(item.date)
        if (itemDate >= getWeekStart(now) && itemDate <= now) {
          return sum + item.amount
        }
        return sum
      }, 0),
      monthly: incomes.reduce((sum, item) => {
        const itemDate = new Date(item.date)
        if (itemDate >= getMonthStart(now) && itemDate <= now) {
          return sum + item.amount
        }
        return sum
      }, 0),
      yearly: incomes.reduce((sum, item) => {
        const itemDate = new Date(item.date)
        if (itemDate >= getYearStart(now) && itemDate <= now) {
          return sum + item.amount
        }
        return sum
      }, 0),
    }
  }, [incomes])

  const currentExpense = useMemo(() => {
    const now = new Date()
    return {
      weekly: expenses.reduce((sum, item) => {
        const itemDate = new Date(item.date)
        if (itemDate >= getWeekStart(now) && itemDate <= now) {
          return sum + item.amount
        }
        return sum
      }, 0),
      monthly: expenses.reduce((sum, item) => {
        const itemDate = new Date(item.date)
        if (itemDate >= getMonthStart(now) && itemDate <= now) {
          return sum + item.amount
        }
        return sum
      }, 0),
      yearly: expenses.reduce((sum, item) => {
        const itemDate = new Date(item.date)
        if (itemDate >= getYearStart(now) && itemDate <= now) {
          return sum + item.amount
        }
        return sum
      }, 0),
    }
  }, [expenses])

  const incomeGoalCompletion = useMemo(() => {
    const weeklyGoal = incomeGoals.find((g) => g.type === 'WEEKLY')
    const monthlyGoal = incomeGoals.find((g) => g.type === 'MONTHLY')
    const yearlyGoal = incomeGoals.find((g) => g.type === 'YEARLY')

    return {
      weekly: weeklyGoal ? Math.min((currentIncome.weekly / weeklyGoal.amount) * 100, 100) : 0,
      monthly: monthlyGoal ? Math.min((currentIncome.monthly / monthlyGoal.amount) * 100, 100) : 0,
      yearly: yearlyGoal ? Math.min((currentIncome.yearly / yearlyGoal.amount) * 100, 100) : 0,
      hasGoals: incomeGoals.length > 0,
    }
  }, [incomeGoals, currentIncome])

  const expenseBudgetCompletion = useMemo(() => {
    const weeklyBudget = expenseBudgets.find((b) => b.type === 'WEEKLY')
    const monthlyBudget = expenseBudgets.find((b) => b.type === 'MONTHLY')
    const yearlyBudget = expenseBudgets.find((b) => b.type === 'YEARLY')

    return {
      weekly: weeklyBudget ? Math.min((currentExpense.weekly / weeklyBudget.amount) * 100, 100) : 0,
      monthly: monthlyBudget ? Math.min((currentExpense.monthly / monthlyBudget.amount) * 100, 100) : 0,
      yearly: yearlyBudget ? Math.min((currentExpense.yearly / yearlyBudget.amount) * 100, 100) : 0,
      hasBudgets: expenseBudgets.length > 0,
    }
  }, [expenseBudgets, currentExpense])

  const transactions = useMemo(
    () => [
      ...incomes.map((item) => ({ ...item, type: 'income' as const })),
      ...expenses.map((item) => ({ ...item, type: 'expense' as const })),
    ],
    [incomes, expenses],
  )

  const availableCategories = useMemo(() => {
    const base = transactions.filter((item) => (typeFilter === 'all' ? true : item.type === typeFilter))
    return Array.from(new Set(base.map((item) => item.category))).sort((a, b) => a.localeCompare(b))
  }, [transactions, typeFilter])

  const filteredTransactions = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase()

    const filtered = transactions.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false
      }

      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false
      }

      const itemDate = new Date(item.date)
      if (fromDate) {
        const fromBoundary = new Date(`${fromDate}T00:00:00`)
        if (itemDate < fromBoundary) {
          return false
        }
      }

      if (toDate) {
        const toBoundary = new Date(`${toDate}T23:59:59`)
        if (itemDate > toBoundary) {
          return false
        }
      }

      if (normalizedSearchText) {
        const noteText = (item.note ?? '').toLowerCase()
        if (!noteText.includes(normalizedSearchText) && !item.category.toLowerCase().includes(normalizedSearchText)) {
          return false
        }
      }

      return true
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      }

      if (sortBy === 'category') {
        const compare = a.category.localeCompare(b.category)
        return sortOrder === 'asc' ? compare : -compare
      }

      const compare = new Date(a.date).getTime() - new Date(b.date).getTime()
      return sortOrder === 'asc' ? compare : -compare
    })

    return sorted
  }, [transactions, typeFilter, categoryFilter, fromDate, toDate, searchText, sortBy, sortOrder])

  const filteredTotal = useMemo(
    () => filteredTransactions.reduce((sum, item) => sum + item.amount, 0),
    [filteredTransactions],
  )

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

            <section className="entry-overview-grid metric-grid">
              <article className="entry-card goals-display-card">
                <div className="goals-display-head">
                  <h3>📊 Income Goals</h3>
                  <button 
                    className="view-more-link"
                    onClick={() => navigate('/income-goals')}
                  >
                    View All →
                  </button>
                </div>
                {goalsLoading ? (
                  <p className="goals-loading">Loading...</p>
                ) : incomeGoals.length === 0 ? (
                  <p className="goals-empty">No income goals yet</p>
                ) : (
                  <ul className="goals-summary-list">
                    {incomeGoals.map((goal) => (
                      <li key={goal.id} className="goal-summary-item">
                        <span className="goal-badge">{goal.type}</span>
                        <span className="goal-amount">₹{money.format(goal.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="entry-card goals-display-card">
                <div className="goals-display-head">
                  <h3>💸 Expense Budgets</h3>
                  <button 
                    className="view-more-link"
                    onClick={() => navigate('/expense-budget')}
                  >
                    View All →
                  </button>
                </div>
                {goalsLoading ? (
                  <p className="goals-loading">Loading...</p>
                ) : expenseBudgets.length === 0 ? (
                  <p className="goals-empty">No budgets set yet</p>
                ) : (
                  <ul className="goals-summary-list">
                    {expenseBudgets.map((budget) => (
                      <li key={budget.id} className="goal-summary-item">
                        <span className="goal-badge">{budget.type}</span>
                        <span className="goal-amount">₹{money.format(budget.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>

            {incomeGoalCompletion.hasGoals && (
              <section className="entry-card completion-chart-card">
                <h2>Income Goal Progress</h2>
                <div className="completion-grid">
                  <div className="completion-item">
                    <div className="completion-pie" style={{
                      background: `conic-gradient(#10b981 0deg ${incomeGoalCompletion.weekly * 3.6}deg, rgba(16, 185, 129, 0.2) ${incomeGoalCompletion.weekly * 3.6}deg)`
                    }}>
                      <span className="completion-percent">{Math.round(incomeGoalCompletion.weekly)}%</span>
                    </div>
                    <p className="completion-label">Weekly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{
                      background: `conic-gradient(#3b82f6 0deg ${incomeGoalCompletion.monthly * 3.6}deg, rgba(59, 130, 246, 0.2) ${incomeGoalCompletion.monthly * 3.6}deg)`
                    }}>
                      <span className="completion-percent">{Math.round(incomeGoalCompletion.monthly)}%</span>
                    </div>
                    <p className="completion-label">Monthly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{
                      background: `conic-gradient(#f97316 0deg ${incomeGoalCompletion.yearly * 3.6}deg, rgba(249, 115, 22, 0.2) ${incomeGoalCompletion.yearly * 3.6}deg)`
                    }}>
                      <span className="completion-percent">{Math.round(incomeGoalCompletion.yearly)}%</span>
                    </div>
                    <p className="completion-label">Yearly</p>
                  </div>
                </div>
              </section>
            )}

            {expenseBudgetCompletion.hasBudgets && (
              <section className="entry-card completion-chart-card">
                <h2>Expense Budget Usage</h2>
                <div className="completion-grid">
                  <div className="completion-item">
                    <div className="completion-pie" style={{
                      background: `conic-gradient(#ec4899 0deg ${expenseBudgetCompletion.weekly * 3.6}deg, rgba(236, 72, 153, 0.2) ${expenseBudgetCompletion.weekly * 3.6}deg)`
                    }}>
                      <span className="completion-percent">{Math.round(expenseBudgetCompletion.weekly)}%</span>
                    </div>
                    <p className="completion-label">Weekly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{
                      background: `conic-gradient(#8b5cf6 0deg ${expenseBudgetCompletion.monthly * 3.6}deg, rgba(139, 92, 246, 0.2) ${expenseBudgetCompletion.monthly * 3.6}deg)`
                    }}>
                      <span className="completion-percent">{Math.round(expenseBudgetCompletion.monthly)}%</span>
                    </div>
                    <p className="completion-label">Monthly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{
                      background: `conic-gradient(#ee7752 0deg ${expenseBudgetCompletion.yearly * 3.6}deg, rgba(238, 119, 82, 0.2) ${expenseBudgetCompletion.yearly * 3.6}deg)`
                    }}>
                      <span className="completion-percent">{Math.round(expenseBudgetCompletion.yearly)}%</span>
                    </div>
                    <p className="completion-label">Yearly</p>
                  </div>
                </div>
              </section>
            )}

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

            <section className="entry-card budget-list-card">
              <div className="list-head">
                <h2>Filtered Transactions</h2>
                <span>{filteredTransactions.length} records</span>
              </div>

              <div className="budget-filters-grid">
                <label>
                  <span>Type</span>
                  <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}>
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </label>

                <label>
                  <span>Category</span>
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                    <option value="ALL">All</option>
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>From</span>
                  <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                </label>

                <label>
                  <span>To</span>
                  <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                </label>

                <label>
                  <span>Sort By</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                  </select>
                </label>

                <label>
                  <span>Order</span>
                  <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </label>

                <label className="budget-search-label">
                  <span>Search</span>
                  <input
                    placeholder="Search note or category"
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                  />
                </label>
              </div>

              <div className="budget-filter-summary">
                <strong>Filtered Total</strong>
                <span>₹{money.format(filteredTotal)}</span>
              </div>

              {filteredTransactions.length === 0 ? <p>No data matches your filter.</p> : null}

              {filteredTransactions.length > 0 ? (
                <div className="budget-table-wrap">
                  <table className="budget-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((item) => (
                        <tr key={`${item.type}-${item.id}`}>
                          <td className={item.type === 'income' ? 'income' : 'expense'}>{item.type.toUpperCase()}</td>
                          <td>{item.category}</td>
                          <td>₹{money.format(item.amount)}</td>
                          <td>{new Date(item.date).toLocaleDateString('en-IN')}</td>
                          <td>{item.note ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </section>
  )
}
