
export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string | Date;
  priority: 'high' | 'medium' | 'low';
  type: string;
  relatedId?: string | null;
  isCompleted: boolean;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  icon?: React.ReactNode;
}

export interface RemindersSummary {
  total: number;
  incomplete: number;
  upcoming: number;
}

export interface ReminderFormValues {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: string;
  relatedId?: string;
}

export interface RecentMating {
  litterId: string;
  maleName: string;
  femaleName: string;
  date: Date;
}

export interface CustomReminderInput {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type?: string;
  relatedId?: string;
}

export interface UpcomingHeat {
  id: string; 
  dogId: string;
  dogName: string;
  date: Date;
  expectedDate: Date;
  daysUntil: number;
  heatIndex: number;
}

// Creating a MatingData interface
export interface MatingData {
  id: string;
  femaleName: string;
  maleName: string;
  matingDate: Date;
  formattedDate: string;
  isToday: boolean;
  litterId: string;
}

// Helper function to create a valid Reminder object
export const createReminder = (
  data: Omit<Reminder, 'isCompleted'> & { isCompleted?: boolean }
): Reminder => {
  return {
    ...data,
    isCompleted: data.isCompleted ?? false // Default to false if not provided
  };
};
