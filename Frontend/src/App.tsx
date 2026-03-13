import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import EntryForm from './components/EntryForm'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/entry" />} path="/" />
      <Route
        element={(
          <ProtectedRoute>
            <EntryForm />
          </ProtectedRoute>
        )}
        path="/entry"
      />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />
    </Routes>
  )
}

export default App
