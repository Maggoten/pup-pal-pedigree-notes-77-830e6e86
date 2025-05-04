
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDogs as useDogsHook } from '@/hooks/dogs'; // Import using the correct path
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
  const forceReload = useForceReload(user?.id, fetchDogs);
  
  const { updateDog, removeDog } = useDogOperations({
    updateDogBase,
    deleteDog,
    refreshDogs: async () => { await fetchDogs(); },
    activeDog,
    setActiveDog
  });

  const wrappedRefreshDogs = async (): Promise<void> => {
    try {
      await fetchDogs();
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

  const value: DogsContextType = {
    dogs,
    loading: isLoading,
    error: error ? error : (authLoading ? null : (!isLoggedIn && !user?.id && dogLoadingAttempted ? 'Authentication required' : null)),
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
