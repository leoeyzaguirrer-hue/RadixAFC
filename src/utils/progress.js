export function crearProgresoInicial(moduloId, nivelId, ejerciciosTotales, porcentajeRequerido) {
  return {
    moduloId,
    nivelId,
    completado: false,
    ejerciciosTotales,
    ejerciciosCorrectos: 0,
    porcentaje: 0,
    aprobado: false,
    porcentajeRequerido,
    ejerciciosFallados: [],
    fechaInicio: new Date(),
    fechaCompletacion: null,
  };
}

export function actualizarProgresoConRespuesta(progreso, ejercicioId, esCorrecta) {
  const nuevo = { ...progreso };
  if (esCorrecta) {
    nuevo.ejerciciosCorrectos += 1;
    nuevo.ejerciciosFallados = nuevo.ejerciciosFallados.filter(id => id !== ejercicioId);
  } else {
    if (!nuevo.ejerciciosFallados.includes(ejercicioId)) {
      nuevo.ejerciciosFallados.push(ejercicioId);
    }
  }
  nuevo.porcentaje = Math.round((nuevo.ejerciciosCorrectos / nuevo.ejerciciosTotales) * 100);
  nuevo.aprobado = nuevo.porcentaje >= nuevo.porcentajeRequerido;
  if (nuevo.aprobado) {
    nuevo.completado = true;
    nuevo.fechaCompletacion = new Date();
  }
  return nuevo;
}
