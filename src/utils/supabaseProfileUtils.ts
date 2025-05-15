
import { isSupabaseError, safeGet } from './supabaseErrorHandler';
import { ProfileData, SharedUser } from '@/types/settings';

/**
 * Convert Supabase profile data to the app's ProfileData type
 */
export function convertToProfileData(profileData: any): ProfileData | null {
  if (isSupabaseError(profileData)) {
    return null;
  }
  
  return {
    id: safeGet(profileData, 'id', ''),
    email: safeGet(profileData, 'email', ''),
    first_name: safeGet(profileData, 'first_name', ''),
    last_name: safeGet(profileData, 'last_name', ''),
    address: safeGet(profileData, 'address', ''),
    kennel_name: safeGet(profileData, 'kennel_name', ''),
    phone: safeGet(profileData, 'phone', ''),
    created_at: safeGet(profileData, 'created_at', ''),
    updated_at: safeGet(profileData, 'updated_at', ''),
    subscription_status: safeGet(profileData, 'subscription_status', 'free')
  };
}

/**
 * Convert Supabase shared user data to the app's SharedUser type
 */
export function convertToSharedUser(userData: any): SharedUser | null {
  if (isSupabaseError(userData)) {
    return null;
  }
  
  return {
    id: safeGet(userData, 'id', ''),
    shared_with_id: safeGet(userData, 'shared_with_id', ''),
    role: safeGet(userData, 'role', 'viewer'),
    status: safeGet(userData, 'status', 'pending'),
    created_at: safeGet(userData, 'created_at', ''),
    updated_at: safeGet(userData, 'updated_at', ''),
    owner_id: safeGet(userData, 'owner_id', '')
  };
}

/**
 * Process an array of shared users from Supabase and filter out any invalid entries
 */
export function processSharedUsers(sharedUsers: any[]): SharedUser[] {
  if (!Array.isArray(sharedUsers)) {
    return [];
  }
  
  return sharedUsers
    .map(convertToSharedUser)
    .filter((user): user is SharedUser => user !== null);
}
