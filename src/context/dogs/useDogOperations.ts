
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dog, DogDependencies } from '@/types/dogs';
import { DeletionMode } from '@/services/dogs';

interface UseDogOperationsProps {
  updateDogBase: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: {
    (id: string, mode: DeletionMode): Promise<boolean>;
    checkDependencies: (id: string) => Promise<DogDependencies | null>;
  };
  refreshDogs: () => Promise<void>;
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
      
      await refreshDogs();
      
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

  const removeDog = useCallback(async (id: string, mode: DeletionMode = 'soft'): Promise<boolean> => {
    try {
      await deleteDog(id, mode);
      
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

  // Correctly add the checkDependencies method to removeDog
  removeDog.checkDependencies = deleteDog.checkDependencies;

  return { updateDog, removeDog };
};
