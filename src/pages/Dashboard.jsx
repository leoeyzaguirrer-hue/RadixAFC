import { Link } from 'react-router-dom'
import { modulesManifest } from '../data/contentLoader'

const ACCENTS = [
  'accent-azuloscuro',
  'accent-azulclaro',
  'accent-naranja',
  'accent-amarillo',
  'accent-gris',
]

export default function Dashboard() {
  const totalEjercicios = modulesManifest.reduce(
    (acc, m) => acc + m.niveles.reduce((s, n) => s + n.ejercicios, 0),
    0
  )

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
            return (
              <Link
                key={mod.id}
                to={`/modulo/${mod.id}`}
                className="mod-card"
              >
                <div className={`mod-card-accent ${accent}`}></div>
                <div className="mod-card-body">
                  <div className="mod-card-row">
                    <span className="mod-number">{mod.numero}</span>
                    <span className="mod-badge badge-active">
                      {mod.niveles.length} niveles
                    </span>
                  </div>
                  <h3 className="mod-title">{mod.titulo}</h3>
                  <p className="mod-question">{mod.preguntaCentral}</p>
                  <div className="mod-levels">
                    {mod.niveles.map((nivel) => (
                      <div key={nivel.nivelId} className="lvl-dot off">
                        {nivel.nivelId}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
