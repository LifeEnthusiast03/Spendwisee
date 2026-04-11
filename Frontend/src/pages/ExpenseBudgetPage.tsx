import { useState } from 'react'
import toast from 'react-hot-toast'
import TopNavigation from '../components/TopNavigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { addExpenseBudget, deleteExpenseBudget } from '../store/slices/expenseBudgetSlice'
import type { BudgetType, ExpenseCategory } from '../store/slices/expenseBudgetSlice'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const expenseCategories: ExpenseCategory[] = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER']

export default function ExpenseBudgetPage() {
  const dispatch = useAppDispatch()
  const { budgets, isLoading } = useAppSelector((s) => s.expenseBudget)
  const [formData, setFormData] = useState({ amount: '', type: 'MONTHLY' as BudgetType, catagory: 'FOOD' as ExpenseCategory })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      const result = await dispatch(addExpenseBudget({ amount: Number(formData.amount), type: formData.type, catagory: formData.catagory }))
      if (addExpenseBudget.rejected.match(result)) {
        toast.error(result.payload as string)
      } else {
        toast.success(`${formData.catagory} ${formData.type} budget created!`)
        setFormData({ amount: '', type: 'MONTHLY', catagory: 'FOOD' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (budgetId: number) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return
    const result = await dispatch(deleteExpenseBudget(budgetId))
    if (deleteExpenseBudget.rejected.match(result)) {
      toast.error(result.payload as string)
    } else {
      toast.success('Expense budget deleted!')
    }
  }

  const getTypeColor = (type: BudgetType) => ({ WEEKLY: '#f97316', MONTHLY: '#ef4444', YEARLY: '#dc2626' }[type])
  const getTypeEmoji = (type: BudgetType) => ({ WEEKLY: '⏰', MONTHLY: '💸', YEARLY: '📌' }[type])

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />
        <header className="mobile-header single-column">
          <div className="mobile-greeting">
            <p className="mobile-kicker">SpendWise</p>
            <h1>Expense Budget</h1>
          </div>
        </header>

        <section className="entry-card goal-form-card">
          <h2>Create Expense Budget</h2>
          <form onSubmit={handleSubmit} className="entry-form">
            <label><span>Category</span>
              <select value={formData.catagory} onChange={(e) => setFormData({ ...formData, catagory: e.target.value as ExpenseCategory })} disabled={submitting}>
                {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label><span>Budget Type</span>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as BudgetType })} disabled={submitting}>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>
            <label><span>Budget Limit (₹)</span>
              <input type="number" inputMode="decimal" placeholder="Enter budget limit" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} disabled={submitting} />
            </label>
            <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Budget'}</button>
          </form>
        </section>

        <section className="entry-card goal-list-card">
          <div className="list-head">
            <h2>Your Expense Budgets</h2>
            <span>{budgets.length} budget{budgets.length !== 1 ? 's' : ''}</span>
          </div>
          {isLoading ? <div className="skeleton-card pulse" /> : budgets.length === 0 ? (
            <p className="empty-state">No expense budgets yet. Create one to get started!</p>
          ) : (
            <ul className="goals-list">
              {budgets.map((budget) => (
                <li key={budget.id} className="goal-item">
                  <div className="goal-item-head">
                    <div className="goal-type-badge" style={{ backgroundColor: getTypeColor(budget.type) }}>
                      <span>{getTypeEmoji(budget.type)}</span>
                      <strong>{budget.type}</strong>
                    </div>
                    <div className="goal-amount"><p>₹{money.format(budget.amount)}</p></div>
                  </div>
                  <div className="goal-item-meta">
                    <span className="goal-category-badge">{budget.category}</span>
                  </div>
                  <button className="goal-delete-btn" onClick={() => handleDelete(budget.id)} title="Delete budget">✕</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
