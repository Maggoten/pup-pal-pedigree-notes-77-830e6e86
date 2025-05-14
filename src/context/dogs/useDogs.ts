
import { useContext } from 'react';
import { DogsContext } from './DogsProvider';
import { DogsContextType } from './types';

export const useDogs = (): DogsContextType => {
  const context = useContext(DogsContext);
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogsProvider');
  }
  return context;
};
