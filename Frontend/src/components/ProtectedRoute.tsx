import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
  children: ReactElement
}

const BACKEND_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/dashboard`, {
          method: 'GET',
          credentials: 'include',
        })

        const redirectedToLogin = response.redirected && response.url.endsWith('/login')

        if (!isMounted) return
        setIsAuthenticated(response.ok && !redirectedToLogin)
      } catch {
        if (!isMounted) return
        setIsAuthenticated(false)
      } finally {
        if (!isMounted) return
        setIsChecking(false)
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  if (isChecking) {
    return <p className="entry-message">Checking session...</p>
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return children
}

export default ProtectedRoute
