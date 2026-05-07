import { describe, it, expect } from 'vitest'
import { calcularPorcentaje, nivelAprobado, getPorcentajeRequerido } from './scoring'

describe('calcularPorcentaje', () => {
  it('devuelve 0 cuando no hay ejercicios totales', () => {
    expect(calcularPorcentaje(0, 0)).toBe(0)
  })
  it('redondea correctamente', () => {
    expect(calcularPorcentaje(1, 3)).toBe(33)  // 33.33 → 33
    expect(calcularPorcentaje(2, 3)).toBe(67)  // 66.66 → 67
  })
  it('100% cuando todo es correcto', () => {
    expect(calcularPorcentaje(10, 10)).toBe(100)
  })
})

describe('nivelAprobado', () => {
  it('aprueba cuando porcentaje ≥ requerido', () => {
    expect(nivelAprobado(87, 87)).toBe(true)
    expect(nivelAprobado(90, 87)).toBe(true)
  })
  it('reprueba cuando porcentaje < requerido', () => {
    expect(nivelAprobado(86, 87)).toBe(false)
  })
})

describe('getPorcentajeRequerido', () => {
  it('nivel 1 requiere 87%', () => {
    expect(getPorcentajeRequerido(1)).toBe(87)
  })
  it('nivel 2 requiere 83%', () => {
    expect(getPorcentajeRequerido(2)).toBe(83)
  })
  it('nivel 3 requiere 80%', () => {
    expect(getPorcentajeRequerido(3)).toBe(80)
  })
  it('cualquier otro nivel cae al default 80%', () => {
    expect(getPorcentajeRequerido(99)).toBe(80)
  })
})
