import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppDispatch } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'
import './App.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return (
    <Routes>
      <Route element={<Navigate replace to="/home" />} path="/" />
      <Route element={<ProtectedRoute><HomePage /></ProtectedRoute>} path="/home" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />
      <Route element={<Navigate replace to="/home" />} path="*" />
    </Routes>
  )
}

export default App
