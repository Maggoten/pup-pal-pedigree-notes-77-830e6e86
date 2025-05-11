
export interface Puppy {
  id: string;
  name: string;
  number?: number;
  color?: string;
  gender?: 'male' | 'female';
  litter_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  birth_weight?: number;
  current_weight?: number;
  collar_color?: string;
  sold?: boolean;
  imageUrl?: string;
  description?: string;
  notes?: string;
  reserved?: boolean;
  reservedBy?: string;
}

export interface PuppyWeight {
  id: string;
  puppy_id: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface PuppyHeight {
  id: string;
  puppy_id: string;
  height: number;
  date: string;
  notes?: string;
}

export interface PuppyNote {
  id: string;
  puppy_id: string;
  content: string;
  date: string;
  created_by?: string;
}
