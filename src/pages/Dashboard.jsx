import { Link } from 'react-router-dom'

const modules = [
  {
    number: '01',
    title: 'Filosofia y Fundamentos Conductuales',
    question: 'Por que una ciencia de la conducta y no de la mente?',
    accent: 'accent-azuloscuro',
    status: 'done',
    progress: 100,
    progressFill: 'fill-verde',
    progressText: '100%',
    levels: [
      { state: 'done', label: '\u2713' },
      { state: 'done', label: '\u2713' },
      { state: 'done', label: '\u2713' },
    ],
  },
  {
    number: '02',
    title: 'Procesos de Aprendizaje: Condicionamiento',
    question: 'Como se establecen las relaciones entre eventos y conducta?',
    accent: 'accent-azulclaro',
    status: 'active',
    progress: 33,
    progressFill: 'fill-naranja',
    progressText: 'Nivel 1/3',
    levels: [
      { state: 'now', label: '1' },
      { state: 'off', label: '2' },
      { state: 'off', label: '3' },
    ],
  },
  {
    number: '2.5',
    title: 'Operacionalizacion de la Conducta',
    question: 'Como convertir lo vago en algo medible?',
    accent: 'accent-naranja',
    status: 'locked',
    progress: 0,
    progressFill: 'fill-naranja',
    progressText: '0/3',
    levels: [
      { state: 'off', label: '1' },
      { state: 'off', label: '2' },
      { state: 'off', label: '3' },
    ],
  },
  {
    number: '03',
    title: 'Conducta Operante y Consecuencias',
    question: 'Que mantiene una conducta a lo largo del tiempo?',
    accent: 'accent-amarillo',
    status: 'locked',
    progress: 0,
    progressFill: 'fill-naranja',
    progressText: '0/3',
    levels: [
      { state: 'off', label: '1' },
      { state: 'off', label: '2' },
      { state: 'off', label: '3' },
    ],
  },
  {
    number: '04',
    title: 'Programas de Refuerzo',
    question: 'Por que importa cuando y como se refuerza?',
    accent: 'accent-gris',
    status: 'locked',
    progress: 0,
    progressFill: 'fill-naranja',
    progressText: '0/3',
    levels: [
      { state: 'off', label: '1' },
      { state: 'off', label: '2' },
      { state: 'off', label: '3' },
    ],
  },
  {
    number: '05',
    title: 'Control de Estimulos y Discriminacion',
    question: 'Por que una conducta ocurre aqui pero no alla?',
    accent: 'accent-azuloscuro',
    status: 'locked',
    progress: 0,
    progressFill: 'fill-naranja',
    progressText: '0/3',
    levels: [
      { state: 'off', label: '1' },
      { state: 'off', label: '2' },
      { state: 'off', label: '3' },
    ],
  },
]

const badgeMap = {
  done: { cls: 'badge-done', text: '\u2713 Completado' },
  active: { cls: 'badge-active', text: '\u25CF En curso' },
  locked: { cls: 'badge-locked', text: '\uD83D\uDD12 Bloqueado' },
}

export default function Dashboard() {
  return (
    <div className="screen">
      <div className="dash-container">
        {/* Continue CTA */}
        <Link to="/teoria" className="continue-cta">
          <div className="continue-left">
            <p className="continue-overline">Continuar donde dejaste</p>
            <p className="continue-title">Modulo 2 &rsaquo; Nivel 1 &mdash; Condicionamiento Clasico</p>
            <p className="continue-meta">Teoria en progreso &middot; Ultima sesion: hace 2 horas</p>
          </div>
          <span className="continue-btn">Continuar &rarr;</span>
        </Link>

        {/* Stats */}
        <div className="stats-strip">
          <div className="stat-item">
            <p className="stat-item-label">Modulo actual</p>
            <p className="stat-item-value c-naranja">2</p>
            <p className="stat-item-sub">de 13 modulos</p>
          </div>
          <div className="stat-item">
            <p className="stat-item-label">Nivel</p>
            <p className="stat-item-value c-azul">1</p>
            <p className="stat-item-sub">de 3 niveles</p>
          </div>
          <div className="stat-item">
            <p className="stat-item-label">Ejercicios</p>
            <p className="stat-item-value">27</p>
            <p className="stat-item-sub">de ~245 totales</p>
          </div>
          <div className="stat-item">
            <p className="stat-item-label">Racha</p>
            <p className="stat-item-value c-amarillo">5 dias</p>
            <p className="stat-item-sub">Tu mejor: 12 dias</p>
          </div>
        </div>

        {/* Global Progress */}
        <div className="global-progress">
          <div className="global-progress-top">
            <span className="global-progress-label">Progreso general del programa</span>
            <span className="global-progress-pct">15%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '15%' }}></div>
          </div>
        </div>

        {/* Modules */}
        <div className="section-head">
          <h2 className="section-title">Modulos del programa</h2>
          <button className="section-link">Ver todos &rarr;</button>
        </div>

        <div className="modules-grid">
          {modules.map((mod) => {
            const badge = badgeMap[mod.status]
            const isLocked = mod.status === 'locked'
            const cardClasses = `mod-card${mod.status === 'active' ? ' active-mod' : ''}${isLocked ? ' locked' : ''}`

            const cardContent = (
              <>
                <div className={`mod-card-accent ${mod.accent}`}></div>
                <div className="mod-card-body">
                  <div className="mod-card-row">
                    <span className="mod-number">{mod.number}</span>
                    <span className={`mod-badge ${badge.cls}`}>{badge.text}</span>
                  </div>
                  <h3 className="mod-title">{mod.title}</h3>
                  <p className="mod-question">{mod.question}</p>
                  <div className="mod-progress-row">
                    <div className="mod-progress-track">
                      <div className={`mod-progress-fill ${mod.progressFill}`} style={{ width: `${mod.progress}%` }}></div>
                    </div>
                    <span className="mod-progress-text">{mod.progressText}</span>
                  </div>
                  <div className="mod-levels">
                    {mod.levels.map((lvl, i) => (
                      <div key={i} className={`lvl-dot ${lvl.state}`}>{lvl.label}</div>
                    ))}
                  </div>
                </div>
              </>
            )

            if (isLocked) {
              return (
                <div key={mod.number} className={cardClasses}>
                  {cardContent}
                </div>
              )
            }

            return (
              <Link key={mod.number} to="/teoria" className={cardClasses}>
                {cardContent}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
