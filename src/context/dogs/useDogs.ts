
import { useContext } from 'react';
import { DogsContext } from './DogsProvider';
import { DogsContextType } from './types';
import { useAuth } from '@/hooks/useAuth';

export const useDogs = (): DogsContextType => {
  const context = useContext(DogsContext);
  const { isAuthReady, isLoggedIn } = useAuth();
  
  // Provide better error messages based on auth state
  if (context === undefined) {
    if (!isAuthReady) {
      throw new Error('useDogs called before authentication is ready. Ensure components using useDogs are rendered after auth initialization.');
    }
    
    if (!isLoggedIn) {
      throw new Error('useDogs called when user is not logged in. This hook requires authentication.');
    }
    
    throw new Error('useDogs must be used within a DogsProvider. Make sure your component is wrapped with DogsProvider.');
  }
  
  return context;
};
