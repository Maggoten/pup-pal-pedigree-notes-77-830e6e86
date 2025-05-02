
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

export interface Puppy {
  id: string;
  name: string;
  gender: 'male' | 'female';
  color: string;
  markings?: string;
  birthWeight?: number;
  currentWeight?: number;
  sold?: boolean;
  reserved?: boolean;
  newOwner?: string;
  notes?: PuppyNote[];
  collar?: string;
  microchip?: string;
  
  // New properties that were missing
  breed?: string;
  imageUrl?: string;
  birthDateTime?: string;
  weightLog: PuppyWeightRecord[];
  heightLog: PuppyHeightRecord[];
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
