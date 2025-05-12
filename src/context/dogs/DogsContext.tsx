
import { createContext, useContext } from 'react';
import type { DogsContextType } from './types';
import { Dog } from '@/types/dogs';

// Create default values for the context
const defaultContextValue: DogsContextType = {
  dogs: [],
  loading: true,
  error: null,
  activeDog: null,
  setActiveDog: () => {},
  refreshDogs: async () => {},
  fetchDogs: async () => [],
  addDog: async () => undefined,
  updateDog: async () => null,
  removeDog: async () => false,
  totalDogs: 0 // Ensure totalDogs is included in the default value
};

export const DogsContext = createContext<DogsContextType>(defaultContextValue);

// Custom hook to use the dogs context with better error handling
export const useDogs = (): DogsContextType => {
  const context = useContext(DogsContext);
  if (context === undefined) {
    throw new Error('useDogs must be used within a DogsProvider');
  }
  return context;
};
