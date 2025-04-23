
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDogs as useDogsHook } from '@/hooks/dogs';
import { useAuth } from '@/hooks/useAuth';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';

// Define the shape of our Dogs context
interface DogsContextType {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  refreshDogs: () => Promise<void>;
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog | undefined>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  removeDog: (id: string) => Promise<boolean>;
}

// Create the context with an undefined default value
const DogsContext = createContext<DogsContextType | undefined>(undefined);

// Define the provider component
interface DogsProviderProps {
  children: ReactNode;
}

export const DogsProvider: React.FC<DogsProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [activeDog, setActiveDog] = useState<Dog | null>(null);
  const [dogLoadingAttempted, setDogLoadingAttempted] = useState(false);
  
  // Add detailed logging for user authentication status
  useEffect(() => {
    console.log('Auth state in DogsProvider: isLoggedIn=', isLoggedIn, 
                'authLoading=', authLoading, 
                'userId=', user?.id || 'undefined');
  }, [isLoggedIn, authLoading, user]);
  
  // Use the useDogs hook with the authenticated user ID
  const { 
    dogs, 
    isLoading: dogsLoading, 
    error, 
    fetchDogs, 
    addDog,
    updateDog: updateDogBase,
    deleteDog 
  } = useDogsHook(user?.id);
  
  // Implement force reload capability for recovery from errors
  const forceReload = async () => {
    setDogLoadingAttempted(false);
    if (user?.id) {
      try {
        console.log('Forcing complete reload of dogs data');
        await fetchDogs(true); // Skip cache to force fresh data
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

  // Create a wrapped function that doesn't return the dogs array
  const wrappedRefreshDogs = async (): Promise<void> => {
    try {
      console.log('Refreshing dogs data');
      await fetchDogs();
      console.log('Dogs data refreshed successfully');
    } catch (e) {
      console.error('Error refreshing dogs:', e);
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive"
      });
    }
    // Explicitly return void
    return;
  };

  // Track when we attempt to load dogs
  useEffect(() => {
    if (!authLoading && isLoggedIn && user?.id && !dogLoadingAttempted) {
      console.log('Auth finished loading, attempting to fetch dogs');
      setDogLoadingAttempted(true);
      fetchDogs().catch(err => {
        console.error('Initial dogs fetch failed:', err);
      });
    }
  }, [authLoading, isLoggedIn, user?.id, dogLoadingAttempted, fetchDogs]);

  // Implement updateDog with better logging and error handling
  const updateDog = async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
    try {
      console.log('DogsContext.updateDog called with:', { id, updates });
      
      if (!id) {
        throw new Error("Invalid dog ID provided");
      }
      
      const updatedDog = await updateDogBase(id, updates);
      console.log('Update result:', updatedDog);
      
      // Update active dog if necessary and successful
      if (updatedDog && activeDog?.id === id) {
        console.log('Updating active dog in state');
        setActiveDog(updatedDog);
      }
      
      // Force a refresh to ensure UI is in sync
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

  // For backward compatibility, rename deleteDog to removeDog
  const removeDog = async (id: string): Promise<boolean> => {
    try {
      console.log('Removing dog:', id);
      await deleteDog(id);
      
      // Reset active dog if it's the one being removed
      if (activeDog?.id === id) {
        console.log('Removing active dog');
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

  // Reset active dog if it no longer exists in the list
  useEffect(() => {
    if (activeDog && !dogs.some(dog => dog.id === activeDog.id)) {
      console.log('Active dog no longer exists, resetting');
      setActiveDog(null);
    }
  }, [dogs, activeDog]);

  // Calculate loading state by combining auth and data loading
  const isLoading = authLoading || (isLoggedIn && dogsLoading && !dogLoadingAttempted);

  // Create the context value object
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

// Custom hook to use the dogs context
export const useDogs = () => {
  const context = useContext(DogsContext);
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogsProvider');
  }
  return context;
};

// Export the Dog type from @/types/dogs
export type { Dog } from '@/types/dogs';
