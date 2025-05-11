
export interface UseImageUploadProps {
  user_id: string | null | undefined;
  onImageChange: (url: string) => void;
  onImageSaved?: (url: string) => Promise<void>;
}

export interface UploadResult {
  data?: {
    path?: string;
  };
  error?: any;
}

export interface PuppyImageUploaderProps {
  puppyId: string;
  litterId: string;
  puppyName: string;
  currentImage?: string;
  onImageChange: (newImageUrl: string) => void;
  large?: boolean;
}

// Define puppy related types to fix type errors
export interface PuppyWeight {
  date: string;
  weight: number;
}

export interface PuppyHeight {
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
  gender: "male" | "female";
  litter_id: string;
  birth_date_time?: string;
  collar?: string;
  color?: string;
  current_weight?: number;
  birth_weight?: number;
  breed?: string;
  registration_number?: string;
  sold?: boolean;
  price?: number;
  buyer_name?: string;
  buyer_phone?: string;
  buyer_email?: string;
  notes?: PuppyNote[];
  created_at?: string;
  updated_at?: string;
  imageUrl?: string;
  weightLog?: PuppyWeight[];
  heightLog?: PuppyHeight[];
}
