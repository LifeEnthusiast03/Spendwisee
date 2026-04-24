import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../store/api'
import { QUERY_KEYS } from './useTransactionQueries'
import type { BudgetType, IncomeGoal, ExpenseBudget } from '../types/types'

// ─── Income Goal Queries ──────────────────────────────────────────────────────

export function useIncomeGoals() {
  return useQuery({
    queryKey: QUERY_KEYS.incomeGoals,
    queryFn: async () => {
      const res = await api.get<IncomeGoal[]>('/incomegoal')
      return res.data
    },
  })
}

export function useCreateIncomeGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { amount: number; type: BudgetType; catagory: string }) => {
      const res = await api.post<IncomeGoal>('/incomegoal', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Income goal set!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incomeGoals })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create income goal')
    },
  })
}

export function useDeleteIncomeGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/incomegoal/${id}`)
      return id
    },
    onSuccess: () => {
      toast.success('Income goal deleted!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incomeGoals })
    },
    onError: () => {
      toast.error('Failed to delete income goal')
    },
  })
}

// ─── Expense Budget Queries ────────────────────────────────────────────────────

export function useExpenseBudgets() {
  return useQuery({
    queryKey: QUERY_KEYS.expenseBudgets,
    queryFn: async () => {
      const res = await api.get<ExpenseBudget[]>('/expensebudget')
      return res.data
    },
  })
}

export function useCreateExpenseBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { amount: number; type: BudgetType; catagory: string }) => {
      const res = await api.post<ExpenseBudget>('/expensebudget', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Expense budget set!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.expenseBudgets })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create expense budget')
    },
  })
}

export function useDeleteExpenseBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/expensebudget/${id}`)
      return id
    },
    onSuccess: () => {
      toast.success('Budget deleted!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.expenseBudgets })
    },
    onError: () => {
      toast.error('Failed to delete budget')
    },
  })
}
