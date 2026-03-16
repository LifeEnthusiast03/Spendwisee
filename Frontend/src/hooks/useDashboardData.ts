import { useEffect, useMemo, useState } from 'react'

export type EntryRecord = {
  id: number
  amount: number
  category: string
  note: string | null
  date: string
}

export type CategoryTotals = Record<string, number>

export type UserProfile = {
  id: number
  email: string
  name: string | null
  googleId: string | null
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function useDashboardData() {
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [incomes, setIncomes] = useState<EntryRecord[]>([])
  const [expenses, setExpenses] = useState<EntryRecord[]>([])
  const [incomeTotals, setIncomeTotals] = useState<CategoryTotals>({})
  const [expenseTotals, setExpenseTotals] = useState<CategoryTotals>({})

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDataError('')
      setProfileError('')
      setIsLoadingData(true)

      try {
        const [userResponse, incomeResponse, expenseResponse, incomeTotalResponse, expenseTotalResponse] = await Promise.all([
          fetch(`${API_BASE}/auth/user`, { credentials: 'include' }),
          fetch(`${API_BASE}/income`, { credentials: 'include' }),
          fetch(`${API_BASE}/expense`, { credentials: 'include' }),
          fetch(`${API_BASE}/income/total`, { credentials: 'include' }),
          fetch(`${API_BASE}/expense/total`, { credentials: 'include' }),
        ])

        if (!userResponse.ok) {
          setProfileError('Could not load profile info.')
        } else {
          const userPayload = (await userResponse.json()) as UserProfile
          setProfile(userPayload)
        }

        if (!incomeResponse.ok || !expenseResponse.ok || !incomeTotalResponse.ok || !expenseTotalResponse.ok) {
          setDataError('Could not load dashboard data right now.')
          return
        }

        const [incomePayload, expensePayload, incomeTotalsPayload, expenseTotalsPayload] = await Promise.all([
          incomeResponse.json() as Promise<EntryRecord[]>,
          expenseResponse.json() as Promise<EntryRecord[]>,
          incomeTotalResponse.json() as Promise<CategoryTotals>,
          expenseTotalResponse.json() as Promise<CategoryTotals>,
        ])

        setIncomes(incomePayload)
        setExpenses(expensePayload)
        setIncomeTotals(incomeTotalsPayload)
        setExpenseTotals(expenseTotalsPayload)
      } catch {
        setDataError('Network error while loading dashboard data.')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchDashboardData()
  }, [])

  const totalIncome = useMemo(() => Object.values(incomeTotals).reduce((sum, amount) => sum + amount, 0), [incomeTotals])
  const totalExpense = useMemo(() => Object.values(expenseTotals).reduce((sum, amount) => sum + amount, 0), [expenseTotals])
  const netBalance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense])

  return {
    isLoadingData,
    dataError,
    profileError,
    profile,
    incomes,
    expenses,
    incomeTotals,
    expenseTotals,
    totalIncome,
    totalExpense,
    netBalance,
  }
}
