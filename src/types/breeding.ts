
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
  notes?: string;
  collar?: string;
  microchip?: string;
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
}
