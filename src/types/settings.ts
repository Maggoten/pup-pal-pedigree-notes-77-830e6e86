
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

export interface UserSettings {
  firstName?: string;
  lastName?: string;
  email: string;
  kennelInfo?: KennelInfo;
  subscriptionTier?: 'free' | 'premium' | 'professional';
  subscriptionEndsAt?: Date;
  sharedUsers?: SharedUser[];
}
