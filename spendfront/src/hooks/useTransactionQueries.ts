import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../store/api'
import type { IncomeRecord, ExpenseRecord, CategoryTotals } from '../types/types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  incomes: ['incomes'] as const,
  incomeTotals: ['income-totals'] as const,
  expenses: ['expenses'] as const,
  expenseTotals: ['expense-totals'] as const,
  goals: ['goals'] as const,
  incomeGoals: ['income-goals'] as const,
  expenseBudgets: ['expense-budgets'] as const,
}

// ─── Income Queries ───────────────────────────────────────────────────────────

export function useIncomes() {
  return useQuery({
    queryKey: QUERY_KEYS.incomes,
    queryFn: async () => {
      const res = await api.get<IncomeRecord[]>('/income')
      return res.data
    },
  })
}

export function useIncomeTotals() {
  return useQuery({
    queryKey: QUERY_KEYS.incomeTotals,
    queryFn: async () => {
      const res = await api.get<CategoryTotals>('/income/total')
      return res.data
    },
  })
}

export function useAddIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      amount: number
      catagory: string
      note: string | null
      date: string
    }) => {
      const res = await api.post<IncomeRecord>('/addincome', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Income added!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incomes })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incomeTotals })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add income')
    },
  })
}

export function useDeleteIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/income/${id}`)
      return id
    },
    onSuccess: () => {
      toast.success('Income deleted!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incomes })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incomeTotals })
    },
    onError: () => {
      toast.error('Failed to delete income')
    },
  })
}

// ─── Expense Queries ──────────────────────────────────────────────────────────

export function useExpenses() {
  return useQuery({
    queryKey: QUERY_KEYS.expenses,
    queryFn: async () => {
      const res = await api.get<ExpenseRecord[]>('/expense')
      return res.data
    },
  })
}

export function useExpenseTotals() {
  return useQuery({
    queryKey: QUERY_KEYS.expenseTotals,
    queryFn: async () => {
      const res = await api.get<CategoryTotals>('/expense/total')
      return res.data
    },
  })
}

export function useAddExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      amount: number
      catagory: string
      note: string | null
      date: string
    }) => {
      const res = await api.post<ExpenseRecord>('/addexpense', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Expense added!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.expenses })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.expenseTotals })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add expense')
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expense/${id}`)
      return id
    },
    onSuccess: () => {
      toast.success('Expense deleted!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.expenses })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.expenseTotals })
    },
    onError: () => {
      toast.error('Failed to delete expense')
    },
  })
}
