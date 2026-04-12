import { useState, useEffect, useRef, useContext } from 'react'
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

let firebaseAuth = null
let auth = null
try {
  const cfg = await import('../config/firebaseConfig')
  auth = cfg.auth
  firebaseAuth = await import('firebase/auth')
} catch { /* Firebase not configured */ }

function getInitials(name, lastName) {
  const a = name?.trim()?.[0]?.toUpperCase() || ''
  const b = lastName?.trim()?.[0]?.toUpperCase() || ''
  return a + b || '?'
}

function Avatar({ profile, size = 38 }) {
  const { profileCompleted, name, lastName, avatarColor } = profile
  const initials = profileCompleted ? getInitials(name, lastName) : '?'
  const bg       = profileCompleted ? (avatarColor || '#0552a0') : '#dcdadb'
  const color    = profileCompleted ? '#fff' : '#0552a0'
  const fontSize = size <= 38 ? '0.85rem' : '1.35rem'

  return (
    <div
      className="tnav-avatar"
      style={{ width: size, height: size, background: bg, color, fontSize }}
    >
      {initials}
    </div>
  )
}

export default function TopNav() {
  const location   = useLocation()
  const navigate   = useNavigate()
  const authCtx    = useContext(AuthContext)
  const user       = authCtx?.user
  const profile    = authCtx?.userProfile || {}
  const [open, setOpen] = useState(false)
  const dropRef    = useRef(null)

  // Ocultar TopNav en landing/login/register
  const hiddenPaths = ['/', '/login', '/register']
  if (hiddenPaths.includes(location.pathname)) return null

  // Close dropdown when clicking outside
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    setOpen(false)
    if (auth && firebaseAuth) await firebaseAuth.signOut(auth)
    navigate('/login')
  }

  async function handleResetPassword() {
    setOpen(false)
    if (!auth || !firebaseAuth || !user?.email) return
    try {
      await firebaseAuth.sendPasswordResetEmail(auth, user.email)
      alert(`Te enviamos un email a ${user.email} para cambiar tu contraseña. Revisa tu bandeja de entrada.`)
    } catch {
      alert('No se pudo enviar el email. Intentá de nuevo.')
    }
  }

  const displayName = profile.profileCompleted
    ? `${profile.name} ${profile.lastName}`.trim()
    : null

  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <Link to="/dashboard" className="topnav-brand" style={{ textDecoration: 'none' }}>
          <span className="brand-afc">AFC</span> <span className="brand-praxis">Praxis</span>
        </Link>

        <div className="topnav-tabs">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `topnav-tab${isActive ? ' active' : ''}`}
          >
            Dashboard
          </NavLink>
        </div>

        <div className="topnav-right">
          {/* Avatar + dropdown */}
          <div className="tnav-drop-wrap" ref={dropRef}>
            <button
              className="tnav-avatar-btn"
              onClick={() => setOpen(o => !o)}
              aria-label="Menú de usuario"
            >
              <Avatar profile={profile} size={38} />
            </button>

            {open && (
              <div className="tnav-dropdown">
                {/* User info */}
                <div className="tnav-dd-header">
                  <Avatar profile={profile} size={48} />
                  <div className="tnav-dd-info">
                    {displayName
                      ? <p className="tnav-dd-name">{displayName}</p>
                      : <p className="tnav-dd-incomplete">Completa tu perfil</p>
                    }
                    <p className="tnav-dd-email">{user?.email}</p>
                  </div>
                </div>

                <div className="tnav-dd-divider" />

                <button
                  className="tnav-dd-item"
                  onClick={() => { setOpen(false); navigate('/perfil') }}
                >
                  <span>👤</span> Mi perfil
                </button>

                <button
                  className="tnav-dd-item"
                  onClick={handleResetPassword}
                >
                  <span>🔒</span> Cambiar contraseña
                </button>

                <div className="tnav-dd-divider" />

                <button
                  className="tnav-dd-item tnav-dd-logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
