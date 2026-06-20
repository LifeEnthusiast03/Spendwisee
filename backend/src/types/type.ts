export interface IUser {
  id?: number
  email: string
  name: string | null
  googleId?: string | null
  password?: string | null
}

export type IncomeCategory =
  | "SALARY"
  | "FREELANCE"
  | "BUSINESS"
  | "INVESTMENT"
  | "GIFT"
  | "OTHER"

export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "RENT"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "BILLS"
  | "OTHER"

export type GoalPeriodType = "WEEKLY" | "MONTHLY" | "YEARLY"

export interface IExpenseBudget {
  id?: number
  amount: number
  category: ExpenseCategory
  type: GoalPeriodType
  fulfilledAmount?: number
  periodStart?: Date
  periodEnd?: Date
  createdAt?: Date
  updatedAt?: Date
  userId: number
}

export interface IIncomeGoal {
  id?: number
  amount: number
  category: IncomeCategory
  type: GoalPeriodType
  fulfilledAmount?: number
  periodStart?: Date
  periodEnd?: Date
  createdAt?: Date
  updatedAt?: Date
  userId: number
}

export interface IGoal {
  id?: number
  name: string
  amount: number
  totalMoney?: number
  startdate: Date
  enddate: Date
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  userId: number
}

export interface IIncome {
  id?: number
  amount: number
  category: IncomeCategory
  note?: string | null
  date?: Date
  createdAt?: Date
  updatedAt?: Date
  userId: number
}

export interface IExpense {
  id?: number
  amount: number
  category: ExpenseCategory
  note?: string | null
  date?: Date
  createdAt?: Date
  updatedAt?: Date
  userId: number
}

declare module "express-session" {
  interface SessionData {
    passport: {
      user: IUser
    }
  }
}

// Extend passport user on req.user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}
