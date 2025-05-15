
import { Dog } from './dogs';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: string; 
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  is_completed?: boolean;
  icon?: string;
  related_id?: string;
  // Legacy field names for backwards compatibility with UI components
  isCompleted?: boolean;
  relatedId?: string;
}

export interface CustomReminderInput {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  due_date: Date; // For API compatibility
  type?: string;
}

export interface UpcomingHeat {
  dog: Dog;
  expectedDate: Date;
  daysTillHeat: number;
  id?: string;
  // Properties needed for ReminderCalendarSyncService
  dogId?: string;
  dogName?: string;
  date?: Date;
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
