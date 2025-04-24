
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDogs as useDogsHook } from '@/hooks/dogs';
import { DogsContextType } from './types';

export const DogsContext = createContext<DogsContextType | undefined>(undefined);

interface DogsProviderProps {
  children: ReactNode;
}

export const DogsProvider: React.FC<DogsProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [activeDog, setActiveDog] = useState<Dog | null>(null);
  const [dogLoadingAttempted, setDogLoadingAttempted] = useState(false);
  
  const { 
    dogs, 
    isLoading: dogsLoading, 
    error, 
    fetchDogs, 
    addDog,
    updateDog: updateDogBase,
    deleteDog 
  } = useDogsHook(user?.id);
  
  const forceReload = async () => {
    setDogLoadingAttempted(false);
    if (user?.id) {
      try {
        await fetchDogs(true);
        toast({
          title: "Refreshed",
          description: "Dog data has been refreshed from the server."
        });
      } catch (e) {
        console.error('Force reload failed:', e);
        toast({
          title: "Refresh failed",
          description: "Could not refresh data. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

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

  const updateDog = async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
    try {
      if (!id) {
        throw new Error("Invalid dog ID provided");
      }
      
      const updatedDog = await updateDogBase(id, updates);
      
      if (updatedDog && activeDog?.id === id) {
        setActiveDog(updatedDog);
      }
      
      await wrappedRefreshDogs();
      
      return updatedDog;
    } catch (e) {
      console.error('Error updating dog:', e);
      toast({
        title: "Update failed",
        description: "Could not update dog information. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const removeDog = async (id: string): Promise<boolean> => {
    try {
      await deleteDog(id);
      
      if (activeDog?.id === id) {
        setActiveDog(null);
      }
      
      return true;
    } catch (e) {
      console.error('Error removing dog:', e);
      toast({
        title: "Remove failed",
        description: "Could not remove dog. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (activeDog && !dogs.some(dog => dog.id === activeDog.id)) {
      setActiveDog(null);
    }
  }, [dogs, activeDog]);

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
