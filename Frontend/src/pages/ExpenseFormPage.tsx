import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import TopNavigation from '../components/TopNavigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { addExpense, fetchExpenseTotals } from '../store/slices/expenseSlice'

const expenseCategories = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER'] as const
const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export default function ExpenseFormPage() {
  const dispatch = useAppDispatch()
  const { totals: incomeTotals } = useAppSelector((s) => s.income)
  const { totals: expenseTotals } = useAppSelector((s) => s.expense)
  const totalIncome = Object.values(incomeTotals).reduce((s, a) => s + a, 0)
  const totalExpense = Object.values(expenseTotals).reduce((s, a) => s + a, 0)
  const netBalance = totalIncome - totalExpense

  const [amount, setAmount] = useState('')
  const [catagory, setCatagory] = useState<string>(expenseCategories[0])
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      toast.error('Amount must be a non-negative number.')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await dispatch(addExpense({ amount: parsedAmount, catagory, note: note.trim() || null, ...(date ? { date } : {}) }))
      if (addExpense.rejected.match(result)) {
        toast.error(result.payload as string)
      } else {
        toast.success('Expense added successfully!')
        dispatch(fetchExpenseTotals())
        setAmount(''); setDate(''); setNote('')
      }
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
          <Link className="action-button" to="/home">Back to Home</Link>
        </div>
        <section className="transaction-page-grid">
          <article className="entry-card form-page-card cool-form-card expense-theme">
            <h2>Add Expense</h2>
            <p className="form-card-copy">Log spending across food, transport, rent, bills, and more to keep your budget under control.</p>
            <form className="entry-form" onSubmit={submitExpense}>
              <label><span>Amount</span><input min={0} placeholder="Enter amount" step="1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
              <label><span>Category</span>
                <select value={catagory} onChange={(e) => setCatagory(e.target.value)}>
                  {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label><span>Note</span><input placeholder="Optional note" type="text" value={note} onChange={(e) => setNote(e.target.value)} /></label>
              <label><span>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <button disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving...' : 'Add expense'}</button>
            </form>
          </article>
          <aside className="entry-card quick-insights-card">
            <h2>Quick Snapshot</h2>
            <div className="quick-insights-grid">
              <article><span>Total Income</span><strong className="income">₹{money.format(totalIncome)}</strong></article>
              <article><span>Total Expense</span><strong className="expense">₹{money.format(totalExpense)}</strong></article>
              <article><span>Net Balance</span><strong className={netBalance >= 0 ? 'income' : 'expense'}>₹{money.format(Math.abs(netBalance))}</strong></article>
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
