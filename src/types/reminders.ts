
// Import existing types
import { Dog } from '@/context/DogsContext';

export interface UpcomingHeat {
  dog: Dog;
  heatDate: Date;
  dogId: string;  // Used for storing or referencing the heat
}

export interface RecentMating {
  id: string;
  damId: string;
  damName: string;
  sireId?: string;
  sireName: string;
  date: Date;
  notes?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  type: 'general' | 'dog' | 'litter' | 'breeding';
  isCompleted: boolean;
  relatedId?: string;  // Id of related entity (dog, litter, etc)
}
