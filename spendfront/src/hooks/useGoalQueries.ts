import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../store/api'
import { QUERY_KEYS } from './useTransactionQueries'
import type { Goal } from '../types/types'

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGoals() {
  return useQuery({
    queryKey: QUERY_KEYS.goals,
    queryFn: async () => {
      const res = await api.get<Goal[]>('/goal')
      return res.data
    },
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      name: string
      amount: number
      startdate: string
      enddate: string
    }) => {
      const res = await api.post<Goal>('/goal', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Goal created!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.goals })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create goal')
    },
  })
}

export function useAddMoneyToGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: number; amount: number }) => {
      const res = await api.post<Goal>(`/goal/${goalId}/addmoney`, { amount })
      return res.data
    },
    onSuccess: () => {
      toast.success('Money added to goal!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.goals })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add money')
    },
  })
}

export function useRemoveMoneyFromGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: number; amount: number }) => {
      const res = await api.post<Goal>(`/goal/${goalId}/removemoney`, { amount })
      return res.data
    },
    onSuccess: () => {
      toast.success('Money removed from goal!')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.goals })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to remove money')
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/goal/${id}`)
      return id
    },
    onSuccess: () => {
      toast.success('Goal deleted')
      qc.invalidateQueries({ queryKey: QUERY_KEYS.goals })
    },
    onError: () => {
      toast.error('Failed to delete goal')
    },
  })
}
