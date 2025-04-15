
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useToast } from '@/components/ui/use-toast';
import * as dogService from '@/services/dogService';

// Simple in-memory cache with shorter duration
const dogCache: Record<string, { data: Dog[], timestamp: number }> = {};
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds (reduced from 5)

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
        return cachedData.data;
      }
      
      console.log('Fetching fresh dog data');
      const fetchedDogs = await dogService.fetchDogs(userId);
      
      // Update cache
      dogCache[cacheKey] = {
        data: fetchedDogs,
        timestamp: Date.now()
      };
      
      setDogs(fetchedDogs);
      setIsInitialLoad(false);
      setIsLoading(false);
      return fetchedDogs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching dogs:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsInitialLoad(false);
      setIsLoading(false);
      return [];
    }
  }, [userId, isInitialLoad, toast]);

  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      
      const newDog = await dogService.addDog(dog, userId!);
      
      // Optimistic update - add to local state first
      setDogs(prevDogs => {
        const updatedDogs = [newDog, ...prevDogs];
        
        // Also update the cache
        const cacheKey = `dogs-${userId}`;
        dogCache[cacheKey] = {
          data: updatedDogs,
          timestamp: Date.now()
        };
        
        return updatedDogs;
      });
      
      toast({
        title: "Dog added",
        description: `${dog.name} has been added successfully.`,
      });
      
      setIsLoading(false);
      return newDog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error adding dog:', errorMessage);
      
      toast({
        title: "Error adding dog",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsLoading(false);
      throw err;
    }
  };

  const updateDog = async (id: string, updates: Partial<Dog>) => {
    try {
      setIsLoading(true);
      
      // Optimistic update - update local state first
      const dogToUpdate = dogs.find(dog => dog.id === id);
      if (dogToUpdate) {
        const updatedDog = { ...dogToUpdate, ...updates };
        
        // Update local state
        const updatedDogs = dogs.map(dog => 
          dog.id === id ? updatedDog : dog
        );
        
        setDogs(updatedDogs);
        
        // Also update the cache
        const cacheKey = `dogs-${userId}`;
        if (dogCache[cacheKey]) {
          dogCache[cacheKey] = {
            data: updatedDogs,
            timestamp: Date.now()
          };
        }
      }
      
      // Then perform the actual update
      const result = await dogService.updateDog(id, updates);
      
      toast({
        title: "Dog updated",
        description: "Dog information has been updated successfully.",
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error updating dog:', errorMessage);
      
      // Revert optimistic update by fetching fresh data
      await fetchDogs(true);
      
      toast({
        title: "Error updating dog",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsLoading(false);
      return false;
    }
  };

  const deleteDog = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Optimistic delete - remove from local state first
      const updatedDogs = dogs.filter(dog => dog.id !== id);
      setDogs(updatedDogs);
      
      // Also update the cache
      const cacheKey = `dogs-${userId}`;
      if (dogCache[cacheKey]) {
        dogCache[cacheKey] = {
          data: updatedDogs,
          timestamp: Date.now()
        };
      }
      
      // Then perform the actual delete
      await dogService.deleteDog(id);
      
      toast({
        title: "Dog removed",
        description: "Dog has been removed successfully.",
      });
      
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error removing dog:', errorMessage);
      
      // Revert optimistic delete by fetching fresh data
      await fetchDogs(true);
      
      toast({
        title: "Error removing dog",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsLoading(false);
      return false;
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
