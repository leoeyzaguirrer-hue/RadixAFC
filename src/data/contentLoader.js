// Carga eager de todos los JSON de teoria y ejercicios usando import.meta.glob.
// Esto produce un manifiesto sincrono con metadata por modulo + nivel.

import modulesMeta from './modules.json';

const teoriaModules = import.meta.glob('./teoria/module-*/level-*.json', { eager: true });
const ejerciciosModules = import.meta.glob('./ejercicios/module-*/level-*.json', { eager: true });

// Helper: extrae moduloId y nivelId desde una ruta tipo './teoria/module-2.5/level-1.json'
function parsePath(path) {
  const match = path.match(/module-([^/]+)\/level-(\d+)\.json$/);
  if (!match) return null;
  return { moduloId: match[1], nivelId: Number(match[2]) };
}

function unwrap(mod) {
  return mod && (mod.default ?? mod);
}

// { '1': { 1: <teoria>, 2: <teoria>, 3: <teoria> }, '2.5': {...}, ... }
const teoriaIndex = {};
for (const [path, mod] of Object.entries(teoriaModules)) {
  const parsed = parsePath(path);
  if (!parsed) continue;
  const { moduloId, nivelId } = parsed;
  if (!teoriaIndex[moduloId]) teoriaIndex[moduloId] = {};
  teoriaIndex[moduloId][nivelId] = unwrap(mod);
}

const ejerciciosIndex = {};
for (const [path, mod] of Object.entries(ejerciciosModules)) {
  const parsed = parsePath(path);
  if (!parsed) continue;
  const { moduloId, nivelId } = parsed;
  if (!ejerciciosIndex[moduloId]) ejerciciosIndex[moduloId] = {};
  ejerciciosIndex[moduloId][nivelId] = unwrap(mod);
}

// Manifiesto: lista de modulos con id, numero, titulo, preguntaCentral, niveles disponibles.
// Se construye desde modules.json (orden curado) pero solo incluye modulos que tienen al menos un nivel de teoria.
export const modulesManifest = modulesMeta
  .map((m) => {
    const id = String(m.id);
    const nivelesDisponibles = teoriaIndex[id] ? Object.keys(teoriaIndex[id]).map(Number).sort((a, b) => a - b) : [];
    if (nivelesDisponibles.length === 0) return null;
    const niveles = nivelesDisponibles.map((nivelId) => {
      const t = teoriaIndex[id][nivelId];
      return {
        nivelId,
        titulo: t?.titulo || `Nivel ${nivelId}`,
        preguntaCentral: t?.preguntaCentral || '',
        aprobacionRequerida: t?.aprobacionRequerida ?? null,
        ejercicios: ejerciciosIndex[id]?.[nivelId]?.length ?? 0,
      };
    });
    return {
      id,
      numero: id === '2.5' ? '2.5' : String(id).padStart(2, '0'),
      orden: m.ordenDesbloqueo,
      titulo: m.titulo,
      preguntaCentral: m.preguntaCentral,
      esMinModulo: !!m.esMinModulo,
      niveles,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.orden - b.orden);

export function getModulo(moduloId) {
  const id = String(moduloId);
  return modulesManifest.find((m) => m.id === id) || null;
}

export function getTeoria(moduloId, nivelId) {
  const id = String(moduloId);
  const n = Number(nivelId);
  return teoriaIndex[id]?.[n] || null;
}

export function getEjercicios(moduloId, nivelId) {
  const id = String(moduloId);
  const n = Number(nivelId);
  return ejerciciosIndex[id]?.[n] || [];
}
