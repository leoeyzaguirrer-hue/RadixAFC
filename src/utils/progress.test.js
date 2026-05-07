import { describe, it, expect } from 'vitest'
import { crearProgresoInicial, actualizarProgresoConRespuesta } from './progress'

describe('crearProgresoInicial', () => {
  it('crea un objeto con valores iniciales correctos', () => {
    const p = crearProgresoInicial('mod1', 1, 10, 87)
    expect(p.moduloId).toBe('mod1')
    expect(p.nivelId).toBe(1)
    expect(p.ejerciciosTotales).toBe(10)
    expect(p.ejerciciosCorrectos).toBe(0)
    expect(p.porcentaje).toBe(0)
    expect(p.aprobado).toBe(false)
    expect(p.completado).toBe(false)
    expect(p.porcentajeRequerido).toBe(87)
    expect(p.ejerciciosFallados).toEqual([])
    expect(p.fechaInicio).toBeInstanceOf(Date)
    expect(p.fechaCompletacion).toBeNull()
  })
})

describe('actualizarProgresoConRespuesta', () => {
  const base = crearProgresoInicial('mod1', 1, 4, 87)

  it('suma una respuesta correcta y recalcula porcentaje', () => {
    const p = actualizarProgresoConRespuesta(base, 'ej1', true)
    expect(p.ejerciciosCorrectos).toBe(1)
    expect(p.porcentaje).toBe(25)
    expect(p.aprobado).toBe(false)
  })

  it('agrega un ejercicio a fallados cuando es incorrecto', () => {
    const p = actualizarProgresoConRespuesta(base, 'ej1', false)
    expect(p.ejerciciosFallados).toContain('ej1')
    expect(p.ejerciciosCorrectos).toBe(0)
  })

  it('no duplica un ejercicio fallado', () => {
    const p1 = actualizarProgresoConRespuesta(base, 'ej1', false)
    const p2 = actualizarProgresoConRespuesta(p1, 'ej1', false)
    expect(p2.ejerciciosFallados).toEqual(['ej1'])
  })

  it('quita un ejercicio de fallados al responderlo correctamente', () => {
    const p1 = actualizarProgresoConRespuesta(base, 'ej1', false)
    const p2 = actualizarProgresoConRespuesta(p1, 'ej1', true)
    expect(p2.ejerciciosFallados).toEqual([])
  })

  it('marca aprobado y completado al alcanzar el porcentaje requerido', () => {
    let p = base
    for (const id of ['e1', 'e2', 'e3', 'e4']) {
      p = actualizarProgresoConRespuesta(p, id, true)
    }
    expect(p.porcentaje).toBe(100)
    expect(p.aprobado).toBe(true)
    expect(p.completado).toBe(true)
    expect(p.fechaCompletacion).toBeInstanceOf(Date)
  })

  it('no muta el objeto original (devuelve nuevo)', () => {
    const p = actualizarProgresoConRespuesta(base, 'ej1', true)
    expect(base.ejerciciosCorrectos).toBe(0)
    expect(p).not.toBe(base)
  })
})
