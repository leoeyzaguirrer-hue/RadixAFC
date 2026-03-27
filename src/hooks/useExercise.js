import { useState, useCallback } from 'react';
import { useProgress } from './useProgress';

export function useExercise(moduloId, nivelId) {
  const { actualizarEjercicio } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  const submitAnswer = useCallback(async (ejercicioId, respuesta, esCorrecta) => {
    setRespuestas(prev => ({ ...prev, [ejercicioId]: { respuesta, esCorrecta } }));
    await actualizarEjercicio(moduloId, nivelId, ejercicioId, esCorrecta);
  }, [moduloId, nivelId, actualizarEjercicio]);

  const nextExercise = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  return { currentIndex, respuestas, submitAnswer, nextExercise };
}
