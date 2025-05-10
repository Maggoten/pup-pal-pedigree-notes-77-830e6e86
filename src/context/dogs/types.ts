
import { Dog } from '@/types/dogs';

export interface DogsContextType {
  dogs: Dog[];
  loading: boolean;
  error: string | null;
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
  refreshDogs: () => Promise<void>;
  fetchDogs: (skipCache?: boolean) => Promise<Dog[]>;
  addDog: (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => Promise<Dog | undefined>;
  updateDog: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  removeDog: (id: string) => Promise<boolean>;
}
