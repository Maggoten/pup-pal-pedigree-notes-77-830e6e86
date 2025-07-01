
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDogs as useDogsHook } from '@/hooks/dogs';
import { DogsContextType } from './types';
import { useForceReload } from './useForceReload';
import { useActiveDog } from './useActiveDog';
import { useDogOperations } from './useDogOperations';

export const DogsContext = createContext<DogsContextType | undefined>(undefined);

interface DogsProviderProps {
  children: ReactNode;
}

export const DogsProvider: React.FC<DogsProviderProps> = ({ children }) => {
  const { user, isLoggedIn, isLoading: authLoading, isAuthReady } = useAuth();
  const [dogLoadingAttempted, setDogLoadingAttempted] = useState(false);
  const { toast } = useToast();
  
  // Don't initialize dogs context until auth is ready
  const shouldInitializeDogs = isAuthReady && isLoggedIn && user?.id;

  const { 
    dogs, 
    isLoading: dogsLoading, 
    error, 
    fetchDogs, 
    addDog,
    updateDog: updateDogBase,
    deleteDog 
  } = useDogsHook();

  const { activeDog, setActiveDog } = useActiveDog(dogs);
  const forceReload = useForceReload(user?.id, fetchDogs);
  
  const { updateDog, removeDog } = useDogOperations({
    updateDogBase,
    deleteDog,
    refreshDogs: async () => { 
      const result = await fetchDogs(); 
      return result;
    },
    activeDog,
    setActiveDog
  });

  const wrappedRefreshDogs = async (skipCache?: boolean): Promise<Dog[]> => {
    try {
      const result = await fetchDogs(skipCache);
      return result;
    } catch (e) {
      console.error('Error refreshing dogs:', e);
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  };

  // Only attempt to fetch dogs when auth is ready and user is logged in
  useEffect(() => {
    if (shouldInitializeDogs && !dogLoadingAttempted) {
      console.log('[DogsProvider] Auth ready, initializing dogs data');
      setDogLoadingAttempted(true);
      fetchDogs().catch(err => {
        console.error('Initial dogs fetch failed:', err);
      });
    }
  }, [shouldInitializeDogs, dogLoadingAttempted, fetchDogs]);

  // Show loading state until auth is ready
  if (!isAuthReady) {
    console.log('[DogsProvider] Waiting for auth to be ready');
    return (
      <DogsContext.Provider value={undefined}>
        {children}
      </DogsContext.Provider>
    );
  }

  // If auth is ready but user is not logged in, provide minimal context
  if (!isLoggedIn || !user?.id) {
    const unauthenticatedValue: DogsContextType = {
      dogs: [],
      loading: false,
      error: 'Authentication required',
      activeDog: null,
      setActiveDog: () => {},
      refreshDogs: async () => [],
      fetchDogs: async () => [],
      addDog: async () => { throw new Error('Authentication required'); },
      updateDog: async () => { throw new Error('Authentication required'); },
      removeDog: async () => { throw new Error('Authentication required'); }
    };

    return (
      <DogsContext.Provider value={unauthenticatedValue}>
        {children}
      </DogsContext.Provider>
    );
  }

  const isLoading = authLoading || (isLoggedIn && dogsLoading && !dogLoadingAttempted);

  const value: DogsContextType = {
    dogs,
    loading: isLoading,
    error: error ? error : null,
    activeDog,
    setActiveDog,
    refreshDogs: wrappedRefreshDogs,
    fetchDogs,
    addDog,
    updateDog,
    removeDog
  };

  return (
    <DogsContext.Provider value={value}>
      {children}
    </DogsContext.Provider>
  );
};
