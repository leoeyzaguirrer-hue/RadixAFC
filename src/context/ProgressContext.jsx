import { createContext, useState, useCallback } from 'react';
import { calcularPorcentaje, nivelAprobado } from '../utils/scoring';

export const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progreso, setProgreso] = useState(new Map());

  const cargarProgreso = useCallback(async (uid) => {
    // TODO: Load from Firestore users/{uid}/progreso/
    setProgreso(new Map());
  }, []);

  const actualizarEjercicio = useCallback(async (moduloId, nivelId, ejercicioId, esCorrecta) => {
    const key = `${moduloId}_${nivelId}`;
    setProgreso((prev) => {
      const nuevo = new Map(prev);
      const nivel = nuevo.get(key) || {
        completado: false,
        ejerciciosTotales: 0,
        ejerciciosCorrectos: 0,
        porcentaje: 0,
        aprobado: false,
        porcentajeRequerido: 80,
        ejerciciosFallados: [],
        fechaInicio: new Date(),
        fechaCompletacion: null,
      };

      if (esCorrecta) {
        nivel.ejerciciosCorrectos += 1;
        nivel.ejerciciosFallados = nivel.ejerciciosFallados.filter((id) => id !== ejercicioId);
      } else {
        if (!nivel.ejerciciosFallados.includes(ejercicioId)) {
          nivel.ejerciciosFallados.push(ejercicioId);
        }
      }

      nivel.porcentaje = calcularPorcentaje(nivel.ejerciciosCorrectos, nivel.ejerciciosTotales);
      nivel.aprobado = nivelAprobado(nivel.porcentaje, nivel.porcentajeRequerido);

      if (nivel.aprobado) {
        nivel.completado = true;
        nivel.fechaCompletacion = new Date();
      }

      nuevo.set(key, nivel);
      return nuevo;
    });
    // TODO: Persist to Firestore
  }, []);

  const getNivelAprobado = useCallback(
    (moduloId, nivelId) => {
      const key = `${moduloId}_${nivelId}`;
      const nivel = progreso.get(key);
      return nivel?.aprobado || false;
    },
    [progreso]
  );

  const getModuloDesbloqueado = useCallback(
    (moduloId) => {
      // Module 1 is always unlocked
      const orden = [1, 2, '2.5', 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      const idx = orden.findIndex((id) => String(id) === String(moduloId));
      if (idx === 0) return true;
      // Previous module must have all 3 levels approved
      const prevModuloId = orden[idx - 1];
      return [1, 2, 3].every((nivelId) => getNivelAprobado(prevModuloId, nivelId));
    },
    [getNivelAprobado]
  );

  return (
    <ProgressContext.Provider
      value={{ progreso, cargarProgreso, actualizarEjercicio, getNivelAprobado, getModuloDesbloqueado }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
