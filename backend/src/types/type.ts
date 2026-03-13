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
