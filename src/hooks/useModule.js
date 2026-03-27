import { useContext } from 'react';
import { ModuleContext } from '../context/ModuleContext';

export function useModule() {
  const context = useContext(ModuleContext);
  if (!context) throw new Error('useModule must be used within ModuleProvider');
  return context;
}
