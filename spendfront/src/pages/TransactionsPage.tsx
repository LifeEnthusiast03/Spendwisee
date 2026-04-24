import { TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setActiveTab,
  setFormAmount,
  setFormCategory,
  setFormNote,
  setFormDate,
  resetTransactionForm,
} from '../store/slices/transactionSlice'
import {
  useIncomes,
  useExpenses,
  useAddIncome,
  useAddExpense,
  useDeleteIncome,
  useDeleteExpense,
} from '../hooks/useTransactionQueries'

const INCOME_CATEGORIES = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER']
const EXPENSE_CATEGORIES = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER']

export default function TransactionsPage() {
  const dispatch = useAppDispatch()
  const { activeTab, formAmount, formCategory, formNote, formDate } = useAppSelector(
    (s) => s.transaction
  )

  // ── React Query – cached fetches ──────────────────────────────────────────
  const { data: incomes = [], isLoading: loadingIncomes } = useIncomes()
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses()

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addIncomeMutation = useAddIncome()
  const addExpenseMutation = useAddExpense()
  const deleteIncomeMutation = useDeleteIncome()
  const deleteExpenseMutation = useDeleteExpense()

  const loadingList = activeTab === 'income' ? loadingIncomes : loadingExpenses
  const submitting =
    activeTab === 'income' ? addIncomeMutation.isPending : addExpenseMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(formAmount)
    if (!parsedAmount || parsedAmount <= 0) return

    const payload = {
      amount: parsedAmount,
      catagory: formCategory,
      note: formNote || null,
      date: formDate,
    }

    if (activeTab === 'income') {
      await addIncomeMutation.mutateAsync(payload)
    } else {
      await addExpenseMutation.mutateAsync(payload)
    }
    dispatch(resetTransactionForm())
  }

  const handleDelete = (id: number) => {
    if (activeTab === 'income') {
      deleteIncomeMutation.mutate(id)
    } else {
      deleteExpenseMutation.mutate(id)
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })

  const cats = activeTab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const list = activeTab === 'income' ? incomes : expenses

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-kicker">Manage</p>
          <h1 className="page-title">Transactions</h1>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="tab-toggle">
        <button
          className={`tab-btn ${activeTab === 'income' ? 'tab-btn--active-income' : ''}`}
          onClick={() => dispatch(setActiveTab('income'))}
        >
          <TrendingUp size={16} /> Income
        </button>
        <button
          className={`tab-btn ${activeTab === 'expense' ? 'tab-btn--active-expense' : ''}`}
          onClick={() => dispatch(setActiveTab('expense'))}
        >
          <TrendingDown size={16} /> Expense
        </button>
      </div>

      <div className="txn-page-grid">
        {/* Form */}
        <div className="glass-card">
          <h2 className="card-title">
            {activeTab === 'income' ? (
              <TrendingUp size={18} className="income-color" />
            ) : (
              <TrendingDown size={18} className="expense-color" />
            )}
            Add {activeTab === 'income' ? 'Income' : 'Expense'}
          </h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-label">
              <span>Amount (₹)</span>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={formAmount}
                onChange={(e) => dispatch(setFormAmount(e.target.value))}
                min={0}
                required
              />
            </label>
            <label className="form-label">
              <span>Category</span>
              <select
                className="form-input form-select"
                value={formCategory}
                onChange={(e) => dispatch(setFormCategory(e.target.value))}
              >
                {cats.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="form-label">
              <span>Note (optional)</span>
              <input
                className="form-input"
                type="text"
                placeholder="Add a note..."
                value={formNote}
                onChange={(e) => dispatch(setFormNote(e.target.value))}
              />
            </label>
            <label className="form-label">
              <span>Date</span>
              <input
                className="form-input"
                type="date"
                value={formDate}
                onChange={(e) => dispatch(setFormDate(e.target.value))}
              />
            </label>
            <button
              className={`submit-btn ${activeTab === 'income' ? 'submit-btn--income' : 'submit-btn--expense'}`}
              type="submit"
              disabled={submitting}
            >
              <Plus size={18} />
              {submitting ? 'Adding...' : `Add ${activeTab === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-card">
          <h2 className="card-title">History</h2>
          {loadingList ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : list.length === 0 ? (
            <div className="empty-state"><p>No {activeTab} records yet.</p></div>
          ) : (
            <div className="txn-list">
              {list.map((t) => (
                <div key={t.id} className={`txn-row txn-row--${activeTab}`}>
                  <div className={`txn-dot txn-dot--${activeTab}`} />
                  <div className="txn-info">
                    <span className="txn-category">{t.category}</span>
                    {t.note && <span className="txn-note">{t.note}</span>}
                  </div>
                  <span className="txn-date">{fmtDate(t.date)}</span>
                  <span className={`txn-amount txn-amount--${activeTab}`}>
                    {activeTab === 'income' ? '+' : '-'}₹{fmt(t.amount)}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(t.id)}
                    title="Delete"
                    disabled={
                      deleteIncomeMutation.isPending || deleteExpenseMutation.isPending
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
