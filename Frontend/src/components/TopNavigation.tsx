import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, BarChart3, Plus, Target, Wallet, PiggyBank, User } from 'lucide-react'

export default function TopNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!addMenuRef.current) return
      if (!addMenuRef.current.contains(event.target as Node)) setIsAddOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAddOpen(false)
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

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="top-nav" aria-label="Top navigation">
      <Link className={`top-nav-item ${isActive('/home') ? 'active' : ''}`} to="/home">
        <span className="nav-icon"><Home size={20} /></span>
        <small>Home</small>
      </Link>
      <Link className={`top-nav-item ${isActive('/analytics') ? 'active' : ''}`} to="/analytics">
        <span className="nav-icon"><BarChart3 size={20} /></span>
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
          <span className="nav-icon"><Plus size={22} /></span>
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
      <Link className={`top-nav-item ${isActive('/goals') ? 'active' : ''}`} to="/goals">
        <span className="nav-icon"><PiggyBank size={20} /></span>
        <small>Goals</small>
      </Link>
      <Link className={`top-nav-item ${isActive('/income-goals') ? 'active' : ''}`} to="/income-goals">
        <span className="nav-icon"><Target size={20} /></span>
        <small>Targets</small>
      </Link>
      <Link className={`top-nav-item ${isActive('/budget') ? 'active' : ''}`} to="/budget">
        <span className="nav-icon"><Wallet size={20} /></span>
        <small>Budget</small>
      </Link>
      <Link className={`top-nav-item ${isActive('/profile') ? 'active' : ''}`} to="/profile">
        <span className="nav-icon"><User size={20} /></span>
        <small>Profile</small>
      </Link>
    </nav>
  )
}
