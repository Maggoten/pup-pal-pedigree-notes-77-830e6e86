
import { useDogsQueries } from './useDogsQueries';
import { useDogsMutations } from './useDogsMutations';
import { Dog } from '@/types/dogs';
import { UseDogs } from './types';

export function useDogsFunctions(): UseDogs {
  const dogsQueries = useDogsQueries();
  const dogsMutations = useDogsMutations();
  
  return {
    ...dogsQueries,
    ...dogsMutations,
    // Explicitly add totalDogs to satisfy the UseDogs interface
    totalDogs: dogsQueries.dogs?.length || 0
  };
}

export { useDogsQueries } from './useDogsQueries';
export { useDogsMutations } from './useDogsMutations';
