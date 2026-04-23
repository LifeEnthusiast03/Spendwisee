import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import api from '../store/api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

interface CategoryData {
  category: string
  total: number
}

interface Transaction {
  id: number
  amount: number
  category: string
  date: string
}

const INCOME_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#fbbf24', '#a78bfa']
const EXPENSE_COLORS = ['#f43f5e', '#fb7185', '#ff8d6c', '#ffbe82', '#e11d48', '#be123c']

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)

// Custom tooltip for charts
const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        {label && <p className="chart-tooltip-label">{label}</p>}
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

export default function AnalyticsPage() {
  const [incomeData, setIncomeData] = useState<CategoryData[]>([])
  const [expenseData, setExpenseData] = useState<CategoryData[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [incTotalRes, expTotalRes, incRes, expRes] = await Promise.all([
          api.get('/income/total'),
          api.get('/expense/total'),
          api.get('/income'),
          api.get('/expense'),
        ])

        // Category data — API returns { CATEGORY: amount } flat object
        const toArr = (obj: Record<string, number>) =>
          Object.entries(obj)
            .map(([category, total]) => ({ category, total }))
            .filter((d) => d.total > 0)
        setIncomeData(toArr(incTotalRes.data))
        setExpenseData(toArr(expTotalRes.data))

        // Monthly trend data — last 6 months
        const incomes: Transaction[] = incRes.data
        const expenses: Transaction[] = expRes.data

        const monthMap: Record<string, { income: number; expense: number }> = {}
        const addToMap = (items: Transaction[], key: 'income' | 'expense') => {
          items.forEach((t) => {
            const d = new Date(t.date)
            const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
            if (!monthMap[label]) monthMap[label] = { income: 0, expense: 0 }
            monthMap[label][key] += t.amount
          })
        }
        addToMap(incomes, 'income')
        addToMap(expenses, 'expense')

        // Sort by date and take last 6
        const sorted = Object.entries(monthMap)
          .sort(([a], [b]) => {
            const parse = (s: string) => new Date(`01 ${s}`)
            return parse(a).getTime() - parse(b).getTime()
          })
          .slice(-6)
          .map(([month, v]) => ({ month, ...v }))

        setMonthlyData(sorted)
      } catch {
        //
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalIncome = incomeData.reduce((s, d) => s + d.total, 0)
  const totalExpense = expenseData.reduce((s, d) => s + d.total, 0)
  const net = totalIncome - totalExpense

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-kicker">Overview</p>
          <h1 className="page-title">Analytics</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-row">
        <div className="stat-card stat-card--income">
          <div className="stat-card-icon"><TrendingUp size={22} /></div>
          <div className="stat-card-label">Total Income</div>
          <div className="stat-card-value">₹{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card stat-card--expense">
          <div className="stat-card-icon"><TrendingDown size={22} /></div>
          <div className="stat-card-label">Total Expense</div>
          <div className="stat-card-value">₹{fmt(totalExpense)}</div>
        </div>
        <div className={`stat-card ${net >= 0 ? 'stat-card--balance' : 'stat-card--expense'}`}>
          <div className="stat-card-icon"><Wallet size={22} /></div>
          <div className="stat-card-label">Net Savings</div>
          <div className="stat-card-value">₹{fmt(net)}</div>
          <div className="stat-card-sub">{net >= 0 ? 'Positive balance 🎯' : 'Overspent'}</div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Monthly Bar Chart */}
          {monthlyData.length > 0 && (
            <div className="glass-card">
              <h2 className="card-title">Monthly Income vs Expense</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'rgba(246,239,232,0.5)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(246,239,232,0.5)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: 'rgba(246,239,232,0.7)', fontSize: '0.82rem' }}>{value}</span>
                      )}
                    />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pie Charts Row */}
          <div className="analytics-grid">
            {/* Income Pie */}
            <div className="glass-card">
              <h2 className="card-title income-color">
                <TrendingUp size={18} /> Income by Category
              </h2>
              {incomeData.length === 0 ? (
                <div className="empty-state"><p>No income data yet</p></div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={incomeData}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        label={({ name, percent }: PieLabelRenderProps) =>
                          `${name ?? ''} ${(((percent ?? 0) * 100).toFixed(0))}%`
                        }
                        labelLine={false}
                      >
                        {incomeData.map((_, i) => (
                          <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`₹${fmt(value)}`, 'Amount']}
                        contentStyle={{
                          background: 'rgba(15,23,42,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#f6efe8',
                          fontSize: '0.82rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="pie-legend">
                    {incomeData.map((d, i) => (
                      <div key={d.category} className="pie-legend-item">
                        <span className="pie-legend-dot" style={{ background: INCOME_COLORS[i % INCOME_COLORS.length] }} />
                        <span className="pie-legend-label">{d.category}</span>
                        <span className="pie-legend-value">₹{fmt(d.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Expense Pie */}
            <div className="glass-card">
              <h2 className="card-title expense-color">
                <TrendingDown size={18} /> Expenses by Category
              </h2>
              {expenseData.length === 0 ? (
                <div className="empty-state"><p>No expense data yet</p></div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        label={({ name, percent }: PieLabelRenderProps) =>
                          `${name ?? ''} ${(((percent ?? 0) * 100).toFixed(0))}%`
                        }
                        labelLine={false}
                      >
                        {expenseData.map((_, i) => (
                          <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`₹${fmt(value)}`, 'Amount']}
                        contentStyle={{
                          background: 'rgba(15,23,42,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#f6efe8',
                          fontSize: '0.82rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {expenseData.map((d, i) => (
                      <div key={d.category} className="pie-legend-item">
                        <span className="pie-legend-dot" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />
                        <span className="pie-legend-label">{d.category}</span>
                        <span className="pie-legend-value">₹{fmt(d.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Bar Charts */}
          <div className="analytics-grid">
            <div className="glass-card">
              <h2 className="card-title income-color">
                <TrendingUp size={18} /> Income Breakdown
              </h2>
              {incomeData.length === 0 ? (
                <div className="empty-state"><p>No data yet</p></div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={incomeData}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'rgba(246,239,232,0.45)', fontSize: 11 }}
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
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="total" name="Income" radius={[0, 6, 6, 0]} maxBarSize={24}>
                        {incomeData.map((_, i) => (
                          <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-card">
              <h2 className="card-title expense-color">
                <TrendingDown size={18} /> Expense Breakdown
              </h2>
              {expenseData.length === 0 ? (
                <div className="empty-state"><p>No data yet</p></div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={expenseData}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'rgba(246,239,232,0.45)', fontSize: 11 }}
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
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="total" name="Expense" radius={[0, 6, 6, 0]} maxBarSize={24}>
                        {expenseData.map((_, i) => (
                          <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
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
