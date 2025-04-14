
export interface Dog {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  color: string;
  registrationNumber?: string;
  notes?: string;
  dewormingDate?: string;
  vaccinationDate?: string;
  heatInterval?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HeatRecord {
  id: string;
  dog_id: string;
  date: string;
  created_at?: string;
}

export interface Vaccination {
  id: string;
  dog_id: string;
  name: string;
  date: string;
  created_at?: string;
}

export interface MedicalIssue {
  id: string;
  dog_id: string;
  issue: string;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface Mating {
  id: string;
  dog_id: string;
  partner_id?: string;
  partner_name?: string;
  date: string;
  successful: boolean;
  created_at?: string;
}

export interface Litter {
  id: string;
  dam_id: string;
  sire_id?: string;
  date: string;
  puppies: number;
  notes?: string;
  created_at?: string;
}
