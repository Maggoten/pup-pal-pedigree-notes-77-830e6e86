
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
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [dogLoadingAttempted, setDogLoadingAttempted] = useState(false);
  const { toast } = useToast();
  
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
  
  // Fix the fetchDogs call to handle the return value properly
  const forceReload = useForceReload(user?.id, async () => {
    await fetchDogs(true);
  });
  
  const { updateDog, removeDog } = useDogOperations({
    updateDogBase,
    deleteDog,
    refreshDogs: async () => { 
      await fetchDogs(true);
    },
    activeDog,
    setActiveDog
  });

  const wrappedRefreshDogs = async (): Promise<void> => {
    try {
      await fetchDogs(true);
      return;
    } catch (e) {
      console.error('Error refreshing dogs:', e);
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn && user?.id && !dogLoadingAttempted) {
      setDogLoadingAttempted(true);
      fetchDogs().catch(err => {
        console.error('Initial dogs fetch failed:', err);
      });
    }
  }, [authLoading, isLoggedIn, user?.id, dogLoadingAttempted, fetchDogs]);

  const isLoading = authLoading || (isLoggedIn && dogsLoading && !dogLoadingAttempted);

  // Fix the error type to be string or null
  let errorMessage: string | null = null;
  if (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  } else if (authLoading) {
    errorMessage = null;
  } else if (!isLoggedIn && !user?.id && dogLoadingAttempted) {
    errorMessage = 'Authentication required';
  }

  const value: DogsContextType = {
    dogs,
    loading: isLoading,
    error: errorMessage,
    activeDog,
    setActiveDog,
    refreshDogs: wrappedRefreshDogs,
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
