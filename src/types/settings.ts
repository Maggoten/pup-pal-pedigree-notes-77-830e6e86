
export interface KennelInfo {
  kennelName: string;
  address?: string;
  website?: string;
  phone?: string;
}

export interface SharedUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  status: 'pending' | 'active';
}

export interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  phone: string | null;
  kennel_name: string | null;
  subscription_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserSettings {
  profile: ProfileData;
  sharedUsers?: SharedUser[];
}
