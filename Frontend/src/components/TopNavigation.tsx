import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 19.5h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 16v-4m5 4V8m5 8v-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function BudgetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.5 14h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19c1.6-3.3 4.1-4.8 6.5-4.8s4.9 1.5 6.5 4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function TopNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!addMenuRef.current) {
        return
      }
      if (!addMenuRef.current.contains(event.target as Node)) {
        setIsAddOpen(false)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const handleNavigateToForm = (target: '/income-form' | '/expense-form') => {
    setIsAddOpen(false)
    navigate(target)
  }

  return (
    <nav className="top-nav" aria-label="Top navigation">
      <Link className={`top-nav-item ${location.pathname === '/home' ? 'active' : ''}`} to="/home">
        <span className="nav-icon">
          <HomeIcon />
        </span>
        <small>Home</small>
      </Link>
      <Link className={`top-nav-item ${location.pathname === '/analytics' ? 'active' : ''}`} to="/analytics">
        <span className="nav-icon">
          <AnalyticsIcon />
        </span>
        <small>Analytics</small>
      </Link>
      <div className="top-nav-add-wrap" ref={addMenuRef}>
        <button
          aria-expanded={isAddOpen}
          aria-haspopup="dialog"
          className="top-nav-item top-nav-add"
          onClick={() => setIsAddOpen((prev) => !prev)}
          type="button"
        >
          <span className="nav-icon">
            <PlusIcon />
          </span>
          <small>Add</small>
        </button>

        {isAddOpen ? (
          <div className="add-choice-card" role="dialog" aria-label="Choose transaction type">
            <p>Add transaction</p>
            <button className="add-choice-btn income" onClick={() => handleNavigateToForm('/income-form')} type="button">
              Add Income
            </button>
            <button className="add-choice-btn expense" onClick={() => handleNavigateToForm('/expense-form')} type="button">
              Add Expense
            </button>
          </div>
        ) : null}
      </div>
      <Link className={`top-nav-item ${location.pathname === '/budget' ? 'active' : ''}`} to="/budget">
        <span className="nav-icon">
          <BudgetIcon />
        </span>
        <small>Budget</small>
      </Link>
      <Link className={`top-nav-item ${location.pathname === '/profile' ? 'active' : ''}`} to="/profile">
        <span className="nav-icon">
          <ProfileIcon />
        </span>
        <small>Profile</small>
      </Link>
    </nav>
  )
}
