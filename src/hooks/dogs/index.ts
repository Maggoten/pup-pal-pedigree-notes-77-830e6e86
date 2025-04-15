
import { useDogsMutations } from './useDogsMutations';
import { useDogsQueries } from './useDogsQueries';
import { UseDogs } from './types';

export const useDogs = (userId: string | undefined): UseDogs => {
  const queries = useDogsQueries(userId);
  const mutations = useDogsMutations(userId);

  return {
    ...queries,
    ...mutations
  };
};

// Export types
export type { UseDogs, UseDogsMutations, UseDogsQueries } from './types';
