
import { useDogsMutations } from './useDogsMutations';
import { useDogsQueries } from './useDogsQueries';
import { UseDogs, UseDogsMutations, UseDogsQueries } from './types';

export const useDogs = (): UseDogs => {
  const queries = useDogsQueries();
  const mutations = useDogsMutations();

  return {
    ...queries,
    ...mutations
  };
};

// Export types
export type { UseDogs, UseDogsMutations, UseDogsQueries } from './types';
