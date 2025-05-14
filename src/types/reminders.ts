
export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string | Date;
  priority: string;
  type: string;
  relatedId?: string | null;
  isCompleted: boolean;
  isDeleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  priority: string;
  type: string;
  relatedId?: string;
}

export interface RecentMating {
  litterId: string;
  maleName: string;
  femaleName: string;
  date: Date;
}
