
import { useContext } from 'react';
import { DogsContext } from './DogsProvider';
import { DogsContextType } from './types';
import { useAuth } from '@/hooks/useAuth';

export const useDogs = (): DogsContextType => {
  const context = useContext(DogsContext);
  
  // The context should never be undefined now since DogsProvider always provides a value
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogsProvider. Make sure your component is wrapped with DogsProvider.');
  }
  
  return context;
};
