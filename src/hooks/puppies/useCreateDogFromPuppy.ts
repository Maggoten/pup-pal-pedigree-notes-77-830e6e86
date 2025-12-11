import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { createDogFromPuppy, CreateDogFromPuppyResult } from '@/services/puppies/createDogFromPuppy';
import { Puppy, Litter } from '@/types/breeding';

export const useCreateDogFromPuppy = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('litters');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createDog = async (puppy: Puppy, litter: Litter): Promise<CreateDogFromPuppyResult> => {
    if (!user) {
      toast({
        title: t('toast.error'),
        description: t('puppies.createDogProfile.errors.notAuthenticated'),
        variant: 'destructive'
      });
      return { success: false, error: 'Not authenticated' };
    }

    if (puppy.status !== 'Kept') {
      toast({
        title: t('toast.error'),
        description: t('puppies.createDogProfile.errors.notKept'),
        variant: 'destructive'
      });
      return { success: false, error: 'Puppy is not marked as Kept' };
    }

    setIsCreating(true);

    try {
      const result = await createDogFromPuppy(puppy, litter, user.id);

      if (result.success && result.dogId) {
        // Invalidate dogs cache so My Dogs page shows the new dog immediately
        await queryClient.invalidateQueries({ queryKey: ['dogs', user.id] });
        
        toast({
          title: t('toast.success'),
          description: t('puppies.createDogProfile.success', { name: puppy.name }),
        });
        // Navigate to the new dog profile after a short delay
        setTimeout(() => {
          navigate(`/my-dogs/${result.dogId}`);
        }, 1500);
      } else {
        toast({
          title: t('toast.error'),
          description: result.error || t('puppies.createDogProfile.errors.failed'),
          variant: 'destructive'
        });
      }

      return result;
    } catch (error) {
      console.error('Error in useCreateDogFromPuppy:', error);
      toast({
        title: t('toast.error'),
        description: t('puppies.createDogProfile.errors.failed'),
        variant: 'destructive'
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDog,
    isCreating
  };
};
