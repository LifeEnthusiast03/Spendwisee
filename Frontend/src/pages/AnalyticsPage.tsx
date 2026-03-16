import TopNavigation from '../components/TopNavigation'
import { useDashboardData } from '../hooks/useDashboardData'

type CategorySlice = { label: string; amount: number; color: string }
type WeeklyPoint = { label: string; amount: number }

const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const donutPalette = ['#10b981', '#f97316', '#38bdf8', '#a855f7', '#f43f5e', '#facc15', '#14b8a6', '#64748b']

const toCategorySlices = (totals: Record<string, number>): CategorySlice[] => {
  const sorted = Object.entries(totals)
    .map(([label, amount]) => ({ label, amount }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const topItems = sorted.slice(0, 6)
  const othersTotal = sorted.slice(6).reduce((sum, item) => sum + item.amount, 0)

  const slices = topItems.map((item, index) => ({
    label: item.label,
    amount: item.amount,
    color: donutPalette[index % donutPalette.length],
  }))

  if (othersTotal > 0) {
    slices.push({ label: 'OTHER', amount: othersTotal, color: '#475569' })
  }

  return slices
}

const buildDonutGradient = (rows: CategorySlice[]): string => {
  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  if (total <= 0) {
    return 'conic-gradient(rgba(255,255,255,0.12) 0deg, rgba(255,255,255,0.12) 360deg)'
  }

  let start = 0
  const segments = rows.map((row) => {
    const sweep = (row.amount / total) * 360
    const end = start + sweep
    const segment = `${row.color} ${start}deg ${end}deg`
    start = end
    return segment
  })

  return `conic-gradient(${segments.join(', ')})`
}

const buildWeeklySpending = (dates: { date: string; amount: number }[]): WeeklyPoint[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const points: WeeklyPoint[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return { label: dayFormatter.format(date), amount: 0 }
  })

  const dateIndex = new Map<number, number>()
  points.forEach((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    dateIndex.set(date.getTime(), index)
  })

  dates.forEach((record) => {
    const parsed = new Date(record.date)
    if (Number.isNaN(parsed.getTime())) {
      return
    }
    parsed.setHours(0, 0, 0, 0)
    const targetIndex = dateIndex.get(parsed.getTime())
    if (targetIndex !== undefined) {
      points[targetIndex].amount += record.amount
    }
  })

  return points
}

export default function AnalyticsPage() {
  const { isLoadingData, dataError, incomes, expenses, incomeTotals, expenseTotals, totalIncome, totalExpense } = useDashboardData()
  const incomeSlices = toCategorySlices(incomeTotals)
  const expenseSlices = toCategorySlices(expenseTotals)
  const totalIncomeByCategory = incomeSlices.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenseByCategory = expenseSlices.reduce((sum, item) => sum + item.amount, 0)
  const incomeDonutBackground = buildDonutGradient(incomeSlices)
  const expenseDonutBackground = buildDonutGradient(expenseSlices)
  const weeklySpending = buildWeeklySpending(expenses)
  const weeklyIncome = buildWeeklySpending(incomes)
  const maxWeeklySpending = Math.max(...weeklySpending.map((item) => item.amount), 1)
  const spendToIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0
  const avgDailySpending = weeklySpending.reduce((sum, point) => sum + point.amount, 0) / 7
  const topExpenseCategory = expenseSlices[0]
  const totalTransactions = incomes.length + expenses.length

  const linePoints = (() => {
    const width = 320
    const height = 140
    const padding = 14
    const xStep = (width - padding * 2) / Math.max(weeklySpending.length - 1, 1)
    return weeklySpending
      .map((point, index) => {
        const x = padding + xStep * index
        const y = height - padding - (point.amount / maxWeeklySpending) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')
  })()

  return (
    <section className="entry-shell home-shell">
      <div className="entry-dashboard mobile-dashboard">
        <TopNavigation />

        <header className="mobile-header single-column">
          <div className="mobile-greeting">
            <p className="mobile-kicker">SpendWise</p>
            <h1>Analytics</h1>
          </div>
        </header>

        {isLoadingData ? <p className="entry-loading">Loading analytics...</p> : null}
        {!isLoadingData && dataError ? <p className="entry-message error">{dataError}</p> : null}

        {!isLoadingData && !dataError ? (
          <>
            <section className="mobile-viz-grid">
              <article className="entry-card mobile-card">
                <div className="card-head">
                  <h2>Income Categories</h2>
                  <span>This month</span>
                </div>
                <div className="donut-layout">
                  <div className="donut-main" style={{ background: incomeDonutBackground }}>
                    <div className="donut-inner">
                      <small>Total</small>
                      <strong>₹{money.format(totalIncomeByCategory)}</strong>
                    </div>
                  </div>
                  <ul className="donut-legend">
                    {incomeSlices.length === 0 ? <li>No income categories yet.</li> : null}
                    {incomeSlices.map((slice) => (
                      <li key={slice.label}>
                        <span style={{ background: slice.color }} />
                        <p>{slice.label}</p>
                        <strong>₹{money.format(slice.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="entry-card mobile-card">
                <div className="card-head">
                  <h2>Expense Categories</h2>
                  <span>This month</span>
                </div>
                <div className="donut-layout">
                  <div className="donut-main" style={{ background: expenseDonutBackground }}>
                    <div className="donut-inner">
                      <small>Total</small>
                      <strong>₹{money.format(totalExpenseByCategory)}</strong>
                    </div>
                  </div>
                  <ul className="donut-legend">
                    {expenseSlices.length === 0 ? <li>No expense categories yet.</li> : null}
                    {expenseSlices.map((slice) => (
                      <li key={slice.label}>
                        <span style={{ background: slice.color }} />
                        <p>{slice.label}</p>
                        <strong>₹{money.format(slice.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </section>

            <section className="mobile-viz-grid">
              <article className="entry-card mobile-card">
                <div className="card-head">
                  <h2>Weekly Spending</h2>
                  <span>Last 7 days</span>
                </div>
                <div className="trend-graph">
                  <svg viewBox="0 0 320 140" role="img" aria-label="Weekly spending trend line graph">
                    <defs>
                      <linearGradient id="weeklyLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#fb7185" />
                      </linearGradient>
                    </defs>
                    <polyline className="trend-line" fill="none" points={linePoints} />
                    {weeklySpending.map((point, index) => {
                      const width = 320
                      const height = 140
                      const padding = 14
                      const xStep = (width - padding * 2) / Math.max(weeklySpending.length - 1, 1)
                      const x = padding + xStep * index
                      const y = height - padding - (point.amount / maxWeeklySpending) * (height - padding * 2)
                      return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="3.5" className="trend-dot" />
                    })}
                  </svg>
                </div>
                <div className="trend-labels">
                  {weeklySpending.map((point) => (
                    <div key={point.label}>
                      <span>{point.label}</span>
                      <strong>₹{money.format(point.amount)}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="entry-card mobile-card analytics-kpi-card">
                <div className="card-head">
                  <h2>Additional Insights</h2>
                  <span>Auto generated</span>
                </div>
                <div className="analytics-kpi-grid">
                  <div>
                    <small>Spend / Income</small>
                    <strong>{spendToIncomeRatio.toFixed(1)}%</strong>
                  </div>
                  <div>
                    <small>Avg Daily Spend</small>
                    <strong>₹{money.format(avgDailySpending)}</strong>
                  </div>
                  <div>
                    <small>Top Expense</small>
                    <strong>{topExpenseCategory ? topExpenseCategory.label : 'N/A'}</strong>
                  </div>
                  <div>
                    <small>Total Transactions</small>
                    <strong>{totalTransactions}</strong>
                  </div>
                  <div>
                    <small>Weekly Income</small>
                    <strong>₹{money.format(weeklyIncome.reduce((sum, point) => sum + point.amount, 0))}</strong>
                  </div>
                  <div>
                    <small>Weekly Expense</small>
                    <strong>₹{money.format(weeklySpending.reduce((sum, point) => sum + point.amount, 0))}</strong>
                  </div>
                </div>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </section>
  )
}
