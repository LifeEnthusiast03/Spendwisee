import { useState } from 'react'
import toast from 'react-hot-toast'
import { PiggyBank, Plus, Minus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import TopNavigation from '../components/TopNavigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { addGoal, addMoneyToGoal, removeMoneyFromGoal, updateGoal, deleteGoal } from '../store/slices/goalSlice'
import type { Goal } from '../store/slices/goalSlice'

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const pageLoadTime = Date.now()
const getDaysLeft = (enddate: string) => Math.max(0, Math.ceil((new Date(enddate).getTime() - pageLoadTime) / (1000 * 60 * 60 * 24)))

export default function GoalsPage() {
  const dispatch = useAppDispatch()
  const { goals, isLoading } = useAppSelector((s) => s.goal)
  const { totals: incomeTotals } = useAppSelector((s) => s.income)
  const { totals: expenseTotals } = useAppSelector((s) => s.expense)

  const totalIncome = Object.values(incomeTotals).reduce((s, a) => s + a, 0)
  const totalExpense = Object.values(expenseTotals).reduce((s, a) => s + a, 0)
  const availableBalance = totalIncome - totalExpense

  // Create goal form
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', amount: '', startdate: '', enddate: '' })
  const [creating, setCreating] = useState(false)

  // Money modal
  const [moneyModal, setMoneyModal] = useState<{ goal: Goal; action: 'add' | 'remove' } | null>(null)
  const [moneyAmount, setMoneyAmount] = useState('')

  // Edit modal
  const [editModal, setEditModal] = useState<Goal | null>(null)
  const [editForm, setEditForm] = useState({ amount: '', enddate: '' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name.trim()) { toast.error('Enter a goal name'); return }
    if (!createForm.amount || Number(createForm.amount) <= 0) { toast.error('Enter a valid amount'); return }
    if (!createForm.startdate || !createForm.enddate) { toast.error('Start and end dates are required'); return }

    setCreating(true)
    const result = await dispatch(addGoal({
      name: createForm.name.trim(),
      amount: Number(createForm.amount),
      startdate: createForm.startdate,
      enddate: createForm.enddate,
    }))
    if (addGoal.rejected.match(result)) {
      toast.error(result.payload as string)
    } else {
      toast.success(`Goal "${createForm.name}" created!`)
      setCreateForm({ name: '', amount: '', startdate: '', enddate: '' })
      setShowCreate(false)
    }
    setCreating(false)
  }

  const handleMoneySubmit = async () => {
    if (!moneyModal) return
    const amt = Number(moneyAmount)
    if (!Number.isFinite(amt) || amt <= 0) { toast.error('Enter a valid amount'); return }

    if (moneyModal.action === 'add') {
      const result = await dispatch(addMoneyToGoal({ goalid: moneyModal.goal.id, amount: amt }))
      if (addMoneyToGoal.rejected.match(result)) toast.error(result.payload as string)
      else toast.success(`₹${money.format(amt)} added to "${moneyModal.goal.name}"`)
    } else {
      const result = await dispatch(removeMoneyFromGoal({ goalid: moneyModal.goal.id, amount: amt }))
      if (removeMoneyFromGoal.rejected.match(result)) toast.error(result.payload as string)
      else toast.success(`₹${money.format(amt)} removed from "${moneyModal.goal.name}"`)
    }
    setMoneyModal(null)
    setMoneyAmount('')
  }

  const handleUpdate = async () => {
    if (!editModal) return
    const data: { amount?: number; enddate?: string } = {}
    if (editForm.amount) data.amount = Number(editForm.amount)
    if (editForm.enddate) data.enddate = editForm.enddate
    if (Object.keys(data).length === 0) { toast.error('Nothing to update'); return }

    const result = await dispatch(updateGoal({ goalid: editModal.id, data }))
    if (updateGoal.rejected.match(result)) toast.error(result.payload as string)
    else toast.success(`Goal "${editModal.name}" updated!`)
    setEditModal(null)
    setEditForm({ amount: '', enddate: '' })
  }

  const handleDelete = async (goal: Goal) => {
    if (!window.confirm(`Delete goal "${goal.name}"?`)) return
    const result = await dispatch(deleteGoal(goal.id))
    if (deleteGoal.rejected.match(result)) toast.error(result.payload as string)
    else toast.success(`Goal "${goal.name}" deleted`)
  }

  const openEdit = (goal: Goal) => {
    setEditModal(goal)
    setEditForm({ amount: String(goal.amount), enddate: goal.enddate.split('T')[0] })
  }

  const activeGoals = goals.filter((g) => g.isActive)
  const completedGoals = goals.filter((g) => !g.isActive || g.totalMoney >= g.amount)
  const totalSaved = goals.reduce((s, g) => s + g.totalMoney, 0)
  const totalTarget = activeGoals.reduce((s, g) => s + g.amount, 0)



  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />

        <header className="mobile-header single-column">
          <div className="mobile-greeting">
            <p className="mobile-kicker">SpendWise</p>
            <h1>Savings Goals</h1>
          </div>
        </header>

        {/* Stats strip */}
        <section className="entry-overview-grid metric-grid">
          <article className="entry-card stat">
            <h3>Available Balance</h3>
            <p className={availableBalance >= 0 ? 'income' : 'expense'}>₹{money.format(Math.abs(availableBalance))}</p>
          </article>
          <article className="entry-card stat">
            <h3>Total Saved</h3>
            <p className="goals-saved">₹{money.format(totalSaved)}</p>
          </article>
          <article className="entry-card stat">
            <h3>Active Target</h3>
            <p>₹{money.format(totalTarget)}</p>
          </article>
        </section>

        {/* Create toggle */}
        <button className="goal-create-toggle" onClick={() => setShowCreate(!showCreate)} type="button">
          <Plus size={18} /> {showCreate ? 'Cancel' : 'Create New Goal'}
        </button>

        {/* Create form */}
        {showCreate && (
          <section className="entry-card goal-form-card">
            <h2>🎯 New Savings Goal</h2>
            <form onSubmit={handleCreate} className="entry-form">
              <label><span>Goal Name</span><input type="text" placeholder="e.g. Emergency Fund, Vacation" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} /></label>
              <label><span>Target Amount (₹)</span><input type="number" placeholder="Enter target amount" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} min={1} /></label>
              <label><span>Start Date</span><input type="date" value={createForm.startdate} onChange={(e) => setCreateForm({ ...createForm, startdate: e.target.value })} /></label>
              <label><span>End Date</span><input type="date" value={createForm.enddate} onChange={(e) => setCreateForm({ ...createForm, enddate: e.target.value })} /></label>
              <button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Goal'}</button>
            </form>
          </section>
        )}

        {/* Goals grid */}
        {isLoading ? <div className="skeleton-card pulse" /> : activeGoals.length === 0 && completedGoals.length === 0 ? (
          <section className="entry-card">
            <div className="empty-goals-state">
              <PiggyBank size={48} />
              <h2>No goals yet</h2>
              <p>Create your first savings goal to start tracking your financial targets!</p>
            </div>
          </section>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <section className="goals-grid">
                {activeGoals.map((goal) => {
                  const pct = goal.amount > 0 ? Math.min((goal.totalMoney / goal.amount) * 100, 100) : 0
                  const remaining = goal.amount - goal.totalMoney
                  const daysLeft = getDaysLeft(goal.enddate)

                  return (
                    <article key={goal.id} className="entry-card goal-card">
                      <div className="goal-card-header">
                        <div className="goal-card-title">
                          <TrendingUp size={18} />
                          <h3>{goal.name}</h3>
                        </div>
                        <div className="goal-card-actions">
                          <button onClick={() => openEdit(goal)} title="Edit"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(goal)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </div>

                      <div className="goal-progress-section">
                        <div className="goal-progress-ring-wrap">
                          <svg viewBox="0 0 120 120" className="goal-progress-ring">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                            <circle cx="60" cy="60" r="52" fill="none" stroke="url(#goalGrad)" strokeWidth="8" strokeLinecap="round"
                              strokeDasharray={`${pct * 3.267} ${326.7 - pct * 3.267}`} strokeDashoffset="81.675"
                              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                            <defs><linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient></defs>
                          </svg>
                          <div className="goal-progress-center">
                            <strong>{Math.round(pct)}%</strong>
                            <small>saved</small>
                          </div>
                        </div>
                        <div className="goal-progress-details">
                          <div><small>Saved</small><strong className="income">₹{money.format(goal.totalMoney)}</strong></div>
                          <div><small>Target</small><strong>₹{money.format(goal.amount)}</strong></div>
                          <div><small>Remaining</small><strong>₹{money.format(remaining)}</strong></div>
                          <div><small>Days Left</small><strong>{daysLeft}</strong></div>
                        </div>
                      </div>

                      <div className="goal-card-bar">
                        <div className="bar-track"><div className="bar-fill goal-fill" style={{ width: `${pct}%` }} /></div>
                      </div>

                      <div className="goal-card-money-actions">
                        <button className="goal-money-btn add" onClick={() => { setMoneyModal({ goal, action: 'add' }); setMoneyAmount('') }}>
                          <Plus size={14} /> Add Money
                        </button>
                        <button className="goal-money-btn remove" onClick={() => { setMoneyModal({ goal, action: 'remove' }); setMoneyAmount('') }} disabled={goal.totalMoney === 0}>
                          <Minus size={14} /> Withdraw
                        </button>
                      </div>
                    </article>
                  )
                })}
              </section>
            )}
          </>
        )}

        {/* Money Modal */}
        {moneyModal && (
          <div className="modal-overlay" onClick={() => setMoneyModal(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>{moneyModal.action === 'add' ? '💰 Add Money' : '💸 Withdraw Money'}</h2>
              <p className="modal-subtitle">
                {moneyModal.action === 'add'
                  ? `Add money to "${moneyModal.goal.name}". Available balance: ₹${money.format(availableBalance)}`
                  : `Withdraw from "${moneyModal.goal.name}". Current saved: ₹${money.format(moneyModal.goal.totalMoney)}`}
              </p>
              <div className="modal-form">
                <label><span>Amount (₹)</span>
                  <input type="number" placeholder="Enter amount" value={moneyAmount} onChange={(e) => setMoneyAmount(e.target.value)} min={1}
                    max={moneyModal.action === 'add' ? availableBalance : moneyModal.goal.totalMoney} autoFocus />
                </label>
                <div className="modal-actions">
                  <button className="modal-cancel" onClick={() => setMoneyModal(null)}>Cancel</button>
                  <button className={`modal-confirm ${moneyModal.action}`} onClick={handleMoneySubmit}>
                    {moneyModal.action === 'add' ? 'Add Money' : 'Withdraw'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="modal-overlay" onClick={() => setEditModal(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2>✏️ Edit Goal</h2>
              <p className="modal-subtitle">Update target amount or end date for "{editModal.name}"</p>
              <div className="modal-form">
                <label><span>Target Amount (₹)</span>
                  <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} min={editModal.totalMoney} />
                </label>
                <label><span>End Date</span>
                  <input type="date" value={editForm.enddate} onChange={(e) => setEditForm({ ...editForm, enddate: e.target.value })} />
                </label>
                <div className="modal-actions">
                  <button className="modal-cancel" onClick={() => setEditModal(null)}>Cancel</button>
                  <button className="modal-confirm add" onClick={handleUpdate}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
