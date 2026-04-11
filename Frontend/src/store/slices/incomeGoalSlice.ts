import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../api'

export type BudgetType = 'WEEKLY' | 'MONTHLY' | 'YEARLY'
export type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BUSINESS' | 'INVESTMENT' | 'GIFT' | 'OTHER'

export interface IncomeGoal {
  id: number
  amount: number
  category: IncomeCategory
  type: BudgetType
  isActive: boolean
  periodStart: string
  periodEnd: string
  createdAt: string
  userId: number
}

interface IncomeGoalState {
  goals: IncomeGoal[]
  isLoading: boolean
  error: string | null
}

const initialState: IncomeGoalState = {
  goals: [],
  isLoading: false,
  error: null,
}

export const fetchIncomeGoals = createAsyncThunk('incomeGoal/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/incomegoal')
    return res.data as IncomeGoal[]
  } catch {
    return rejectWithValue('Failed to fetch income goals')
  }
})

export const addIncomeGoal = createAsyncThunk(
  'incomeGoal/add',
  async (data: { amount: number; type: BudgetType; catagory: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/incomegoal', data)
      return res.data as IncomeGoal
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to create income goal' : 'Failed to create income goal')
    }
  }
)

export const deleteIncomeGoal = createAsyncThunk('incomeGoal/delete', async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/incomegoal/${id}`)
    return id
  } catch (err: unknown) {
    return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete income goal' : 'Failed to delete income goal')
  }
})

const incomeGoalSlice = createSlice({
  name: 'incomeGoal',
  initialState,
  reducers: {
    clearIncomeGoalError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomeGoals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchIncomeGoals.fulfilled, (state, action) => {
        state.isLoading = false
        state.goals = action.payload
      })
      .addCase(fetchIncomeGoals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(addIncomeGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload)
      })
      .addCase(deleteIncomeGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.payload)
      })
  },
})

export const { clearIncomeGoalError } = incomeGoalSlice.actions
export default incomeGoalSlice.reducer
