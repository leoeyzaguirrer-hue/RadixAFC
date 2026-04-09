import { useState } from 'react'
import { Link } from 'react-router-dom'

const MC_OPTIONS = [
  { letter: 'A', text: 'Son epifenomenos sin relevancia para el analisis conductual y deben ignorarse.' },
  { letter: 'B', text: 'Son conductas que ocurren a escala reducida y siguen las mismas leyes que la conducta publica.' },
  { letter: 'C', text: 'Son causas directas de la conducta observable y la determinan.' },
  { letter: 'D', text: 'Solo pueden estudiarse a traves de metodos de introspeccion controlada.' },
]

const CORRECT_INDEX = 1

const PANELS = ['mc', 'match', 'cloze', 'results']

export default function ExerciseView() {
  const [activePanel, setActivePanel] = useState('mc')
  const [selectedOption, setSelectedOption] = useState(null)
  const [verified, setVerified] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(1)

  const handlePickMC = (index) => {
    if (verified) return
    setSelectedOption(index)
  }

  const handleVerify = () => {
    if (activePanel === 'mc' && selectedOption !== null) {
      setVerified(true)
    }
  }

  const handleHint = () => {
    if (!showHint) {
      setShowHint(true)
      setHintsUsed((prev) => Math.min(prev + 1, 3))
    }
  }

  const getOptClass = (index) => {
    const classes = ['mc-opt']
    if (!verified && selectedOption === index) classes.push('picked')
    if (verified && index === CORRECT_INDEX) classes.push('right')
    if (verified && selectedOption === index && index !== CORRECT_INDEX) classes.push('wrong')
    return classes.join(' ')
  }

  return (
    <div className="screen">
      <div className="ex-container">
        {/* Top bar */}
        <div className="ex-topbar">
          <div className="ex-topbar-left">
            <Link to="/teoria" className="ex-back">&larr;</Link>
            <div className="ex-topbar-info">
              <h2>Modulo 1 &middot; Nivel 2</h2>
              <p>Conducta como Objeto de Estudio</p>
            </div>
          </div>
          <div className="ex-counter"><strong>3</strong> / 7</div>
        </div>

        {/* Progress dots */}
        <div className="ex-dots">
          <div className="ex-dot ok"></div>
          <div className="ex-dot ok"></div>
          <div className="ex-dot now"></div>
          <div className="ex-dot"></div>
          <div className="ex-dot"></div>
          <div className="ex-dot"></div>
          <div className="ex-dot"></div>
        </div>

        {/* MC Exercise */}
        {activePanel === 'mc' && (
          <div className="ex-card">
            <span className="ex-type ex-type-mc">&loz; Opcion multiple</span>
            <p className="ex-question">
              Desde el conductismo radical, cual de las siguientes afirmaciones sobre los eventos privados (pensar, sentir) es correcta?
            </p>
            <div className="mc-list">
              {MC_OPTIONS.map((opt, i) => (
                <div key={i} className={getOptClass(i)} onClick={() => handlePickMC(i)}>
                  <span className="mc-letter">{opt.letter}</span>
                  <span className="mc-text">{opt.text}</span>
                </div>
              ))}
            </div>
            {verified && (
              <div className="fb-box fb-ok">
                <p className="fb-icon">{'\u2713'}</p>
                <p className="fb-title">Correcto!</p>
                <p className="fb-text">
                  Los eventos privados, desde el conductismo radical, son conducta. Skinner los consideraba del mismo tipo que la conducta publica: sujetos a las mismas leyes de aprendizaje, accesibles directamente solo para quien los experimenta. No se ignoran ni se tratan como causa &mdash; se analizan como conducta.
                </p>
              </div>
            )}
            {showHint && !verified && (
              <div className="fb-box fb-hint">
                <p className="fb-icon">💡</p>
                <p className="fb-title">Pista 1 de 3</p>
                <p className="fb-text">
                  Recorda la diferencia entre el conductismo metodologico (Watson) y el conductismo radical (Skinner). Cual de los dos incluye eventos privados como parte del analisis?
                </p>
              </div>
            )}
          </div>
        )}

        {/* Matching Exercise */}
        {activePanel === 'match' && (
          <div className="ex-card">
            <span className="ex-type ex-type-match">&loz; Emparejamiento</span>
            <p className="ex-question">Empareja cada concepto con su descripcion correcta segun el analisis del comportamiento:</p>
            <div className="match-grid">
              <div className="match-col">
                <p className="match-col-label">Concepto</p>
                <div className="match-item matched">Conducta</div>
                <div className="match-item">Evento privado</div>
                <div className="match-item">Explicacion circular</div>
                <div className="match-item">Unidad de analisis</div>
              </div>
              <div className="match-arrows">
                <span className="match-arrow on">&rarr;</span>
                <span className="match-arrow">&rarr;</span>
                <span className="match-arrow">&rarr;</span>
                <span className="match-arrow">&rarr;</span>
              </div>
              <div className="match-col">
                <p className="match-col-label">Descripcion</p>
                <div className="match-item matched">Interaccion organismo-entorno</div>
                <div className="match-item">Usar el fenomeno como su propia causa</div>
                <div className="match-item">Conducta accesible solo al individuo</div>
                <div className="match-item">El acto en su contexto completo</div>
              </div>
            </div>
          </div>
        )}

        {/* Cloze Exercise */}
        {activePanel === 'cloze' && (
          <div className="ex-card">
            <span className="ex-type ex-type-cloze">&loz; Completar</span>
            <p className="ex-question">Completa el siguiente enunciado seleccionando las palabras correctas:</p>
            <div className="cloze-body">
              <p>
                Desde el analisis del comportamiento, la conducta se define como la{' '}
                <span className="cloze-gap filled">interaccion</span> de un organismo con su{' '}
                <span className="cloze-gap">________</span>. Los eventos privados como pensar y sentir se consideran{' '}
                <span className="cloze-gap">________</span>, no causas de la conducta observable.
              </p>
            </div>
            <div className="cloze-chips">
              <span className="cloze-chip used">interaccion</span>
              <span className="cloze-chip">entorno</span>
              <span className="cloze-chip">conducta</span>
              <span className="cloze-chip">mente</span>
              <span className="cloze-chip">sintomas</span>
              <span className="cloze-chip">procesos</span>
            </div>
          </div>
        )}

        {/* Results */}
        {activePanel === 'results' && (
          <div className="results-panel">
            <p className="results-icon">🎯</p>
            <h2 className="results-h">Nivel 2 completado</h2>
            <p className="results-score pass">90%</p>
            <p className="results-sub">Superaste el umbral de aprobacion (83%)</p>
            <div className="results-stats">
              <div className="rs-item"><p className="rs-val green">6</p><p className="rs-label">Correctas</p></div>
              <div className="rs-item"><p className="rs-val red">1</p><p className="rs-label">Incorrectas</p></div>
              <div className="rs-item"><p className="rs-val">2</p><p className="rs-label">Pistas</p></div>
            </div>
            <div className="results-btns">
              <Link to="/dashboard" className="th-btn">&larr; Dashboard</Link>
              <button className="th-btn th-btn-primary">Nivel 3 &rarr;</button>
            </div>
          </div>
        )}

        {/* Actions bar */}
        {activePanel !== 'results' && (
          <div className="ex-actions">
            <button className="hint-btn" onClick={handleHint}>
              💡 Pista
              <span className="hint-dots">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`hint-pip${i >= 3 - hintsUsed ? ' spent' : ''}`}></span>
                ))}
              </span>
            </button>
            <button
              className="verify-btn"
              disabled={activePanel === 'mc' && selectedOption === null}
              onClick={handleVerify}
            >
              {verified ? 'Siguiente \u2192' : 'Verificar respuesta'}
            </button>
          </div>
        )}

        {/* Demo Switcher */}
        <div className="demo-switcher">
          <p className="demo-label">Vista previa &mdash; Tipos de ejercicio</p>
          <div className="demo-btns">
            {PANELS.map((panel) => (
              <button
                key={panel}
                className={`demo-btn${activePanel === panel ? ' active-demo' : ''}`}
                onClick={() => {
                  setActivePanel(panel)
                  setSelectedOption(null)
                  setVerified(false)
                  setShowHint(false)
                }}
              >
                {panel === 'mc' ? 'Opcion Multiple' : panel === 'match' ? 'Emparejamiento' : panel === 'cloze' ? 'Completar (Cloze)' : 'Resultados'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
