import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../api'

export interface Goal {
  id: number
  name: string
  amount: number
  totalMoney: number
  startdate: string
  enddate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  userId: number
}

interface GoalState {
  goals: Goal[]
  isLoading: boolean
  error: string | null
}

const initialState: GoalState = {
  goals: [],
  isLoading: false,
  error: null,
}

export const fetchGoals = createAsyncThunk('goal/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/goal')
    return res.data as Goal[]
  } catch {
    return rejectWithValue('Failed to fetch goals')
  }
})

export const addGoal = createAsyncThunk(
  'goal/add',
  async (data: { name: string; amount: number; startdate: string; enddate: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/goal', data)
      return res.data as Goal
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to create goal' : 'Failed to create goal')
    }
  }
)

export const addMoneyToGoal = createAsyncThunk(
  'goal/addMoney',
  async ({ goalid, amount }: { goalid: number; amount: number }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/goal/${goalid}/addmoney`, { amount })
      return res.data as Goal
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to add money to goal' : 'Failed to add money to goal')
    }
  }
)

export const removeMoneyFromGoal = createAsyncThunk(
  'goal/removeMoney',
  async ({ goalid, amount }: { goalid: number; amount: number }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/goal/${goalid}/removemoney`, { amount })
      return res.data as Goal
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to remove money from goal' : 'Failed to remove money from goal')
    }
  }
)

export const updateGoal = createAsyncThunk(
  'goal/update',
  async ({ goalid, data }: { goalid: number; data: { amount?: number; enddate?: string } }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/goal/${goalid}`, data)
      return res.data as Goal
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to update goal' : 'Failed to update goal')
    }
  }
)

export const deleteGoal = createAsyncThunk('goal/delete', async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/goal/${id}`)
    return id
  } catch (err: unknown) {
    return rejectWithValue(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to delete goal' : 'Failed to delete goal')
  }
})

const goalSlice = createSlice({
  name: 'goal',
  initialState,
  reducers: {
    clearGoalError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false
        state.goals = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload)
      })
      .addCase(addMoneyToGoal.fulfilled, (state, action) => {
        const idx = state.goals.findIndex((g) => g.id === action.payload.id)
        if (idx !== -1) state.goals[idx] = action.payload
      })
      .addCase(removeMoneyFromGoal.fulfilled, (state, action) => {
        const idx = state.goals.findIndex((g) => g.id === action.payload.id)
        if (idx !== -1) state.goals[idx] = action.payload
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const idx = state.goals.findIndex((g) => g.id === action.payload.id)
        if (idx !== -1) state.goals[idx] = action.payload
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.payload)
      })
  },
})

export const { clearGoalError } = goalSlice.actions
export default goalSlice.reducer
