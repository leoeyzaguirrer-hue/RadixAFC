import { createContext, useState, useCallback, useEffect, useRef, useContext } from 'react';
import { calcularPorcentaje, nivelAprobado } from '../utils/scoring';
import { AuthContext } from './AuthContext';

let db = null;
let firestoreFns = null;

try {
  const config = await import('../config/firebaseConfig');
  db = config.db;
  firestoreFns = await import('firebase/firestore');
} catch {
  console.warn('Firestore not available');
}

export const ProgressContext = createContext(null);

const MODULE_ORDER = ['1', '2', '2.5', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

function defaultNivel() {
  return {
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
}

async function persistirNivel(uid, moduloId, nivelId, currentMap) {
  if (!db || !firestoreFns || !uid) return;
  try {
    const { doc, setDoc, updateDoc } = firestoreFns;
    const allApproved = [1, 2, 3].every((n) => currentMap.get(`${moduloId}_${n}`)?.aprobado);
    const docRef = doc(db, 'userProgress', uid);
    const update = {
      [`${moduloId}.level${nivelId}`]: true,
      [`${moduloId}.completed`]: allApproved,
    };
    try {
      await updateDoc(docRef, update);
    } catch {
      // Document doesn't exist yet — create it
      await setDoc(docRef, {
        [moduloId]: { [`level${nivelId}`]: true, completed: allApproved },
      });
    }
  } catch (err) {
    console.warn('Error saving progress:', err);
  }
}

export function ProgressProvider({ children }) {
  const [progreso, setProgreso] = useState(new Map());
  const progresoRef = useRef(new Map());
  const authCtx = useContext(AuthContext);
  const user = authCtx?.user;

  // Sync ref whenever state changes
  useEffect(() => {
    progresoRef.current = progreso;
  }, [progreso]);

  // Auto-load from Firestore when user changes
  useEffect(() => {
    if (!user?.uid) {
      const empty = new Map();
      progresoRef.current = empty;
      setProgreso(empty);
      return;
    }
    if (!db || !firestoreFns) return;
    const { doc, getDoc } = firestoreFns;
    getDoc(doc(db, 'userProgress', user.uid))
      .then((snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const nuevo = new Map();
        for (const [moduloId, levels] of Object.entries(data)) {
          for (let n = 1; n <= 3; n++) {
            if (levels[`level${n}`]) {
              nuevo.set(`${moduloId}_${n}`, {
                completado: true,
                ejerciciosTotales: 0,
                ejerciciosCorrectos: 0,
                porcentaje: 100,
                aprobado: true,
                porcentajeRequerido: 80,
                ejerciciosFallados: [],
                fechaInicio: null,
                fechaCompletacion: null,
              });
            }
          }
        }
        progresoRef.current = nuevo;
        setProgreso(nuevo);
      })
      .catch((err) => console.warn('Error loading progress:', err));
  }, [user?.uid]);

  const cargarProgreso = useCallback(async (uid) => {
    // Kept for external callers; auto-load via useEffect handles the common case
    if (!db || !firestoreFns || !uid) { setProgreso(new Map()); return; }
    const { doc, getDoc } = firestoreFns;
    try {
      const snap = await getDoc(doc(db, 'userProgress', uid));
      if (!snap.exists()) { setProgreso(new Map()); return; }
      const data = snap.data();
      const nuevo = new Map();
      for (const [moduloId, levels] of Object.entries(data)) {
        for (let n = 1; n <= 3; n++) {
          if (levels[`level${n}`]) {
            nuevo.set(`${moduloId}_${n}`, {
              completado: true, ejerciciosTotales: 0, ejerciciosCorrectos: 0,
              porcentaje: 100, aprobado: true, porcentajeRequerido: 80,
              ejerciciosFallados: [], fechaInicio: null, fechaCompletacion: null,
            });
          }
        }
      }
      progresoRef.current = nuevo;
      setProgreso(nuevo);
    } catch (err) {
      console.warn('Error loading progress:', err);
    }
  }, []);

  const actualizarEjercicio = useCallback(async (moduloId, nivelId, ejercicioId, esCorrecta) => {
    const key = `${moduloId}_${nivelId}`;
    const prev = progresoRef.current;
    const nivel = { ...(prev.get(key) || defaultNivel()) };

    if (esCorrecta) {
      nivel.ejerciciosCorrectos += 1;
      nivel.ejerciciosFallados = nivel.ejerciciosFallados.filter((id) => id !== ejercicioId);
    } else {
      if (!nivel.ejerciciosFallados.includes(ejercicioId)) {
        nivel.ejerciciosFallados = [...nivel.ejerciciosFallados, ejercicioId];
      }
    }

    nivel.porcentaje = calcularPorcentaje(nivel.ejerciciosCorrectos, nivel.ejerciciosTotales);
    const wasApproved = nivel.aprobado;
    nivel.aprobado = nivelAprobado(nivel.porcentaje, nivel.porcentajeRequerido);
    if (nivel.aprobado) {
      nivel.completado = true;
      nivel.fechaCompletacion = nivel.fechaCompletacion || new Date();
    }

    const nuevo = new Map(prev);
    nuevo.set(key, nivel);
    progresoRef.current = nuevo;
    setProgreso(nuevo);

    if (!wasApproved && nivel.aprobado && user?.uid) {
      await persistirNivel(user.uid, moduloId, nivelId, nuevo);
    }
  }, [user?.uid]);

  const getNivelAprobado = useCallback(
    (moduloId, nivelId) => {
      const key = `${moduloId}_${nivelId}`;
      return progresoRef.current.get(key)?.aprobado || false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progreso]
  );

  const getModuloCompletado = useCallback(
    (moduloId) => [1, 2, 3].every((nivelId) => getNivelAprobado(moduloId, nivelId)),
    [getNivelAprobado]
  );

  const getModuloDesbloqueado = useCallback(
    (moduloId) => {
      const idx = MODULE_ORDER.findIndex((id) => id === String(moduloId));
      if (idx <= 0) return true;
      const prevModuloId = MODULE_ORDER[idx - 1];
      return [1, 2, 3].every((nivelId) => getNivelAprobado(prevModuloId, nivelId));
    },
    [getNivelAprobado]
  );

  return (
    <ProgressContext.Provider
      value={{
        progreso,
        cargarProgreso,
        actualizarEjercicio,
        getNivelAprobado,
        getModuloCompletado,
        getModuloDesbloqueado,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
