import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { modulesManifest } from '../data/contentLoader'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'

const ADMIN_EMAIL = 'leo.eyzaguirre@gmail.com'

const MODULE_EMOJIS = {
  '1': '🧠', '2': '🔗', '2.5': '📏', '3': '⚡', '4': '📊',
  '5': '🎯', '6': '🛠️', '7': '📋', '8': '💬', '9': '🕸️',
  '10': '🌿', '11': '🤝', '12': '🔄', '13': '🏁',
}

// ── SVG path coordinates (640-wide viewBox, 200px rows) ──
const ROW_H    = 200  // height per module row (px)
const NODE_T   = 35   // row-top → card-top offset
const NODE_B   = 165  // row-top → card-bottom offset (NODE_T + 130)
const LEFT_X   = 140  // x-center of left-column cards
const RIGHT_X  = 500  // x-center of right-column cards
const VBOX_W   = 640
const TOTAL_H  = ROW_H * 14  // 2800

function buildPathD() {
  let d = ''
  for (let i = 0; i < modulesManifest.length - 1; i++) {
    const x1 = i % 2 === 0 ? LEFT_X : RIGHT_X
    const x2 = i % 2 === 0 ? RIGHT_X : LEFT_X
    const y1 = i * ROW_H + NODE_B
    const y2 = (i + 1) * ROW_H + NODE_T
    const my = (y1 + y2) / 2
    d += `M ${x1} ${y1} C ${x1} ${my} ${x2} ${my} ${x2} ${y2} `
  }
  return d.trim()
}

const PATH_D = buildPathD()

export default function Dashboard() {
  const { user } = useAuth()
  const { getNivelAprobado, getModuloDesbloqueado, getModuloCompletado } = useProgress()
  const [lockedMsg, setLockedMsg] = useState(false)

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!lockedMsg) return
    const t = setTimeout(() => setLockedMsg(false), 3000)
    return () => clearTimeout(t)
  }, [lockedMsg])

  const completedCount = modulesManifest.filter(m => getModuloCompletado(m.id)).length

  function getModStatus(mod) {
    if (isAdmin) return 'available'
    if (getModuloCompletado(mod.id)) return 'completed'
    if (getModuloDesbloqueado(mod.id)) return 'available'
    return 'locked'
  }

  function getDotClass(modId, nivelId, status) {
    if (status === 'locked') return 'off'
    if (getNivelAprobado(modId, nivelId)) return 'done'
    return 'off'
  }

  return (
    <div className="path-screen">
      {/* Floating background spheres */}
      <div className="path-bg-sphere pbs-1" />
      <div className="path-bg-sphere pbs-2" />
      <div className="path-bg-sphere pbs-3" />
      <div className="path-bg-sphere pbs-4" />
      <div className="path-bg-sphere pbs-5" />

      <div className="path-outer">
        {/* ── Progress header ── */}
        <div className="path-header">
          <p className="path-header-tag">Tu camino de aprendizaje</p>
          <h1 className="path-header-title">AFC Praxis</h1>
          <div className="path-progress-wrap">
            <div
              className="path-progress-fill"
              style={{ width: `${(completedCount / modulesManifest.length) * 100}%` }}
            />
          </div>
          <p className="path-progress-label">
            <span className="path-progress-count">{completedCount}</span>
            {' de '}
            <span className="path-progress-total">{modulesManifest.length}</span>
            {' módulos completados'}
          </p>
        </div>

        {/* ── Zigzag path ── */}
        <div className="path-scroll-wrap">
          <div className="path-container">
            {/* SVG connector lines */}
            <svg
              className="path-svg"
              viewBox={`0 0 ${VBOX_W} ${TOTAL_H}`}
              preserveAspectRatio="none"
              width={VBOX_W}
              height={TOTAL_H}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Subtle glow duplicate */}
              <path
                d={PATH_D}
                stroke="rgba(23,143,206,0.15)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
              {/* Main dashed line */}
              <path
                d={PATH_D}
                stroke="rgba(23,143,206,0.5)"
                strokeWidth="2.5"
                strokeDasharray="9 7"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {/* Module nodes */}
            {modulesManifest.map((mod, i) => {
              const isLeft = i % 2 === 0
              const status  = getModStatus(mod)
              const emoji   = MODULE_EMOJIS[mod.id] || '📚'

              const card = (
                <div className={`pnc pnc-${status}`}>
                  <div className="pnc-top">
                    <span className="pnc-emoji" aria-hidden="true">{emoji}</span>
                    <span className="pnc-num">{mod.numero}</span>
                    {status === 'completed' && (
                      <span className="pnc-done-badge" aria-label="Completado">✓</span>
                    )}
                    {status === 'locked' && (
                      <span className="pnc-lock-icon" aria-label="Bloqueado">🔒</span>
                    )}
                  </div>
                  <p className="pnc-title">{mod.titulo}</p>
                  <div className="pnc-dots">
                    {mod.niveles.map(n => (
                      <div
                        key={n.nivelId}
                        className={`pnc-dot ${getDotClass(mod.id, n.nivelId, status)}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              )

              return (
                <div
                  key={mod.id}
                  className={`path-row ${isLeft ? 'path-row-left' : 'path-row-right'}`}
                >
                  {status === 'locked' ? (
                    <div
                      role="button"
                      tabIndex={0}
                      className="pnc-trigger"
                      onClick={() => setLockedMsg(true)}
                      onKeyDown={e => e.key === 'Enter' && setLockedMsg(true)}
                    >
                      {card}
                    </div>
                  ) : (
                    <Link to={`/modulo/${mod.id}`} className="pnc-trigger">
                      {card}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
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
