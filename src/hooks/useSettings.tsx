
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { 
  getUserSettings, 
  updateKennelInfo, 
  updatePersonalInfo,
  addSharedUser,
  removeSharedUser
} from '@/services/settingsService';
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
      const data = await getUserSettings(user);
      
      // Transform the data to match our UserSettings interface
      const userSettings: UserSettings = {
        profile: data.profile,
        // Map the sharedUsers array to ensure roles are properly typed
        sharedUsers: data.sharedUsers?.map(user => ({
          ...user,
          // Ensure role is one of the allowed types or default to 'viewer'
          role: (['admin', 'editor', 'viewer'].includes(user.role) 
            ? user.role as 'admin' | 'editor' | 'viewer' 
            : 'viewer'),
          // Ensure status is one of the allowed types or default to 'pending'
          status: (['pending', 'active'].includes(user.status) 
            ? user.status as 'pending' | 'active' 
            : 'pending'),
        })) || [],
        
        // Derive subscription tier from profile.subscription_status
        subscriptionTier: data.profile.subscription_status === 'premium' ? 'premium' :
                        data.profile.subscription_status === 'professional' ? 'professional' : 'free',
        
        // Placeholder for subscription end date - would come from a real subscription system
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Placeholder: 30 days from now
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
    isUpdatingKennel: updateKennelInfoMutation.isPending,
    isUpdatingPersonal: updatePersonalInfoMutation.isPending,
    isAddingSharedUser: addSharedUserMutation.isPending,
    isRemovingSharedUser: removeSharedUserMutation.isPending
  };
};
