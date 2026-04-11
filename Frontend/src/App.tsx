import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppDispatch } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'
import { fetchIncomes, fetchIncomeTotals } from './store/slices/incomeSlice'
import { fetchExpenses, fetchExpenseTotals } from './store/slices/expenseSlice'
import { fetchIncomeGoals } from './store/slices/incomeGoalSlice'
import { fetchExpenseBudgets } from './store/slices/expenseBudgetSlice'
import { fetchGoals } from './store/slices/goalSlice'
import './App.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import IncomeFormPage from './pages/IncomeFormPage'
import ExpenseFormPage from './pages/ExpenseFormPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BudgetPage from './pages/BudgetPage'
import ProfilePage from './pages/ProfilePage'
import IncomeGoalPage from './pages/IncomeGoalPage'
import ExpenseBudgetPage from './pages/ExpenseBudgetPage'
import GoalsPage from './pages/GoalsPage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth()).then((action) => {
      if (checkAuth.fulfilled.match(action)) {
        dispatch(fetchIncomes())
        dispatch(fetchIncomeTotals())
        dispatch(fetchExpenses())
        dispatch(fetchExpenseTotals())
        dispatch(fetchIncomeGoals())
        dispatch(fetchExpenseBudgets())
        dispatch(fetchGoals())
      }
    })
  }, [dispatch])

  return (
    <Routes>
      <Route element={<Navigate replace to="/home" />} path="/" />
      <Route element={<ProtectedRoute><HomePage /></ProtectedRoute>} path="/home" />
      <Route element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} path="/analytics" />
      <Route element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} path="/budget" />
      <Route element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} path="/profile" />
      <Route element={<ProtectedRoute><IncomeFormPage /></ProtectedRoute>} path="/income-form" />
      <Route element={<ProtectedRoute><ExpenseFormPage /></ProtectedRoute>} path="/expense-form" />
      <Route element={<ProtectedRoute><IncomeGoalPage /></ProtectedRoute>} path="/income-goals" />
      <Route element={<ProtectedRoute><ExpenseBudgetPage /></ProtectedRoute>} path="/expense-budget" />
      <Route element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} path="/goals" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />
      <Route element={<Navigate replace to="/home" />} path="*" />
    </Routes>
  )
}

export default App
