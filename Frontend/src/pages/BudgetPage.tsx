import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation'
import { useAppSelector } from '../store/hooks'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
type TypeFilter = 'all' | 'income' | 'expense'
type SortBy = 'date' | 'amount' | 'category'
type SortOrder = 'asc' | 'desc'

export default function BudgetPage() {
  const navigate = useNavigate()
  const { incomes, totals: incomeTotals } = useAppSelector((s) => s.income)
  const { expenses, totals: expenseTotals } = useAppSelector((s) => s.expense)
  const { goals: incomeGoals, isLoading: goalsLoading } = useAppSelector((s) => s.incomeGoal)
  const { budgets: expenseBudgets } = useAppSelector((s) => s.expenseBudget)
  const isLoading = useAppSelector((s) => s.income.isLoading || s.expense.isLoading)

  const totalIncome = useMemo(() => Object.values(incomeTotals).reduce((s, a) => s + a, 0), [incomeTotals])
  const totalExpense = useMemo(() => Object.values(expenseTotals).reduce((s, a) => s + a, 0), [expenseTotals])
  const netBalance = totalIncome - totalExpense

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const getWeekStart = (d: Date) => { const r = new Date(d); const day = r.getDay(); r.setDate(r.getDate() - day + (day === 0 ? -6 : 1)); return r }
  const getMonthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
  const getYearStart = (d: Date) => new Date(d.getFullYear(), 0, 1)

  const currentIncome = useMemo(() => {
    const now = new Date()
    return {
      weekly: incomes.reduce((s, i) => { const d = new Date(i.date); return d >= getWeekStart(now) && d <= now ? s + i.amount : s }, 0),
      monthly: incomes.reduce((s, i) => { const d = new Date(i.date); return d >= getMonthStart(now) && d <= now ? s + i.amount : s }, 0),
      yearly: incomes.reduce((s, i) => { const d = new Date(i.date); return d >= getYearStart(now) && d <= now ? s + i.amount : s }, 0),
    }
  }, [incomes])

  const currentExpense = useMemo(() => {
    const now = new Date()
    return {
      weekly: expenses.reduce((s, i) => { const d = new Date(i.date); return d >= getWeekStart(now) && d <= now ? s + i.amount : s }, 0),
      monthly: expenses.reduce((s, i) => { const d = new Date(i.date); return d >= getMonthStart(now) && d <= now ? s + i.amount : s }, 0),
      yearly: expenses.reduce((s, i) => { const d = new Date(i.date); return d >= getYearStart(now) && d <= now ? s + i.amount : s }, 0),
    }
  }, [expenses])

  const incomeGoalCompletion = useMemo(() => {
    const w = incomeGoals.find((g) => g.type === 'WEEKLY'), m = incomeGoals.find((g) => g.type === 'MONTHLY'), y = incomeGoals.find((g) => g.type === 'YEARLY')
    return {
      weekly: w ? Math.min((currentIncome.weekly / w.amount) * 100, 100) : 0,
      monthly: m ? Math.min((currentIncome.monthly / m.amount) * 100, 100) : 0,
      yearly: y ? Math.min((currentIncome.yearly / y.amount) * 100, 100) : 0,
      hasGoals: incomeGoals.length > 0,
    }
  }, [incomeGoals, currentIncome])

  const expenseBudgetCompletion = useMemo(() => {
    const w = expenseBudgets.find((b) => b.type === 'WEEKLY'), m = expenseBudgets.find((b) => b.type === 'MONTHLY'), y = expenseBudgets.find((b) => b.type === 'YEARLY')
    return {
      weekly: w ? Math.min((currentExpense.weekly / w.amount) * 100, 100) : 0,
      monthly: m ? Math.min((currentExpense.monthly / m.amount) * 100, 100) : 0,
      yearly: y ? Math.min((currentExpense.yearly / y.amount) * 100, 100) : 0,
      hasBudgets: expenseBudgets.length > 0,
    }
  }, [expenseBudgets, currentExpense])

  const transactions = useMemo(() => [...incomes.map((i) => ({ ...i, type: 'income' as const })), ...expenses.map((e) => ({ ...e, type: 'expense' as const }))], [incomes, expenses])
  const availableCategories = useMemo(() => { const b = transactions.filter((i) => typeFilter === 'all' || i.type === typeFilter); return Array.from(new Set(b.map((i) => i.category))).sort() }, [transactions, typeFilter])

  const filteredTransactions = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    const filtered = transactions.filter((i) => {
      if (typeFilter !== 'all' && i.type !== typeFilter) return false
      if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false
      const d = new Date(i.date)
      if (fromDate && d < new Date(`${fromDate}T00:00:00`)) return false
      if (toDate && d > new Date(`${toDate}T23:59:59`)) return false
      if (q && !(i.note ?? '').toLowerCase().includes(q) && !i.category.toLowerCase().includes(q)) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sortBy === 'amount') return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      if (sortBy === 'category') { const c = a.category.localeCompare(b.category); return sortOrder === 'asc' ? c : -c }
      const c = new Date(a.date).getTime() - new Date(b.date).getTime(); return sortOrder === 'asc' ? c : -c
    })
  }, [transactions, typeFilter, categoryFilter, fromDate, toDate, searchText, sortBy, sortOrder])

  const filteredTotal = filteredTransactions.reduce((s, i) => s + i.amount, 0)
  const topExpenseCategories = Object.entries(expenseTotals).map(([c, a]) => ({ category: c, amount: a })).sort((a, b) => b.amount - a.amount).slice(0, 8)
  const maxExpCat = Math.max(...topExpenseCategories.map((i) => i.amount), 1)

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />
        <header className="mobile-header single-column">
          <div className="mobile-greeting"><p className="mobile-kicker">SpendWise</p><h1>Budget</h1></div>
        </header>

        {isLoading ? <div className="skeleton-card pulse" /> : null}

        {!isLoading ? (
          <>
            <section className="entry-overview-grid metric-grid">
              <article className="entry-card stat"><h3>Total Income</h3><p className="income">₹{money.format(totalIncome)}</p></article>
              <article className="entry-card stat"><h3>Total Expense</h3><p className="expense">₹{money.format(totalExpense)}</p></article>
              <article className="entry-card stat"><h3>Net Balance</h3><p className={netBalance >= 0 ? 'income' : 'expense'}>₹{money.format(Math.abs(netBalance))}</p></article>
            </section>

            <section className="entry-overview-grid metric-grid">
              <article className="entry-card goals-display-card">
                <div className="goals-display-head">
                  <h3>📊 Income Goals</h3>
                  <button className="view-more-link" onClick={() => navigate('/income-goals')}>View All →</button>
                </div>
                {goalsLoading ? <div className="skeleton-card pulse" /> : incomeGoals.length === 0 ? <p className="goals-empty">No income goals yet</p> : (
                  <ul className="goals-summary-list">
                    {incomeGoals.map((g) => <li key={g.id} className="goal-summary-item"><span className="goal-badge">{g.type}</span><span className="goal-amount">₹{money.format(g.amount)}</span></li>)}
                  </ul>
                )}
              </article>
              <article className="entry-card goals-display-card">
                <div className="goals-display-head">
                  <h3>💸 Expense Budgets</h3>
                  <button className="view-more-link" onClick={() => navigate('/expense-budget')}>View All →</button>
                </div>
                {goalsLoading ? <div className="skeleton-card pulse" /> : expenseBudgets.length === 0 ? <p className="goals-empty">No budgets set yet</p> : (
                  <ul className="goals-summary-list">
                    {expenseBudgets.map((b) => <li key={b.id} className="goal-summary-item"><span className="goal-badge">{b.type}</span><span className="goal-amount">₹{money.format(b.amount)}</span></li>)}
                  </ul>
                )}
              </article>
            </section>

            {incomeGoalCompletion.hasGoals && (
              <section className="entry-card completion-chart-card">
                <h2>Income Goal Progress</h2>
                <div className="completion-grid">
                  <div className="completion-item">
                    <div className="completion-pie" style={{ background: `conic-gradient(#10b981 0deg ${incomeGoalCompletion.weekly * 3.6}deg, rgba(16, 185, 129, 0.2) ${incomeGoalCompletion.weekly * 3.6}deg)` }}><span className="completion-percent">{Math.round(incomeGoalCompletion.weekly)}%</span></div>
                    <p className="completion-label">Weekly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{ background: `conic-gradient(#3b82f6 0deg ${incomeGoalCompletion.monthly * 3.6}deg, rgba(59, 130, 246, 0.2) ${incomeGoalCompletion.monthly * 3.6}deg)` }}><span className="completion-percent">{Math.round(incomeGoalCompletion.monthly)}%</span></div>
                    <p className="completion-label">Monthly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{ background: `conic-gradient(#f97316 0deg ${incomeGoalCompletion.yearly * 3.6}deg, rgba(249, 115, 22, 0.2) ${incomeGoalCompletion.yearly * 3.6}deg)` }}><span className="completion-percent">{Math.round(incomeGoalCompletion.yearly)}%</span></div>
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
                    <div className="completion-pie" style={{ background: `conic-gradient(#ec4899 0deg ${expenseBudgetCompletion.weekly * 3.6}deg, rgba(236, 72, 153, 0.2) ${expenseBudgetCompletion.weekly * 3.6}deg)` }}><span className="completion-percent">{Math.round(expenseBudgetCompletion.weekly)}%</span></div>
                    <p className="completion-label">Weekly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{ background: `conic-gradient(#8b5cf6 0deg ${expenseBudgetCompletion.monthly * 3.6}deg, rgba(139, 92, 246, 0.2) ${expenseBudgetCompletion.monthly * 3.6}deg)` }}><span className="completion-percent">{Math.round(expenseBudgetCompletion.monthly)}%</span></div>
                    <p className="completion-label">Monthly</p>
                  </div>
                  <div className="completion-item">
                    <div className="completion-pie" style={{ background: `conic-gradient(#ee7752 0deg ${expenseBudgetCompletion.yearly * 3.6}deg, rgba(238, 119, 82, 0.2) ${expenseBudgetCompletion.yearly * 3.6}deg)` }}><span className="completion-percent">{Math.round(expenseBudgetCompletion.yearly)}%</span></div>
                    <p className="completion-label">Yearly</p>
                  </div>
                </div>
              </section>
            )}

            <section className="entry-card budget-list-card">
              <div className="list-head"><h2>Top Expense Categories</h2><span>{topExpenseCategories.length} categories</span></div>
              {topExpenseCategories.length === 0 ? <p>No expense data yet.</p> : (
                <ul className="budget-list">
                  {topExpenseCategories.map((i) => (
                    <li key={i.category}>
                      <div className="budget-row-head"><strong>{i.category}</strong><span>₹{money.format(i.amount)}</span></div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${(i.amount / maxExpCat) * 100}%` }} /></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="entry-card budget-list-card">
              <div className="list-head"><h2>Filtered Transactions</h2><span>{filteredTransactions.length} records</span></div>
              <div className="budget-filters-grid">
                <label><span>Type</span><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}><option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option></select></label>
                <label><span>Category</span><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="ALL">All</option>{availableCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
                <label><span>From</span><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
                <label><span>To</span><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
                <label><span>Sort By</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}><option value="date">Date</option><option value="amount">Amount</option><option value="category">Category</option></select></label>
                <label><span>Order</span><select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
                <label className="budget-search-label"><span>Search</span><input placeholder="Search note or category" type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} /></label>
              </div>
              <div className="budget-filter-summary"><strong>Filtered Total</strong><span>₹{money.format(filteredTotal)}</span></div>
              {filteredTransactions.length === 0 ? <p>No data matches your filter.</p> : (
                <div className="budget-table-wrap">
                  <table className="budget-table">
                    <thead><tr><th>Type</th><th>Category</th><th>Amount</th><th>Date</th><th>Note</th></tr></thead>
                    <tbody>
                      {filteredTransactions.map((i) => (
                        <tr key={`${i.type}-${i.id}`}>
                          <td className={i.type === 'income' ? 'income' : 'expense'}>{i.type.toUpperCase()}</td>
                          <td>{i.category}</td><td>₹{money.format(i.amount)}</td>
                          <td>{new Date(i.date).toLocaleDateString('en-IN')}</td><td>{i.note ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </section>
  )
}
