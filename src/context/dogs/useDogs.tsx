
import { useContext } from 'react';
import { SupabaseDogContext } from './SupabaseDogContext';

export const useSupabaseDogs = () => {
  const context = useContext(SupabaseDogContext);
  if (context === undefined) {
    throw new Error('useSupabaseDogs must be used within a SupabaseDogProvider');
  }
  return context;
};
