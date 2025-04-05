
import { ChecklistItem } from "./checklist";

export interface WeeklyDevelopment {
  week: number;
  title: string;
  description: string;
  imageUrl?: string;
  keyPoints: string[];
}

export interface PregnancyWeek {
  weekNumber: number;
  development: WeeklyDevelopment;
  checklistItems: ChecklistItem[];
}

export interface PregnancyJourneyState {
  currentWeek: number;
  totalWeeks: number;
  allWeeks: PregnancyWeek[];
}
