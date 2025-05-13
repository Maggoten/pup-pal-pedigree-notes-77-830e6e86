
import React, { useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DogsContext } from './DogsContext';
import type { DogsContextType } from './types';
import type { Dog } from '@/types/dogs';
import { useForceReload } from './useForceReload';
import { useActiveDog } from './useActiveDog';
import { useDogOperations } from './useDogOperations';
import { useDogsQueries } from '@/hooks/dogs/useDogsQueries';

interface DogsProviderProps {
  children: ReactNode;
}

export const DogsProvider: React.FC<DogsProviderProps> = ({ children }) => {
  console.log('[DogsProvider Debug] Provider initializing');
  const { user, supabaseUser, isLoggedIn, isLoading: authLoading, isAuthReady } = useAuth();
  console.log('[DogsProvider Debug] Auth state:', { 
    isAuthReady, 
    isLoggedIn, 
    authLoading, 
    hasUser: !!user, 
    hasSupabaseUser: !!supabaseUser,
    userId: user?.id || supabaseUser?.id
  });
  
  const [dogLoadingAttempted, setDogLoadingAttempted] = useState(false);
  const { toast } = useToast();
  
  // Use the React Query-based hook instead of the old hook
  const { 
    dogs, 
    isLoading: dogsLoading, 
    error,
    fetchDogs: fetchDogsBase
  } = useDogsQueries();

  console.log('[DogsProvider Debug] useDogsQueries results:', { 
    dogsCount: dogs?.length || 0, 
    dogsLoading, 
    hasError: !!error,
    errorDetails: error ? String(error) : 'none'
  });

  const { activeDog, setActiveDog } = useActiveDog(dogs);
  const forceReload = useForceReload(user?.id || supabaseUser?.id, fetchDogsBase);
  
  const { updateDog, removeDog } = useDogOperations({
    updateDogBase: async (id: string, updates: Partial<Dog>) => {
      // We'll implement this in useDogsMutations
      throw new Error('Not implemented');
    },
    deleteDog: async (id: string) => {
      // We'll implement this in useDogsMutations
      throw new Error('Not implemented');
    },
    refreshDogs: async () => { await fetchDogs(true); },
    activeDog,
    setActiveDog
  });

  // Create properly typed wrapper functions that match the DogsContextType interface
  const fetchDogs = async (skipCache?: boolean): Promise<Dog[]> => {
    try {
      // Use either user.id or supabaseUser.id
      const ownerId = user?.id || supabaseUser?.id;
      console.log('[DogsProvider Debug] fetchDogs called with skipCache:', skipCache, 'ownerId:', ownerId);
      
      if (!ownerId) {
        console.warn('[DogsProvider Debug] No owner ID available for fetching dogs');
        return [];
      }
      
      const result = await fetchDogsBase(skipCache || false);
      console.log('[DogsProvider Debug] fetchDogs result:', result.length, 'dogs');
      return result;
    } catch (e) {
      console.error('[DogsProvider Debug] Error in fetchDogs:', e);
      toast({
        title: "Error fetching dogs",
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: "destructive"
      });
      return [];
    }
  };

  const refreshDogs = async (): Promise<void> => {
    try {
      console.log('[DogsProvider Debug] refreshDogs called');
      await fetchDogs(true);
    } catch (e) {
      console.error('[DogsProvider Debug] Error refreshing dogs:', e);
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>): Promise<Dog | undefined> => {
    try {
      // Use either user.id or supabaseUser.id for the owner ID
      const ownerId = user?.id || supabaseUser?.id;
      console.log('[DogsProvider Debug] addDog called with ownerId:', ownerId);
      
      if (!ownerId) {
        throw new Error('User not authenticated');
      }
      
      // This will be implemented in useDogsMutations
      throw new Error('Not implemented');
    } catch (e) {
      console.error('[DogsProvider Debug] Error adding dog:', e);
      toast({
        title: "Add failed",
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: "destructive"
      });
      return undefined;
    }
  };

  useEffect(() => {
    console.log('[DogsProvider Debug] useEffect for initial dog fetch. Auth state:', { 
      authLoading, 
      isLoggedIn, 
      userId: user?.id || supabaseUser?.id, 
      dogLoadingAttempted 
    });
    
    if (!authLoading && isLoggedIn && (user?.id || supabaseUser?.id) && !dogLoadingAttempted) {
      console.log('[DogsProvider Debug] Attempting initial dogs fetch');
      console.log('[DogsProvider] calling fetchDogs, ownerId:', user?.id || supabaseUser?.id);
      setDogLoadingAttempted(true);
      fetchDogs().catch(err => {
        console.error('[DogsProvider Debug] Initial dogs fetch failed:', err);
      });
    }
  }, [authLoading, isLoggedIn, user?.id, supabaseUser?.id, dogLoadingAttempted]);

  const isLoading = authLoading || (isLoggedIn && dogsLoading && !dogLoadingAttempted);
  console.log('[DogsProvider Debug] Final loading state:', isLoading);

  const value: DogsContextType = {
    dogs,
    loading: isLoading,
    error: error ? String(error) : (authLoading ? null : (!isLoggedIn && !(user?.id || supabaseUser?.id) && dogLoadingAttempted ? 'Authentication required' : null)),
    activeDog,
    setActiveDog,
    refreshDogs,
    totalDogs: dogs.length,
    fetchDogs,
    addDog,
    updateDog,
    removeDog
  };

  console.log('[DogsProvider Debug] providing context value', {
    dogsCount: dogs?.length || 0,
    loading: isLoading,
    error: value.error,
    hasActiveDog: !!activeDog
  });
  
  console.log('[DogsProvider Debug] Rendering provider with dogs:', dogs?.length || 0);
  
  return (
    <DogsContext.Provider value={value}>
      {children}
    </DogsContext.Provider>
  );
};
