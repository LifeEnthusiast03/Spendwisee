import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart2,
  ArrowLeftRight,
  Target,
  Wallet,
  User,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/home', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: Wallet, label: 'Budgets' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Brand row — logo + name + collapse toggle */}
      <div className="sidebar-brand">
        {!collapsed && (
          <>
            <div className="sidebar-logo">
              <TrendingUp size={20} />
            </div>
            <span className="sidebar-brand-name">SpendWise</span>
          </>
        )}

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
    </aside>
  )
}
