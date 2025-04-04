
export interface PlannedLitter {
  id: string;
  maleId: string;
  femaleId: string;
  maleName: string;
  femaleName: string;
  expectedHeatDate: string;
  matingDates?: string[];
  notes: string;
  externalMale?: boolean;
  externalMaleBreed?: string;
}

export interface Puppy {
  id: string;
  name: string;
  gender: 'male' | 'female';
  color: string;
  breed?: string; // Keep this optional for backward compatibility
  birthWeight: number;
  birthDateTime: string;
  imageUrl?: string;
  weightLog: { date: string; weight: number }[];
  heightLog: { date: string; height: number }[];
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
}
