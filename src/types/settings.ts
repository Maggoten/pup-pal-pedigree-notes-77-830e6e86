
export interface KennelInfo {
  kennelName: string;
  address?: string;
  website?: string;
  phone?: string;
}

export interface SharedUser {
  id: string;
  shared_with_id: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'active';
  created_at: string;
  updated_at: string;
  owner_id: string;
  // These fields will be populated from profiles in useSettings
  email?: string;
  joinedAt?: Date;
}

export interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  kennel_name: string | null;
  address: string | null;
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  subscription_status: string | null;
}

export interface UserSettings {
  profile: ProfileData;
  sharedUsers: SharedUser[];
  // Derived properties for subscriptions
  subscriptionTier?: 'free' | 'premium' | 'professional';
  subscriptionEndsAt?: Date;
}
