
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDogs as useDogsHook } from '@/hooks/dogs';
import type { DogsContextType } from './types';
import type { Dog } from '@/types/dogs';
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
    totalDogs,
    fetchDogs: fetchDogsBase,
    addDog: addDogBase, 
    updateDog: updateDogBase,
    deleteDog: deleteDogBase
  } = useDogsHook();

  const { activeDog, setActiveDog } = useActiveDog(dogs);
  const forceReload = useForceReload(user?.id, fetchDogsBase);
  
  const { updateDog, removeDog } = useDogOperations({
    updateDogBase,
    deleteDog: deleteDogBase,
    refreshDogs: async () => { await fetchDogs(true); },
    activeDog,
    setActiveDog
  });

  // Create properly typed wrapper functions that match the DogsContextType interface
  const fetchDogs = async (skipCache?: boolean): Promise<Dog[]> => {
    try {
      if (!user?.id) return [];
      
      const result = await fetchDogsBase(skipCache || false);
      return result;
    } catch (e) {
      console.error('Error in fetchDogs:', e);
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
      await fetchDogs(true);
    } catch (e) {
      console.error('Error refreshing dogs:', e);
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>): Promise<Dog | undefined> => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      const newDog = await addDogBase(dog);
      await fetchDogs(true); // Refresh the list after adding
      return newDog;
    } catch (e) {
      console.error('Error adding dog:', e);
      toast({
        title: "Add failed",
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: "destructive"
      });
      return undefined;
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn && user?.id && !dogLoadingAttempted) {
      setDogLoadingAttempted(true);
      fetchDogs().catch(err => {
        console.error('Initial dogs fetch failed:', err);
      });
    }
  }, [authLoading, isLoggedIn, user?.id, dogLoadingAttempted]);

  const isLoading = authLoading || (isLoggedIn && dogsLoading && !dogLoadingAttempted);

  const value: DogsContextType = {
    dogs,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : (authLoading ? null : (!isLoggedIn && !user?.id && dogLoadingAttempted ? 'Authentication required' : null)),
    activeDog,
    setActiveDog,
    refreshDogs,
    totalDogs,
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
