
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

export interface Reminder {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  type: string;
  relatedId?: string;
  isCompleted?: boolean;
  icon?: React.ReactNode;
}

export interface CustomReminderInput {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type?: string;
  relatedId?: string;
  due_date?: Date; // For API compatibility
  dueDate?: Date; // For UI component compatibility
}
