import { describe, it, expect } from 'vitest'
import {
  validateMultipleChoice,
  validateMatching,
  validateOrdering,
  validateCloze,
  validateClassification,
  validateVerdaderoFalso,
} from './validators'

describe('validateMultipleChoice', () => {
  it('devuelve true cuando la respuesta es la correcta', () => {
    expect(validateMultipleChoice('a', 'a')).toBe(true)
  })
  it('devuelve false cuando la respuesta es incorrecta', () => {
    expect(validateMultipleChoice('a', 'b')).toBe(false)
  })
})

describe('validateMatching', () => {
  it('devuelve true cuando los pares coinciden exactamente', () => {
    expect(validateMatching([['x', 1]], [['x', 1]])).toBe(true)
  })
  it('devuelve false cuando los pares difieren', () => {
    expect(validateMatching([['x', 1]], [['x', 2]])).toBe(false)
  })
})

describe('validateOrdering', () => {
  it('devuelve true con el mismo orden', () => {
    expect(validateOrdering([1, 2, 3], [1, 2, 3])).toBe(true)
  })
  it('devuelve false con orden diferente', () => {
    expect(validateOrdering([1, 3, 2], [1, 2, 3])).toBe(false)
  })
})

describe('validateCloze', () => {
  const correctas = [
    { correcta: 'gato', alternativas: ['felino'] },
    { correcta: 'perro' },
  ]
  it('acepta la respuesta principal', () => {
    expect(validateCloze(['gato', 'perro'], correctas)).toBe(true)
  })
  it('acepta una alternativa válida', () => {
    expect(validateCloze(['felino', 'perro'], correctas)).toBe(true)
  })
  it('rechaza una respuesta no válida', () => {
    expect(validateCloze(['rata', 'perro'], correctas)).toBe(false)
  })
})

describe('validateClassification', () => {
  it('devuelve true cuando la clasificación coincide', () => {
    const c = { A: ['x'], B: ['y'] }
    expect(validateClassification(c, c)).toBe(true)
  })
  it('devuelve false cuando difiere', () => {
    expect(validateClassification({ A: ['x'] }, { A: ['y'] })).toBe(false)
  })
})

describe('validateVerdaderoFalso', () => {
  const datos = { esVerdadero: true, justificacionCorrecta: 'porque sí' }
  it('acepta valor + justificación correctos', () => {
    expect(validateVerdaderoFalso(true, 'porque sí', datos)).toBe(true)
  })
  it('rechaza si el booleano es incorrecto', () => {
    expect(validateVerdaderoFalso(false, 'porque sí', datos)).toBe(false)
  })
  it('rechaza si la justificación es incorrecta', () => {
    expect(validateVerdaderoFalso(true, 'otra', datos)).toBe(false)
  })
})
