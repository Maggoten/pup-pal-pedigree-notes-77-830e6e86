
import { Dog } from '@/types/dogs';

export interface UseDogsQueries {
  dogs: Dog[];
  isLoading: boolean; 
  error: string | null;
  fetchDogs: (skipCache?: boolean) => Promise<Dog[]>;
  useDogs: () => { data: Dog[], isLoading: boolean, error: unknown, totalDogs: number };
  totalDogs: number;  // Add the totalDogs property to the interface
}

export interface UseDogsMutations {
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog | undefined>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: (id: string) => Promise<boolean>;
}

export interface UseDogs extends UseDogsQueries, UseDogsMutations {
  totalDogs: number;
}

export interface UseDogOperations {
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  removeDog: (id: string) => Promise<boolean>;
}
