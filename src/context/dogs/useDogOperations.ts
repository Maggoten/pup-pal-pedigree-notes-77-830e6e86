
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dog } from '@/types/dogs';

interface UseDogOperationsProps {
  updateDogBase: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: (id: string) => Promise<boolean>;
  refreshDogs: (skipCache?: boolean) => Promise<Dog[]>; // Updated to match the actual return type
  activeDog: Dog | null;
  setActiveDog: (dog: Dog | null) => void;
}

export const useDogOperations = ({
  updateDogBase,
  deleteDog,
  refreshDogs,
  activeDog,
  setActiveDog
}: UseDogOperationsProps) => {
  const { toast } = useToast();

  const updateDog = useCallback(async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
    try {
      if (!id) {
        throw new Error("Invalid dog ID provided");
      }
      
      const updatedDog = await updateDogBase(id, updates);
      
      if (updatedDog && activeDog?.id === id) {
        setActiveDog(updatedDog);
      }
      
      await refreshDogs(); // This now returns Dog[] but we don't need to use the result
      
      return updatedDog;
    } catch (e) {
      console.error('Error updating dog:', e);
      toast({
        title: "Update failed",
        description: "Could not update dog information. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [updateDogBase, activeDog, setActiveDog, refreshDogs, toast]);

  const removeDog = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteDog(id);
      
      if (activeDog?.id === id) {
        setActiveDog(null);
      }
      
      return true;
    } catch (e) {
      console.error('Error removing dog:', e);
      toast({
        title: "Remove failed",
        description: "Could not remove dog. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [deleteDog, activeDog, setActiveDog, toast]);

  return { updateDog, removeDog };
};
