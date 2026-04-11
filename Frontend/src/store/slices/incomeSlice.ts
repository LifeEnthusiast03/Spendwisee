import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../api'

export interface IncomeRecord {
  id: number
  amount: number
  category: string
  note: string | null
  date: string
}

export type CategoryTotals = Record<string, number>

interface IncomeState {
  incomes: IncomeRecord[]
  totals: CategoryTotals
  isLoading: boolean
  error: string | null
}

const initialState: IncomeState = {
  incomes: [],
  totals: {},
  isLoading: false,
  error: null,
}

export const fetchIncomes = createAsyncThunk('income/fetchIncomes', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/income')
    return res.data as IncomeRecord[]
  } catch {
    return rejectWithValue('Failed to fetch incomes')
  }
})

export const fetchIncomeTotals = createAsyncThunk('income/fetchTotals', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/income/total')
    return res.data as CategoryTotals
  } catch {
    return rejectWithValue('Failed to fetch income totals')
  }
})

export const addIncome = createAsyncThunk(
  'income/addIncome',
  async (data: { amount: number; catagory: string; note: string | null; date?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/addincome', data)
      return res.data as IncomeRecord
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to add income' : 'Failed to add income')
    }
  }
)

export const deleteIncome = createAsyncThunk('income/deleteIncome', async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/income/${id}`)
    return id
  } catch (err: unknown) {
    return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete income' : 'Failed to delete income')
  }
})

const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    clearIncomeError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.isLoading = false
        state.incomes = action.payload
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchIncomeTotals.fulfilled, (state, action) => {
        state.totals = action.payload
      })
      .addCase(addIncome.fulfilled, (state, action) => {
        state.incomes.unshift(action.payload)
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.incomes = state.incomes.filter((i) => i.id !== action.payload)
      })
  },
})

export const { clearIncomeError } = incomeSlice.actions
export default incomeSlice.reducer
