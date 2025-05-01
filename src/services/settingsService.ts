
import { supabase } from '@/integrations/supabase/client';
import { KennelInfo, SharedUser } from '@/types/settings';
import { User } from '@/types/auth';

export const getUserSettings = async (user: User | null) => {
  if (!user?.id) {
    throw new Error('User ID is required');
  }
  
  try {
    // Fetch the user's profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    // First get the shared users data
    const { data: sharedUsersData, error: sharedError } = await supabase
      .from('shared_users')
      .select('*')
      .eq('owner_id', user.id);
    
    if (sharedError) {
      throw sharedError;
    }
    
    // If we have shared users, fetch their profile information separately
    let formattedSharedUsers: SharedUser[] = [];
    
    if (sharedUsersData && sharedUsersData.length > 0) {
      // Create an array of shared user IDs
      const sharedUserIds = sharedUsersData.map(su => su.shared_with_id);
      
      // Fetch profiles for these users in a single query
      const { data: sharedProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', sharedUserIds);
      
      if (profilesError) {
        console.error('Error fetching shared user profiles:', profilesError);
        // Continue with partial data instead of throwing error
      }
      
      // Create a map of profiles by ID for easier lookup
      const profilesMap = sharedProfiles ? 
        Object.fromEntries(sharedProfiles.map(p => [p.id, p])) : {};
      
      // Transform the shared users data into the expected format
      formattedSharedUsers = sharedUsersData.map(su => {
        const userProfile = profilesMap[su.shared_with_id];
        return {
          id: su.shared_with_id,
          email: userProfile?.email || 'Unknown email',
          role: su.role as 'admin' | 'editor' | 'viewer',
          joinedAt: new Date(su.created_at),
          status: su.status as 'pending' | 'active'
        };
      });
    }
    
    return {
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      kennelInfo: {
        kennelName: profile.kennel_name || '',
        address: profile.address || '',
        phone: profile.phone || '',
      },
      subscriptionTier: profile.subscription_status === 'active' ? 'premium' : 'free',
      sharedUsers: formattedSharedUsers
    };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateKennelInfo = async (user: User | null, kennelInfo: KennelInfo) => {
  if (!user?.id) {
    throw new Error('User ID is required');
  }
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        kennel_name: kennelInfo.kennelName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating kennel info:', error);
    throw error;
  }
};

export const updatePersonalInfo = async (
  user: User | null, 
  personalInfo: { firstName: string; lastName: string }
) => {
  if (!user?.id) {
    throw new Error('User ID is required');
  }
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating personal info:', error);
    throw error;
  }
};

export const addSharedUser = async (
  user: User | null, 
  email: string, 
  role: 'admin' | 'editor' | 'viewer'
) => {
  if (!user?.id) {
    throw new Error('User ID is required');
  }
  
  try {
    // First check if the user exists
    const { data: userToAdd, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError || !userToAdd) {
      throw new Error('User not found');
    }
    
    // Add the shared user
    const { error } = await supabase
      .from('shared_users')
      .insert({
        owner_id: user.id,
        shared_with_id: userToAdd.id,
        role: role,
        status: 'pending'
      });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding shared user:', error);
    throw error;
  }
};

export const removeSharedUser = async (user: User | null, sharedUserId: string) => {
  if (!user?.id) {
    throw new Error('User ID is required');
  }
  
  try {
    const { error } = await supabase
      .from('shared_users')
      .delete()
      .eq('owner_id', user.id)
      .eq('shared_with_id', sharedUserId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing shared user:', error);
    throw error;
  }
};
