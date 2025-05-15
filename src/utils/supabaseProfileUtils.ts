
import { ProfileData, SharedUser } from "@/types/settings";
import { isError } from "./supabaseTypeUtils";

/**
 * Converts a raw profile data object from Supabase to our app's ProfileData type
 */
export const convertToProfileData = (profileData: any): ProfileData | null => {
  if (!profileData || isError(profileData)) return null;
  
  return {
    id: profileData.id,
    email: profileData.email,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    address: profileData.address,
    kennel_name: profileData.kennel_name,
    phone: profileData.phone,
    subscription_status: profileData.subscription_status,
    created_at: profileData.created_at,
    updated_at: profileData.updated_at
  };
};

/**
 * Process shared users data from Supabase into our app's SharedUser type
 */
export const processSharedUsers = (sharedUsersData: any[]): SharedUser[] => {
  if (!Array.isArray(sharedUsersData)) return [];
  
  return sharedUsersData
    .filter(user => !isError(user) && user.shared_with_id)
    .map(user => ({
      id: user.id,
      shared_with_id: user.shared_with_id,
      role: user.role,
      status: user.status,
      owner_id: user.owner_id,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
};
