
import { Dog } from '@/types/dogs';
import { PlannedLitterFormValues } from '@/services/planned-litters/types';

// Define UsePlannedLitterMutations interface
export interface UsePlannedLitterMutations {
  handleAddPlannedLitter: (values: PlannedLitterFormValues) => Promise<void>;
  handleAddMatingDate: (litterId: string, date: Date) => Promise<void>;
  handleEditMatingDate: (litterId: string, dateIndex: number, newDate: Date) => Promise<void>;
  handleDeleteMatingDate: (litterId: string, dateIndex: number) => Promise<void>;
  handleDeleteLitter: (litterId: string) => Promise<void>;
}

// Define RecentMating type
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
