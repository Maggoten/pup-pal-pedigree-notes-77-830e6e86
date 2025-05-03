
import { Dog, DogDependencies } from '@/types/dogs';

export interface UseDogsQueries {
  dogs: Dog[];
  isLoading: boolean;
  error: Error | null;
  fetchDogs: (skipCache?: boolean) => Promise<Dog[]>;
  useDogs: () => { data: Dog[], isLoading: boolean, error: Error | null };
}

export interface UseDogsMutations {
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: {
    (id: string, mode?: DeletionMode): Promise<boolean>;
    checkDependencies: (id: string) => Promise<DogDependencies | null>;
  };
}

export type UseDogs = UseDogsQueries & UseDogsMutations & {
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  refreshDogs: () => Promise<void>;
  removeDog: {
    (id: string, mode?: DeletionMode): Promise<boolean>;
    checkDependencies: (id: string) => Promise<DogDependencies | null>;
  };
};

// Include DeletionMode type here for local reference
export type DeletionMode = 'soft' | 'hard';
