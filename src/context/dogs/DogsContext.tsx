
import { createContext, useContext } from 'react';
import type { DogsContextType } from './types';

export const DogsContext = createContext<DogsContextType | undefined>(undefined);

export const useDogs = (): DogsContextType => {
  const context = useContext(DogsContext);
  if (context === undefined) {
    console.error('[DogsContext Debug] Context is undefined! Make sure you are using DogsProvider.');
    throw new Error('useDogs must be used within a DogsProvider');
  }
  console.log('[DogsContext Debug] Context accessed successfully');
  return context;
};

// Re-export the provider for convenience
export { DogsProvider } from './DogsProvider';
