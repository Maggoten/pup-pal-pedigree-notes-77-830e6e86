
// Define a ProfileData interface
export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  kennel_name: string;
  phone: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

// Define a SharedUser interface
export interface SharedUser {
  id: string;
  owner_id: string;
  shared_with_id: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Define a UserSettings interface that combines ProfileData and SharedUsers
export interface UserSettings {
  profile: ProfileData;
  sharedUsers: SharedUser[];
  subscriptionTier: 'free' | 'premium' | 'professional';
  subscriptionEndsAt: Date;
}

// Define a SettingsContextType interface for the settings context
export interface SettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  deleteAccount: (password: string) => Promise<boolean>;
  cancelSubscription: () => Promise<void>;
  isCancellingSubscription: boolean;
  isDeletingAccount: boolean;
  updatePersonalInfo: (info: { firstName: string; lastName: string }) => Promise<void>;
  updateKennelInfo: (info: { kennelName: string; address?: string; website?: string; phone?: string }) => Promise<void>;
  isUpdatingPersonal: boolean;
  isUpdatingKennel: boolean;
  addSharedUser: (email: string, role: string) => Promise<void>;
  removeSharedUser: (userId: string) => Promise<void>;
  isAddingSharedUser: boolean;
  isRemovingSharedUser: boolean;
}
