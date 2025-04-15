
export interface Dog {
  id: string;
  owner_id: string;
  name: string;
  breed?: string;
  gender?: 'male' | 'female';
  birthdate?: string;
  registration_number?: string;
  chip_number?: string;
  color?: string;
  image_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
