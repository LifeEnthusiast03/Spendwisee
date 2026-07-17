// ─────────────────────────────────────────────────────────────────────────────
// types/types.ts  –  Single source of truth for all shared types & interfaces
// ─────────────────────────────────────────────────────────────────────────────

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number
  email: string
  name: string | null
  googleId: string | null
}

// ── Transactions ──────────────────────────────────────────────────────────────

export interface IncomeRecord {
  id: number
  amount: number
  category: string
  note: string | null
  date: string
}

export interface ExpenseRecord {
  id: number
  amount: number
  category: string
  note: string | null
  date: string
}

/** { CATEGORY: totalAmount } flat map returned by /income/total & /expense/total */
export type CategoryTotals = Record<string, number>

// ── Savings Goals ─────────────────────────────────────────────────────────────

export interface Goal {
  id: number
  name: string
  amount: number
  totalMoney: number
  startdate: string
  enddate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  userId: number
}

// ── Budgets ───────────────────────────────────────────────────────────────────

export type BudgetType = 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'GIFT' | 'OTHER'

export type ExpenseCategory =
  | 'FOOD'
  | 'TRANSPORT'
  | 'RENT'
  | 'SHOPPING'
  | 'ENTERTAINMENT'
  | 'BILLS'
  | 'OTHER'

export interface IncomeGoal {
  id: number
  amount: number
  fulfilledAmount: number
  category: IncomeCategory | string
  type: BudgetType
  periodStart: string
  periodEnd: string
  createdAt: string
  userId: number
}

export interface ExpenseBudget {
  id: number
  amount: number
  fulfilledAmount: number
  category: ExpenseCategory | string
  type: BudgetType
  periodStart: string
  periodEnd: string
  createdAt: string
  userId: number
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface CategoryData {
  category: string
  total: number
}

// ── Export ────────────────────────────────────────────────────────────────────

/** Range values accepted by GET /export/transactions?range= */
export type ExportRange = 'this_month' | 'last_3' | 'last_6' | 'all_time'

// ── AI Chat ───────────────────────────────────────────────────────────────────

export interface AgentResponse {
  type: 'success' | 'error' | 'info' | 'advice' | 'list'
  title: string
  summary: string
  details?: { label: string; value: string }[]
  items?: string[]
  tips?: string[]
}

/** Discriminated union of SSE event payloads emitted by POST /chat/stream */
export type SseEvent =
  | { type: 'delta'; text: string }
  | { type: 'status'; text: string }
  | { type: 'done'; response: AgentResponse }
  | { type: 'error'; message: string }
