import { useAppSelector } from '../store/hooks'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail,
  TrendingUp, TrendingDown, Wallet,
  Target, BarChart2, ArrowLeftRight, Calendar,
  ChevronRight,
} from 'lucide-react'
import { useIncomes, useExpenses } from '../hooks/useTransactionQueries'
import { useGoals } from '../hooks/useGoalQueries'
import { useIncomeGoals, useExpenseBudgets } from '../hooks/useBudgetQueries'

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
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

  const savingsRate = totalIncome > 0
    ? Math.max(0, (netBalance / totalIncome) * 100)
    : 0

  // Estimate join date from user object if available, else show "—"
  const joinDate = (user as { createdAt?: string })?.createdAt
    ? new Date((user as { createdAt?: string }).createdAt!).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null

  const quickStats = [
    { icon: ArrowLeftRight, val: totalTxns, label: 'Transactions', color: 'var(--sw-accent)', route: '/transactions', iconBg: 'var(--sw-accent-lo)' },
    { icon: Target, val: goals.length, label: 'Goals', color: '#60a5fa', route: '/goals', iconBg: 'rgba(96,165,250,0.12)' },
    { icon: Wallet, val: incomeGoals.length + expenseBudgets.length, label: 'Budgets', color: '#a78bfa', route: '/budgets', iconBg: 'rgba(167,139,250,0.12)' },
    { icon: BarChart2, val: activeBudgets, label: 'Active Now', color: '#f59e0b', route: '/budgets', iconBg: 'rgba(245,158,11,0.12)' },
  ]

  return (
    <div className="pf-page">
      {/* ── Page header ──────────────────────────────────── */}
      <div className="pf-header pf-fade-in" style={{ animationDelay: '0ms' }}>
        <div>
          <p className="page-kicker">Account</p>
          <h1 className="page-title">Profile</h1>
        </div>
      </div>

      <div className="pf-layout">
        {/* ════════════════════════════════════════════════
            LEFT COLUMN — Identity card
            ════════════════════════════════════════════════ */}
        <div className="pf-identity-card pf-fade-in" style={{ animationDelay: '50ms' }}>

          {/* ── Avatar ── */}
          <div className="pf-avatar-section">
            <div className="pf-avatar-ring">
              <div className="pf-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="pf-identity-meta">
              <h2 className="pf-name">{displayName}</h2>
              <p className="pf-email">{user?.email}</p>
              {joinDate && (
                <div className="pf-join-date">
                  <Calendar size={11} />
                  <span>Member since {joinDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pf-divider" />

          {/* ── Info rows ── */}
          <div className="pf-info-list">
            <div className="pf-info-row">
              <div className="pf-info-icon-wrap">
                <User size={15} />
              </div>
              <div className="pf-info-content">
                <span className="pf-info-label">Full Name</span>
                <span className="pf-info-value">{user?.name || '—'}</span>
              </div>
            </div>

            <div className="pf-info-row">
              <div className="pf-info-icon-wrap">
                <Mail size={15} />
              </div>
              <div className="pf-info-content">
                <span className="pf-info-label">Email Address</span>
                <span className="pf-info-value">{user?.email}</span>
              </div>
            </div>

            <div className="pf-info-row">
              <div className="pf-info-icon-wrap" style={{ background: 'var(--sw-accent-lo)', color: 'var(--sw-accent)' }}>
                <BarChart2 size={15} />
              </div>
              <div className="pf-info-content">
                <span className="pf-info-label">Total Transactions</span>
                <span className="pf-info-value">{totalTxns} records</span>
              </div>
            </div>

            <div className="pf-info-row">
              <div className="pf-info-icon-wrap" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                <Target size={15} />
              </div>
              <div className="pf-info-content">
                <span className="pf-info-label">Savings Goals</span>
                <span className="pf-info-value">{activeGoals} active · {goals.length} total</span>
              </div>
            </div>

            <div className="pf-info-row">
              <div className="pf-info-icon-wrap" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                <Wallet size={15} />
              </div>
              <div className="pf-info-content">
                <span className="pf-info-label">Active Budgets</span>
                <span className="pf-info-value">{activeBudgets} running</span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            RIGHT COLUMN — Financial snapshot
            ════════════════════════════════════════════════ */}
        <div className="pf-stats-col">
          <p className="pf-section-label pf-fade-in" style={{ animationDelay: '100ms' }}>Financial Snapshot</p>

          {/* ── Net Balance hero ── */}
          <div
            className={`pf-balance-hero pf-fade-in ${netBalance >= 0 ? 'pf-balance-hero--pos' : 'pf-balance-hero--neg'}`}
            style={{ animationDelay: '150ms' }}
          >
            <div className="pf-balance-top">
              <span className="pf-balance-label">Net Balance</span>
              {totalIncome > 0 && (
                <span className={`pf-trend-badge ${netBalance >= 0 ? 'pf-trend-badge--pos' : 'pf-trend-badge--neg'}`}>
                  {netBalance >= 0 ? '↑' : '↓'} {savingsRate.toFixed(1)}% savings rate
                </span>
              )}
            </div>
            <span className="pf-balance-amount">
              {netBalance < 0 ? '-' : ''}₹{fmt(Math.abs(netBalance))}
            </span>
            <span className="pf-balance-caption">
              {netBalance >= 0 ? '🎯 You\'re saving well!' : '⚠️ Expenses exceed income'}
            </span>
          </div>

          {/* ── Income / Expense side-by-side ── */}
          <div className="pf-fin-row pf-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="pf-fin-card pf-fin-card--income">
              <div className="pf-fin-left-accent" />
              <div className="pf-fin-icon pf-fin-icon--income">
                <TrendingUp size={17} />
              </div>
              <div className="pf-fin-body">
                <span className="pf-fin-label">Total Income</span>
                <span className="pf-fin-amount pf-fin-amount--income">₹{fmt(totalIncome)}</span>
                <span className="pf-fin-sub">{incomes.length} entries</span>
              </div>
            </div>

            <div className="pf-fin-card pf-fin-card--expense">
              <div className="pf-fin-left-accent pf-fin-left-accent--expense" />
              <div className="pf-fin-icon pf-fin-icon--expense">
                <TrendingDown size={17} />
              </div>
              <div className="pf-fin-body">
                <span className="pf-fin-label">Total Expense</span>
                <span className="pf-fin-amount pf-fin-amount--expense">₹{fmt(totalExpense)}</span>
                <span className="pf-fin-sub">{expenses.length} entries</span>
              </div>
            </div>
          </div>

          {/* ── Savings Rate bar ── */}
          {totalIncome > 0 && (
            <div className="pf-savings-card pf-fade-in" style={{ animationDelay: '250ms' }}>
              <div className="pf-savings-header">
                <span className="pf-savings-title">Savings Rate</span>
                <span className="pf-savings-pct">{savingsRate.toFixed(1)}%</span>
              </div>
              <div className="pf-savings-track">
                <div
                  className="pf-savings-fill"
                  style={{ width: `${Math.min(100, savingsRate)}%` }}
                />
              </div>
              {/* Tick labels */}
              <div className="pf-savings-ticks">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <span className="pf-savings-hint">
                You save ₹{fmt(Math.max(0, netBalance))} out of every ₹{fmt(totalIncome)} earned
              </span>
            </div>
          )}

          {/* ── Clickable quick-stat cards ── */}
          <div className="pf-quick-grid pf-fade-in" style={{ animationDelay: '300ms' }}>
            {quickStats.map(({ icon: Icon, val, label, color, route, iconBg }) => (
              <button
                key={label}
                className="pf-quick-card"
                onClick={() => navigate(route)}
                style={{ '--pf-card-color': color } as React.CSSProperties}
              >
                <div className="pf-quick-icon-wrap" style={{ background: iconBg, color }}>
                  <Icon size={15} />
                </div>
                <span className="pf-quick-val">{val}</span>
                <span className="pf-quick-label">{label}</span>
                <ChevronRight size={12} className="pf-quick-arrow" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
