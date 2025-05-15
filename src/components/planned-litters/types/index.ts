
import { PlannedLitter } from '@/types/breeding';
import { Dog } from '@/types/dogs';
import { UpcomingHeat, RecentMating } from '@/types/reminders';

export interface PlannedLitterFormValues {
  femaleId: string;
  maleId?: string;
  expectedHeatDate: Date;
  externalMale: boolean;
  externalMaleName?: string;
  externalMaleBreed?: string;
  externalMaleRegistration?: string;
  notes?: string;
}

export { RecentMating };

export type { PlannedLitter, Dog, UpcomingHeat };
