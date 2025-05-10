
import { PlannedLitter } from '@/types/breeding';
import { UpcomingHeat } from '@/types/reminders';
import { RecentMating } from '../types';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { Dog } from '@/context/DogsContext';

export interface UsePlannedLitterQueries {
  plannedLitters: PlannedLitter[];
  upcomingHeats: UpcomingHeat[];
  recentMatings: RecentMating[];
  males: Dog[];
  females: Dog[];
  isLoading: boolean;
  setPlannedLitters: React.Dispatch<React.SetStateAction<PlannedLitter[]>>;
}

export interface UsePlannedLitterMutations {
  handleAddPlannedLitter: (values: PlannedLitterFormValues) => Promise<void>;
  handleAddMatingDate: (litterId: string, date: Date) => Promise<void>;
  handleEditMatingDate: (litterId: string, dateIndex: number, newDate: Date) => Promise<void>;
  handleDeleteMatingDate: (litterId: string, dateIndex: number) => Promise<void>;
  handleDeleteLitter: (litterId: string) => Promise<void>;
  sessionChecked?: boolean;
}

export type UsePlannedLitters = UsePlannedLitterQueries & UsePlannedLitterMutations & {
  isRefreshing: boolean;
};
