import { useState } from 'react'
import toast from 'react-hot-toast'
import TopNavigation from '../components/TopNavigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { addIncomeGoal, deleteIncomeGoal } from '../store/slices/incomeGoalSlice'
import type { BudgetType, IncomeCategory } from '../store/slices/incomeGoalSlice'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const incomeCategories: IncomeCategory[] = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER']

export default function IncomeGoalPage() {
  const dispatch = useAppDispatch()
  const { goals, isLoading } = useAppSelector((s) => s.incomeGoal)
  const [formData, setFormData] = useState({ amount: '', type: 'MONTHLY' as BudgetType, catagory: 'SALARY' as IncomeCategory })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      const result = await dispatch(addIncomeGoal({ amount: Number(formData.amount), type: formData.type, catagory: formData.catagory }))
      if (addIncomeGoal.rejected.match(result)) {
        toast.error(result.payload as string)
      } else {
        toast.success(`${formData.catagory} ${formData.type} income goal created!`)
        setFormData({ amount: '', type: 'MONTHLY', catagory: 'SALARY' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (goalId: number) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return
    const result = await dispatch(deleteIncomeGoal(goalId))
    if (deleteIncomeGoal.rejected.match(result)) {
      toast.error(result.payload as string)
    } else {
      toast.success('Income goal deleted!')
    }
  }

  const getTypeColor = (type: BudgetType) => ({ WEEKLY: '#fbbf24', MONTHLY: '#10b981', YEARLY: '#3b82f6' }[type])
  const getTypeEmoji = (type: BudgetType) => ({ WEEKLY: '📅', MONTHLY: '📊', YEARLY: '🎯' }[type])

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />
        <header className="mobile-header single-column">
          <div className="mobile-greeting">
            <p className="mobile-kicker">SpendWise</p>
            <h1>Income Goals</h1>
          </div>
        </header>

        <section className="entry-card goal-form-card">
          <h2>Create Income Goal</h2>
          <form onSubmit={handleSubmit} className="entry-form">
            <label><span>Category</span>
              <select value={formData.catagory} onChange={(e) => setFormData({ ...formData, catagory: e.target.value as IncomeCategory })} disabled={submitting}>
                {incomeCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label><span>Goal Type</span>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as BudgetType })} disabled={submitting}>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>
            <label><span>Amount (₹)</span>
              <input type="number" inputMode="decimal" placeholder="Enter target amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} disabled={submitting} />
            </label>
            <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Goal'}</button>
          </form>
        </section>

        <section className="entry-card goal-list-card">
          <div className="list-head">
            <h2>Your Income Goals</h2>
            <span>{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
          </div>
          {isLoading ? <div className="skeleton-card pulse" /> : goals.length === 0 ? (
            <p className="empty-state">No income goals yet. Create one to get started!</p>
          ) : (
            <ul className="goals-list">
              {goals.map((goal) => (
                <li key={goal.id} className="goal-item">
                  <div className="goal-item-head">
                    <div className="goal-type-badge" style={{ backgroundColor: getTypeColor(goal.type) }}>
                      <span>{getTypeEmoji(goal.type)}</span>
                      <strong>{goal.type}</strong>
                    </div>
                    <div className="goal-amount"><p>₹{money.format(goal.amount)}</p></div>
                  </div>
                  <div className="goal-item-meta">
                    <span className="goal-category-badge">{goal.category}</span>
                  </div>
                  <button className="goal-delete-btn" onClick={() => handleDelete(goal.id)} title="Delete goal">✕</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
