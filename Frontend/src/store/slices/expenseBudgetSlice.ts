import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../api'

export type BudgetType = 'WEEKLY' | 'MONTHLY' | 'YEARLY'
export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'RENT' | 'SHOPPING' | 'ENTERTAINMENT' | 'BILLS' | 'OTHER'

export interface ExpenseBudget {
  id: number
  amount: number
  category: ExpenseCategory
  type: BudgetType
  isActive: boolean
  periodStart: string
  periodEnd: string
  createdAt: string
  userId: number
}

interface ExpenseBudgetState {
  budgets: ExpenseBudget[]
  isLoading: boolean
  error: string | null
}

const initialState: ExpenseBudgetState = {
  budgets: [],
  isLoading: false,
  error: null,
}

export const fetchExpenseBudgets = createAsyncThunk('expenseBudget/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/expensebudget')
    return res.data as ExpenseBudget[]
  } catch {
    return rejectWithValue('Failed to fetch expense budgets')
  }
})

export const addExpenseBudget = createAsyncThunk(
  'expenseBudget/add',
  async (data: { amount: number; type: BudgetType; catagory: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/expensebudget', data)
      return res.data as ExpenseBudget
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to create expense budget' : 'Failed to create expense budget')
    }
  }
)

export const deleteExpenseBudget = createAsyncThunk('expenseBudget/delete', async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/expensebudget/${id}`)
    return id
  } catch (err: unknown) {
    return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete expense budget' : 'Failed to delete expense budget')
  }
})

const expenseBudgetSlice = createSlice({
  name: 'expenseBudget',
  initialState,
  reducers: {
    clearExpenseBudgetError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenseBudgets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchExpenseBudgets.fulfilled, (state, action) => {
        state.isLoading = false
        state.budgets = action.payload
      })
      .addCase(fetchExpenseBudgets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(addExpenseBudget.fulfilled, (state, action) => {
        state.budgets.push(action.payload)
      })
      .addCase(deleteExpenseBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload)
      })
  },
})

export const { clearExpenseBudgetError } = expenseBudgetSlice.actions
export default expenseBudgetSlice.reducer
