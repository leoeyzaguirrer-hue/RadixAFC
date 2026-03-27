import { createContext, useState, useEffect, useCallback } from 'react';
import modulosData from '../data/modules.json';
import nivelesData from '../data/levels.json';

export const ModuleContext = createContext(null);

export function ModuleProvider({ children }) {
  const [modulos] = useState(modulosData);
  const [niveles] = useState(nivelesData);

  const getModulo = useCallback(
    (id) => modulos.find((m) => String(m.id) === String(id)),
    [modulos]
  );

  const getNivelesDeModulo = useCallback(
    (moduloId) => niveles.filter((n) => String(n.moduloId) === String(moduloId)),
    [niveles]
  );

  const getEjercicios = useCallback(async (moduloId, nivelId) => {
    try {
      const mod = String(moduloId).includes('.') ? `module-${moduloId}` : `module-${moduloId}`;
      const data = await import(`../data/exercises/${mod}/level-${nivelId}.json`);
      return data.default?.ejercicios || data.ejercicios || [];
    } catch {
      return [];
    }
  }, []);

  const getTeoria = useCallback(async (moduloId, nivelId) => {
    try {
      const mod = `module-${moduloId}`;
      const data = await import(`../data/teoria/${mod}/level-${nivelId}.json`);
      return data.default || data;
    } catch {
      return null;
    }
  }, []);

  return (
    <ModuleContext.Provider value={{ modulos, niveles, getModulo, getNivelesDeModulo, getEjercicios, getTeoria }}>
      {children}
    </ModuleContext.Provider>
  );
}
