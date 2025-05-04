
import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
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

  // Enhanced refresh dogs function with retry logic
  const wrappedRefreshDogs = useCallback(async (): Promise<void> => {
    try {
      console.log('[DOGS_PROVIDER] Refreshing dogs data');
      setLastRefreshTime(Date.now());
      await fetchDogs();
      console.log('[DOGS_PROVIDER] Dogs refresh completed successfully');
    } catch (e) {
      console.error('[DOGS_PROVIDER] Error refreshing dogs:', e);
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive"
      });
    }
  }, [fetchDogs, toast]);

  // Enhanced initial load function with retries
  const attemptInitialLoad = useCallback(async () => {
    if (!isLoggedIn || !user?.id) {
      console.log('[DOGS_PROVIDER] Not logged in or no user ID, skipping dogs load');
      return;
    }
    
    if (dogLoadingAttempted && retryCount >= 3) {
      console.log('[DOGS_PROVIDER] Max retries reached, not attempting to load dogs again');
      return;
    }
    
    try {
      console.log(`[DOGS_PROVIDER] Attempting to load dogs for user ${user.id} (attempt ${retryCount + 1})`);
      setDogLoadingAttempted(true);
      await fetchDogs();
      console.log('[DOGS_PROVIDER] Successfully loaded dogs data');
    } catch (err) {
      console.error('[DOGS_PROVIDER] Failed to load dogs:', err);
      
      // Schedule a retry after a delay
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000); // Exponential backoff
        console.log(`[DOGS_PROVIDER] Scheduling retry in ${delay}ms`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          // Reset the loading attempted so we try again
          setDogLoadingAttempted(false);
        }, delay);
      }
    }
  }, [isLoggedIn, user?.id, dogLoadingAttempted, retryCount, fetchDogs]);

  // Monitor auth state and trigger initial dog data load
  useEffect(() => {
    if (!authLoading && !dogLoadingAttempted) {
      attemptInitialLoad();
    }
  }, [authLoading, dogLoadingAttempted, attemptInitialLoad]);
  
  // Reset retry count when user changes
  useEffect(() => {
    setRetryCount(0);
    setDogLoadingAttempted(false);
  }, [user?.id]);
  
  // Add a data integrity check
  useEffect(() => {
    if (dogs.length > 0) {
      // Log data quality issues for debugging
      const dogsWithoutVaccination = dogs.filter(dog => !dog.vaccinationDate).length;
      const femaleDogsWithoutHeat = dogs.filter(
        dog => dog.gender === 'female' && (!dog.heatHistory || dog.heatHistory.length === 0)
      ).length;
      
      console.log('[DOGS_PROVIDER] Data quality check:', {
        totalDogs: dogs.length,
        dogsWithoutVaccination,
        femaleDogsWithoutHeat,
      });
    }
  }, [dogs]);

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
  
  // Debug logging
  useEffect(() => {
    console.log('[DOGS_PROVIDER] Status:', { 
      authLoading, 
      isLoggedIn: !!isLoggedIn,
      userId: user?.id,
      dogsLoading,
      dogsCount: dogs.length,
      dogLoadingAttempted,
      retryCount,
      lastRefreshTime: lastRefreshTime ? new Date(lastRefreshTime).toISOString() : 'never'
    });
  }, [authLoading, isLoggedIn, user?.id, dogsLoading, dogs.length, dogLoadingAttempted, retryCount, lastRefreshTime]);

  return (
    <DogsContext.Provider value={value}>
      {children}
    </DogsContext.Provider>
  );
};
