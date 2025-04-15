
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDogs as useDogsHook } from '@/hooks/dogs';
import { useAuth } from '@/hooks/useAuth';
import { Dog } from '@/types/dogs';

// Define the shape of our Dogs context
interface DogsContextType {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  refreshDogs: () => Promise<void>;
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog | undefined>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<boolean>;
  removeDog: (id: string) => Promise<boolean>;
}

// Create the context with an undefined default value
const DogsContext = createContext<DogsContextType | undefined>(undefined);

// Define the provider component
interface DogsProviderProps {
  children: ReactNode;
}

export const DogsProvider: React.FC<DogsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [activeDog, setActiveDog] = useState<Dog | null>(null);
  
  // Use the useDogs hook with the authenticated user ID
  const { 
    dogs, 
    isLoading: loading, 
    error, 
    fetchDogs, 
    addDog,
    updateDog,
    deleteDog: removeDog 
  } = useDogsHook(user?.id);

  // Create a wrapped function that doesn't return the dogs array
  const wrappedRefreshDogs = async (): Promise<void> => {
    await fetchDogs();
    // Explicitly return void
    return;
  };

  // Reset active dog if it no longer exists in the list
  useEffect(() => {
    if (activeDog && !dogs.some(dog => dog.id === activeDog.id)) {
      setActiveDog(null);
    }
  }, [dogs, activeDog]);

  // Create the context value object
  const value: DogsContextType = {
    dogs,
    loading,
    error,
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
