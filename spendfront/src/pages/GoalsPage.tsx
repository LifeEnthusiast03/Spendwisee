import { useEffect, useState } from 'react'
import { Plus, Trash2, Target, PlusCircle, MinusCircle } from 'lucide-react'
import api from '../store/api'
import toast from 'react-hot-toast'

interface Goal {
  id: number
  name: string
  amount: number
  totalMoney: number
  startdate: string
  enddate: string
  isActive: boolean
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  // Add goal form
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [enddate, setEnddate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Money modal
  const [moneyGoalId, setMoneyGoalId] = useState<number | null>(null)
  const [moneyAmt, setMoneyAmt] = useState('')
  const [moneyMode, setMoneyMode] = useState<'add' | 'remove'>('add')

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await api.get('/goal')
      setGoals(res.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !enddate) { toast.error('Fill all fields'); return }
    setSubmitting(true)
    try {
      await api.post('/goal', { name, amount: parseFloat(amount), enddate })
      toast.success('Goal created!')
      setName(''); setAmount(''); setEnddate('')
      fetchGoals()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/goal/${id}`)
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast.success('Goal deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleMoney = async () => {
    const amt = parseFloat(moneyAmt)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    try {
      if (moneyMode === 'add') {
        await api.post(`/goal/${moneyGoalId}/addmoney`, { amount: amt })
        toast.success('Money added!')
      } else {
        await api.post(`/goal/${moneyGoalId}/removemoney`, { amount: amt })
        toast.success('Money removed!')
      }
      setMoneyGoalId(null)
      setMoneyAmt('')
      fetchGoals()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed')
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n)
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-kicker">Savings</p>
          <h1 className="page-title">Goals</h1>
        </div>
      </div>

      <div className="txn-page-grid">
        {/* Create form */}
        <div className="glass-card">
          <h2 className="card-title"><Target size={18} /> New Goal</h2>
          <form className="form-grid" onSubmit={handleCreate}>
            <label className="form-label">
              <span>Goal Name</span>
              <input className="form-input" type="text" placeholder="e.g. New Laptop" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="form-label">
              <span>Target Amount (₹)</span>
              <input className="form-input" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} min={1} required />
            </label>
            <label className="form-label">
              <span>Target Date</span>
              <input className="form-input" type="date" value={enddate} onChange={(e) => setEnddate(e.target.value)} required />
            </label>
            <button className="submit-btn submit-btn--goal" type="submit" disabled={submitting}>
              <Plus size={18} />
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </div>

        {/* Goals list */}
        <div className="glass-card">
          <h2 className="card-title">My Goals</h2>
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : goals.length === 0 ? (
            <div className="empty-state"><p>No goals yet. Create one!</p></div>
          ) : (
            <div className="budget-list">
              {goals.map((g) => {
                const pct = Math.min((g.totalMoney / g.amount) * 100, 100)
                return (
                  <div key={g.id} className="budget-item">
                    <div className="budget-item-header">
                      <div>
                        <span className="budget-category">{g.name}</span>
                        <span className={`budget-type-badge ${g.isActive ? 'badge--active' : 'badge--inactive'}`}>
                          {g.isActive ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="icon-btn icon-btn--add" title="Add money" onClick={() => { setMoneyGoalId(g.id); setMoneyMode('add') }}>
                          <PlusCircle size={16} />
                        </button>
                        <button className="icon-btn icon-btn--remove" title="Remove money" onClick={() => { setMoneyGoalId(g.id); setMoneyMode('remove') }}>
                          <MinusCircle size={16} />
                        </button>
                        <button className="delete-btn" title="Delete" onClick={() => handleDelete(g.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="budget-progress-track">
                      <div className="budget-progress-fill progress--goal" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="budget-amounts">
                      <span>₹{fmt(g.totalMoney)} / ₹{fmt(g.amount)}</span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="budget-period">Target: {fmtDate(g.enddate)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Money modal */}
      {moneyGoalId !== null && (
        <div className="modal-overlay" onClick={() => setMoneyGoalId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{moneyMode === 'add' ? 'Add Money' : 'Remove Money'}</h3>
            <input
              className="form-input"
              type="number"
              placeholder="Amount (₹)"
              value={moneyAmt}
              onChange={(e) => setMoneyAmt(e.target.value)}
              min={1}
              autoFocus
            />
            <div className="modal-actions">
              <button className="submit-btn submit-btn--goal" onClick={handleMoney}>Confirm</button>
              <button className="cancel-btn" onClick={() => setMoneyGoalId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
