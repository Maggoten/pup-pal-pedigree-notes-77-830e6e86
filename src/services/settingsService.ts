
import { KennelInfo, SharedUser, UserSettings } from "@/types/settings";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

// Get user settings from Supabase
export const getUserSettings = async (user: User | null): Promise<UserSettings | null> => {
  if (!user?.email) return null;
  
  try {
    // Get profile data from Supabase
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, address, subscription_tier, subscription_end_date, sharing_enabled')
      .eq('id', await getCurrentUserId())
      .single();
      
    if (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }
    
    // Get shared users data
    const { data: sharedUsersData, error: sharedError } = await supabase
      .from('shared_users')
      .select('*')
      .eq('owner_id', await getCurrentUserId());
      
    if (sharedError) {
      console.error("Error fetching shared users:", sharedError);
    }
    
    // Format and return the settings
    return {
      email: user.email,
      firstName: profileData?.first_name || user.firstName,
      lastName: profileData?.last_name || user.lastName,
      kennelInfo: {
        kennelName: user.firstName ? `${user.firstName}'s Kennel` : "My Kennel",
        address: profileData?.address || user.address
      },
      subscriptionTier: (profileData?.subscription_tier as "free" | "premium" | "professional") || 'free',
      subscriptionEndsAt: profileData?.subscription_end_date ? new Date(profileData.subscription_end_date) : undefined,
      sharedUsers: sharedUsersData ? sharedUsersData.map(u => ({
        id: u.id,
        email: u.shared_email,
        role: u.role as "admin" | "editor" | "viewer",
        joinedAt: new Date(u.created_at),
        status: u.status as "pending" | "active"
      })) : []
    };
  } catch (error) {
    console.error("Error in getUserSettings:", error);
    return null;
  }
};

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || '';
};

// Update kennel information
export const updateKennelInfo = async (
  user: User | null, 
  kennelInfo: KennelInfo
): Promise<UserSettings | null> => {
  if (!user?.email) return null;
  
  try {
    // Call the update_profile function
    const { data, error } = await supabase.rpc('update_profile', {
      p_first_name: user.firstName || '',
      p_last_name: user.lastName || '',
      p_kennel_name: kennelInfo.kennelName,
      p_address: kennelInfo.address || '',
      p_website: kennelInfo.website || '',
      p_phone: kennelInfo.phone || ''
    });
    
    if (error) {
      console.error("Error updating kennel info:", error);
      return null;
    }
    
    // Return updated settings
    return getUserSettings(user);
  } catch (error) {
    console.error("Error in updateKennelInfo:", error);
    return null;
  }
};

// Update personal information
export const updatePersonalInfo = async (
  user: User | null, 
  personalInfo: { firstName: string; lastName: string }
): Promise<UserSettings | null> => {
  if (!user?.email) return null;
  
  try {
    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        updated_at: new Date().toISOString()
      })
      .eq('id', await getCurrentUserId());
      
    if (error) {
      console.error("Error updating personal info:", error);
      return null;
    }
    
    // Update local user object
    const updatedUser = {
      ...user,
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName
    };
    
    // Return updated settings
    return getUserSettings(updatedUser);
  } catch (error) {
    console.error("Error in updatePersonalInfo:", error);
    return null;
  }
};

// Add shared user
export const addSharedUser = async (
  user: User | null, 
  email: string, 
  role: 'admin' | 'editor' | 'viewer'
): Promise<SharedUser | null> => {
  if (!user?.email) return null;
  
  try {
    // Insert new shared user
    const { data, error } = await supabase
      .from('shared_users')
      .insert({
        owner_id: await getCurrentUserId(),
        shared_email: email,
        role: role
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error adding shared user:", error);
      return null;
    }
    
    // Return the new shared user
    return {
      id: data.id,
      email: data.shared_email,
      role: data.role as 'admin' | 'editor' | 'viewer',
      joinedAt: new Date(data.created_at),
      status: data.status as 'pending' | 'active'
    };
  } catch (error) {
    console.error("Error in addSharedUser:", error);
    return null;
  }
};

// Remove shared user
export const removeSharedUser = async (
  user: User | null, 
  sharedUserId: string
): Promise<boolean> => {
  if (!user?.email) return false;
  
  try {
    // Delete shared user
    const { error } = await supabase
      .from('shared_users')
      .delete()
      .eq('id', sharedUserId)
      .eq('owner_id', await getCurrentUserId());
      
    if (error) {
      console.error("Error removing shared user:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeSharedUser:", error);
    return false;
  }
};
