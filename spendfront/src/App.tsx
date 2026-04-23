import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppDispatch } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'
import './App.css'

import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

import HomePage from './pages/HomePage'
import AnalyticsPage from './pages/AnalyticsPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetsPage from './pages/BudgetsPage'
import GoalsPage from './pages/GoalsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  const withLayout = (page: ReactElement) => (
    <ProtectedRoute>
      <AppLayout>{page}</AppLayout>
    </ProtectedRoute>
  )

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/home" />} />
      <Route path="/home" element={withLayout(<HomePage />)} />
      <Route path="/analytics" element={withLayout(<AnalyticsPage />)} />
      <Route path="/transactions" element={withLayout(<TransactionsPage />)} />
      <Route path="/budgets" element={withLayout(<BudgetsPage />)} />
      <Route path="/goals" element={withLayout(<GoalsPage />)} />
      <Route path="/profile" element={withLayout(<ProfilePage />)} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  )
}

export default App
