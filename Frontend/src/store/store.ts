import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import incomeReducer from './slices/incomeSlice'
import expenseReducer from './slices/expenseSlice'
import incomeGoalReducer from './slices/incomeGoalSlice'
import expenseBudgetReducer from './slices/expenseBudgetSlice'
import goalReducer from './slices/goalSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    income: incomeReducer,
    expense: expenseReducer,
    incomeGoal: incomeGoalReducer,
    expenseBudget: expenseBudgetReducer,
    goal: goalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
