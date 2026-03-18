import { useEffect, useState } from 'react'
import axios from 'axios'
import TopNavigation from '../components/TopNavigation'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

type BudgetType = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

interface ExpenseBudget {
  id: number
  amount: number
  type: BudgetType
  createdAt: string
  userId: number
}

export default function ExpenseBudgetPage() {
  const [budgets, setBudgets] = useState<ExpenseBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ amount: '', type: 'MONTHLY' as BudgetType })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3000/expensebudget', {
        withCredentials: true,
      })
      setBudgets(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch expense budgets')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(
        'http://localhost:3000/expensebudget',
        {
          amount: Number(formData.amount),
          type: formData.type,
        },
        { withCredentials: true }
      )
      
      setBudgets([...budgets, response.data])
      setFormData({ amount: '', type: 'MONTHLY' })
      setSuccessMessage(`${formData.type} expense budget created successfully!`)
      setError(null)
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create expense budget'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (budgetId: number) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return

    try {
      await axios.delete(`http://localhost:3000/expensebudget/${budgetId}`, {
        withCredentials: true,
      })
      
      setBudgets(budgets.filter((b) => b.id !== budgetId))
      setSuccessMessage('Expense budget deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to delete expense budget')
      console.error(err)
    }
  }

  const getTypeColor = (type: BudgetType) => {
    const colors: Record<BudgetType, string> = {
      WEEKLY: '#f97316',
      MONTHLY: '#ef4444',
      YEARLY: '#dc2626',
    }
    return colors[type]
  }

  const getTypeEmoji = (type: BudgetType) => {
    const emojis: Record<BudgetType, string> = {
      WEEKLY: '⏰',
      MONTHLY: '💸',
      YEARLY: '📌',
    }
    return emojis[type]
  }

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

        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <section className="entry-card goal-form-card">
          <h2>Create Expense Budget</h2>
          <form onSubmit={handleSubmit} className="entry-form">
            <label>
              <span>Budget Type</span>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as BudgetType })}
                disabled={submitting}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>

            <label>
              <span>Budget Limit (₹)</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Enter budget limit"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={submitting}
              />
            </label>

            <button type="submit" disabled={submitting} className="entry-form button">
              {submitting ? 'Creating...' : 'Create Budget'}
            </button>
          </form>
        </section>

        <section className="entry-card goal-list-card">
          <div className="list-head">
            <h2>Your Expense Budgets</h2>
            <span>{budgets.length} budget{budgets.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <p className="entry-loading">Loading budgets...</p>
          ) : budgets.length === 0 ? (
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
                    <div className="goal-amount">
                      <p>₹{money.format(budget.amount)}</p>
                    </div>
                  </div>
                  <button
                    className="goal-delete-btn"
                    onClick={() => handleDelete(budget.id)}
                    title="Delete budget"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}
