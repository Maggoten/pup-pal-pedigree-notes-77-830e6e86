
import { KennelInfo, SharedUser, UserSettings } from "@/types/settings";
import { User } from "@/types/auth";

// Mock settings data - in a real application, this would come from a database
const MOCK_USER_SETTINGS: Record<string, UserSettings> = {
  "default@example.com": {
    firstName: "Default",
    lastName: "User",
    email: "default@example.com",
    kennelInfo: {
      kennelName: "Happy Paws Kennel",
      address: "123 Dogwood Lane",
      website: "happypawskennel.com",
      phone: "555-123-4567"
    },
    subscriptionTier: "free",
    sharedUsers: []
  }
};

// Get user settings
export const getUserSettings = async (user: User | null): Promise<UserSettings | null> => {
  // In a real application, this would fetch data from an API
  if (!user?.email) return null;
  
  // Return mock data if available, or create default settings
  return MOCK_USER_SETTINGS[user.email] || {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    kennelInfo: { kennelName: "" },
    subscriptionTier: "free",
    sharedUsers: []
  };
};

// Update kennel information
export const updateKennelInfo = async (
  user: User | null, 
  kennelInfo: KennelInfo
): Promise<UserSettings | null> => {
  if (!user?.email) return null;
  
  // In a real app, this would call an API to update the database
  const settings = await getUserSettings(user);
  if (settings) {
    settings.kennelInfo = kennelInfo;
    
    // Update mock data
    MOCK_USER_SETTINGS[user.email] = settings;
  }
  
  return settings;
};

// Update personal information
export const updatePersonalInfo = async (
  user: User | null, 
  personalInfo: { firstName: string; lastName: string }
): Promise<UserSettings | null> => {
  if (!user?.email) return null;
  
  // In a real app, this would call an API to update the database
  const settings = await getUserSettings(user);
  if (settings) {
    settings.firstName = personalInfo.firstName;
    settings.lastName = personalInfo.lastName;
    
    // Update mock data
    MOCK_USER_SETTINGS[user.email] = settings;
  }
  
  return settings;
};

// Add shared user
export const addSharedUser = async (
  user: User | null, 
  email: string, 
  role: 'admin' | 'editor' | 'viewer'
): Promise<SharedUser | null> => {
  if (!user?.email) return null;
  
  const settings = await getUserSettings(user);
  if (!settings) return null;
  
  if (!settings.sharedUsers) {
    settings.sharedUsers = [];
  }
  
  // Check if user is already shared
  const existingUser = settings.sharedUsers.find(u => u.email === email);
  if (existingUser) {
    return null;
  }
  
  // Create new shared user
  const newSharedUser: SharedUser = {
    id: `shared-${Date.now()}`,
    email,
    role,
    joinedAt: new Date(),
    status: 'pending'
  };
  
  settings.sharedUsers.push(newSharedUser);
  MOCK_USER_SETTINGS[user.email] = settings;
  
  return newSharedUser;
};

// Remove shared user
export const removeSharedUser = async (
  user: User | null, 
  sharedUserId: string
): Promise<boolean> => {
  if (!user?.email) return false;
  
  const settings = await getUserSettings(user);
  if (!settings || !settings.sharedUsers) return false;
  
  const initialLength = settings.sharedUsers.length;
  settings.sharedUsers = settings.sharedUsers.filter(u => u.id !== sharedUserId);
  
  if (settings.sharedUsers.length !== initialLength) {
    MOCK_USER_SETTINGS[user.email] = settings;
    return true;
  }
  
  return false;
};
