export function calcularPorcentaje(correctos, totales) {
  if (totales === 0) return 0;
  return Math.round((correctos / totales) * 100);
}

export function nivelAprobado(porcentaje, porcentajeRequerido) {
  return porcentaje >= porcentajeRequerido;
}

export function getPorcentajeRequerido(nivelId) {
  switch (nivelId) {
    case 1: return 87;
    case 2: return 83;
    case 3: return 80;
    default: return 80;
  }
}
