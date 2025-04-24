
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dog } from '@/types/dogs';

// Update parameter type to match the fetchDogs function with correct return type
export const useForceReload = (userId: string | undefined, fetchDogs: (skipCache?: boolean) => Promise<Dog[]>) => {
  const { toast } = useToast();

  return useCallback(async () => {
    if (userId) {
      try {
        await fetchDogs(true);
        toast({
          title: "Refreshed",
          description: "Dog data has been refreshed from the server."
        });
      } catch (e) {
        console.error('Force reload failed:', e);
        toast({
          title: "Refresh failed",
          description: "Could not refresh data. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [userId, fetchDogs, toast]);
};
