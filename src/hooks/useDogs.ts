
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import * as dogService from '@/services/dogService';

// Simple in-memory cache
const dogCache: Record<string, { data: Dog[], timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useDogs = (userId: string | undefined) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDogs = useCallback(async (skipCache = false) => {
    if (!userId) return;
    
    // First loading state is different from refresh loading state
    if (isInitialLoad) {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      // Check cache first if not explicitly skipping
      const cacheKey = `dogs-${userId}`;
      const cachedData = dogCache[cacheKey];
      const now = Date.now();
      
      if (!skipCache && cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
        console.log('Using cached dog data');
        setDogs(cachedData.data);
        setIsInitialLoad(false);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching fresh dog data');
      const fetchedDogs = await dogService.fetchDogs(userId);
      
      // Update cache
      dogCache[cacheKey] = {
        data: fetchedDogs,
        timestamp: Date.now()
      };
      
      setDogs(fetchedDogs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching dogs:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsInitialLoad(false);
      setIsLoading(false);
    }
  }, [userId, isInitialLoad, toast]);

  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      
      const newDog = await dogService.addDog(dog, userId!);
      
      toast({
        title: "Dog added",
        description: `${dog.name} has been added successfully.`,
      });
      
      // Force a fresh fetch to update the list
      await fetchDogs(true);
      return newDog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error adding dog:', errorMessage);
      
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
      
      // Force a fresh fetch to update the list
      await fetchDogs(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error updating dog:', errorMessage);
      
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
      
      // Force a fresh fetch to update the list
      await fetchDogs(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error removing dog:', errorMessage);
      
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

  // Add a refresh function that skips cache
  const refreshDogs = useCallback(() => {
    return fetchDogs(true);
  }, [fetchDogs]);

  useEffect(() => {
    if (userId) {
      fetchDogs();
    } else {
      setDogs([]);
      setIsInitialLoad(false);
    }
  }, [userId, fetchDogs]);

  return {
    dogs,
    isLoading,
    error,
    fetchDogs: refreshDogs, // Use the skip-cache version for refreshDogs
    addDog,
    updateDog,
    deleteDog
  };
};
