import { Plus, Trash2, TrendingUp, Wallet } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setBudgetTab,
  setBudgetFormCategory,
  setBudgetFormAmount,
  setBudgetFormType,
  resetBudgetForm,
} from '../store/slices/budgetSlice'
import type { BudgetType } from '../types/types'
import {
  useIncomeGoals,
  useExpenseBudgets,
  useCreateIncomeGoal,
  useCreateExpenseBudget,
  useDeleteIncomeGoal,
  useDeleteExpenseBudget,
} from '../hooks/useBudgetQueries'

const INCOME_CATS = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER']
const EXPENSE_CATS = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER']
const TYPES: BudgetType[] = ['WEEKLY', 'MONTHLY', 'YEARLY']

export default function BudgetsPage() {
  const dispatch = useAppDispatch()
  const { activeTab, formCategory, formAmount, formType } = useAppSelector((s) => s.budget)

  // ── React Query – cached fetches ──────────────────────────────────────────
  const { data: incomeGoals = [], isLoading: loadingIG } = useIncomeGoals()
  const { data: expenseBudgets = [], isLoading: loadingEB } = useExpenseBudgets()

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createIG = useCreateIncomeGoal()
  const createEB = useCreateExpenseBudget()
  const deleteIG = useDeleteIncomeGoal()
  const deleteEB = useDeleteExpenseBudget()

  const loading = activeTab === 'income' ? loadingIG : loadingEB
  const submitting = activeTab === 'income' ? createIG.isPending : createEB.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(formAmount)
    if (!parsedAmount || parsedAmount <= 0) return

    const payload = { amount: parsedAmount, type: formType, catagory: formCategory }

    if (activeTab === 'income') {
      await createIG.mutateAsync(payload)
    } else {
      await createEB.mutateAsync(payload)
    }
    dispatch(resetBudgetForm())
  }

  const handleDelete = (id: number) => {
    if (activeTab === 'income') {
      deleteIG.mutate(id)
    } else {
      deleteEB.mutate(id)
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n)
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const cats = activeTab === 'income' ? INCOME_CATS : EXPENSE_CATS
  const list = activeTab === 'income' ? incomeGoals : expenseBudgets

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
          className={`tab-btn ${activeTab === 'income' ? 'tab-btn--active-income' : ''}`}
          onClick={() => dispatch(setBudgetTab('income'))}
        >
          <TrendingUp size={16} /> Income Goals
        </button>
        <button
          className={`tab-btn ${activeTab === 'expense' ? 'tab-btn--active-expense' : ''}`}
          onClick={() => dispatch(setBudgetTab('expense'))}
        >
          <Wallet size={16} /> Expense Budgets
        </button>
      </div>

      <div className="txn-page-grid">
        {/* Form */}
        <div className="glass-card">
          <h2 className="card-title">
            Set {activeTab === 'income' ? 'Income Goal' : 'Expense Budget'}
          </h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-label">
              <span>Category</span>
              <select
                className="form-input form-select"
                value={formCategory}
                onChange={(e) => dispatch(setBudgetFormCategory(e.target.value))}
              >
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="form-label">
              <span>Target Amount (₹)</span>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={formAmount}
                onChange={(e) => dispatch(setBudgetFormAmount(e.target.value))}
                min={1}
                required
              />
            </label>
            <label className="form-label">
              <span>Period</span>
              <select
                className="form-input form-select"
                value={formType}
                onChange={(e) => dispatch(setBudgetFormType(e.target.value as BudgetType))}
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <button
              className={`submit-btn ${activeTab === 'income' ? 'submit-btn--income' : 'submit-btn--expense'}`}
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
          <h2 className="card-title">Active {activeTab === 'income' ? 'Goals' : 'Budgets'}</h2>
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : list.length === 0 ? (
            <div className="empty-state">
              <p>No {activeTab === 'income' ? 'goals' : 'budgets'} set yet.</p>
            </div>
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
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(g.id)}
                        disabled={deleteIG.isPending || deleteEB.isPending}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="budget-progress-track">
                      <div
                        className={`budget-progress-fill ${activeTab === 'income' ? 'progress--income' : 'progress--expense'}`}
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
