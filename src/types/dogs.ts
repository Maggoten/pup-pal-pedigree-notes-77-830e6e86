
// Type aliases for better readability and maintenance
export type Gender = 'male' | 'female';

export type Heat = {
  date: string;
};

export type Breeding = {
  date: string;
  mate: string;
  notes?: string;
};

export type Litter = {
  date: string;
  puppies: number;
  sire?: string;
  notes?: string;
};

export type BreedingHistory = {
  litters?: Litter[];
  breedings?: Breeding[];
  matings?: Breeding[]; // Adding matings for compatibility with ReminderService.ts
};

export interface DogDependency {
  count: number;
  items: Array<{
    id: string;
    name: string;
  }>;
}

export interface DogDependencies {
  planned_litters?: DogDependency;
  planned_litters_female?: DogDependency;
  pregnancies_female?: DogDependency;
  pregnancies_male?: DogDependency;
  litters_dam?: DogDependency;
  litters_sire?: DogDependency;
  calendar_events?: DogDependency;
}

export interface Dog {
  // Primary fields
  id: string;
  owner_id: string;
  name: string;
  
  // Basic information
  breed: string;
  gender: Gender;
  color?: string;
  
  // Dates using aliases for Supabase compatibility
  birthdate?: string;       // Supabase field
  dateOfBirth: string;      // Alias for UI components
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;      // New field for soft deletion
  
  // Registration info
  registration_number?: string;  // Supabase field
  registrationNumber: string;    // Alias for UI components
  chip_number?: string;
  
  // Image handling
  image_url?: string;       // Supabase field
  image: string;            // Alias for UI components
  
  // Health tracking
  dewormingDate?: string;
  vaccinationDate?: string;
  
  // Breeding-related fields
  heatHistory?: Heat[];
  heatInterval?: number;
  breedingHistory?: BreedingHistory;
  
  // Additional information
  notes?: string;
}
