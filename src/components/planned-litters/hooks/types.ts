
import { Dog } from '@/types/dogs';

// Define RecentMating type here and export it
export interface RecentMating {
  id: string;
  litterId: string;
  damId: string;
  damName: string;
  sireId?: string;
  sireName?: string;
  maleName: string;
  femaleName: string;
  date: Date;
}

export interface PlannedLitterHookState {
  dogs: Dog[];
  isLoading: boolean;
  error: Error | null;
}
