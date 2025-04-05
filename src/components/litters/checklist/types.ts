
import { Litter } from '@/types/breeding';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  age: number; // in days
  isCompleted: boolean;
  category: 'health' | 'development' | 'admin';
  weekNumber?: number;
}

export interface PuppyDevelopmentChecklistProps {
  litter: Litter;
  onToggleItem: (itemId: string, completed: boolean) => void;
  compact?: boolean;
}

// Group checklist items by timeline segments
export const timelineSegments = [
  { name: 'First Week', min: 0, max: 7 },
  { name: 'Weeks 2-3', min: 8, max: 21 },
  { name: 'Weeks 4-6', min: 22, max: 42 },
  { name: 'Weeks 7-8', min: 43, max: 56 },
  { name: 'After 8 Weeks', min: 57, max: 100 }
];
