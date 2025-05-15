
import { Dog } from "@/context/DogsContext";

export interface UpcomingHeat {
  dog: Dog;
  heatDate: Date;
}

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

export interface BreedingReminder {
  id: string;
  title: string;
  date: Date;
  type: string;
  dogId?: string;
  dogName?: string;
}

export interface CustomReminderInput {
  title: string;
  description: string;
  date: Date;
  priority: 'low' | 'medium' | 'high';
  type: string;
  relatedId?: string;
}
