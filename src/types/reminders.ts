
import { ReactElement } from 'react';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  type: string;
  relatedId?: string;
  icon?: ReactElement;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomReminderInput {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: string;  // Ensure this is required
  relatedId?: string;
}

// Type alias for form values
export type ReminderFormValues = CustomReminderInput;

export interface MatingData {
  id: string;
  litterId: string;
  femaleName: string;
  maleName: string;
  matingDate: Date;
  formattedDate: string;
  isToday: boolean;
}

export interface RecentMating {
  id: string;
  litterId: string;
  femaleName: string;
  maleName: string;
  date: Date;
  formattedDate?: string;
  isToday?: boolean;
}

export interface UpcomingHeat {
  id: string;
  dogId: string;
  dogName: string;
  expectedDate: Date;  // Standardize on expectedDate, not date
  daysUntil: number;
  heatIndex: number;
}

export const createReminder = (data: Omit<Reminder, 'isCompleted'>): Reminder => {
  return {
    ...data,
    isCompleted: false
  };
};
