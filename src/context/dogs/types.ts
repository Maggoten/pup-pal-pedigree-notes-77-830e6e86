
import { Dog, DogDependencies } from '@/types/dogs';
import { DeletionMode } from '@/services/dogs';

export type RemoveDogFn = {
  (id: string, mode?: DeletionMode): Promise<boolean>;
  checkDependencies: (id: string) => Promise<DogDependencies | null>;
}

export interface DogsContextType {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  refreshDogs: () => Promise<void>;
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog | undefined>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  removeDog: RemoveDogFn;
}
