
import { Dog } from './dogs';

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

export interface MatingDate {
  id: string;
  plannedLitterId: string;
  matingDate: Date | string;
  pregnancyId?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BreedingRecord {
  id: string;
  dogId: string;
  partnerId: string;
  date: Date | string;
  notes?: string;
}
