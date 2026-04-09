import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <span className="theme-toggle-label">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
      <div className="theme-toggle" onClick={toggleTheme} title="Cambiar tema"></div>
    </>
  )
}
