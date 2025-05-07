
export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: 'pregnancy' | 'litter' | 'breeding' | 'health';
  icon?: React.ReactNode;
  relatedId?: string;
  isCompleted?: boolean;
}

export interface UpcomingHeat {
  dogId: string;
  dogName: string;
  date: Date;
  heatIndex: number; // Add the index of the heat record in the dog's heatHistory array
}

export interface RecentMating {
  litterId: string;
  maleName: string;
  femaleName: string;
  date: Date;
}
