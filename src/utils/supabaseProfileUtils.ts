
import { ProfileData, SharedUser } from "@/types/settings";
import { isSupabaseError } from "./supabaseTypeUtils";

// Convert database profile to ProfileData
export const convertToProfileData = (rawProfile: any): ProfileData | null => {
  if (!rawProfile || isSupabaseError(rawProfile)) {
    return null;
  }

  return {
    id: rawProfile.id || '',
    email: rawProfile.email || '',
    first_name: rawProfile.first_name || '',
    last_name: rawProfile.last_name || '',
    address: rawProfile.address || '',
    kennel_name: rawProfile.kennel_name || '',
    phone: rawProfile.phone || '',
    subscription_status: rawProfile.subscription_status || 'active',
    created_at: rawProfile.created_at || '',
    updated_at: rawProfile.updated_at || ''
  };
};

// Process shared users and handle potential errors
export const processSharedUsers = (rawUsers: any[]): SharedUser[] => {
  if (!Array.isArray(rawUsers)) {
    return [];
  }

  return rawUsers
    .filter(user => !isSupabaseError(user) && user && user.id)
    .map(user => ({
      id: user.id || '',
      shared_with_id: user.shared_with_id || '',
      role: user.role || 'viewer',
      status: user.status || 'pending',
      created_at: user.created_at || '',
      updated_at: user.updated_at || '',
      owner_id: user.owner_id || ''
    }));
};
