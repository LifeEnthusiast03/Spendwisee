import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

type EntryRecord = {
  id: number
  amount: number
  category: string
  note: string | null
  date: string
}

type CategoryTotals = Record<string, number>
type ChartRow = { category: string; amount: number }

const incomeCategories = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER'] as const
const expenseCategories = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER'] as const
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const colorScale = ['#ffbe82', '#ff8d6c', '#f97316', '#facc15', '#a855f7', '#7c3aed', '#22c55e', '#06b6d4']

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

const toChartRows = (totals: CategoryTotals): ChartRow[] => {
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
}

const buildPieGradient = (rows: ChartRow[]): string => {
  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  if (total <= 0) {
    return 'conic-gradient(rgba(255,255,255,0.12) 0deg, rgba(255,255,255,0.12) 360deg)'
  }

  let start = 0
  const segments = rows.map((row, index) => {
    const sweep = (row.amount / total) * 360
    const end = start + sweep
    const segment = `${colorScale[index % colorScale.length]} ${start}deg ${end}deg`
    start = end
    return segment
  })

  return `conic-gradient(${segments.join(', ')})`
}

function EntryForm() {
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeCatagory, setIncomeCatagory] = useState<string>(incomeCategories[0])
  const [incomeNote, setIncomeNote] = useState('')
  const [incomeMessage, setIncomeMessage] = useState('')
  const [incomeError, setIncomeError] = useState('')
  const [isIncomeSubmitting, setIsIncomeSubmitting] = useState(false)

  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCatagory, setExpenseCatagory] = useState<string>(expenseCategories[0])
  const [expenseNote, setExpenseNote] = useState('')
  const [expenseMessage, setExpenseMessage] = useState('')
  const [expenseError, setExpenseError] = useState('')
  const [isExpenseSubmitting, setIsExpenseSubmitting] = useState(false)

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')
  const [incomes, setIncomes] = useState<EntryRecord[]>([])
  const [expenses, setExpenses] = useState<EntryRecord[]>([])
  const [incomeTotals, setIncomeTotals] = useState<CategoryTotals>({})
  const [expenseTotals, setExpenseTotals] = useState<CategoryTotals>({})

  const incomeRows = useMemo(() => toChartRows(incomeTotals), [incomeTotals])
  const expenseRows = useMemo(() => toChartRows(expenseTotals), [expenseTotals])
  const totalIncome = useMemo(() => incomeRows.reduce((sum, row) => sum + row.amount, 0), [incomeRows])
  const totalExpense = useMemo(() => expenseRows.reduce((sum, row) => sum + row.amount, 0), [expenseRows])

  const fetchDashboardData = async () => {
    setDataError('')
    setIsLoadingData(true)

    try {
      const [incomeResponse, expenseResponse, incomeTotalResponse, expenseTotalResponse] = await Promise.all([
        fetch(`${API_BASE}/income`, { credentials: 'include' }),
        fetch(`${API_BASE}/expense`, { credentials: 'include' }),
        fetch(`${API_BASE}/income/total`, { credentials: 'include' }),
        fetch(`${API_BASE}/expense/total`, { credentials: 'include' }),
      ])

      if (!incomeResponse.ok || !expenseResponse.ok || !incomeTotalResponse.ok || !expenseTotalResponse.ok) {
        setDataError('Could not load dashboard data right now.')
        return
      }

      const [incomePayload, expensePayload, incomeTotalsPayload, expenseTotalsPayload] = await Promise.all([
        incomeResponse.json() as Promise<EntryRecord[]>,
        expenseResponse.json() as Promise<EntryRecord[]>,
        incomeTotalResponse.json() as Promise<CategoryTotals>,
        expenseTotalResponse.json() as Promise<CategoryTotals>,
      ])

      setIncomes(incomePayload)
      setExpenses(expensePayload)
      setIncomeTotals(incomeTotalsPayload)
      setExpenseTotals(expenseTotalsPayload)
    } catch {
      setDataError('Network error while loading dashboard data.')
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const submitIncome = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIncomeMessage('')
    setIncomeError('')

    const parsedAmount = Number(incomeAmount)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setIncomeError('Amount must be a non-negative number.')
      return
    }

    setIsIncomeSubmitting(true)
    try {
      const response = await fetch(`${API_BASE}/addincome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parsedAmount,
          catagory: incomeCatagory,
          note: incomeNote.trim() || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        setIncomeError(payload?.message ?? 'Failed to add income.')
        return
      }

      setIncomeAmount('')
      setIncomeNote('')
      setIncomeMessage('Income added successfully.')
      await fetchDashboardData()
    } catch {
      setIncomeError('Network error. Please try again.')
    } finally {
      setIsIncomeSubmitting(false)
    }
  }

  const submitExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setExpenseMessage('')
    setExpenseError('')

    const parsedAmount = Number(expenseAmount)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setExpenseError('Amount must be a non-negative number.')
      return
    }

    setIsExpenseSubmitting(true)
    try {
      const response = await fetch(`${API_BASE}/addexpense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parsedAmount,
          catagory: expenseCatagory,
          note: expenseNote.trim() || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        setExpenseError(payload?.message ?? 'Failed to add expense.')
        return
      }

      setExpenseAmount('')
      setExpenseNote('')
      setExpenseMessage('Expense added successfully.')
      await fetchDashboardData()
    } catch {
      setExpenseError('Network error. Please try again.')
    } finally {
      setIsExpenseSubmitting(false)
    }
  }

  return (
    <section className="entry-shell">
      <div className="entry-dashboard">
        <header className="entry-header">
          <h1>Spendwise Dashboard</h1>
          <p>Add entries with separate forms and visualize your category-wise totals.</p>
        </header>

        <section className="entry-form-grid">
          <article className="entry-card">
            <h2>Add Income</h2>
            <form className="entry-form" onSubmit={submitIncome}>
              <label>
                <span>Amount</span>
                <input
                  min={0}
                  placeholder="Enter amount"
                  step="1"
                  type="number"
                  value={incomeAmount}
                  onChange={(event) => setIncomeAmount(event.target.value)}
                />
              </label>

              <label>
                <span>Category</span>
                <select value={incomeCatagory} onChange={(event) => setIncomeCatagory(event.target.value)}>
                  {incomeCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Note</span>
                <input
                  placeholder="Optional note"
                  type="text"
                  value={incomeNote}
                  onChange={(event) => setIncomeNote(event.target.value)}
                />
              </label>

              {incomeError ? <p className="entry-message error">{incomeError}</p> : null}
              {incomeMessage ? <p className="entry-message success">{incomeMessage}</p> : null}

              <button disabled={isIncomeSubmitting} type="submit">
                {isIncomeSubmitting ? 'Saving...' : 'Add income'}
              </button>
            </form>
          </article>

          <article className="entry-card">
            <h2>Add Expense</h2>
            <form className="entry-form" onSubmit={submitExpense}>
              <label>
                <span>Amount</span>
                <input
                  min={0}
                  placeholder="Enter amount"
                  step="1"
                  type="number"
                  value={expenseAmount}
                  onChange={(event) => setExpenseAmount(event.target.value)}
                />
              </label>

              <label>
                <span>Category</span>
                <select value={expenseCatagory} onChange={(event) => setExpenseCatagory(event.target.value)}>
                  {expenseCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Note</span>
                <input
                  placeholder="Optional note"
                  type="text"
                  value={expenseNote}
                  onChange={(event) => setExpenseNote(event.target.value)}
                />
              </label>

              {expenseError ? <p className="entry-message error">{expenseError}</p> : null}
              {expenseMessage ? <p className="entry-message success">{expenseMessage}</p> : null}

              <button disabled={isExpenseSubmitting} type="submit">
                {isExpenseSubmitting ? 'Saving...' : 'Add expense'}
              </button>
            </form>
          </article>
        </section>

        <section className="entry-overview-grid">
          <article className="entry-card stat">
            <h3>Total Income</h3>
            <p>{money.format(totalIncome)}</p>
          </article>
          <article className="entry-card stat">
            <h3>Total Expense</h3>
            <p>{money.format(totalExpense)}</p>
          </article>
        </section>

        {isLoadingData ? <p>Loading dashboard...</p> : null}
        {!isLoadingData && dataError ? <p className="entry-message error">{dataError}</p> : null}

        {!isLoadingData && !dataError ? (
          <section className="entry-viz-grid">
            <article className="entry-card chart-card">
              <h2>Income by Category</h2>
              <div className="chart-split">
                <div className="bar-chart">
                  {incomeRows.length === 0 ? <p>No income data yet.</p> : null}
                  {incomeRows.map((row) => (
                    <div key={row.category} className="bar-row">
                      <span>{row.category}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(row.amount / Math.max(...incomeRows.map((item) => item.amount))) * 100}%` }}
                        />
                      </div>
                      <strong>{money.format(row.amount)}</strong>
                    </div>
                  ))}
                </div>

                <div className="pie-block">
                  <div className="pie-chart" style={{ background: buildPieGradient(incomeRows) }} />
                  <ul className="pie-legend">
                    {incomeRows.map((row, index) => (
                      <li key={row.category}>
                        <span style={{ background: colorScale[index % colorScale.length] }} />
                        {row.category} • {money.format(row.amount)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <article className="entry-card chart-card">
              <h2>Expense by Category</h2>
              <div className="chart-split">
                <div className="bar-chart">
                  {expenseRows.length === 0 ? <p>No expense data yet.</p> : null}
                  {expenseRows.map((row) => (
                    <div key={row.category} className="bar-row">
                      <span>{row.category}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${(row.amount / Math.max(...expenseRows.map((item) => item.amount))) * 100}%` }}
                        />
                      </div>
                      <strong>{money.format(row.amount)}</strong>
                    </div>
                  ))}
                </div>

                <div className="pie-block">
                  <div className="pie-chart" style={{ background: buildPieGradient(expenseRows) }} />
                  <ul className="pie-legend">
                    {expenseRows.map((row, index) => (
                      <li key={row.category}>
                        <span style={{ background: colorScale[index % colorScale.length] }} />
                        {row.category} • {money.format(row.amount)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </section>
        ) : null}

        <section className="entry-lists">
          <div className="entry-list-card">
            <h2>Latest Income Entries</h2>
            {incomes.length === 0 ? <p>No income added yet.</p> : null}
            {incomes.length > 0 ? (
              <ul>
                {incomes.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <strong>{money.format(item.amount)}</strong> • {item.category} {item.note ? `• ${item.note}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="entry-list-card">
            <h2>Latest Expense Entries</h2>
            {expenses.length === 0 ? <p>No expense added yet.</p> : null}
            {expenses.length > 0 ? (
              <ul>
                {expenses.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <strong>{money.format(item.amount)}</strong> • {item.category} {item.note ? `• ${item.note}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  )
}

export default EntryForm
