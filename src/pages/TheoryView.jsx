import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function TheoryView() {
  const barRef = useRef(null)

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

  return (
    <div className="screen">
      <div className="reading-progress">
        <div className="reading-progress-fill" ref={barRef}></div>
      </div>
      <div className="theory-grid">
        {/* Sidebar */}
        <aside className="theory-side">
          <p className="side-mod-label">Modulo 1</p>
          <p className="side-mod-title">Filosofia y Fundamentos Conductuales</p>
          <ul className="side-levels">
            <li className="side-level is-done">
              <span className="side-level-dot">{'\u2713'}</span>
              <div>
                <p className="side-level-name">Contextualismo Funcional</p>
                <p className="side-level-meta">Completado &middot; 87%</p>
              </div>
            </li>
            <li className="side-level is-active">
              <span className="side-level-dot">2</span>
              <div>
                <p className="side-level-name">Conducta como Objeto de Estudio</p>
                <p className="side-level-meta">En progreso</p>
              </div>
            </li>
            <li className="side-level">
              <span className="side-level-dot">3</span>
              <div>
                <p className="side-level-name">Analisis Experimental</p>
                <p className="side-level-meta">Bloqueado</p>
              </div>
            </li>
          </ul>
          <div className="side-divider"></div>
          <Link to="/dashboard" className="side-nav-link">&larr; Volver al Dashboard</Link>
          <Link to="/ejercicios" className="side-nav-link">Ir a Ejercicios</Link>
        </aside>

        {/* Main Content */}
        <main className="theory-main">
          <div className="theory-crumb">
            <Link to="/dashboard">Dashboard</Link> <span>&rsaquo;</span>
            <span>Modulo 1</span> <span>&rsaquo;</span> <span>Nivel 2</span>
          </div>

          <p className="theory-badge">&loz; Nivel 2 &middot; Teoria</p>
          <h1 className="theory-h1">La Conducta como Objeto de Estudio Cientifico</h1>
          <p className="theory-lead">
            Que estudia exactamente la psicologia desde una perspectiva conductual? No la mente, no los procesos internos como causa &mdash; sino la interaccion del organismo con su entorno.
          </p>

          <div className="theory-block">
            <h3><span className="accent-dash"></span> Que es conducta?</h3>
            <p>
              Desde el analisis del comportamiento, la conducta no se limita a movimientos observables. La conducta es la interaccion de un organismo completo con su entorno &mdash; incluyendo lo que hace, dice, piensa y siente, siempre en relacion con las circunstancias en que ocurre.
            </p>
            <p>
              Esta definicion tiene consecuencias profundas: pensar, sentir, imaginar y recordar tambien son conductas. No son causas de lo que hacemos, sino parte de lo que hacemos. La diferencia con el enfoque mentalista es que aqui no se buscan explicaciones &ldquo;dentro&rdquo; de la persona, sino en la relacion entre la persona y su contexto.
            </p>
            <div className="callout callout-key">
              <p>La conducta no es algo que el organismo &ldquo;hace solo&rdquo; &mdash; es siempre una relacion: un organismo que actua EN un contexto determinado. Sin contexto, no hay conducta que analizar.</p>
            </div>
          </div>

          <div className="theory-block">
            <h3><span className="accent-dash"></span> La unidad de analisis</h3>
            <p>
              Si la conducta es interaccion, entonces nuestra unidad de analisis no puede ser solo &ldquo;la respuesta&rdquo; aislada. Necesitamos considerar el campo completo: que ocurre antes, que hace el organismo, y que ocurre despues. Esta secuencia basica &mdash; el acto en su contexto &mdash; es el punto de partida de todo analisis posterior.
            </p>
            <div className="callout callout-example">
              <p className="callout-label">Ejemplo cotidiano</p>
              <p>
                Cuando un nino llora al ver al dentista, no explicamos su llanto diciendo &ldquo;tiene miedo&rdquo; (eso seria circular). En cambio, observamos: que estimulos estan presentes? que experiencias previas tuvo en ese contexto? que ocurre cuando llora? Asi podemos entender &mdash; y eventualmente modificar &mdash; la conducta.
              </p>
            </div>
            <div className="callout callout-example">
              <p className="callout-label">Ejemplo clinico</p>
              <p>
                Un consultante dice &ldquo;estoy deprimido&rdquo;. Desde nuestro marco, no tomamos &ldquo;depresion&rdquo; como explicacion. Preguntamos: que hace o deja de hacer esta persona? en que contextos? que cambio en su entorno? La etiqueta diagnostica describe, pero no explica la conducta.
              </p>
            </div>
          </div>

          <div className="theory-block">
            <h3><span className="accent-dash"></span> Errores comunes en este nivel</h3>
            <div className="callout callout-error">
              <p className="callout-label">Error frecuente</p>
              <p>
                <strong>&ldquo;La conducta es solo lo observable.&rdquo;</strong> &mdash; Este es un malentendido clasico del conductismo metodologico. Desde el conductismo radical de Skinner, los eventos privados (pensar, sentir) son conducta. No se niegan; se tratan como conducta, no como causa.
              </p>
            </div>
            <div className="callout callout-error">
              <p className="callout-label">Error frecuente</p>
              <p>
                <strong>&ldquo;El conductismo ignora las emociones.&rdquo;</strong> &mdash; Las emociones son parte del repertorio conductual del organismo. Lo que el conductismo rechaza es usarlas como explicacion causal de otras conductas.
              </p>
            </div>
          </div>

          <div className="theory-footer-nav">
            <Link to="/dashboard" className="th-btn">&larr; Nivel anterior</Link>
            <Link to="/ejercicios" className="th-btn th-btn-primary">Ir a ejercicios &rarr;</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
