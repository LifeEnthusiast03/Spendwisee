import { useMemo, useState } from 'react'
import TopNavigation from '../components/TopNavigation'
import { useAppSelector } from '../store/hooks'

type CategorySlice = { label: string; amount: number; color: string }
type WeeklyPoint = { label: string; amount: number }

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const monthDayFormatter = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' })
const donutPalette = ['#10b981', '#f97316', '#38bdf8', '#a855f7', '#f43f5e', '#facc15', '#14b8a6', '#64748b']

const toCategorySlices = (totals: Record<string, number>): CategorySlice[] => {
  const sorted = Object.entries(totals).map(([label, amount]) => ({ label, amount })).filter((i) => i.amount > 0).sort((a, b) => b.amount - a.amount)
  const top = sorted.slice(0, 6)
  const othersTotal = sorted.slice(6).reduce((s, i) => s + i.amount, 0)
  const slices = top.map((i, idx) => ({ label: i.label, amount: i.amount, color: donutPalette[idx % donutPalette.length] }))
  if (othersTotal > 0) slices.push({ label: 'OTHER', amount: othersTotal, color: '#475569' })
  return slices
}

const buildDonutGradient = (rows: CategorySlice[]): string => {
  const total = rows.reduce((s, r) => s + r.amount, 0)
  if (total <= 0) return 'conic-gradient(rgba(255,255,255,0.12) 0deg, rgba(255,255,255,0.12) 360deg)'
  let start = 0
  const segs = rows.map((r) => { const sweep = (r.amount / total) * 360; const end = start + sweep; const seg = `${r.color} ${start}deg ${end}deg`; start = end; return seg })
  return `conic-gradient(${segs.join(', ')})`
}

const buildTimePoints = (dates: { date: string; amount: number }[], days: number, formatter: Intl.DateTimeFormat): WeeklyPoint[] => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const points: WeeklyPoint[] = Array.from({ length: days }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() - (days - 1 - i)); return { label: formatter.format(d), amount: 0 } })
  const dateIndex = new Map<number, number>()
  points.forEach((_, i) => { const d = new Date(today); d.setDate(today.getDate() - (days - 1 - i)); dateIndex.set(d.getTime(), i) })
  dates.forEach((r) => { const p = new Date(r.date); if (Number.isNaN(p.getTime())) return; p.setHours(0, 0, 0, 0); const idx = dateIndex.get(p.getTime()); if (idx !== undefined) points[idx].amount += r.amount })
  return points
}

const buildLinePoints = (points: WeeklyPoint[], max: number): string => {
  const w = 320, h = 140, p = 14; const xStep = (w - p * 2) / Math.max(points.length - 1, 1)
  return points.map((pt, i) => `${p + xStep * i},${h - p - (pt.amount / max) * (h - p * 2)}`).join(' ')
}

