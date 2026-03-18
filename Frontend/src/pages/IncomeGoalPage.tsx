import { useEffect, useState } from 'react'
import axios from 'axios'
import TopNavigation from '../components/TopNavigation'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

type BudgetType = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

interface IncomeGoal {
  id: number
  amount: number
  type: BudgetType
  createdAt: string
  userId: number
}

export default function IncomeGoalPage() {
  const [goals, setGoals] = useState<IncomeGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ amount: '', type: 'MONTHLY' as BudgetType })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3000/incomegoal', {
        withCredentials: true,
      })
      setGoals(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch income goals')
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
        'http://localhost:3000/incomegoal',
        {
          amount: Number(formData.amount),
          type: formData.type,
        },
        { withCredentials: true }
      )
      
      setGoals([...goals, response.data])
      setFormData({ amount: '', type: 'MONTHLY' })
      setSuccessMessage(`${formData.type} income goal created successfully!`)
      setError(null)
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create income goal'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (goalId: number) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return

    try {
      await axios.delete(`http://localhost:3000/incomegoal/${goalId}`, {
        withCredentials: true,
      })
      
      setGoals(goals.filter((g) => g.id !== goalId))
      setSuccessMessage('Income goal deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Failed to delete income goal')
      console.error(err)
    }
  }

  const getTypeColor = (type: BudgetType) => {
    const colors: Record<BudgetType, string> = {
      WEEKLY: '#fbbf24',
      MONTHLY: '#10b981',
      YEARLY: '#3b82f6',
    }
    return colors[type]
  }

  const getTypeEmoji = (type: BudgetType) => {
    const emojis: Record<BudgetType, string> = {
      WEEKLY: '📅',
      MONTHLY: '📊',
      YEARLY: '🎯',
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
            <h1>Income Goals</h1>
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
          <h2>Create Income Goal</h2>
          <form onSubmit={handleSubmit} className="entry-form">
            <label>
              <span>Goal Type</span>
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
              <span>Amount (₹)</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Enter target amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                disabled={submitting}
              />
            </label>

            <button type="submit" disabled={submitting} className="entry-form button">
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </section>

        <section className="entry-card goal-list-card">
          <div className="list-head">
            <h2>Your Income Goals</h2>
            <span>{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <p className="entry-loading">Loading goals...</p>
          ) : goals.length === 0 ? (
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
                    <div className="goal-amount">
                      <p>₹{money.format(goal.amount)}</p>
                    </div>
                  </div>
                  <button
                    className="goal-delete-btn"
                    onClick={() => handleDelete(goal.id)}
                    title="Delete goal"
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
