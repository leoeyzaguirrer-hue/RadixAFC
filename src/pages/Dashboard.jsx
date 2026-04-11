import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { modulesManifest } from '../data/contentLoader'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'

const ACCENTS = [
  'accent-azuloscuro',
  'accent-azulclaro',
  'accent-naranja',
  'accent-amarillo',
  'accent-gris',
]

const ADMIN_EMAIL = 'leo.eyzaguirre@gmail.com'

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
)

export default function Dashboard() {
  const { user } = useAuth()
  const { getNivelAprobado, getModuloDesbloqueado, getModuloCompletado } = useProgress()
  const [lockedMsg, setLockedMsg] = useState(false)

  const isAdmin = user?.email === ADMIN_EMAIL

  // Auto-dismiss locked message after 3 s
  useEffect(() => {
    if (!lockedMsg) return
    const t = setTimeout(() => setLockedMsg(false), 3000)
    return () => clearTimeout(t)
  }, [lockedMsg])

  const totalEjercicios = modulesManifest.reduce(
    (acc, m) => acc + m.niveles.reduce((s, n) => s + n.ejercicios, 0),
    0
  )

  function getModStatus(mod) {
    if (isAdmin) return 'available'
    if (getModuloCompletado(mod.id)) return 'completed'
    if (getModuloDesbloqueado(mod.id)) return 'available'
    return 'locked'
  }

  function getLvlDotClass(modId, nivel, status) {
    if (status === 'locked') return 'off'
    if (getNivelAprobado(modId, nivel.nivelId)) return 'done'
    if (status === 'available') {
      const firstPending = mod => mod.niveles.find(n => !getNivelAprobado(mod.id, n.nivelId))
      const modData = modulesManifest.find(m => m.id === modId)
      if (modData && firstPending(modData)?.nivelId === nivel.nivelId) return 'now'
    }
    return 'off'
  }

  return (
    <div className="screen">
      <div className="dash-container">
        {/* Stats */}
        <div className="stats-strip">
          <div className="stat-item">
            <p className="stat-item-label">Modulos disponibles</p>
            <p className="stat-item-value c-naranja">{modulesManifest.length}</p>
            <p className="stat-item-sub">en el programa</p>
          </div>
          <div className="stat-item">
            <p className="stat-item-label">Niveles totales</p>
            <p className="stat-item-value c-azul">
              {modulesManifest.reduce((acc, m) => acc + m.niveles.length, 0)}
            </p>
            <p className="stat-item-sub">3 por modulo</p>
          </div>
          <div className="stat-item">
            <p className="stat-item-label">Ejercicios totales</p>
            <p className="stat-item-value">{totalEjercicios}</p>
            <p className="stat-item-sub">en todo el programa</p>
          </div>
        </div>

        {/* Modules */}
        <div className="section-head">
          <h2 className="section-title">Modulos del programa</h2>
        </div>

        <div className="modules-grid">
          {modulesManifest.map((mod, idx) => {
            const accent = ACCENTS[idx % ACCENTS.length]
            const status = getModStatus(mod)
            const isLocked = status === 'locked'

            const cardBody = (
              <>
                <div className={`mod-card-accent ${accent}`}></div>
                <div className="mod-card-body">
                  <div className="mod-card-row">
                    <span className="mod-number">{mod.numero}</span>
                    <span className={`mod-badge ${isLocked ? 'badge-locked' : 'badge-active'}`}>
                      {isLocked ? <><LockIcon /> bloqueado</> : `${mod.niveles.length} niveles`}
                    </span>
                  </div>
                  <h3 className="mod-title">{mod.titulo}</h3>
                  <p className="mod-question">{mod.preguntaCentral}</p>
                  <div className="mod-levels">
                    {mod.niveles.map((nivel) => (
                      <div
                        key={nivel.nivelId}
                        className={`lvl-dot ${getLvlDotClass(mod.id, nivel, status)}`}
                      >
                        {nivel.nivelId}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )

            if (isLocked) {
              return (
                <div
                  key={mod.id}
                  className="mod-card locked"
                  role="button"
                  tabIndex={0}
                  onClick={() => setLockedMsg(true)}
                  onKeyDown={(e) => e.key === 'Enter' && setLockedMsg(true)}
                >
                  {cardBody}
                </div>
              )
            }

            return (
              <Link key={mod.id} to={`/modulo/${mod.id}`} className="mod-card">
                {cardBody}
              </Link>
            )
          })}
        </div>
      </div>

      {lockedMsg && (
        <div className="locked-toast" role="alert">
          Completa el módulo anterior para desbloquear este contenido
        </div>
      )}
    </div>
  )
}
