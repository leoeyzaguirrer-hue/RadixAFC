import { Link, useParams, Navigate } from 'react-router-dom'
import { getModulo } from '../data/contentLoader'

export default function ModulePage() {
  const { moduloId } = useParams()
  const modulo = getModulo(moduloId)

  if (!modulo) return <Navigate to="/dashboard" replace />

  return (
    <div className="screen">
      <div className="dash-container">
        <div className="theory-crumb">
          <Link to="/dashboard">Dashboard</Link> <span>&rsaquo;</span>
          <span>Modulo {modulo.numero}</span>
        </div>

        <h1 className="theory-h1">{modulo.titulo}</h1>
        <p className="theory-lead">{modulo.preguntaCentral}</p>

        <div className="section-head" style={{ marginTop: '2rem' }}>
          <h2 className="section-title">Niveles</h2>
        </div>

        <div className="modules-grid">
          {modulo.niveles.map((nivel) => (
            <Link
              key={nivel.nivelId}
              to={`/modulo/${modulo.id}/nivel/${nivel.nivelId}/teoria`}
              className="mod-card"
            >
              <div className="mod-card-accent accent-azulclaro"></div>
              <div className="mod-card-body">
                <div className="mod-card-row">
                  <span className="mod-number">N{nivel.nivelId}</span>
                  {nivel.aprobacionRequerida != null && (
                    <span className="mod-badge badge-active">
                      Umbral {nivel.aprobacionRequerida}%
                    </span>
                  )}
                </div>
                <h3 className="mod-title">{nivel.titulo}</h3>
                {nivel.preguntaCentral && (
                  <p className="mod-question">{nivel.preguntaCentral}</p>
                )}
                <p className="mod-question">
                  {nivel.ejercicios} ejercicios disponibles
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
