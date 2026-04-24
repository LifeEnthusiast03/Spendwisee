import { Plus, Trash2, Target, PlusCircle, MinusCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setFormName,
  setFormAmount,
  setFormStartdate,
  setFormEnddate,
  resetGoalForm,
  openMoneyModal,
  closeMoneyModal,
  setMoneyAmount,
} from '../store/slices/goalSlice'
import {
  useGoals,
  useCreateGoal,
  useAddMoneyToGoal,
  useRemoveMoneyFromGoal,
  useDeleteGoal,
} from '../hooks/useGoalQueries'
import toast from 'react-hot-toast'

export default function GoalsPage() {
  const dispatch = useAppDispatch()
  const {
    formName, formAmount, formStartdate, formEnddate,
    moneyGoalId, moneyAmount, moneyMode,
  } = useAppSelector((s) => s.goal)

  // ── React Query ───────────────────────────────────────────────────────────
  const { data: goals = [], isLoading } = useGoals()
  const createGoal = useCreateGoal()
  const addMoney = useAddMoneyToGoal()
  const removeMoney = useRemoveMoneyFromGoal()
  const deleteGoal = useDeleteGoal()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formAmount || !formStartdate || !formEnddate) {
      toast.error('Fill all fields')
      return
    }
    if (new Date(formStartdate) >= new Date(formEnddate)) {
      toast.error('End date must be after start date')
      return
    }
    await createGoal.mutateAsync({
      name: formName,
      amount: parseFloat(formAmount),
      startdate: formStartdate,
      enddate: formEnddate,
    })
    dispatch(resetGoalForm())
  }

  const handleMoney = async () => {
    const amt = parseFloat(moneyAmount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    if (moneyGoalId === null) return

    if (moneyMode === 'add') {
      await addMoney.mutateAsync({ goalId: moneyGoalId, amount: amt })
    } else {
      await removeMoney.mutateAsync({ goalId: moneyGoalId, amount: amt })
    }
    dispatch(closeMoneyModal())
  }

  const moneyPending = addMoney.isPending || removeMoney.isPending

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
              <input
                className="form-input"
                type="text"
                placeholder="e.g. New Laptop"
                value={formName}
                onChange={(e) => dispatch(setFormName(e.target.value))}
                required
              />
            </label>
            <label className="form-label">
              <span>Target Amount (₹)</span>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                value={formAmount}
                onChange={(e) => dispatch(setFormAmount(e.target.value))}
                min={1}
                required
              />
            </label>
            <label className="form-label">
              <span>Start Date</span>
              <input
                className="form-input"
                type="date"
                value={formStartdate}
                onChange={(e) => dispatch(setFormStartdate(e.target.value))}
                required
              />
            </label>
            <label className="form-label">
              <span>Target Date</span>
              <input
                className="form-input"
                type="date"
                value={formEnddate}
                onChange={(e) => dispatch(setFormEnddate(e.target.value))}
                required
              />
            </label>
            <button
              className="submit-btn submit-btn--goal"
              type="submit"
              disabled={createGoal.isPending}
            >
              <Plus size={18} />
              {createGoal.isPending ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </div>

        {/* Goals list */}
        <div className="glass-card">
          <h2 className="card-title">My Goals</h2>
          {isLoading ? (
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
                        <button
                          className="icon-btn icon-btn--add"
                          title="Add money"
                          onClick={() => dispatch(openMoneyModal({ id: g.id, mode: 'add' }))}
                        >
                          <PlusCircle size={16} />
                        </button>
                        <button
                          className="icon-btn icon-btn--remove"
                          title="Remove money"
                          onClick={() => dispatch(openMoneyModal({ id: g.id, mode: 'remove' }))}
                        >
                          <MinusCircle size={16} />
                        </button>
                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => deleteGoal.mutate(g.id)}
                          disabled={deleteGoal.isPending}
                        >
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
                    <div className="budget-period">
                      {fmtDate(g.startdate)} → {fmtDate(g.enddate)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Money modal */}
      {moneyGoalId !== null && (
        <div className="modal-overlay" onClick={() => dispatch(closeMoneyModal())}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{moneyMode === 'add' ? 'Add Money' : 'Remove Money'}</h3>
            <input
              className="form-input"
              type="number"
              placeholder="Amount (₹)"
              value={moneyAmount}
              onChange={(e) => dispatch(setMoneyAmount(e.target.value))}
              min={1}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="submit-btn submit-btn--goal"
                onClick={handleMoney}
                disabled={moneyPending}
              >
                {moneyPending ? 'Processing...' : 'Confirm'}
              </button>
              <button className="cancel-btn" onClick={() => dispatch(closeMoneyModal())}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
