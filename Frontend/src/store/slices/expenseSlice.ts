import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../api'

export interface ExpenseRecord {
  id: number
  amount: number
  category: string
  note: string | null
  date: string
}

export type CategoryTotals = Record<string, number>

interface ExpenseState {
  expenses: ExpenseRecord[]
  totals: CategoryTotals
  isLoading: boolean
  error: string | null
}

const initialState: ExpenseState = {
  expenses: [],
  totals: {},
  isLoading: false,
  error: null,
}

export const fetchExpenses = createAsyncThunk('expense/fetchExpenses', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/expense')
    return res.data as ExpenseRecord[]
  } catch {
    return rejectWithValue('Failed to fetch expenses')
  }
})

export const fetchExpenseTotals = createAsyncThunk('expense/fetchTotals', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/expense/total')
    return res.data as CategoryTotals
  } catch {
    return rejectWithValue('Failed to fetch expense totals')
  }
})

export const addExpense = createAsyncThunk(
  'expense/addExpense',
  async (data: { amount: number; catagory: string; note: string | null; date?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/addexpense', data)
      return res.data as ExpenseRecord
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to add expense' : 'Failed to add expense')
    }
  }
)

export const deleteExpense = createAsyncThunk('expense/deleteExpense', async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/expense/${id}`)
    return id
  } catch (err: unknown) {
    return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete expense' : 'Failed to delete expense')
  }
})

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearExpenseError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false
        state.expenses = action.payload
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchExpenseTotals.fulfilled, (state, action) => {
        state.totals = action.payload
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload)
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload)
      })
  },
})

export const { clearExpenseError } = expenseSlice.actions
export default expenseSlice.reducer
