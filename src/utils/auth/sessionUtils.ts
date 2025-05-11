
import { User } from '@/types/auth';

/**
 * Maps user profile data from Supabase to our app's User format
 * Extracts only the fields we need and provides fallbacks
 */
export const mapUserProfile = (
  profile: any, 
  userId: string,
  userEmail?: string | null
): User => {
  if (!profile) {
    // Fallback user when profile is missing
    return {
      id: userId,
      email: userEmail || '',
      firstName: '',
      lastName: '',
      address: ''
    };
  }
  
  // Map profile data to our user model
  return {
    id: userId,
    email: userEmail || '',
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    address: profile.address || ''
  };
};

/**
 * Helper for checking if a session is expired or near expiry
 */
export const isSessionNearExpiry = (
  session: { expires_at?: number | null },
  thresholdMinutes = 5
): boolean => {
  if (!session?.expires_at) return true;
  
  // Convert expires_at to milliseconds
  const expiryTime = session.expires_at * 1000;
  const now = Date.now();
  
  // Check if within threshold minutes of expiry
  const thresholdMs = thresholdMinutes * 60 * 1000;
  return now >= expiryTime - thresholdMs;
};
