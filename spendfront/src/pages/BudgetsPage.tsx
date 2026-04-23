import { useEffect, useState } from 'react'
import { Plus, Trash2, TrendingUp, Wallet } from 'lucide-react'
import api from '../store/api'
import toast from 'react-hot-toast'

const INCOME_CATS = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER']
const EXPENSE_CATS = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER']
const TYPES = ['WEEKLY', 'MONTHLY', 'YEARLY']

interface Goal {
  id: number
  category: string
  amount: number
  fulfilledAmount: number
  type: string
  periodStart: string
  periodEnd: string
  isActive: boolean
}

export default function BudgetsPage() {
  const [tab, setTab] = useState<'income' | 'expense'>('income')
  const [incomeGoals, setIncomeGoals] = useState<Goal[]>([])
  const [expenseBudgets, setExpenseBudgets] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState('OTHER')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('MONTHLY')
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [igRes, ebRes] = await Promise.all([
        api.get('/incomegoal'),
        api.get('/expensebudget'),
      ])
      setIncomeGoals(igRes.data)
      setExpenseBudgets(ebRes.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) { toast.error('Enter a valid amount'); return }
    setSubmitting(true)
    try {
      if (tab === 'income') {
        await api.post('/incomegoal', { amount: parsedAmount, type, catagory: category })
        toast.success('Income goal set!')
      } else {
        await api.post('/expensebudget', { amount: parsedAmount, type, catagory: category })
        toast.success('Expense budget set!')
      }
      setAmount('')
      setCategory('OTHER')
      setType('MONTHLY')
      fetchAll()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (tab === 'income') {
        await api.delete(`/incomegoal/${id}`)
        setIncomeGoals((prev) => prev.filter((g) => g.id !== id))
      } else {
        await api.delete(`/expensebudget/${id}`)
        setExpenseBudgets((prev) => prev.filter((g) => g.id !== id))
      }
      toast.success('Deleted!')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n)
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const cats = tab === 'income' ? INCOME_CATS : EXPENSE_CATS
  const list = tab === 'income' ? incomeGoals : expenseBudgets

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-kicker">Planning</p>
          <h1 className="page-title">Budgets & Goals</h1>
        </div>
      </div>

      <div className="tab-toggle">
        <button
          className={`tab-btn ${tab === 'income' ? 'tab-btn--active-income' : ''}`}
          onClick={() => { setTab('income'); setCategory('OTHER') }}
        >
          <TrendingUp size={16} /> Income Goals
        </button>
        <button
          className={`tab-btn ${tab === 'expense' ? 'tab-btn--active-expense' : ''}`}
          onClick={() => { setTab('expense'); setCategory('OTHER') }}
        >
          <Wallet size={16} /> Expense Budgets
        </button>
      </div>

      <div className="txn-page-grid">
        {/* Form */}
        <div className="glass-card">
          <h2 className="card-title">
            Set {tab === 'income' ? 'Income Goal' : 'Expense Budget'}
          </h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-label">
              <span>Category</span>
              <select className="form-input form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="form-label">
              <span>Target Amount (₹)</span>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                required
              />
            </label>
            <label className="form-label">
              <span>Period</span>
              <select className="form-input form-select" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <button
              className={`submit-btn ${tab === 'income' ? 'submit-btn--income' : 'submit-btn--expense'}`}
              type="submit"
              disabled={submitting}
            >
              <Plus size={18} />
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-card">
          <h2 className="card-title">Active {tab === 'income' ? 'Goals' : 'Budgets'}</h2>
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : list.length === 0 ? (
            <div className="empty-state"><p>No {tab === 'income' ? 'goals' : 'budgets'} set yet.</p></div>
          ) : (
            <div className="budget-list">
              {list.map((g) => {
                const now = new Date()
                const isActive = now >= new Date(g.periodStart) && now <= new Date(g.periodEnd)
                const pct = Math.min((g.fulfilledAmount / g.amount) * 100, 100)
                return (
                  <div key={g.id} className="budget-item">
                    <div className="budget-item-header">
                      <div>
                        <span className="budget-category">{g.category}</span>
                        <span className={`budget-type-badge ${isActive ? 'badge--active' : 'badge--inactive'}`}>
                          {g.type} · {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button className="delete-btn" onClick={() => handleDelete(g.id)}><Trash2 size={14} /></button>
                    </div>
                    <div className="budget-progress-track">
                      <div
                        className={`budget-progress-fill ${tab === 'income' ? 'progress--income' : 'progress--expense'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="budget-amounts">
                      <span>₹{fmt(g.fulfilledAmount)} / ₹{fmt(g.amount)}</span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="budget-period">
                      {fmtDate(g.periodStart)} → {fmtDate(g.periodEnd)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
