import React, { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart2, BarChart3, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useExportTransactions } from '../hooks/useExportTransactions'
import type { ExportRange } from '../types/types'
import {
  useIncomes,
  useExpenses,
  useIncomeTotals,
  useExpenseTotals,
} from '../hooks/useTransactionQueries'
import type { CategoryData } from '../types/types'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Line, ReferenceLine,
} from 'recharts'



/* ─────────────────────────────────────────────────────── */
/* Color palettes                                          */
/* ─────────────────────────────────────────────────────── */
const INCOME_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#fbbf24', '#a78bfa']
const EXPENSE_COLORS = ['#f43f5e', '#fb7185', '#ff8d6c', '#ffbe82', '#e11d48', '#be123c']

/* ─────────────────────────────────────────────────────── */
/* Formatters                                              */
/* ─────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

/* ─────────────────────────────────────────────────────── */
/* Date range helpers                                      */
/* ─────────────────────────────────────────────────────── */
type DateRange = 'thisMonth' | 'last3' | 'last6' | 'allTime'

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  thisMonth: 'This Month',
  last3: 'Last 3 Months',
  last6: 'Last 6 Months',
  allTime: 'All Time',
}

const DATE_RANGE_MONTHS: Record<DateRange, number | null> = {
  thisMonth: 1,
  last3: 3,
  last6: 6,
  allTime: null,
}

/** Maps the frontend DateRange key to the backend ExportRange query param */
const DATE_RANGE_TO_EXPORT: Record<DateRange, ExportRange> = {
  thisMonth: 'this_month',
  last3: 'last_3',
  last6: 'last_6',
  allTime: 'all_time',
}

