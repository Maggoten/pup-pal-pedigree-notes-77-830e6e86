
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
}

export interface PregnancyChecklist {
  id: string;
  pregnancyId: string;
  groups: ChecklistGroup[];
  progress: number;
}
