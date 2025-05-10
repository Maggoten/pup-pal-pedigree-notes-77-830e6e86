
import { useCallback } from 'react';
import { Dog } from '@/types/dogs';

interface UseDogOperationsProps {
  updateDogBase: (id: string, updates: Partial<Dog>) => Promise<Dog | null>;
  deleteDog: (id: string) => Promise<boolean>;
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
  
  // Update a dog, potentially resetting activeDog if it's the one being updated
  const updateDog = useCallback(async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
    try {
      const updatedDog = await updateDogBase(id, updates);
      
      // If the active dog is the one being updated, update the activeDog as well
      if (activeDog && activeDog.id === id && updatedDog) {
        setActiveDog({ ...activeDog, ...updatedDog });
      }
      
      return updatedDog;
    } catch (error) {
      console.error('Error in updateDog:', error);
      throw error;
    }
  }, [updateDogBase, activeDog, setActiveDog]);
  
  // Delete a dog and clear activeDog if it's the one being deleted
  const removeDog = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await deleteDog(id);
      
      // If the active dog is the one being deleted, clear it
      if (activeDog && activeDog.id === id && result) {
        setActiveDog(null);
      }
      
      // Refresh the dog list after deletion
      if (result) {
        await refreshDogs();
      }
      
      return result;
    } catch (error) {
      console.error('Error in removeDog:', error);
      throw error;
    }
  }, [deleteDog, activeDog, setActiveDog, refreshDogs]);
  
  return {
    updateDog,
    removeDog
  };
};
