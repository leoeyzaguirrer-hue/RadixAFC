import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function TopNav() {
  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <div className="topnav-brand">
          <span className="brand-afc">AFC</span> <span className="brand-praxis">Praxis</span>
        </div>
        <div className="topnav-tabs">
          <NavLink to="/dashboard" className={({ isActive }) => `topnav-tab${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/teoria" className={({ isActive }) => `topnav-tab${isActive ? ' active' : ''}`}>
            Teoria
          </NavLink>
          <NavLink to="/ejercicios" className={({ isActive }) => `topnav-tab${isActive ? ' active' : ''}`}>
            Ejercicios
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
