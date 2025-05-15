
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { 
  getUserSettings, 
  updateKennelInfo, 
  updatePersonalInfo,
  addSharedUser,
  removeSharedUser,
  cancelSubscription
} from '@/services/settingsService';
import { deleteUserAccount } from '@/services/authService';
import { KennelInfo, UserSettings, SharedUser } from '@/types/settings';
import { toast } from '@/components/ui/use-toast';

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user settings
  const { 
    data: settings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['settings', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      
      const data = await getUserSettings(user);
      
      // Initialize with empty or default values if data is missing
      const profileData = data?.profile || {
        id: '',
        email: '',
        first_name: null,
        last_name: null,
        kennel_name: null,
        address: null,
        phone: null,
        created_at: null,
        updated_at: null,
        subscription_status: 'free'
      };
      
      // Safely process shared users
      const sharedUsers = Array.isArray(data?.sharedUsers) 
        ? data.sharedUsers.map(user => {
            // Ensure each user has valid required properties
            return {
              id: user?.id || '',
              shared_with_id: user?.shared_with_id || '',
              role: (['admin', 'editor', 'viewer'].includes(user?.role) 
                ? user.role as 'admin' | 'editor' | 'viewer' 
                : 'viewer'),
              status: (['pending', 'active'].includes(user?.status) 
                ? user.status as 'pending' | 'active' 
                : 'pending'),
              created_at: user?.created_at || '',
              updated_at: user?.updated_at || '',
              owner_id: user?.owner_id || ''
            };
          })
        : [];
      
      // Safely determine subscription tier
      const subscriptionTier = 
        profileData.subscription_status === 'premium' ? 'premium' :
        profileData.subscription_status === 'professional' ? 'professional' : 'free';
      
      // Construct the final settings object
      const userSettings: UserSettings = {
        profile: profileData,
        sharedUsers: sharedUsers,
        subscriptionTier: subscriptionTier,
        // Placeholder for subscription end date
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
      
      return userSettings;
    },
    enabled: !!user?.email,
  });
  
  // Update kennel info
  const updateKennelInfoMutation = useMutation({
    mutationFn: (kennelInfo: KennelInfo) => updateKennelInfo(user, kennelInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.email] });
      toast({
        title: "Kennel information updated",
        description: "Your kennel information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update kennel information",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Update personal info
  const updatePersonalInfoMutation = useMutation({
    mutationFn: (personalInfo: { firstName: string; lastName: string }) => 
      updatePersonalInfo(user, personalInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.email] });
      toast({
        title: "Personal information updated",
        description: "Your personal information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update personal information",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Add shared user
  const addSharedUserMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'admin' | 'editor' | 'viewer' }) => 
      addSharedUser(user, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.email] });
      toast({
        title: "User invited",
        description: "An invitation has been sent to the user.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to invite user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Remove shared user
  const removeSharedUserMutation = useMutation({
    mutationFn: (sharedUserId: string) => removeSharedUser(user, sharedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.email] });
      toast({
        title: "User removed",
        description: "The user has been removed from your shared accounts.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => cancelSubscription(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.email] });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled. You'll still have access until the end of your billing period.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel subscription",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => deleteUserAccount(password),
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been deleted. You will be logged out shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete account",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateKennelInfo: (kennelInfo: KennelInfo) => updateKennelInfoMutation.mutate(kennelInfo),
    updatePersonalInfo: (personalInfo: { firstName: string; lastName: string }) => 
      updatePersonalInfoMutation.mutate(personalInfo),
    addSharedUser: (email: string, role: 'admin' | 'editor' | 'viewer') => 
      addSharedUserMutation.mutate({ email, role }),
    removeSharedUser: (sharedUserId: string) => removeSharedUserMutation.mutate(sharedUserId),
    cancelSubscription: () => cancelSubscriptionMutation.mutate(),
    deleteAccount: (password: string): Promise<boolean> => {
      return deleteAccountMutation.mutateAsync(password);
    },
    isUpdatingKennel: updateKennelInfoMutation.isPending,
    isUpdatingPersonal: updatePersonalInfoMutation.isPending,
    isAddingSharedUser: addSharedUserMutation.isPending,
    isRemovingSharedUser: removeSharedUserMutation.isPending,
    isCancellingSubscription: cancelSubscriptionMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending
  };
};
