
export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  isCompleted: boolean;
  weekNumber?: number;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface PreBreedingChecklist {
  id: string;
  plannedLitterId: string;
  groups: ChecklistGroup[];
  progress: number;
  version?: number; // Add version field
}

export interface PregnancyChecklist {
  id: string;
  pregnancyId: string;
  groups: ChecklistGroup[];
  progress: number;
  version?: number; // Add version field
}

// Add an interface for Supabase checklist items
export interface SupabaseChecklistItem {
  id: string;
  pregnancy_id: string;
  user_id: string;
  item_id: string;
  week_number: number;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}
