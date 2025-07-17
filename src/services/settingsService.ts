
import { supabase } from '@/integrations/supabase/client';
import { KennelInfo } from '@/types/settings';
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
    
    // Fetch shared users
    const { data: sharedUsers, error: sharedError } = await supabase
      .from('shared_users')
      .select('*')
      .eq('owner_id', user.id);
    
    if (sharedError) {
      throw sharedError;
    }
    
    return {
      profile,
      sharedUsers: sharedUsers || []
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
        address: kennelInfo.address,
        phone: kennelInfo.phone,
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

export const cancelSubscription = async (user: User | null): Promise<boolean> => {
  if (!user?.id) {
    throw new Error('User ID is required');
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    console.log('[SETTINGS] Calling cancel-subscription edge function for user:', user.id);

    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('[SETTINGS] Error from cancel-subscription function:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }

    if (!data?.success) {
      console.error('[SETTINGS] Cancel subscription function returned failure:', data);
      throw new Error(data?.error || 'Failed to cancel subscription');
    }

    console.log('[SETTINGS] Subscription cancelled successfully:', data);
    return true;
  } catch (error) {
    console.error('[SETTINGS] Error cancelling subscription:', error);
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
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
