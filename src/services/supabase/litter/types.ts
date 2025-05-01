
import { Litter, Puppy } from '@/types/breeding';

export interface SupabasePuppy {
  id: string;
  litter_id: string;
  name: string;
  gender: 'male' | 'female';
  color: string;
  markings?: string;
  birth_weight?: number;
  current_weight?: number;
  sold?: boolean;
  reserved?: boolean;
  new_owner?: string;
  collar?: string;
  microchip?: string;
  breed?: string;
  image_url?: string;
  birth_date_time?: string;
  created_at?: string;
  updated_at?: string;
  weight_logs?: {
    date: string;
    weight: number;
  }[];
  height_logs?: {
    date: string;
    height: number;
  }[];
  notes?: {
    date: string;
    content: string;
  }[];
}

export interface SupabaseLitter {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  sire_id?: string;
  dam_id?: string;
  sire_name: string;
  dam_name: string;
  archived: boolean;
  created_at?: string;
  updated_at?: string;
  puppies?: SupabasePuppy[];
}

export interface LitterService {
  loadLitters(): Promise<Litter[]>;
  addLitter(litter: Litter): Promise<Litter | null>;
  updateLitter(updatedLitter: Litter): Promise<boolean>;
  deleteLitter(litterId: string): Promise<boolean>;
  toggleArchiveLitter(litterId: string, archive: boolean): Promise<boolean>;
}

export interface PuppyService {
  addPuppy(litterId: string, puppy: Puppy): Promise<Puppy | null>;
  updatePuppy(litterId: string, puppy: Puppy): Promise<boolean>;
  deletePuppy(puppyId: string): Promise<boolean>;
}

export interface LogService {
  addWeightLog(puppyId: string, date: string, weight: number): Promise<boolean>;
  addHeightLog(puppyId: string, date: string, height: number): Promise<boolean>;
  addPuppyNote(puppyId: string, date: string, content: string): Promise<boolean>;
}

export interface ChecklistService {
  saveChecklistItemStatus(litterId: string, itemId: string, completed: boolean): Promise<boolean>;
  loadChecklistStatuses(litterId: string): Promise<Record<string, boolean>>;
}
