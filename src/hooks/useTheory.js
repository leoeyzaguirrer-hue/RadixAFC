import { useState, useEffect } from 'react';
import { useModule } from './useModule';

export function useTheory(moduloId, nivelId) {
  const { getTeoria } = useModule();
  const [teoria, setTeoria] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTeoria(moduloId, nivelId).then(data => {
      if (!cancelled) {
        setTeoria(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [moduloId, nivelId, getTeoria]);

  return { teoria, loading };
}
