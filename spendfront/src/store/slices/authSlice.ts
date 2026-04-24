import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'
import type { UserProfile } from '../../types/types'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/user')
    return res.data as UserProfile
  } catch {
    return rejectWithValue('Not authenticated')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout')
    return true
  } catch {
    return rejectWithValue('Logout failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
