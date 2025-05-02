
import { Dog } from '@/types/dogs';

export interface UseDogsQueries {
  dogs: Dog[];
  isLoading: boolean;
  error: string | null;
  fetchDogs: (skipCache?: boolean) => Promise<Dog[]>;
  useDogs: () => { data: Dog[], isLoading: boolean, error: unknown };
}
