
import { PlannedLitter } from '@/types/breeding';
import { UpcomingHeat } from '@/types/reminders';
import { Dog } from '@/context/DogsContext';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';

export interface RecentMating {
  id: string;
  maleName: string;
  femaleName: string;
  date: Date;
}

export interface PlannedLitterHandlers {
  onAddPlannedLitter: (values: PlannedLitterFormValues) => void;
  onAddMatingDate: (litterId: string, date: Date) => void;
  onEditMatingDate?: (litterId: string, dateIndex: number, newDate: Date) => void;
  onDeleteMatingDate?: (litterId: string, dateIndex: number) => void;
  onDeleteLitter: (litterId: string) => void;
}

export interface MatingProps {
  upcomingHeats: UpcomingHeat[];
  recentMatings: RecentMating[];
}
