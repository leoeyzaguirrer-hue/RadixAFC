import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { modulesManifest } from '../data/contentLoader'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'

const ADMIN_EMAIL = 'leo.eyzaguirre@gmail.com'

const MODULE_EMOJIS = {
  '1':'🧠','2':'🔗','2.5':'📏','3':'⚡','4':'📊',
  '5':'🎯','6':'🛠️','7':'📋','8':'💬','9':'🕸️',
  '10':'🌿','11':'🤝','12':'🔄','13':'🏁',
}

const MODULE_SHORT = {
  '1' :'Filosofía y Fundamentos', '2'  :'Condicionamiento Clásico',
  '2.5':'Operacionalización',      '3'  :'Condicionamiento Operante',
  '4' :'Análisis Funcional',       '5'  :'Evaluación Conductual',
  '6' :'Técnicas de Intervención', '7'  :'Medición y Registro',
  '8' :'Conducta Verbal',          '9'  :'RFT',
  '10':'ACT',                      '11' :'FAP',
  '12':'Integración Clínica',      '13' :'Síntesis Final',
}

// ── Layout constants (must match CSS) ──
const ROW_H   = 290   // CSS row height
const NODE_T  = 25    // gap above card (card vertically centered ≈ 25px top)
const CARD_H  = 240   // card height desktop
const LEFT_X  = 224   // SVG x-center of left cards  (= padding-left + half card-width = 114+110)
const RIGHT_X = 416   // SVG x-center of right cards (= 306+110)
const VBOX_W  = 640

function buildPathD(count) {
  let d = ''
  for (let i = 0; i < count - 1; i++) {
    const x1 = i % 2 === 0 ? LEFT_X : RIGHT_X
    const x2 = i % 2 === 0 ? RIGHT_X : LEFT_X
    const y1 = i * ROW_H + NODE_T + CARD_H       // card bottom
    const y2 = (i + 1) * ROW_H + NODE_T           // next card top
    const my = (y1 + y2) / 2
    d += `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2} `
  }
  return d.trim()
}

