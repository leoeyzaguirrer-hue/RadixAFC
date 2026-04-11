import { useEffect, useRef } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getModulo, getTeoria } from '../data/contentLoader'

function Paragraph({ text }) {
  if (!text) return null
  return text
    .split(/\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p, i) => <p key={i}>{p}</p>)
}

function Section({ section }) {
  switch (section.tipo) {
    case 'texto':
      return (
        <div className="theory-block">
          {section.titulo && (
            <h3>
              <span className="accent-dash"></span> {section.titulo}
            </h3>
          )}
          <Paragraph text={section.contenido} />
        </div>
      )

    case 'conceptos':
      return (
        <div className="theory-block">
          {section.titulo && (
            <h3>
              <span className="accent-dash"></span> {section.titulo}
            </h3>
          )}
          {section.items?.map((item, i) => (
            <div key={i} className="callout callout-key">
              <p className="callout-label">{item.nombre}</p>
              {item.metaforaRaiz && (
                <p>
                  <strong>Metafora raiz:</strong> {item.metaforaRaiz}
                </p>
              )}
              {item.criterioVerdad && (
                <p>
                  <strong>Criterio de verdad:</strong> {item.criterioVerdad}
                </p>
              )}
              {item.descripcion && <p>{item.descripcion}</p>}
            </div>
          ))}
        </div>
      )

    case 'errorComun':
      return (
        <div className="theory-block">
          <div className="callout callout-error">
            <p className="callout-label">Error frecuente</p>
            <p>
              <strong>{section.error}</strong>
            </p>
            {section.correccion && <p>{section.correccion}</p>}
          </div>
        </div>
      )

    case 'ejemploCotidiano':
    case 'ejemploClinico':
    case 'ejemplo':
    case 'escenario': {
      const label =
        section.tipo === 'ejemploClinico' || section.subtipo === 'clinico'
          ? 'Ejemplo clinico'
          : section.tipo === 'escenario'
          ? 'Escenario'
          : 'Ejemplo cotidiano'
      return (
        <div className="theory-block">
          <div className="callout callout-example">
            <p className="callout-label">{label}</p>
            {section.titulo && (
              <p>
                <strong>{section.titulo}</strong>
              </p>
            )}
            <Paragraph text={section.contenido} />
            {section.pasos && (
              <ul>
                {section.pasos.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ul>
            )}
            {section.items && (
              <ul>
                {section.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )
    }

    case 'conexionClinica':
      return (
        <div className="theory-block">
          <div className="callout callout-key">
            <p className="callout-label">
              {section.titulo || 'Conexion clinica'}
            </p>
            <Paragraph text={section.contenido} />
          </div>
        </div>
      )

    case 'tabla':
      return (
        <div className="theory-block">
          {section.titulo && (
            <h3>
              <span className="accent-dash"></span> {section.titulo}
            </h3>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table className="theory-table">
              {section.encabezados && (
                <thead>
                  <tr>
                    {section.encabezados.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {section.filas?.map((fila, i) => (
                  <tr key={i}>
                    {fila.map((celda, j) => (
                      <td key={j}>{celda}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

    case 'cita':
      return (
        <div className="theory-block">
          <blockquote className="callout callout-key">
            <p>&ldquo;{section.texto}&rdquo;</p>
            {section.fuente && (
              <p className="callout-label">&mdash; {section.fuente}</p>
            )}
          </blockquote>
        </div>
      )

    case 'nota':
      return (
        <div className="theory-block">
          <div className="callout callout-key">
            <p className="callout-label">Nota</p>
            <Paragraph text={section.contenido} />
          </div>
        </div>
      )

    case 'comparacion':
      return (
        <div className="theory-block">
          {section.titulo && (
            <h3>
              <span className="accent-dash"></span> {section.titulo}
            </h3>
          )}
          <div className="theory-compare">
            <div className="callout callout-error">
              <p className="callout-label">
                {section.lado_incorrecto?.titulo || 'Incorrecto'}
              </p>
              <p>{section.lado_incorrecto?.contenido}</p>
              {section.lado_incorrecto?.ejemplo && (
                <p>
                  <em>{section.lado_incorrecto.ejemplo}</em>
                </p>
              )}
            </div>
            <div className="callout callout-key">
              <p className="callout-label">
                {section.lado_correcto?.titulo || 'Correcto'}
              </p>
              <p>{section.lado_correcto?.contenido}</p>
              {section.lado_correcto?.ejemplo && (
                <p>
                  <em>{section.lado_correcto.ejemplo}</em>
                </p>
              )}
            </div>
          </div>
        </div>
      )

    case 'diagrama':
      return (
        <div className="theory-block">
          {section.titulo && (
            <h3>
              <span className="accent-dash"></span> {section.titulo}
            </h3>
          )}
          {section.descripcion && (
            <div className="callout callout-key">
              <Paragraph text={section.descripcion} />
            </div>
          )}
          {section.fases && (
            <div className="theory-phases">
              {section.fases.map((fase, i) => (
                <div key={i} className="callout callout-key">
                  <p className="callout-label">{fase.label}</p>
                  <p>{fase.descripcion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    case 'referencias':
      return (
        <div className="theory-block">
          <h3>
            <span className="accent-dash"></span> Referencias
          </h3>
          <ul className="theory-refs">
            {section.items?.map((ref, i) => (
              <li key={i}>{ref}</li>
            ))}
          </ul>
        </div>
      )

    default:
      return (
        <div className="theory-block">
          {section.titulo && <h3>{section.titulo}</h3>}
          <Paragraph text={section.contenido} />
        </div>
      )
  }
}

export default function TheoryPage() {
  const { moduloId, nivelId } = useParams()
  const barRef = useRef(null)

  const modulo = getModulo(moduloId)
  const teoria = getTeoria(moduloId, nivelId)

  useEffect(() => {
    const handleScroll = () => {
      if (!barRef.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      barRef.current.style.width = Math.min(pct, 100) + '%'
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [moduloId, nivelId])

  if (!modulo || !teoria) return <Navigate to="/dashboard" replace />

  const nivelActualNum = Number(nivelId)

  return (
    <div className="screen">
      <div className="reading-progress">
        <div className="reading-progress-fill" ref={barRef}></div>
      </div>
      <div className="theory-grid">
        {/* Sidebar */}
        <aside className="theory-side">
          <p className="side-mod-label">Modulo {modulo.numero}</p>
          <p className="side-mod-title">{modulo.titulo}</p>
          <ul className="side-levels">
            {modulo.niveles.map((nivel) => {
              const isActive = nivel.nivelId === nivelActualNum
              return (
                <li
                  key={nivel.nivelId}
                  className={`side-level${isActive ? ' is-active' : ''}`}
                >
                  <span className="side-level-dot">{nivel.nivelId}</span>
                  <div>
                    <Link
                      to={`/modulo/${modulo.id}/nivel/${nivel.nivelId}/teoria`}
                      className="side-level-name"
                      style={{ textDecoration: 'none' }}
                    >
                      {nivel.titulo}
                    </Link>
                    <p className="side-level-meta">
                      {nivel.ejercicios} ejercicios &middot;{' '}
                      {nivel.aprobacionRequerida ?? '-'}%
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="side-divider"></div>
          <Link to="/dashboard" className="side-nav-link">
            &larr; Volver al Dashboard
          </Link>
          <Link
            to={`/modulo/${modulo.id}`}
            className="side-nav-link"
          >
            &larr; Niveles del modulo
          </Link>
          <Link
            to={`/modulo/${modulo.id}/nivel/${nivelActualNum}/ejercicios`}
            className="side-nav-link"
          >
            Ir a Ejercicios &rarr;
          </Link>
        </aside>

        {/* Main Content */}
        <main className="theory-main">
          <div className="theory-crumb">
            <Link to="/dashboard">Dashboard</Link> <span>&rsaquo;</span>
            <Link to={`/modulo/${modulo.id}`}>Modulo {modulo.numero}</Link>{' '}
            <span>&rsaquo;</span> <span>Nivel {nivelActualNum}</span>
          </div>

          <p className="theory-badge">
            &loz; Nivel {nivelActualNum} &middot; Teoria
          </p>
          <h1 className="theory-h1">{teoria.titulo}</h1>
          {teoria.preguntaCentral && (
            <p className="theory-lead">{teoria.preguntaCentral}</p>
          )}

          {teoria.secciones?.map((section, i) => (
            <Section key={i} section={section} />
          ))}

          <div className="theory-footer-nav">
            <Link to={`/modulo/${modulo.id}`} className="th-btn">
              &larr; Volver al modulo
            </Link>
            <Link
              to={`/modulo/${modulo.id}/nivel/${nivelActualNum}/ejercicios`}
              className="th-btn th-btn-primary"
            >
              Ir a ejercicios &rarr;
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
