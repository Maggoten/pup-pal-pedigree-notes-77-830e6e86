
import { Dog } from './dogs';

// Basic types
export interface Puppy {
  id: string;
  name: string;
  litterId: string;
  gender: 'male' | 'female';
  color: string;
  breed?: string;
  birthWeight?: number;
  birthDateTime?: string;
  imageUrl?: string;
  currentWeight?: number;
  weightLog: PuppyWeightRecord[];
  heightLog: PuppyHeightRecord[];
  notes?: PuppyNote[];
  collar?: string;
  microchip?: string;
  status?: 'Available' | 'Reserved' | 'Sold';
  reserved?: boolean;
  sold?: boolean;
  newOwner?: string | null;
  buyer_name?: string | null;
  buyer_phone?: string | null;
  registered_name?: string | null;
  registration_number?: string | null;
  markings?: string;
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
}

export interface MatingDate {
  id: string;
  plannedLitterId: string;
  matingDate: string | Date;
  pregnancyId?: string | null;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PlannedLitter {
  id: string;
  maleId: string | null;
  femaleId: string;
  maleName: string;
  femaleName: string;
  externalMale: boolean;
  externalMaleName: string | null;
  externalMaleBreed: string | null;
  externalMaleRegistration: string | null;
  expectedHeatDate: Date | string;
  notes: string | null;
  male: Dog | null;
  female: Dog | null;
  matingDates: MatingDate[];
}

export interface BreedingRecord {
  id: string;
  dogId: string;
  partnerId: string;
  date: Date | string;
  notes?: string;
}
