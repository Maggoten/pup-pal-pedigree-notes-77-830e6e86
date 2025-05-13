
import { useContext } from 'react';
import { DogsContext } from './DogsContext';
import type { DogsContextType } from './types';

export const useDogs = (): DogsContextType => {
  const context = useContext(DogsContext);
  console.log('[useDogs] context received:', {
    hasContext: !!context,
    dogsCount: context?.dogs?.length || 0,
    loading: context?.loading,
    error: context?.error
  });
  
  if (context === undefined) {
    console.error('[useDogs] Context is undefined! Make sure this hook is used within a DogsProvider');
    throw new Error('useDogs must be used within a DogsProvider');
  }
  return context;
};
