import { useState } from 'react'
import { TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react'
import api from '../store/api'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const INCOME_CATEGORIES = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER']
const EXPENSE_CATEGORIES = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER']

interface Transaction {
  id: number
  amount: number
  category: string
  note?: string
  date: string
}

export default function TransactionsPage() {
  const [tab, setTab] = useState<'income' | 'expense'>('income')

  // Form state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  // List state
  const [incomes, setIncomes] = useState<Transaction[]>([])
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const fetchAll = async () => {
    setLoadingList(true)
    try {
      const [incRes, expRes] = await Promise.all([api.get('/income'), api.get('/expense')])
      setIncomes(incRes.data)
      setExpenses(expRes.data)
    } catch {
      //
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setSubmitting(true)
    try {
      if (tab === 'income') {
        await api.post('/addincome', { amount: parsedAmount, catagory: category, note, date })
        toast.success('Income added!')
      } else {
        await api.post('/addexpense', { amount: parsedAmount, catagory: category, note, date })
        toast.success('Expense added!')
      }
      setAmount('')
      setNote('')
      setCategory('OTHER')
      setDate(new Date().toISOString().slice(0, 10))
      fetchAll()
    } catch {
      toast.error('Failed to add. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number, type: 'income' | 'expense') => {
    try {
      if (type === 'income') {
        await api.delete(`/income/${id}`)
        setIncomes((prev) => prev.filter((i) => i.id !== id))
      } else {
        await api.delete(`/expense/${id}`)
        setExpenses((prev) => prev.filter((e) => e.id !== id))
      }
      toast.success('Deleted!')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })

  const cats = tab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const list = tab === 'income' ? incomes : expenses

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
          className={`tab-btn ${tab === 'income' ? 'tab-btn--active-income' : ''}`}
          onClick={() => { setTab('income'); setCategory('OTHER') }}
        >
          <TrendingUp size={16} /> Income
        </button>
        <button
          className={`tab-btn ${tab === 'expense' ? 'tab-btn--active-expense' : ''}`}
          onClick={() => { setTab('expense'); setCategory('OTHER') }}
        >
          <TrendingDown size={16} /> Expense
        </button>
      </div>

      <div className="txn-page-grid">
        {/* Form */}
        <div className="glass-card">
          <h2 className="card-title">
            {tab === 'income' ? <TrendingUp size={18} className="income-color" /> : <TrendingDown size={18} className="expense-color" />}
            Add {tab === 'income' ? 'Income' : 'Expense'}
          </h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-label">
              <span>Amount (₹)</span>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
                required
              />
            </label>
            <label className="form-label">
              <span>Category</span>
              <select
                className="form-input form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <label className="form-label">
              <span>Date</span>
              <input
                className="form-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <button
              className={`submit-btn ${tab === 'income' ? 'submit-btn--income' : 'submit-btn--expense'}`}
              type="submit"
              disabled={submitting}
            >
              <Plus size={18} />
              {submitting ? 'Adding...' : `Add ${tab === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-card">
          <h2 className="card-title">History</h2>
          {loadingList ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : list.length === 0 ? (
            <div className="empty-state"><p>No {tab} records yet.</p></div>
          ) : (
            <div className="txn-list">
              {list.map((t) => (
                <div key={t.id} className={`txn-row txn-row--${tab}`}>
                  <div className={`txn-dot txn-dot--${tab}`} />
                  <div className="txn-info">
                    <span className="txn-category">{t.category}</span>
                    {t.note && <span className="txn-note">{t.note}</span>}
                  </div>
                  <span className="txn-date">{fmtDate(t.date)}</span>
                  <span className={`txn-amount txn-amount--${tab}`}>
                    {tab === 'income' ? '+' : '-'}₹{fmt(t.amount)}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(t.id, tab)}
                    title="Delete"
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
