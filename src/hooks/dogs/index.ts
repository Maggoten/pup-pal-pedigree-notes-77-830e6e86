
import { useDogsMutations } from './useDogsMutations';
import { useDogsQueries } from './useDogsQueries';
import { UseDogs, UseDogsMutations, UseDogsQueries } from './types';
import { Dog } from '@/types/dogs';

export const useDogs = (): UseDogs => {
  const queries = useDogsQueries();
  const mutations = useDogsMutations();

  return {
    ...queries,
    ...mutations,
    fetchDogs: async (skipCache?: boolean): Promise<Dog[]> => {
      return queries.fetchDogs(skipCache); 
    },
    addDog: async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>): Promise<Dog | undefined> => {
      return mutations.addDog(dog);
    },
    updateDog: async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
      return mutations.updateDog(id, updates);
    },
    deleteDog: async (id: string): Promise<boolean> => {
      return mutations.deleteDog(id);
    }
  };
};

// Export types
export type { UseDogs, UseDogsMutations, UseDogsQueries } from './types';
