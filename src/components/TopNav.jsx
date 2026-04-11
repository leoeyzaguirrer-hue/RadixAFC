import { NavLink, useLocation, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function TopNav() {
  const location = useLocation()

  // Ocultar TopNav en landing/login/register
  const hiddenPaths = ['/', '/login', '/register']
  if (hiddenPaths.includes(location.pathname)) return null

  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <Link to="/dashboard" className="topnav-brand" style={{ textDecoration: 'none' }}>
          <span className="brand-afc">AFC</span> <span className="brand-praxis">Praxis</span>
        </Link>
        <div className="topnav-tabs">
          <NavLink to="/dashboard" className={({ isActive }) => `topnav-tab${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
        </div>
        <div className="topnav-right">
          <ThemeToggle />
          <div className="topnav-avatar">EP</div>
        </div>
      </div>
    </nav>
  )
}