// Deterministic pseudo-random (stable between renders)
function sr(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id:       i,
  size:     +(8  + sr(i)       * 32).toFixed(1),
  top:      +(sr(i + 50)       * 94).toFixed(2),
  left:     +(sr(i + 100)      * 94).toFixed(2),
  opacity:  +(0.06 + sr(i+150) * 0.04).toFixed(3),
  duration: +(15 + sr(i + 200) * 20).toFixed(1),
  delay:    -(sr(i + 250)      * 20).toFixed(1),
  anim:     i % 4,
}))

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

  function getModStatus(mod) {
    if (isAdmin) return 'available'
    if (getModuloCompletado(mod.id)) return 'completed'
    if (!getModuloDesbloqueado(mod.id)) return 'locked'
    const lvls = [1, 2, 3].filter(n => getNivelAprobado(mod.id, n)).length
    return lvls > 0 ? 'in-progress' : 'available'
  }

  const completedCount = modulesManifest.filter(m => getModuloCompletado(m.id)).length
  const totalCount     = modulesManifest.length
  const totalSvgH      = ROW_H * totalCount
  const pathD          = buildPathD(totalCount)

  // Dot at center of current active module
  const currentModIdx = modulesManifest.findIndex(m => {
    const s = getModStatus(m)
    return s === 'available' || s === 'in-progress'
  })
  const dotX = currentModIdx >= 0
    ? (currentModIdx % 2 === 0 ? LEFT_X : RIGHT_X)
    : LEFT_X
  const dotY = currentModIdx >= 0
    ? currentModIdx * ROW_H + ROW_H / 2   // vertical center of row
    : ROW_H / 2

  return (
    <div className="dpv3-screen">

      {/* ── Floating particles ── */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className={`dpv3-particle dpv3-pa${p.anim}`}
          style={{
            width:             p.size,
            height:            p.size,
            top:               `${p.top}%`,
            left:              `${p.left}%`,
            opacity:           p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay:    `${p.delay}s`,
          }}
        />
      ))}

      <div className="dpv3-outer">

        {/* ── Header ── */}
        <header className="dpv3-header">
          <p className="dpv3-h-sub">Del análisis a la práctica</p>
          <h2 className="dpv3-h-mid">Tu camino de aprendizaje</h2>
          <h1 className="dpv3-h-brand">AFC Praxis</h1>
          <svg className="dpv3-sep" width="148" height="14" viewBox="0 0 148 14" aria-hidden="true">
            <polygon points="4,7 7,4 10,7 7,10"   fill="#fdc413" />
            <line x1="12" y1="7" x2="136" y2="7"  stroke="#fdc413" strokeWidth="1.5" />
            <polygon points="138,7 141,4 144,7 141,10" fill="#fdc413" />
          </svg>
        </header>

        {/* ── Progress bar ── */}
        <div className="dpv3-prog-wrap">
          <p className="dpv3-prog-label">
            <span className="dpv3-prog-n">{completedCount}</span>
            {` de ${totalCount} módulos completados`}
          </p>
          <div className="dpv3-prog-track">
            <div
              className="dpv3-prog-fill"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Zigzag path ── */}
        <div className="dpv3-scroll">
          <div className="dpv3-container">

            {/* SVG connector */}
            <svg
              className="dpv3-svg"
              viewBox={`0 0 ${VBOX_W} ${totalSvgH}`}
              width={VBOX_W}
              height={totalSvgH}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Glow layer */}
              <path d={pathD} stroke="rgba(253,196,19,0.1)" strokeWidth="14" fill="none" strokeLinecap="round" />
              {/* Animated dashed flow */}
              <path
                d={pathD}
                className="dpv3-flow"
                stroke="rgba(253,196,19,0.32)"
                strokeWidth="3"
                strokeDasharray="8 6"
                fill="none"
                strokeLinecap="round"
              />
              {/* Progress dot */}
              {currentModIdx >= 0 && (
                <>
                  <circle cx={dotX} cy={dotY} r="16" fill="rgba(240,130,35,0.18)" className="dpv3-dot-ring" />
                  <circle cx={dotX} cy={dotY} r="9"  fill="#f08223" />
                  <circle cx={dotX} cy={dotY} r="3.5" fill="rgba(255,255,255,0.9)" />
                </>
              )}
            </svg>

            {/* ── Module nodes ── */}
            {modulesManifest.map((mod, i) => {
              const isLeft   = i % 2 === 0
              const status   = getModStatus(mod)
              const emoji    = MODULE_EMOJIS[mod.id] || '📚'
              const name     = MODULE_SHORT[mod.id] || mod.titulo
              const lvls     = !isAdmin
                ? [1, 2, 3].filter(n => getNivelAprobado(mod.id, n)).length
                : 0
              const isLocked = status === 'locked'

              const card = (
                <div className={`dpv3-card dpv3-c-${status}`}>
                  {status === 'completed' && (
                    <span className="dpv3-badge-done" aria-label="Completado">✓</span>
                  )}
                  <div className="dpv3-c-top">
                    <span className="dpv3-c-emoji" aria-hidden="true">
                      {isLocked ? '🔒' : emoji}
                    </span>
                    <span className="dpv3-c-num">{mod.numero}</span>
                  </div>
                  <p className="dpv3-c-title">{name}</p>
                  {lvls > 0 && (
                    <div className="dpv3-c-minibar">
                      <div className="dpv3-c-mitrack">
                        <div className="dpv3-c-mifill" style={{ width: `${(lvls / 3) * 100}%` }} />
                      </div>
                      <span className="dpv3-c-milabel">Nivel {lvls}/3</span>
                    </div>
                  )}
                  {(status === 'available' || status === 'in-progress') && (
                    <span className="dpv3-c-cta">
                      {status === 'in-progress' ? 'Continuar' : 'Comenzar'} →
                    </span>
                  )}
                </div>
              )

              return (
                <div
                  key={mod.id}
                  className={`dpv3-row ${isLeft ? 'dpv3-r-l' : 'dpv3-r-r'}`}
                >
                  {isLocked ? (
                    <div
                      className="dpv3-trigger"
                      role="button"
                      tabIndex={0}
                      onClick={() => setLockedMsg(true)}
                      onKeyDown={e => e.key === 'Enter' && setLockedMsg(true)}
                    >
                      {card}
                    </div>
                  ) : (
                    <Link to={`/modulo/${mod.id}`} className="dpv3-trigger">
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
