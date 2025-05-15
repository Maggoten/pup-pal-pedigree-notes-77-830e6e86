
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserSettings, SharedUser, ProfileData } from '@/types/settings';
import { toast } from '@/components/ui/use-toast';
import { isSupabaseError, safeGet, safeCast, safeArray } from '@/utils/supabaseErrorHandler';

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  error: Error | null;
  refreshSettings: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
  addSharedUser: (email: string, role: string) => Promise<void>;
  removeSharedUser: (userId: string) => Promise<void>;
  isAddingSharedUser: boolean;
  isRemovingSharedUser: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    address: '',
    kennel_name: '',
    phone: '',
    subscription_status: 'active',
    created_at: '',
    updated_at: ''
  },
  sharedUsers: []
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAddingSharedUser, setIsAddingSharedUser] = useState(false);
  const [isRemovingSharedUser, setIsRemovingSharedUser] = useState(false);
  const { user, session } = useAuth();
  
  const loadSharedUsers = async (userId: string) => {
    try {
      const { data: sharedUsersData, error: sharedUsersError } = await supabase
        .from('shared_users')
        .select('*')
        .eq('owner_id', userId);
      
      if (sharedUsersError) throw new Error(sharedUsersError.message);
      
      // Safe access to prevent type issues
      const safeSharedUsers = safeArray(sharedUsersData).map(userData => ({
        id: safeGet(userData, 'id', ''),
        shared_with_id: safeGet(userData, 'shared_with_id', ''),
        role: safeGet(userData, 'role', 'viewer'),
        status: safeGet(userData, 'status', 'pending'),
        created_at: safeGet(userData, 'created_at', ''),
        updated_at: safeGet(userData, 'updated_at', ''),
        owner_id: safeGet(userData, 'owner_id', ''),
      }));
      
      return safeSharedUsers;
    } catch (err) {
      console.error('Error loading shared users:', err);
      return [];
    }
  };

  const refreshSettings = async () => {
    if (!user?.id) {
      setSettings(DEFAULT_SETTINGS);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw new Error(profileError.message);
      
      // Safe profile handling
      const safeProfile: ProfileData = {
        id: safeGet(profileData, 'id', ''),
        email: safeGet(profileData, 'email', ''),
        first_name: safeGet(profileData, 'first_name', ''),
        last_name: safeGet(profileData, 'last_name', ''),
        address: safeGet(profileData, 'address', ''),
        kennel_name: safeGet(profileData, 'kennel_name', ''),
        phone: safeGet(profileData, 'phone', ''),
        subscription_status: safeGet(profileData, 'subscription_status', 'active'),
        created_at: safeGet(profileData, 'created_at', ''),
        updated_at: safeGet(profileData, 'updated_at', '')
      };
      
      // Get shared users
      const sharedUsers = await loadSharedUsers(user.id);
      
      setSettings({
        profile: safeProfile,
        sharedUsers
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProfile = async (profileData: Partial<ProfileData>) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshSettings();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile settings have been updated.'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile settings.',
        variant: 'destructive'
      });
    }
  };
  
  const addSharedUser = async (email: string, role: string) => {
    if (!user?.id) return;
    
    setIsAddingSharedUser(true);
    
    try {
      // First check if user exists by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        if (userError.code === 'PGRST116') {
          throw new Error(`User with email ${email} not found.`);
        }
        throw userError;
      }
      
      const sharedWithId = safeGet(userData, 'id', '');
      if (!sharedWithId) {
        throw new Error('Could not find user with that email');
      }
      
      // Check if user is already shared
      const { data: existingShares, error: sharesError } = await supabase
        .from('shared_users')
        .select('*')
        .eq('owner_id', user.id)
        .eq('shared_with_id', sharedWithId);
      
      if (sharesError) throw sharesError;
      
      if (safeArray(existingShares).length > 0) {
        throw new Error(`You've already shared access with ${email}`);
      }
      
      // Add shared user
      const { error: insertError } = await supabase
        .from('shared_users')
        .insert({
          owner_id: user.id,
          shared_with_id: sharedWithId,
          role,
          status: 'pending'
        });
      
      if (insertError) throw insertError;
      
      // Reload shared users
      await refreshSettings();
      
      toast({
        title: 'Invitation Sent',
        description: `Shared access with ${email} successfully.`
      });
      
    } catch (err) {
      console.error('Error adding shared user:', err);
      toast({
        title: 'Invitation Failed',
        description: err instanceof Error ? err.message : 'Failed to share access.',
        variant: 'destructive'
      });
    } finally {
      setIsAddingSharedUser(false);
    }
  };
  
  const removeSharedUser = async (userId: string) => {
    if (!user?.id) return;
    
    setIsRemovingSharedUser(true);
    
    try {
      const { error } = await supabase
        .from('shared_users')
        .delete()
        .eq('owner_id', user.id)
        .eq('shared_with_id', userId);
      
      if (error) throw error;
      
      // Reload shared users
      await refreshSettings();
      
      toast({
        title: 'User Removed',
        description: 'User access has been removed successfully.'
      });
      
    } catch (err) {
      console.error('Error removing shared user:', err);
      toast({
        title: 'Failed to Remove',
        description: 'An error occurred while removing user access.',
        variant: 'destructive'
      });
    } finally {
      setIsRemovingSharedUser(false);
    }
  };
  
  // Load settings when user changes
  useEffect(() => {
    if (user?.id) {
      refreshSettings();
    }
  }, [user?.id]);
  
  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        refreshSettings,
        updateProfile,
        addSharedUser,
        removeSharedUser,
        isAddingSharedUser,
        isRemovingSharedUser
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
