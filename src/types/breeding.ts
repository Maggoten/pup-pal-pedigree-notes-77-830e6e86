export type PlannedLitterStatus = 'planned' | 'active' | 'completed' | 'cancelled';

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
  externalMaleImageUrl?: string;
  status: PlannedLitterStatus;
  litterId?: string;
  completedAt?: string;
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

export interface PuppyWeeklyPhoto {
  id: string;
  puppy_id: string;
  week_number: number;
  image_url: string;
  notes?: string;
  weight?: number;
  height?: number;
  date_taken: string;
  created_at: string;
  updated_at: string;
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
  
  // New or enhanced fields
  breed?: string;
  imageUrl?: string;
  birthDateTime?: string;
  weightLog: PuppyWeightRecord[];
  heightLog: PuppyHeightRecord[];
  registered_name?: string;
  registration_number?: string;
  status?: 'Available' | 'Reserved' | 'Sold';
  buyer_name?: string;
  buyer_phone?: string;
  weeklyPhotos?: PuppyWeeklyPhoto[];
  deathDate?: string;
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
  user_id: string;
  pregnancyId?: string;
}
