
import { useState, useEffect } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import * as dogService from '@/services/dogService';

export const useDogs = (userId: string | undefined) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDogs = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedDogs = await dogService.fetchDogs(userId);
      setDogs(fetchedDogs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      
      const newDog = await dogService.addDog(dog, userId!);
      
      toast({
        title: "Dog added",
        description: `${dog.name} has been added successfully.`,
      });
      
      await fetchDogs();
      return newDog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error adding dog",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDog = async (id: string, updates: Partial<Dog>) => {
    try {
      setIsLoading(true);
      
      await dogService.updateDog(id, updates);
      
      toast({
        title: "Dog updated",
        description: "Dog information has been updated successfully.",
      });
      
      await fetchDogs();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDog = async (id: string) => {
    try {
      setIsLoading(true);
      
      await dogService.deleteDog(id);
      
      toast({
        title: "Dog removed",
        description: "Dog has been removed successfully.",
      });
      
      await fetchDogs();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: "Error removing dog",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDogs();
    } else {
      setDogs([]);
    }
  }, [userId]);

  return {
    dogs,
    isLoading,
    error,
    fetchDogs,
    addDog,
    updateDog,
    deleteDog
  };
};
