
import { useContext } from 'react';
import { DogsContext } from '@/context/dogs/DogsProvider';

export const useDogsContext = () => {
  const context = useContext(DogsContext);
  
  if (!context) {
    throw new Error('useDogsContext must be used within a DogsProvider');
  }
  
  return context;
};
