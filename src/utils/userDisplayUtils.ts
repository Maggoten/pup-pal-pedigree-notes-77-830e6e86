
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the display name for a user with priority:
 * 1. First name from profile (preferred)
 * 2. Email username as fallback
 * 3. "Breeder" as ultimate fallback
 */
export const getDisplayUsername = async (user: User | null): Promise<string> => {
  // If no user is provided, return the default
  if (!user) {
    return 'Breeder';
  }

  try {
    // Try to get the profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single();

    // If we have a valid profile with first_name, use it
    if (profile && profile.first_name) {
      return profile.first_name;
    }
    
    // Fallback to other options if profile fetch failed or first_name is null
    if (user.firstName) {
      return user.firstName;
    } else if (user.email) {
      // Extract username from email
      return user.email.split('@')[0];
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }

  // Ultimate fallback
  return 'Breeder';
};

