
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

export interface Dog {
  // Primary fields
  id: string;
  owner_id: string;
  name: string;
  
  // Link to original puppy (if created from a kept puppy)
  source_puppy_id?: string;
  
  // Basic information
  breed: string;
  gender: Gender;
  color?: string;
  
  // Dates using aliases for Supabase compatibility
  birthdate?: string;       // Supabase field
  dateOfBirth: string;      // Alias for UI components
  created_at?: string;
  updated_at?: string;
  
  // Registration info
  registration_number?: string;  // Supabase field
  registrationNumber: string;    // Alias for UI components
  registered_name?: string;      // Supabase field
  registeredName?: string;       // Alias for UI components
  chip_number?: string;
  
  // Image handling
  image_url?: string;       // Supabase field
  image: string;            // Alias for UI components
  
  // Health tracking
  dewormingDate?: string;
  vaccinationDate?: string;
  sterilization_date?: string;
  sterilizationDate?: string;    // Alias for UI components
  
  // Breeding-related fields
  heatHistory?: Heat[];
  heatInterval?: number;
  breedingHistory?: BreedingHistory;
  
  // Additional information
  notes?: string;
}
