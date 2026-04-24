import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'
import goalReducer from './slices/goalSlice'
import budgetReducer from './slices/budgetSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transaction: transactionReducer,
    goal: goalReducer,
    budget: budgetReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
