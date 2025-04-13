
import { useContext } from 'react';
import { SupabaseDogContext } from './SupabaseDogContext';

// Export the hook with a consistent name
export const useSupabaseDogs = () => {
  const context = useContext(SupabaseDogContext);
  if (context === undefined) {
    throw new Error('useSupabaseDogs must be used within a SupabaseDogProvider');
  }
  return context;
};
