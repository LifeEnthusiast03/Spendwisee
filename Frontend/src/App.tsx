import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage.tsx'
import IncomeFormPage from './pages/IncomeFormPage'
import ExpenseFormPage from './pages/ExpenseFormPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BudgetPage from './pages/BudgetPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/home" />} path="/" />
      <Route
        element={(
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        )}
        path="/home"
      />
      <Route
        element={(
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        )}
        path="/analytics"
      />
      <Route
        element={(
          <ProtectedRoute>
            <BudgetPage />
          </ProtectedRoute>
        )}
        path="/budget"
      />
      <Route
        element={(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
        path="/profile"
      />
      <Route
        element={(
          <ProtectedRoute>
            <IncomeFormPage />
          </ProtectedRoute>
        )}
        path="/income-form"
      />
      <Route
        element={(
          <ProtectedRoute>
            <ExpenseFormPage />
          </ProtectedRoute>
        )}
        path="/expense-form"
      />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />
      <Route element={<Navigate replace to="/home" />} path="*" />
    </Routes>
  )
}

export default App
