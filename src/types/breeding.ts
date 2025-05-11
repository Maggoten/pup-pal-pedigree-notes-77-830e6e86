
export interface PlannedLitter {
  id: string;
  maleId: string;
  femaleId: string;
  maleName: string;
  femaleName: string;
  expectedHeatDate: string;
  notes?: string;
  matingDates?: string[];
  externalMale?: boolean;
  externalMaleBreed?: string;
  externalMaleRegistration?: string;
}

export interface Mating {
  date: string;
  notes?: string;
}

export interface PuppyWeightRecord {
  date: string;
  weight: number;
}

export interface PuppyHeightRecord {
  date: string;
  height: number;
}

export interface PuppyNote {
  date: string;
  content: string;
}

// Unified Puppy interface with consistent naming and optional fields
export interface Puppy {
  id: string;
  name: string;
  gender: 'male' | 'female';
  litterId: string; // camelCase naming
  color?: string; // optional as requested
  markings?: string;
  birthWeight?: number;
  currentWeight?: number;
  sold?: boolean;
  reserved?: boolean;
  newOwner?: string;
  notes?: PuppyNote[];
  collar?: string;
  microchip?: string;
  
  // New or enhanced fields
  breed?: string;
  imageUrl?: string;
  birthDateTime?: string;
  weightLog: PuppyWeightRecord[]; // Provide defaults in components
  heightLog: PuppyHeightRecord[]; // Provide defaults in components
  registered_name?: string;
  registration_number?: string;
  status?: 'Available' | 'Reserved' | 'Sold';
  buyer_name?: string;
  buyer_phone?: string;
}

export interface Litter {
  id: string;
  name: string;
  dateOfBirth: string;
  sireId: string;
  damId: string;
  sireName: string;
  damName: string;
  puppies: Puppy[];
  archived?: boolean;
  user_id: string; // Added user_id property to match the database schema
}
