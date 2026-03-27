export function validateMultipleChoice(respuesta, correcta) {
  return respuesta === correcta;
}

export function validateMatching(pares, paresCorrectos) {
  return JSON.stringify(pares) === JSON.stringify(paresCorrectos);
}

export function validateOrdering(orden, ordenCorrecto) {
  return JSON.stringify(orden) === JSON.stringify(ordenCorrecto);
}

export function validateCloze(respuestas, correctas) {
  return respuestas.every((r, i) =>
    correctas[i].correcta === r || (correctas[i].alternativas || []).includes(r)
  );
}

export function validateClassification(clasificacion, correcta) {
  return JSON.stringify(clasificacion) === JSON.stringify(correcta);
}

export function validateVerdaderoFalso(esVerdadero, justificacion, datos) {
  return esVerdadero === datos.esVerdadero && justificacion === datos.justificacionCorrecta;
}
