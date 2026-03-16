import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TopNavigation from '../components/TopNavigation'
import { useDashboardData } from '../hooks/useDashboardData'

const expenseCategories = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER'] as const
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function ExpenseFormPage() {
  const { totalIncome, totalExpense, netBalance } = useDashboardData()
  const [amount, setAmount] = useState('')
  const [catagory, setCatagory] = useState<string>(expenseCategories[0])
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

  const submitExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError('Amount must be a non-negative number.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE}/addexpense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parsedAmount,
          catagory,
          note: note.trim() || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        setError(payload?.message ?? 'Failed to add expense.')
        return
      }

      setAmount('')
      setNote('')
      setMessage('Expense added successfully.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />

        <div className="form-page-header">
          <div>
            <p className="mobile-kicker">SpendWise</p>
            <h1>Expense Form</h1>
            <p className="form-page-subtitle">Track every expense entry with clean category-based records.</p>
          </div>
          <Link className="action-button" to="/home">
            Back to Home
          </Link>
        </div>

        <section className="transaction-page-grid">
          <article className="entry-card form-page-card cool-form-card expense-theme">
            <h2>Add Expense</h2>
            <p className="form-card-copy">Log spending across food, transport, rent, bills, and more to keep your budget under control.</p>
            <form className="entry-form" onSubmit={submitExpense}>
              <label>
                <span>Amount</span>
                <input
                  min={0}
                  placeholder="Enter amount"
                  step="1"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>

              <label>
                <span>Category</span>
                <select value={catagory} onChange={(event) => setCatagory(event.target.value)}>
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
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>

              {error ? <p className="entry-message error">{error}</p> : null}
              {message ? <p className="entry-message success">{message}</p> : null}

              <button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Saving...' : 'Add expense'}
              </button>
            </form>
          </article>

          <aside className="entry-card quick-insights-card">
            <h2>Quick Snapshot</h2>
            <div className="quick-insights-grid">
              <article>
                <span>Total Income</span>
                <strong className="income">₹{money.format(totalIncome)}</strong>
              </article>
              <article>
                <span>Total Expense</span>
                <strong className="expense">₹{money.format(totalExpense)}</strong>
              </article>
              <article>
                <span>Net Balance</span>
                <strong className={netBalance >= 0 ? 'income' : 'expense'}>₹{money.format(Math.abs(netBalance))}</strong>
              </article>
            </div>
            <div className="transaction-tips">
              <p>Tips</p>
              <ul>
                <li>Track expenses daily for cleaner weekly trends.</li>
                <li>Use notes for context like bill month or vendor.</li>
                <li>Review category split regularly in Analytics.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </section>
  )
}
