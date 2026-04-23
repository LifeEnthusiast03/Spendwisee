import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User'

  const handleLogout = async () => {
    setLoggingOut(true)
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <p className="page-kicker">Account</p>
          <h1 className="page-title">Profile</h1>
        </div>
      </div>

      <div className="profile-page-grid">
        <div className="glass-card profile-card-large">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-lg">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="profile-name">{displayName}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          <div className="profile-divider" />

          {/* Info rows */}
          <div className="profile-info-list">
            <div className="profile-info-row">
              <div className="profile-info-icon"><User size={16} /></div>
              <div>
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-value">{user?.name || '—'}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-icon"><Mail size={16} /></div>
              <div>
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user?.email}</span>
              </div>
            </div>
            <div className="profile-info-row">
              <div className="profile-info-icon"><Shield size={16} /></div>
              <div>
                <span className="profile-info-label">Login Method</span>
                <span className="profile-info-value">
                  {user?.googleId ? 'Google OAuth' : 'Email & Password'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-divider" />

          <button
            className="logout-btn-full"
            onClick={handleLogout}
            disabled={loggingOut}
            id="logout-btn"
          >
            <LogOut size={18} />
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  )
}
