import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, LogOut,
  TrendingUp, TrendingDown, Wallet,
  Target, BarChart2, ArrowLeftRight,
} from 'lucide-react'
import { useIncomes, useExpenses } from '../hooks/useTransactionQueries'
import { useGoals } from '../hooks/useGoalQueries'
import { useIncomeGoals, useExpenseBudgets } from '../hooks/useBudgetQueries'

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User'

  // ── Financial data from React Query cache (zero extra requests if already fetched) ──
  const { data: incomes = [] } = useIncomes()
  const { data: expenses = [] } = useExpenses()
  const { data: goals = [] } = useGoals()
  const { data: incomeGoals = [] } = useIncomeGoals()
  const { data: expenseBudgets = [] } = useExpenseBudgets()

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
  const netBalance = totalIncome - totalExpense
  const totalTxns = incomes.length + expenses.length
  const activeGoals = goals.filter((g) => g.isActive).length
  const now = new Date()
  const activeBudgets = [
    ...incomeGoals.filter((g) => now >= new Date(g.periodStart) && now <= new Date(g.periodEnd)),
    ...expenseBudgets.filter((b) => now >= new Date(b.periodStart) && now <= new Date(b.periodEnd)),
  ].length

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

  const handleLogout = async () => {
    setLoggingOut(true)
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-kicker">Account</p>
          <h1 className="page-title">Profile</h1>
        </div>
      </div>

      <div className="profile-layout">
        {/* ── Left column: identity card ─────────────────────── */}
        <div className="glass-card profile-card-large">
          {/* Avatar + name */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-lg">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="profile-name">{displayName}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          <div className="profile-divider" />

          {/* Info rows */}
          <div className="profile-info-list">
            <div className="profile-info-row">
              <div className="profile-info-icon"><User size={16} /></div>
              <div>
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-value">{user?.name || '—'}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-icon"><Mail size={16} /></div>
              <div>
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user?.email}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-icon"><BarChart2 size={16} /></div>
              <div>
                <span className="profile-info-label">Total Transactions</span>
                <span className="profile-info-value">{totalTxns} records</span>
              </div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-icon"><Target size={16} /></div>
              <div>
                <span className="profile-info-label">Savings Goals</span>
                <span className="profile-info-value">
                  {activeGoals} active · {goals.length} total
                </span>
              </div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-icon"><Wallet size={16} /></div>
              <div>
                <span className="profile-info-label">Active Budgets</span>
                <span className="profile-info-value">{activeBudgets} running</span>
              </div>
            </div>
          </div>

          <div className="profile-divider" />

          <button
            className="logout-btn-full"
            onClick={handleLogout}
            disabled={loggingOut}
            id="logout-btn"
          >
            <LogOut size={18} />
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>

        {/* ── Right column: financial snapshot ───────────────── */}
        <div className="profile-stats-col">
          <p className="profile-section-label">Financial Snapshot</p>

          {/* Net balance hero */}
          <div className={`profile-balance-card ${netBalance >= 0 ? 'profile-balance-card--positive' : 'profile-balance-card--negative'}`}>
            <span className="profile-balance-label">Net Balance</span>
            <span className="profile-balance-value">
              {netBalance < 0 ? '-' : ''}₹{fmt(Math.abs(netBalance))}
            </span>
            <span className="profile-balance-sub">
              {netBalance >= 0 ? '🎯 You\'re saving well!' : '⚠️ Expenses exceed income'}
            </span>
          </div>

          {/* Income / Expense row */}
          <div className="profile-fin-row">
            <div className="profile-fin-card profile-fin-card--income">
              <div className="profile-fin-icon"><TrendingUp size={18} /></div>
              <div>
                <span className="profile-fin-label">Total Income</span>
                <span className="profile-fin-value">₹{fmt(totalIncome)}</span>
                <span className="profile-fin-sub">{incomes.length} entries</span>
              </div>
            </div>
            <div className="profile-fin-card profile-fin-card--expense">
              <div className="profile-fin-icon"><TrendingDown size={18} /></div>
              <div>
                <span className="profile-fin-label">Total Expense</span>
                <span className="profile-fin-value">₹{fmt(totalExpense)}</span>
                <span className="profile-fin-sub">{expenses.length} entries</span>
              </div>
            </div>
          </div>

          {/* Savings rate */}
          {totalIncome > 0 && (
            <div className="glass-card profile-savings-card">
              <div className="profile-savings-header">
                <span className="profile-fin-label">Savings Rate</span>
                <span className="profile-savings-pct">
                  {Math.max(0, ((netBalance / totalIncome) * 100)).toFixed(1)}%
                </span>
              </div>
              <div className="budget-progress-track">
                <div
                  className="budget-progress-fill progress--income"
                  style={{ width: `${Math.min(100, Math.max(0, (netBalance / totalIncome) * 100))}%` }}
                />
              </div>
              <span className="profile-savings-hint">
                You save ₹{fmt(Math.max(0, netBalance))} out of every ₹{fmt(totalIncome)} earned
              </span>
            </div>
          )}

          {/* Quick stats grid */}
          <div className="profile-quick-grid">
            <div className="profile-quick-card">
              <ArrowLeftRight size={16} className="profile-quick-icon" />
              <span className="profile-quick-val">{totalTxns}</span>
              <span className="profile-quick-label">Transactions</span>
            </div>
            <div className="profile-quick-card">
              <Target size={16} className="profile-quick-icon" style={{ color: '#60a5fa' }} />
              <span className="profile-quick-val">{goals.length}</span>
              <span className="profile-quick-label">Goals</span>
            </div>
            <div className="profile-quick-card">
              <Wallet size={16} className="profile-quick-icon" style={{ color: '#a78bfa' }} />
              <span className="profile-quick-val">{incomeGoals.length + expenseBudgets.length}</span>
              <span className="profile-quick-label">Budgets</span>
            </div>
            <div className="profile-quick-card">
              <BarChart2 size={16} className="profile-quick-icon" style={{ color: '#f59e0b' }} />
              <span className="profile-quick-val">{activeBudgets}</span>
              <span className="profile-quick-label">Active Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
