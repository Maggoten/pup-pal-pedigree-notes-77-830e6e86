
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
  date: Date;             // Added this property
  expectedDate: Date;
  daysUntil: number;
  heatIndex: number;      // Added this property
}

// Creating a MatingData interface to match what's being used
export interface MatingData {
  id: string;
  femaleName: string;
  maleName: string;
  matingDate: Date;
  formattedDate: string;
  isToday: boolean;
  litterId: string;      // Added this property
}
