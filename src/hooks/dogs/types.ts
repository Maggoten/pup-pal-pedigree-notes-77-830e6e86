
import { Dog } from '@/types/dogs';

export interface UseDogsMutations {
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: (id: string) => Promise<boolean>;
}

export interface UseDogsQueries {
  dogs: Dog[];
  isLoading: boolean;
  error: string | null;
  fetchDogs: (skipCache?: boolean) => Promise<Dog[]>;
  useDogs: () => { data: Dog[], isLoading: boolean, error: unknown };
}

export interface UseDogs extends UseDogsMutations, UseDogsQueries {}
