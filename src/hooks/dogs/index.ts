
import { useState } from 'react';
import { useDogsMutations } from './useDogsMutations';
import { useDogsQueries } from './useDogsQueries';
import { UseDogs, UseDogsMutations, UseDogsQueries } from './types';
import { Dog } from '@/types/dogs';

export const useDogs = (): UseDogs => {
  const queries = useDogsQueries();
  const mutations = useDogsMutations();
  const [activeDog, setActiveDog] = useState<Dog | null>(null);

  // Create a refreshDogs function that matches the expected return type
  const refreshDogs = async (): Promise<void> => {
    await queries.fetchDogs(true);
    return;
  };

  // Create a removeDog function with checkDependencies attached
  const removeDog = mutations.deleteDog;

  return {
    ...queries,
    ...mutations,
    activeDog,
    setActiveDog,
    refreshDogs,
    removeDog
  };
};

// Export types
export type { UseDogs, UseDogsMutations, UseDogsQueries } from './types';
