import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart2,
  ArrowLeftRight,
  Target,
  Wallet,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'

const NAV_ITEMS = [
  { to: '/home', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: Wallet, label: 'Budgets' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((s) => s.auth)

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    setLoggingOut(true)
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Brand row — logo + name + collapse toggle */}
      <div className="sidebar-brand">
        {!collapsed && <Logo variant="full" size={26} theme="dark" />}

        {/* Collapse button — centered when collapsed, right-aligned when expanded */}
        <button
          className={`sidebar-collapse-btn ${collapsed ? 'sidebar-collapse-btn--centered' : ''}`}
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-icon"><Icon size={20} /></span>
            {!collapsed && <span className="sidebar-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Pinned account/sign-out section ─────────────────── */}
      <div className={`sidebar-user-section ${collapsed ? 'sidebar-user-section--collapsed' : ''}`}>
        <div className="sidebar-user-row">
          {/* Avatar initial */}
          <div className="sidebar-user-avatar" title={displayName}>
            {initial}
          </div>

          {/* Name + email — hidden when collapsed */}
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-email">{displayEmail}</span>
            </div>
          )}

          {/* Logout icon button */}
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