/* ─────────────────────────────────────────────────────── */
/* Custom Tooltip                                          */
/* ─────────────────────────────────────────────────────── */
const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="an-chart-tooltip">
        {label && <p className="an-chart-tooltip-label">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>
            {p.name}: ₹{fmt(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

/* ─────────────────────────────────────────────────────── */
/* Skeleton loader block                                   */
/* ─────────────────────────────────────────────────────── */
const SkeletonBlock = ({ h = 240, className = '' }: { h?: number; className?: string }) => (
  <div className={`an-skeleton ${className}`} style={{ height: h }} />
)

const SkeletonCard = () => (
  <div className="an-glass-card">
    <div className="an-skeleton an-skeleton--title" />
    <SkeletonBlock h={240} />
  </div>
)

/* ─────────────────────────────────────────────────────── */
/* Savings rate radial SVG                                 */
/* ─────────────────────────────────────────────────────── */
const SavingsArc = ({ pct }: { pct: number }) => {
  const R = 28
  const cx = 34
  const cy = 34
  const circumference = Math.PI * R           // half-circle arc
  const clamped = Math.max(0, Math.min(100, pct))
  const filled = (clamped / 100) * circumference
  return (
    <svg width="68" height="40" viewBox="0 0 68 40" style={{ overflow: 'visible' }}>
      {/* track */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* filled */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none"
        stroke={clamped >= 20 ? '#10b981' : clamped >= 5 ? '#f59e0b' : '#f43f5e'}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────── */
/* Donut centre label overlay                              */
/* ─────────────────────────────────────────────────────── */
const DonutCenter = ({ total, label }: { total: number; label: string }) => (
  <div className="an-donut-center">
    <span className="an-donut-center-value">₹{fmt(total)}</span>
    <span className="an-donut-center-label">{label}</span>
  </div>
)

/* ─────────────────────────────────────────────────────── */
/* Pie legend row                                          */
/* ─────────────────────────────────────────────────────── */
const PieLegend = ({ data, colors, total }: { data: CategoryData[]; colors: string[]; total: number }) => (
  <div className="an-pie-legend">
    {data.map((d, i) => {
      const pct = total > 0 ? (d.total / total) * 100 : 0
      return (
        <div key={d.category} className="an-pie-legend-item">
          <span className="an-pie-legend-dot" style={{ background: colors[i % colors.length] }} />
          <span className="an-pie-legend-name">{d.category}</span>
          <span className="an-pie-legend-amt">₹{fmt(d.total)}</span>
          <div className="an-pie-legend-bar-track">
            <div
              className="an-pie-legend-bar-fill"
              style={{ width: `${pct}%`, background: colors[i % colors.length] }}
            />
          </div>
        </div>
      )
    })}
  </div>
)

/* ─────────────────────────────────────────────────────── */
/* Change badge                                            */
/* ─────────────────────────────────────────────────────── */
const ChangeBadge = ({ value, label }: { value: number; label: string }) => {
  const pos = value >= 0
  return (
    <span className={`an-change-badge ${pos ? 'an-change-badge--pos' : 'an-change-badge--neg'}`}>
      {pos ? '+' : ''}{value.toFixed(1)}% {label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────── */
/* Empty state                                             */
/* ─────────────────────────────────────────────────────── */
const EmptyChart = ({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) => (
  <div className="an-empty">
    <Icon size={32} className="an-empty-icon" />
    <p className="an-empty-title">{title}</p>
    <p className="an-empty-sub">{sub}</p>
  </div>
)

/* ═══════════════════════════════════════════════════════ */
/* Main Page                                               */
/* ═══════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  // ── React Query – all cached ──────────────────────────
  const { data: incomeTotals = {}, isLoading: loadingIT } = useIncomeTotals()
  const { data: expenseTotals = {}, isLoading: loadingET } = useExpenseTotals()
  const { data: incomes = [], isLoading: loadingInc } = useIncomes()
  const { data: expenses = [], isLoading: loadingExp } = useExpenses()

  const loading = loadingIT || loadingET || loadingInc || loadingExp

  // ── Date range filter ─────────────────────────────────
  const [dateRange, setDateRange] = useState<DateRange>('last6')

  // ── Export ────────────────────────────────────────────────────────────────
  const { exportTransactions, isExporting } = useExportTransactions()

  // ── Derive category arrays ────────────────────────────
  const toArr = (obj: Record<string, number>): CategoryData[] =>
    Object.entries(obj)
      .map(([category, total]) => ({ category, total }))
      .filter((d) => d.total > 0)

  const incomeData = toArr(incomeTotals)
  const expenseData = toArr(expenseTotals)

  // ── Monthly trend data ────────────────────────────────
  const allMonthlyData = useMemo(() => {
    const monthMap: Record<string, { income: number; expense: number }> = {}
    const addToMap = (items: { date: string; amount: number }[], key: 'income' | 'expense') => {
      items.forEach((t) => {
        const d = new Date(t.date)
        const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
        if (!monthMap[label]) monthMap[label] = { income: 0, expense: 0 }
        monthMap[label][key] += t.amount
      })
    }
    addToMap(incomes, 'income')
    addToMap(expenses, 'expense')
    return Object.entries(monthMap)
      .sort(([a], [b]) => {
        const parse = (s: string) => new Date(`01 ${s}`)
        return parse(a).getTime() - parse(b).getTime()
      })
      .map(([month, v]) => ({ month, ...v, net: v.income - v.expense }))
  }, [incomes, expenses])

  // ── Filter monthly data by date range ─────────────────
  const monthlyData = useMemo(() => {
    const months = DATE_RANGE_MONTHS[dateRange]
    if (months === null) return allMonthlyData
    return allMonthlyData.slice(-months)
  }, [allMonthlyData, dateRange])

  // ── KPI totals ────────────────────────────────────────
  const totalIncome = incomeData.reduce((s, d) => s + d.total, 0)
  const totalExpense = expenseData.reduce((s, d) => s + d.total, 0)
  const net = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0

  // ── Previous period change (mock based on last 2 entries) ──
  const prevNet = monthlyData.length >= 2
    ? monthlyData[monthlyData.length - 2]?.net ?? 0
    : 0
  const lastNet = monthlyData.length >= 1
    ? monthlyData[monthlyData.length - 1]?.net ?? 0
    : 0
  const netChange = prevNet !== 0 ? ((lastNet - prevNet) / Math.abs(prevNet)) * 100 : 0

  const prevIncome = monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2]?.income ?? 0 : 0
  const lastIncome = monthlyData.length >= 1 ? monthlyData[monthlyData.length - 1]?.income ?? 0 : 0
  const incomeChange = prevIncome !== 0 ? ((lastIncome - prevIncome) / Math.abs(prevIncome)) * 100 : 0

  const prevExpense = monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2]?.expense ?? 0 : 0
  const lastExpense = monthlyData.length >= 1 ? monthlyData[monthlyData.length - 1]?.expense ?? 0 : 0
  const expenseChange = prevExpense !== 0 ? ((lastExpense - prevExpense) / Math.abs(prevExpense)) * 100 : 0

  return (
    <div className="an-page">

      {/* ── Sticky Header ───────────────────────────────── */}
      <div className="an-header">
        <div className="an-header-left">
          <p className="an-kicker">Overview</p>
          <h1 className="an-title">Analytics</h1>
        </div>

        {/* Date range filter + Export button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="an-date-filter" role="group" aria-label="Date range filter">
            {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((key) => (
              <button
                key={key}
                id={`an-filter-${key}`}
                className={`an-filter-btn ${dateRange === key ? 'an-filter-btn--active' : ''}`}
                onClick={() => setDateRange(key)}
              >
                {DATE_RANGE_LABELS[key]}
              </button>
            ))}
          </div>

          <button
            id="an-export-btn"
            className="an-export-btn"
            onClick={() => exportTransactions(DATE_RANGE_TO_EXPORT[dateRange])}
            disabled={isExporting}
            title="Export transactions to Excel"
          >
            {isExporting
              ? <Loader2 size={15} className="an-export-spinner" />
              : <FileSpreadsheet size={15} />}
            {isExporting ? 'Exporting…' : 'Export to Excel'}
          </button>
        </div>
      </div>

      <div className="an-section-divider" />

      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="an-kpi-row">
        {/* Total Income */}
        <div
          className="an-kpi-card an-kpi-card--income an-fade-in"
          style={{ animationDelay: '0ms' }}
          title="Total income across all transactions in the selected period"
        >
          <div className="an-kpi-top">
            <span className="an-kpi-label">Total Income</span>
            <span className="an-kpi-icon an-kpi-icon--income"><TrendingUp size={18} /></span>
          </div>
          <div className="an-kpi-value">₹{fmt(totalIncome)}</div>
          <ChangeBadge value={incomeChange} label="vs prev month" />
          <div className="an-kpi-accent an-kpi-accent--income" />
        </div>

        {/* Total Expense */}
        <div
          className="an-kpi-card an-kpi-card--expense an-fade-in"
          style={{ animationDelay: '60ms' }}
          title="Total expenses across all transactions in the selected period"
        >
          <div className="an-kpi-top">
            <span className="an-kpi-label">Total Expenses</span>
            <span className="an-kpi-icon an-kpi-icon--expense"><TrendingDown size={18} /></span>
          </div>
          <div className="an-kpi-value">₹{fmt(totalExpense)}</div>
          <ChangeBadge value={-expenseChange} label="vs prev month" />
          <div className="an-kpi-accent an-kpi-accent--expense" />
        </div>

        {/* Net Savings */}
        <div
          className={`an-kpi-card ${net >= 0 ? 'an-kpi-card--net-pos' : 'an-kpi-card--expense'} an-fade-in`}
          style={{ animationDelay: '120ms' }}
          title="Net savings = total income minus total expenses"
        >
          <div className="an-kpi-top">
            <span className="an-kpi-label">Net Savings</span>
            <span className={`an-kpi-icon ${net >= 0 ? 'an-kpi-icon--net' : 'an-kpi-icon--expense'}`}><Wallet size={18} /></span>
          </div>
          <div className="an-kpi-value">₹{fmt(net)}</div>
          <ChangeBadge value={netChange} label="vs prev month" />
          <div className={`an-kpi-accent ${net >= 0 ? 'an-kpi-accent--net' : 'an-kpi-accent--expense'}`} />
        </div>

        {/* Savings Rate */}
        <div
          className="an-kpi-card an-kpi-card--rate an-fade-in"
          style={{ animationDelay: '180ms' }}
          title="Savings rate = net savings ÷ total income × 100"
        >
          <div className="an-kpi-top">
            <span className="an-kpi-label">Savings Rate</span>
            <span className="an-kpi-icon an-kpi-icon--rate"><PiggyBank size={18} /></span>
          </div>
          <div className="an-kpi-value an-kpi-value--rate">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="an-kpi-arc">
            <SavingsArc pct={savingsRate} />
          </div>
          <div className="an-kpi-accent an-kpi-accent--rate" />
        </div>
      </div>

      <div className="an-section-divider" />

      {loading ? (
        /* ── Skeleton Loaders ──────────────────────────── */
        <div className="an-skeleton-layout">
          <SkeletonCard />
          <div className="an-two-col">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="an-two-col">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <>
          {/* ── Monthly Composed Chart (Bar + Line) ───────── */}
          {monthlyData.length > 0 ? (
            <div className="an-glass-card an-fade-in" style={{ animationDelay: '240ms' }}>
              <h2 className="an-card-title">
                <span className="an-card-title-accent" style={{ background: '#60a5fa' }} />
                <BarChart2 size={17} />
                Monthly Income vs Expense
              </h2>
              <div className="an-chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={monthlyData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'rgba(246,239,232,0.5)', fontSize: 12, fontFamily: 'Inter' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(246,239,232,0.45)', fontSize: 11, fontFamily: 'Inter' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: 'rgba(246,239,232,0.65)', fontSize: '0.82rem', fontFamily: 'Inter' }}>{value}</span>
                      )}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={36} opacity={0.9} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[8, 8, 0, 0]} maxBarSize={36} opacity={0.9} />
                    <Line
                      type="monotone"
                      dataKey="net"
                      name="Net Savings"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: 'rgba(245,158,11,0.3)' }}
                      activeDot={{ r: 6, fill: '#f59e0b' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="an-glass-card">
              <EmptyChart icon={BarChart2} title="No monthly data yet" sub="Add some income or expense transactions to see trends here." />
            </div>
          )}

          {/* ── Pie Charts Row ────────────────────────────── */}
          <div className="an-two-col">
            {/* Income Pie */}
            <div className="an-glass-card an-fade-in" style={{ animationDelay: '300ms' }}>
              <h2 className="an-card-title">
                <span className="an-card-title-accent" style={{ background: '#10b981' }} />
                <TrendingUp size={16} />
                Income by Category
              </h2>
              {incomeData.length === 0 ? (
                <EmptyChart icon={TrendingUp} title="No income data" sub="Record your first income to see the breakdown." />
              ) : (
                <>
                  <div className="an-donut-wrapper">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={incomeData}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={95}
                          paddingAngle={3}
                          labelLine={false}
                        >
                          {incomeData.map((_, i) => (
                            <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`₹${fmt(Number(value))}`, 'Amount']}
                          contentStyle={{
                            background: 'rgba(5,13,26,0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#e8f0fe',
                            fontSize: '0.82rem',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <DonutCenter total={totalIncome} label="Total" />
                  </div>
                  <PieLegend data={incomeData} colors={INCOME_COLORS} total={totalIncome} />
                </>
              )}
            </div>

            {/* Expense Pie */}
            <div className="an-glass-card an-fade-in" style={{ animationDelay: '360ms' }}>
              <h2 className="an-card-title">
                <span className="an-card-title-accent" style={{ background: '#f43f5e' }} />
                <TrendingDown size={16} />
                Expenses by Category
              </h2>
              {expenseData.length === 0 ? (
                <EmptyChart icon={TrendingDown} title="No expense data" sub="Record your first expense to see the breakdown." />
              ) : (
                <>
                  <div className="an-donut-wrapper">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={expenseData}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={95}
                          paddingAngle={3}
                          labelLine={false}
                        >
                          {expenseData.map((_, i) => (
                            <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`₹${fmt(Number(value))}`, 'Amount']}
                          contentStyle={{
                            background: 'rgba(5,13,26,0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#e8f0fe',
                            fontSize: '0.82rem',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <DonutCenter total={totalExpense} label="Total" />
                  </div>
                  <PieLegend data={expenseData} colors={EXPENSE_COLORS} total={totalExpense} />
                </>
              )}
            </div>
          </div>

          {/* ── Category Breakdown Bars ───────────────────── */}
          <div className="an-two-col">
            {/* Income Breakdown */}
            <div className="an-glass-card an-fade-in" style={{ animationDelay: '420ms' }}>
              <h2 className="an-card-title">
                <span className="an-card-title-accent" style={{ background: '#10b981' }} />
                <BarChart3 size={16} />
                Income Breakdown
              </h2>
              {incomeData.length === 0 ? (
                <EmptyChart icon={BarChart3} title="No income data yet" sub="Start adding income transactions." />
              ) : (
                <div className="an-chart-container">
                  <ResponsiveContainer width="100%" height={Math.max(160, incomeData.length * 42)}>
                    <ComposedChart data={incomeData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'rgba(246,239,232,0.4)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        tick={{ fill: 'rgba(246,239,232,0.6)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={82}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="total" name="Income" radius={[0, 8, 8, 0]} maxBarSize={22}>
                        {incomeData.map((_, i) => (
                          <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Expense Breakdown */}
            <div className="an-glass-card an-fade-in" style={{ animationDelay: '480ms' }}>
              <h2 className="an-card-title">
                <span className="an-card-title-accent" style={{ background: '#f43f5e' }} />
                <BarChart3 size={16} />
                Expense Breakdown
              </h2>
              {expenseData.length === 0 ? (
                <EmptyChart icon={BarChart3} title="No expense data yet" sub="Start adding expense transactions." />
              ) : (
                <div className="an-chart-container">
                  <ResponsiveContainer width="100%" height={Math.max(160, expenseData.length * 42)}>
                    <ComposedChart data={expenseData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'rgba(246,239,232,0.4)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        tick={{ fill: 'rgba(246,239,232,0.6)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={82}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="total" name="Expense" radius={[0, 8, 8, 0]} maxBarSize={22}>
                        {expenseData.map((_, i) => (
                          <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
