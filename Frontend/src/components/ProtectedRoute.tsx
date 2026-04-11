import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

type ProtectedRouteProps = {
  children: ReactElement
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading SpendWise...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return children
}

export default ProtectedRoute