export default function AnalyticsPage() {
  const [hoveredIncomeCat, setHoveredIncomeCat] = useState<string | null>(null)
  const [hoveredExpenseCat, setHoveredExpenseCat] = useState<string | null>(null)
  const { incomes, totals: incomeTotals, isLoading: incLoading } = useAppSelector((s) => s.income)
  const { expenses, totals: expenseTotals, isLoading: expLoading } = useAppSelector((s) => s.expense)

  const isLoading = incLoading || expLoading
  const incomeSlices = useMemo(() => toCategorySlices(incomeTotals), [incomeTotals])
  const expenseSlices = useMemo(() => toCategorySlices(expenseTotals), [expenseTotals])
  const totalIncome = useMemo(() => Object.values(incomeTotals).reduce((s, a) => s + a, 0), [incomeTotals])
  const totalExpense = useMemo(() => Object.values(expenseTotals).reduce((s, a) => s + a, 0), [expenseTotals])
  const totalIncByCat = incomeSlices.reduce((s, i) => s + i.amount, 0)
  const totalExpByCat = expenseSlices.reduce((s, i) => s + i.amount, 0)
  const incDonut = buildDonutGradient(incomeSlices)
  const expDonut = buildDonutGradient(expenseSlices)
  const weeklySpending = useMemo(() => buildTimePoints(expenses, 7, dayFormatter), [expenses])
  const monthlySpending = useMemo(() => buildTimePoints(expenses, 30, monthDayFormatter), [expenses])
  
  const maxWeekly = Math.max(...weeklySpending.map((p) => p.amount), 1)
  const maxMonthly = Math.max(...monthlySpending.map((p) => p.amount), 1)
  
  const spendRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0
  const spendHealthColor = spendRatio > 90 ? '#fb7185' : spendRatio > 75 ? '#fbbf24' : '#10b981'
  
  const weeklyTotal = weeklySpending.reduce((s, p) => s + p.amount, 0)
  const monthlyTotal = monthlySpending.reduce((s, p) => s + p.amount, 0)
  const topExpCat = expenseSlices[0]
  const totalTx = incomes.length + expenses.length

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />
        <header className="mobile-header single-column" style={{ marginBottom: '0.8rem' }}>
          <div className="mobile-greeting">
            <p className="mobile-kicker">Insights & Trends</p>
            <h1>Analytics</h1>
          </div>
        </header>

        {isLoading ? <div className="skeleton-card pulse" /> : null}

        {!isLoading ? (
          <div style={{ display: 'grid', gap: '1.5rem', paddingBottom: '2rem' }}>
            
            {/* KPI OVERVIEW */}
            <section className="balance-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="balance-head" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>Financial Health</p>
                  <strong style={{ fontSize: '1.8rem', color: spendHealthColor }}>
                    {spendRatio.toFixed(1)}% <span style={{ fontSize: '1rem', color: 'rgba(246, 239, 232, 0.72)', fontWeight: 500 }}>Spent</span>
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total Transactions</p>
                  <strong style={{ fontSize: '1.5rem' }}>{totalTx}</strong>
                </div>
              </div>
              <div className="balance-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                <article>
                  <span>Avg Daily Spend</span>
                  <h3 className="expense">₹{money.format(weeklyTotal / 7)}</h3>
                </article>
                <article>
                  <span>Monthly Expense</span>
                  <h3 className="expense">₹{money.format(monthlyTotal)}</h3>
                </article>
                <article>
                  <span>Top Expense</span>
                  <h3 style={{ color: topExpCat ? topExpCat.color : '#38bdf8' }}>{topExpCat ? topExpCat.label : 'N/A'}</h3>
                </article>
              </div>
            </section>

            {/* CHARTS TRENDS */}
            <section className="mobile-viz-grid">
              <article className="entry-card mobile-card">
                <div className="card-head" style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'grid', placeItems: 'center', color: '#38bdf8', fontSize: '1.1rem' }}>📉</div>
                    <h2 style={{ fontSize: '1.1rem' }}>Weekly Spending</h2>
                  </div>
                  <span>Last 7 Days</span>
                </div>
                <div className="trend-graph">
                  <svg viewBox="0 0 320 140" role="img" aria-label="Weekly spending trend">
                    <polyline className="trend-line" fill="none" points={buildLinePoints(weeklySpending, maxWeekly)} />
                    {weeklySpending.map((pt, i) => { const w = 320, h = 140, p = 14; const xs = (w - p * 2) / Math.max(weeklySpending.length - 1, 1); return <circle key={i} cx={p + xs * i} cy={h - p - (pt.amount / maxWeekly) * (h - p * 2)} r="3.5" className="trend-dot" /> })}
                  </svg>
                </div>
                <div className="trend-labels">
                  {weeklySpending.map((p) => <div key={p.label}><span>{p.label}</span><strong>₹{money.format(p.amount)}</strong></div>)}
                </div>
                <div className="trend-metrics">
                  <div><small>Weekly Expense</small><strong>₹{money.format(weeklyTotal)}</strong></div>
                  <div><small>Daily Avg</small><strong>₹{money.format(weeklyTotal / 7)}</strong></div>
                </div>
              </article>

              <article className="entry-card mobile-card">
                <div className="card-head" style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'grid', placeItems: 'center', color: '#a855f7', fontSize: '1.1rem' }}>📈</div>
                    <h2 style={{ fontSize: '1.1rem' }}>Monthly Spending</h2>
                  </div>
                  <span>Last 30 Days</span>
                </div>
                <div className="trend-graph">
                  <svg viewBox="0 0 320 140" role="img" aria-label="Monthly spending trend">
                    <polyline className="trend-line monthly" fill="none" points={buildLinePoints(monthlySpending, maxMonthly)} />
                    {monthlySpending.map((pt, i) => { const w = 320, h = 140, p = 14; const xs = (w - p * 2) / Math.max(monthlySpending.length - 1, 1); return <circle key={i} cx={p + xs * i} cy={h - p - (pt.amount / maxMonthly) * (h - p * 2)} r="2.8" className="trend-dot monthly" /> })}
                  </svg>
                </div>
                <div className="trend-labels">
                  {monthlySpending.filter((_, i) => i % 5 === 0 || i === monthlySpending.length - 1).map((p) => <div key={p.label}><span>{p.label}</span><strong>₹{money.format(p.amount)}</strong></div>)}
                </div>
                <div className="trend-metrics">
                  <div><small>Monthly Expense</small><strong>₹{money.format(monthlyTotal)}</strong></div>
                  <div><small>Daily Avg</small><strong>₹{money.format(monthlyTotal / 30)}</strong></div>
                </div>
              </article>
            </section>

            {/* DONUTS CATEGORIES */}
            <section className="mobile-viz-grid">
              <article className="entry-card mobile-card">
                <div className="card-head" style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center', color: '#10b981', fontSize: '1.1rem' }}>📥</div>
                    <h2 style={{ fontSize: '1.1rem' }}>Income Breakup</h2>
                  </div>
                  <span>All time</span>
                </div>
                <div className="donut-layout">
                  <div className="donut-main" style={{ background: incDonut }}>
                    <div className="donut-inner">
                      <small>{hoveredIncomeCat ? 'Category' : 'Total'}</small>
                      <strong style={{ color: hoveredIncomeCat ? incomeSlices.find((s) => s.label === hoveredIncomeCat)?.color : '#f6efe8' }}>₹{money.format(hoveredIncomeCat ? incomeSlices.find((s) => s.label === hoveredIncomeCat)?.amount ?? 0 : totalIncByCat)}</strong>
                      {hoveredIncomeCat && <p className="donut-category">{hoveredIncomeCat}</p>}
                    </div>
                  </div>
                  <ul className="donut-legend">
                    {incomeSlices.length === 0 ? <li style={{ background: 'transparent', cursor: 'default' }}>No income yet.</li> : null}
                    {incomeSlices.map((s) => (
                      <li key={s.label} onMouseEnter={() => setHoveredIncomeCat(s.label)} onMouseLeave={() => setHoveredIncomeCat(null)}>
                        <span style={{ background: s.color }} /><p>{s.label}</p><strong style={{ color: s.color }}>₹{money.format(s.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="entry-card mobile-card">
                <div className="card-head" style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.15)', display: 'grid', placeItems: 'center', color: '#f97316', fontSize: '1.1rem' }}>📤</div>
                    <h2 style={{ fontSize: '1.1rem' }}>Expense Breakup</h2>
                  </div>
                  <span>All time</span>
                </div>
                <div className="donut-layout">
                  <div className="donut-main" style={{ background: expDonut }}>
                    <div className="donut-inner">
                      <small>{hoveredExpenseCat ? 'Category' : 'Total'}</small>
                      <strong style={{ color: hoveredExpenseCat ? expenseSlices.find((s) => s.label === hoveredExpenseCat)?.color : '#f6efe8' }}>₹{money.format(hoveredExpenseCat ? expenseSlices.find((s) => s.label === hoveredExpenseCat)?.amount ?? 0 : totalExpByCat)}</strong>
                      {hoveredExpenseCat && <p className="donut-category">{hoveredExpenseCat}</p>}
                    </div>
                  </div>
                  <ul className="donut-legend">
                    {expenseSlices.length === 0 ? <li style={{ background: 'transparent', cursor: 'default' }}>No expenses yet.</li> : null}
                    {expenseSlices.map((s) => (
                      <li key={s.label} onMouseEnter={() => setHoveredExpenseCat(s.label)} onMouseLeave={() => setHoveredExpenseCat(null)}>
                        <span style={{ background: s.color }} /><p>{s.label}</p><strong style={{ color: s.color }}>₹{money.format(s.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  )
}
