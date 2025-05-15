
// Import existing types
import { Dog } from '@/context/DogsContext';

export interface UpcomingHeat {
  dog: Dog;
  heatDate: Date;
  dogId: string;  // Used for storing or referencing the heat
}

export interface RecentMating {
  id: string;
  litterId: string;  // Added this field
  damId: string;
  damName: string;
  sireId?: string;
  sireName: string;
  maleName: string;  // Added this field
  femaleName: string;  // Added this field
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
  icon?: string;  // Added icon property as optional
  relatedId?: string;  // Id of related entity (dog, litter, etc)
}

// Add CustomReminderInput type for the AddReminderForm
export interface CustomReminderInput {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}
