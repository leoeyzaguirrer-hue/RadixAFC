import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getModulo, getEjercicios } from '../data/contentLoader'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// ----- Type-specific exercise components -----

function MCExercise({ ej, answer, setAnswer, verified }) {
  const correct = ej.respuestaCorrecta
  const getCls = (i) => {
    const cls = ['mc-opt']
    if (!verified && answer === i) cls.push('picked')
    if (verified && i === correct) cls.push('right')
    if (verified && answer === i && i !== correct) cls.push('wrong')
    return cls.join(' ')
  }
  return (
    <>
      <p className="ex-question">{ej.pregunta}</p>
      <div className="mc-list">
        {ej.opciones?.map((opt, i) => (
          <div
            key={i}
            className={getCls(i)}
            onClick={() => !verified && setAnswer(i)}
          >
            <span className="mc-letter">{LETTERS[i]}</span>
            <span className="mc-text">{opt}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function VerdaderoFalsoExercise({ ej, answer, setAnswer, verified }) {
  const correct = ej.respuestaCorrecta
  const getCls = (val) => {
    const cls = ['mc-opt']
    if (!verified && answer === val) cls.push('picked')
    if (verified && val === correct) cls.push('right')
    if (verified && answer === val && val !== correct) cls.push('wrong')
    return cls.join(' ')
  }
  return (
    <>
      <p className="ex-question">{ej.afirmacion || ej.pregunta}</p>
      <div className="mc-list">
        <div className={getCls(true)} onClick={() => !verified && setAnswer(true)}>
          <span className="mc-letter">V</span>
          <span className="mc-text">Verdadero</span>
        </div>
        <div className={getCls(false)} onClick={() => !verified && setAnswer(false)}>
          <span className="mc-letter">F</span>
          <span className="mc-text">Falso</span>
        </div>
      </div>
    </>
  )
}

function EmparejamientoExercise({ ej, answer, setAnswer, verified }) {
  // answer = { [izquierdaIdx]: derechaIdx }
  const pares = ej.pares || []
  const derechas = useMemo(() => {
    // Mantener el orden tal como esta para simplicidad
    return pares.map((p, i) => ({ texto: p.derecha, idx: i }))
  }, [pares])

  const handlePick = (izqIdx, derIdx) => {
    if (verified) return
    setAnswer({ ...(answer || {}), [izqIdx]: derIdx })
  }

  return (
    <>
      <p className="ex-question">{ej.pregunta}</p>
      <div className="match-grid-vertical">
        {pares.map((par, i) => {
          const sel = answer?.[i]
          const isCorrect = verified && sel === i
          const isWrong = verified && sel !== undefined && sel !== i
          return (
            <div key={i} className="match-row">
              <div
                className={`match-item${isCorrect ? ' matched' : ''}${
                  isWrong ? ' wrong' : ''
                }`}
              >
                {par.izquierda}
              </div>
              <span className="match-arrow on">&rarr;</span>
              <select
                className="match-select"
                value={sel ?? ''}
                disabled={verified}
                onChange={(e) => handlePick(i, Number(e.target.value))}
              >
                <option value="">-- Selecciona --</option>
                {derechas.map((d) => (
                  <option key={d.idx} value={d.idx}>
                    {d.texto}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </>
  )
}

function OrdenamientoExercise({ ej, answer, setAnswer, verified }) {
  // answer = current order (array of original indices)
  const items = ej.items || []
  // Inicializar shuffled order la primera vez (en effect, no en render)
  useEffect(() => {
    if (!answer) {
      const shuffled = items
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5)
      setAnswer(shuffled)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = answer ?? items.map((_, i) => i)

  const move = (idx, delta) => {
    if (verified) return
    const next = [...current]
    const target = idx + delta
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setAnswer(next)
  }

  const correctOrder = ej.ordenCorrecto || items.map((_, i) => i)

  return (
    <>
      <p className="ex-question">{ej.pregunta}</p>
      <div className="ordering-list">
        {current.map((origIdx, i) => {
          const isRightSpot = verified && origIdx === correctOrder[i]
          const isWrongSpot =
            verified && origIdx !== correctOrder[i]
          return (
            <div
              key={i}
              className={`mc-opt${isRightSpot ? ' right' : ''}${
                isWrongSpot ? ' wrong' : ''
              }`}
            >
              <span className="mc-letter">{i + 1}</span>
              <span className="mc-text">{items[origIdx]}</span>
              {!verified && (
                <span className="ordering-controls">
                  <button onClick={() => move(i, -1)} disabled={i === 0}>
                    &uarr;
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === current.length - 1}
                  >
                    &darr;
                  </button>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function ClasificacionExercise({ ej, answer, setAnswer, verified }) {
  // Soporta dos formatos:
  // 1) "Clasificacion": items=[{texto, categoria}], categorias=[...]
  // 2) "CLASIFICAR": items=[strings], categorias=[...], solucion={itemIdx: catIdx}
  const isObjFormat = ej.items && typeof ej.items[0] === 'object'
  const items = ej.items || []
  const categorias = ej.categorias || []
  const itemTextos = isObjFormat ? items.map((it) => it.texto) : items
  const correctas = isObjFormat
    ? items.map((it) => categorias.indexOf(it.categoria))
    : items.map((_, i) =>
        ej.solucion ? Number(ej.solucion[String(i)] ?? ej.solucion[i]) : -1
      )

  const handlePick = (itemIdx, catIdx) => {
    if (verified) return
    setAnswer({ ...(answer || {}), [itemIdx]: catIdx })
  }

  return (
    <>
      <p className="ex-question">{ej.pregunta || ej.instrucciones}</p>
      <div className="classify-list">
        {itemTextos.map((texto, i) => {
          const sel = answer?.[i]
          const isRight = verified && sel === correctas[i]
          const isWrong = verified && sel !== undefined && sel !== correctas[i]
          return (
            <div
              key={i}
              className={`classify-row${isRight ? ' right' : ''}${
                isWrong ? ' wrong' : ''
              }`}
            >
              <p className="classify-text">{texto}</p>
              <div className="classify-opts">
                {categorias.map((cat, j) => (
                  <button
                    key={j}
                    className={`classify-chip${sel === j ? ' picked' : ''}${
                      verified && j === correctas[i] ? ' right' : ''
                    }`}
                    disabled={verified}
                    onClick={() => handlePick(i, j)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function ClozeExercise({ ej, answer, setAnswer, verified }) {
  const huecos = ej.huecos || []
  const handlePick = (idx, val) => {
    if (verified) return
    setAnswer({ ...(answer || {}), [idx]: val })
  }

  // Render texto with placeholders {0}, {1}...
  const texto = ej.texto || ''
  const parts = texto.split(/(\{\d+\})/g)

  return (
    <>
      <p className="ex-question">{ej.pregunta}</p>
      <div className="cloze-body">
        <p>
          {parts.map((part, i) => {
            const m = part.match(/^\{(\d+)\}$/)
            if (!m) return <span key={i}>{part}</span>
            const idx = Number(m[1])
            const hueco = huecos[idx]
            if (!hueco) return <span key={i}>___</span>
            const sel = answer?.[idx]
            const isCorrect =
              verified && sel === hueco.respuestaCorrecta
            const isWrong =
              verified && sel !== undefined && sel !== hueco.respuestaCorrecta
            return (
              <select
                key={i}
                className={`cloze-gap${sel ? ' filled' : ''}${
                  isCorrect ? ' right' : ''
                }${isWrong ? ' wrong' : ''}`}
                value={sel || ''}
                disabled={verified}
                onChange={(e) => handlePick(idx, e.target.value)}
              >
                <option value="">___</option>
                {hueco.opciones?.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            )
          })}
        </p>
      </div>
    </>
  )
}

// ----- Verification helpers -----

function isAnswered(ej, answer) {
  if (answer === null || answer === undefined) return false
  switch (ej.tipo) {
    case 'MC':
      return typeof answer === 'number'
    case 'VerdaderoFalso':
      return typeof answer === 'boolean'
    case 'Emparejamiento':
      return Object.keys(answer).length === (ej.pares?.length || 0)
    case 'Ordenamiento':
      return Array.isArray(answer)
    case 'Clasificacion':
    case 'CLASIFICAR':
      return Object.keys(answer).length === (ej.items?.length || 0)
    case 'Cloze':
      return Object.keys(answer).length === (ej.huecos?.length || 0)
    default:
      return false
  }
}

function isCorrect(ej, answer) {
  if (!isAnswered(ej, answer)) return false
  switch (ej.tipo) {
    case 'MC':
      return answer === ej.respuestaCorrecta
    case 'VerdaderoFalso':
      return answer === ej.respuestaCorrecta
    case 'Emparejamiento':
      return ej.pares.every((_, i) => answer[i] === i)
    case 'Ordenamiento': {
      const correct = ej.ordenCorrecto || ej.items.map((_, i) => i)
      return answer.every((v, i) => v === correct[i])
    }
    case 'Clasificacion': {
      const isObjFormat = ej.items && typeof ej.items[0] === 'object'
      const correctas = isObjFormat
        ? ej.items.map((it) => ej.categorias.indexOf(it.categoria))
        : ej.items.map((_, i) =>
            ej.solucion ? Number(ej.solucion[String(i)] ?? ej.solucion[i]) : -1
          )
      return correctas.every((c, i) => answer[i] === c)
    }
    case 'CLASIFICAR': {
      return ej.items.every((_, i) => {
        const correct = Number(
          ej.solucion?.[String(i)] ?? ej.solucion?.[i]
        )
        return answer[i] === correct
      })
    }
    case 'Cloze':
      return ej.huecos.every((h, i) => answer[i] === h.respuestaCorrecta)
    default:
      return false
  }
}

// ----- Main page -----

export default function ExercisePage() {
  const { moduloId, nivelId } = useParams()
  const modulo = getModulo(moduloId)
  const ejercicios = useMemo(() => getEjercicios(moduloId, nivelId), [moduloId, nivelId])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [verifiedMap, setVerifiedMap] = useState({})
  const [hintsShown, setHintsShown] = useState({})
  const [results, setResults] = useState({}) // { [idx]: 'correct' | 'incorrect' }
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    setCurrentIdx(0)
    setAnswers({})
    setVerifiedMap({})
    setHintsShown({})
    setResults({})
    setShowResults(false)
  }, [moduloId, nivelId])

  if (!modulo) return <Navigate to="/dashboard" replace />
  if (!ejercicios || ejercicios.length === 0) {
    return (
      <div className="screen">
        <div className="ex-container">
          <p>No hay ejercicios disponibles para este nivel.</p>
          <Link to={`/modulo/${moduloId}`} className="th-btn">
            &larr; Volver al modulo
          </Link>
        </div>
      </div>
    )
  }

  const nivel = modulo.niveles.find((n) => n.nivelId === Number(nivelId))
  const total = ejercicios.length
  const ej = ejercicios[currentIdx]
  const answer = answers[currentIdx]
  const verified = !!verifiedMap[currentIdx]
  const hintShown = !!hintsShown[currentIdx]

  const setAnswer = (val) => setAnswers((a) => ({ ...a, [currentIdx]: val }))

  const handleVerify = () => {
    if (verified) {
      // Avanzar
      if (currentIdx < total - 1) {
        setCurrentIdx(currentIdx + 1)
      } else {
        setShowResults(true)
      }
      return
    }
    if (!isAnswered(ej, answer)) return
    const correct = isCorrect(ej, answer)
    setVerifiedMap((v) => ({ ...v, [currentIdx]: true }))
    setResults((r) => ({
      ...r,
      [currentIdx]: correct ? 'correct' : 'incorrect',
    }))
  }

  const handleHint = () => {
    setHintsShown((h) => ({ ...h, [currentIdx]: true }))
  }

  const renderExercise = () => {
    const props = { ej, answer, setAnswer, verified }
    switch (ej.tipo) {
      case 'MC':
        return <MCExercise {...props} />
      case 'VerdaderoFalso':
        return <VerdaderoFalsoExercise {...props} />
      case 'Emparejamiento':
        return <EmparejamientoExercise {...props} />
      case 'Ordenamiento':
        return <OrdenamientoExercise {...props} />
      case 'Clasificacion':
      case 'CLASIFICAR':
        return <ClasificacionExercise {...props} />
      case 'Cloze':
        return <ClozeExercise {...props} />
      default:
        return <p>Tipo de ejercicio no soportado: {ej.tipo}</p>
    }
  }

  if (showResults) {
    const correctCount = Object.values(results).filter((r) => r === 'correct').length
    const incorrectCount = total - correctCount
    const score = Math.round((correctCount / total) * 100)
    const umbral = nivel?.aprobacionRequerida ?? 80
    const passed = score >= umbral

    return (
      <div className="screen">
        <div className="ex-container">
          <div className="results-panel">
            <p className="results-icon">{passed ? '🎯' : '📚'}</p>
            <h2 className="results-h">Nivel {nivelId} {passed ? 'completado' : 'no superado'}</h2>
            <p className={`results-score ${passed ? 'pass' : 'nope'}`}>{score}%</p>
            <p className="results-sub">
              Umbral de aprobacion: {umbral}%
            </p>
            <div className="results-stats">
              <div className="rs-item">
                <p className="rs-val green">{correctCount}</p>
                <p className="rs-label">Correctas</p>
              </div>
              <div className="rs-item">
                <p className="rs-val red">{incorrectCount}</p>
                <p className="rs-label">Incorrectas</p>
              </div>
              <div className="rs-item">
                <p className="rs-val">{Object.keys(hintsShown).length}</p>
                <p className="rs-label">Pistas</p>
              </div>
            </div>
            <div className="results-btns">
              <Link to={`/modulo/${moduloId}`} className="th-btn">
                &larr; Volver al modulo
              </Link>
              <button
                className="th-btn th-btn-primary"
                onClick={() => {
                  setCurrentIdx(0)
                  setAnswers({})
                  setVerifiedMap({})
                  setHintsShown({})
                  setResults({})
                  setShowResults(false)
                }}
              >
                Reintentar &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const fb = verified ? results[currentIdx] : null

  return (
    <div className="screen">
      <div className="ex-container">
        {/* Top bar */}
        <div className="ex-topbar">
          <div className="ex-topbar-left">
            <Link
              to={`/modulo/${moduloId}/nivel/${nivelId}/teoria`}
              className="ex-back"
            >
              &larr;
            </Link>
            <div className="ex-topbar-info">
              <h2>
                Modulo {modulo.numero} &middot; Nivel {nivelId}
              </h2>
              <p>{nivel?.titulo || ''}</p>
            </div>
          </div>
          <div className="ex-counter">
            <strong>{currentIdx + 1}</strong> / {total}
          </div>
        </div>

        {/* Crumb */}
        <div className="theory-crumb">
          <Link to="/dashboard">Dashboard</Link> <span>&rsaquo;</span>
          <Link to={`/modulo/${moduloId}`}>Modulo {modulo.numero}</Link>{' '}
          <span>&rsaquo;</span>
          <Link to={`/modulo/${moduloId}/nivel/${nivelId}/teoria`}>
            Nivel {nivelId}
          </Link>{' '}
          <span>&rsaquo;</span> <span>Ejercicios</span>
        </div>

        {/* Progress dots */}
        <div className="ex-dots">
          {ejercicios.map((_, i) => {
            let cls = 'ex-dot'
            if (i === currentIdx) cls += ' now'
            else if (results[i] === 'correct') cls += ' ok'
            else if (results[i] === 'incorrect') cls += ' fail'
            return <div key={i} className={cls}></div>
          })}
        </div>

        {/* Exercise */}
        <div className="ex-card">
          <span className="ex-type ex-type-mc">
            &loz; {ej.tipoLabel || ej.tipo}
          </span>
          {ej.titulo && <h3 className="ex-title">{ej.titulo}</h3>}
          {renderExercise()}

          {verified && fb === 'correct' && (
            <div className="fb-box fb-ok">
              <p className="fb-icon">{'\u2713'}</p>
              <p className="fb-title">Correcto!</p>
              <p className="fb-text">{ej.retroalimentacion?.correcta}</p>
            </div>
          )}
          {verified && fb === 'incorrect' && (
            <div className="fb-box fb-hint">
              <p className="fb-icon">{'\u2717'}</p>
              <p className="fb-title">No es correcto</p>
              <p className="fb-text">{ej.retroalimentacion?.incorrecta}</p>
              {ej.retroalimentacion?.explicacionVF && (
                <p className="fb-text">{ej.retroalimentacion.explicacionVF}</p>
              )}
            </div>
          )}
          {hintShown && !verified && (
            <div className="fb-box fb-hint">
              <p className="fb-icon">💡</p>
              <p className="fb-title">Pista</p>
              <p className="fb-text">{ej.retroalimentacion?.pista}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ex-actions">
          <button
            className="hint-btn"
            onClick={handleHint}
            disabled={hintShown || verified}
          >
            💡 Pista
          </button>
          <button
            className="verify-btn"
            disabled={!verified && !isAnswered(ej, answer)}
            onClick={handleVerify}
          >
            {verified
              ? currentIdx < total - 1
                ? 'Siguiente \u2192'
                : 'Ver resultados \u2192'
              : 'Verificar respuesta'}
          </button>
        </div>
      </div>
    </div>
  )
}
