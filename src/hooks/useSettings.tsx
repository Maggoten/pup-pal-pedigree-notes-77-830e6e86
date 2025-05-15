
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ProfileData, SharedUser, UserSettings } from '@/types/settings';
import { toast } from '@/hooks/use-toast';
import { convertToProfileData, processSharedUsers } from '@/utils/supabaseProfileUtils';

// Create a context type with all the required properties
export interface SettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  deleteAccount: (password: string) => Promise<boolean>;
  cancelSubscription: () => Promise<void>;
  isCancellingSubscription: boolean;
  isDeletingAccount: boolean;
  updatePersonalInfo: (info: { firstName: string; lastName: string }) => Promise<void>;
  updateKennelInfo: (info: { kennelName: string; address?: string; website?: string; phone?: string }) => Promise<void>;
  isUpdatingPersonal: boolean;
  isUpdatingKennel: boolean;
  addSharedUser: (email: string, role: string) => Promise<void>;
  removeSharedUser: (userId: string) => Promise<void>;
  isAddingSharedUser: boolean;
  isRemovingSharedUser: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Additional state for operations
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState<boolean>(false);
  const [isUpdatingPersonal, setIsUpdatingPersonal] = useState<boolean>(false);
  const [isUpdatingKennel, setIsUpdatingKennel] = useState<boolean>(false);
  const [isAddingSharedUser, setIsAddingSharedUser] = useState<boolean>(false);
  const [isRemovingSharedUser, setIsRemovingSharedUser] = useState<boolean>(false);
  
  // Load settings when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserSettings(user.id);
    } else {
      setSettings(null);
      setIsLoading(false);
    }
  }, [user?.id]);
  
  const loadUserSettings = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw new Error(`Error loading profile: ${profileError.message}`);
      }
      
      const profile = convertToProfileData(profileData);
      if (!profile) {
        throw new Error('Could not load profile data');
      }
      
      // Load shared users
      const { data: sharedUsersData, error: sharedUsersError } = await supabase
        .from('shared_users')
        .select('*')
        .eq('owner_id', userId);
      
      if (sharedUsersError) {
        throw new Error(`Error loading shared users: ${sharedUsersError.message}`);
      }
      
      // Process shared users safely
      const sharedUsers = processSharedUsers(sharedUsersData || []);
      
      // Set the subscription tier based on the profile subscription status
      const subscriptionTier = profile.subscription_status === 'professional' 
        ? 'professional' 
        : profile.subscription_status === 'premium' 
          ? 'premium' 
          : 'free';
      
      // Set user settings
      setSettings({
        profile,
        sharedUsers,
        subscriptionTier,
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Mock 30 days from now
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading settings');
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Implementation for deleting an account
  const deleteAccount = async (password: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setIsDeletingAccount(true);
      
      // 1. Verify the password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password
      });
      
      if (signInError) {
        toast({
          title: "Password verification failed",
          description: "Please check your password and try again",
          variant: "destructive"
        });
        return false;
      }
      
      // 2. Call a delete account function
      const { error: deleteError } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });
      
      if (deleteError) {
        toast({
          title: "Error deleting account",
          description: deleteError.message || "An error occurred during account deletion",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted. You'll be logged out now.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeletingAccount(false);
    }
  };
  
  // Implementation for cancelling a subscription 
  const cancelSubscription = async () => {
    if (!user) return;
    
    try {
      setIsCancellingSubscription(true);
      
      // In a real implementation, this would call a serverless function to cancel the subscription
      // For now, we'll just update the profile's subscription status
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'cancelled' })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        
        const updatedProfile = {
          ...prev.profile,
          subscription_status: 'cancelled'
        };
        
        return {
          ...prev,
          profile: updatedProfile,
          subscriptionTier: 'free'
        };
      });
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled but will remain active until the end of the billing period.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setIsCancellingSubscription(false);
    }
  };
  
  // Implementation for updating personal info
  const updatePersonalInfo = async (info: { firstName: string; lastName: string }) => {
    if (!user) return;
    
    try {
      setIsUpdatingPersonal(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: info.firstName,
          last_name: info.lastName
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          profile: {
            ...prev.profile,
            first_name: info.firstName,
            last_name: info.lastName
          }
        };
      });
      
      toast({
        title: "Profile Updated",
        description: "Your personal information has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPersonal(false);
    }
  };
  
  // Implementation for updating kennel info
  const updateKennelInfo = async (info: { 
    kennelName: string; 
    address?: string; 
    website?: string; 
    phone?: string 
  }) => {
    if (!user) return;
    
    try {
      setIsUpdatingKennel(true);
      
      const updateData: Record<string, any> = {
        kennel_name: info.kennelName
      };
      
      if (info.address !== undefined) updateData.address = info.address;
      if (info.phone !== undefined) updateData.phone = info.phone;
      // Website would need a new column in the profiles table
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          profile: {
            ...prev.profile,
            kennel_name: info.kennelName,
            ...(info.address !== undefined ? { address: info.address } : {}),
            ...(info.phone !== undefined ? { phone: info.phone } : {}),
          }
        };
      });
      
      toast({
        title: "Kennel Information Updated",
        description: "Your kennel information has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update kennel information",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingKennel(false);
    }
  };
  
  // Implementation for adding a shared user
  const addSharedUser = async (email: string, role: string) => {
    if (!user) return;
    
    try {
      setIsAddingSharedUser(true);
      
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        if (userError.code === 'PGRST116') {
          toast({
            title: "User not found",
            description: "No user with that email address was found.",
            variant: "destructive"
          });
        } else {
          throw userError;
        }
        return;
      }
      
      // Then create the shared user record
      const { error: shareError } = await supabase
        .from('shared_users')
        .insert({
          owner_id: user.id,
          shared_with_id: userData.id,
          role: role,
          status: 'pending'
        });
      
      if (shareError) {
        if (shareError.code === '23505') { // Unique constraint violated
          toast({
            title: "Already shared",
            description: "You've already shared your account with this user.",
            variant: "destructive"
          });
        } else {
          throw shareError;
        }
        return;
      }
      
      // Refresh settings to get the updated shared users list
      loadUserSettings(user.id);
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to share your account",
        variant: "destructive"
      });
    } finally {
      setIsAddingSharedUser(false);
    }
  };
  
  // Implementation for removing a shared user
  const removeSharedUser = async (userId: string) => {
    if (!user) return;
    
    try {
      setIsRemovingSharedUser(true);
      
      const { error } = await supabase
        .from('shared_users')
        .delete()
        .match({
          owner_id: user.id,
          shared_with_id: userId
        });
      
      if (error) throw error;
      
      // Update local state
      setSettings(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          sharedUsers: prev.sharedUsers.filter(u => u.shared_with_id !== userId)
        };
      });
      
      toast({
        title: "User removed",
        description: "The user has been removed from your shared users list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove user",
        variant: "destructive"
      });
    } finally {
      setIsRemovingSharedUser(false);
    }
  };
  
  return (
    <SettingsContext.Provider 
      value={{
        settings,
        isLoading,
        error,
        deleteAccount,
        cancelSubscription,
        isCancellingSubscription,
        isDeletingAccount,
        updatePersonalInfo,
        updateKennelInfo,
        isUpdatingPersonal,
        isUpdatingKennel,
        addSharedUser,
        removeSharedUser,
        isAddingSharedUser,
        isRemovingSharedUser,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};
