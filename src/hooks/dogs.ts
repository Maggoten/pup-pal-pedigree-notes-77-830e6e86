import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { fetchDogs as fetchDogsService, fetchDogsCount } from '@/services/dogs/fetchDogs';
import { addDog as addDogService } from '@/services/dogs/addDog';
import { updateDog as updateDogService } from '@/services/dogs/updateDog';
import { deleteDog as deleteDogService } from '@/services/dogs/deleteDog';
import { queryClient } from '@/utils/reactQueryConfig';

export function useDogs() {
  const { user, isAuthReady } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalDogs, setTotalDogs] = useState(0);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Handle dogs data fetching
  const fetchDogs = useCallback(async (skipCache = false): Promise<Dog[]> => {
    const userId = user?.id;
    
    if (!userId) {
      console.log('[useDogs] No user ID provided, skipping fetch');
      setIsLoading(false);
      return [];
    }

    // Skip duplicate loading unless forced
    if (hasAttemptedLoad && !skipCache) {
      return dogs;
    }

    setHasAttemptedLoad(true);
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useDogs] Loading dogs for user:', userId);
      
      // Use React Query cache if available, otherwise fetch
      const cachedDogs = queryClient.getQueryData<Dog[]>(['dogs', userId]);
      
      if (cachedDogs && !skipCache) {
        console.log('[useDogs] Using cached dogs data:', cachedDogs.length);
        setDogs(cachedDogs);
        setIsLoading(false);
        
        // Still fetch count in background for pagination
        fetchDogsCount(userId)
          .then(count => setTotalDogs(count))
          .catch(err => console.error('[useDogs] Error fetching count:', err));
          
        return cachedDogs;
      }
      
      // Get count first for pagination
      const count = await fetchDogsCount(userId);
      setTotalDogs(count);
      
      // Fixed: change skipCache parameter type to match fetchDogsService signature
      const fetchedDogs = await fetchDogsService(userId, skipCache ? 1 : 0);
      setDogs(fetchedDogs);
      
      // Update the React Query cache
      queryClient.setQueryData(['dogs', userId], fetchedDogs);
      
      console.log('[useDogs] Successfully loaded', fetchedDogs.length, 'dogs');
      setIsLoading(false);
      return fetchedDogs;
    } catch (err) {
      console.error('[useDogs] Error loading dogs:', err);
      setError(err instanceof Error ? err : new Error('Failed to load dogs'));
      
      // Only show toast for non-auth errors 
      const errorMsg = err instanceof Error ? err.message : String(err);
      const isAuthError = ['401', 'auth', 'JWT', 'unauthorized'].some(code => 
        errorMsg.toLowerCase().includes(code.toLowerCase()));
      
      if (!isAuthError) {
        toast({
          title: "Could not load dogs",
          description: errorMsg,
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
      return [];
    }
  }, [dogs, hasAttemptedLoad, user, queryClient]);

  // Add a dog
  const addDog = async (dog: Omit<Dog, 'id' | 'created_at' | 'updated_at'>): Promise<Dog | undefined> => {
    if (!user?.id) {
      console.error('[useDogs] Cannot add dog: No user ID');
      return undefined;
    }
    
    try {
      // Fixed: Change false boolean to correct string parameter (skipCache = "false")
      const newDog = await addDogService(dog, "false");
      
      if (newDog) {
        // Update local state
        setDogs(prev => [...prev, newDog]);
        
        // Update cache
        queryClient.setQueryData(['dogs', user.id], (old: Dog[] = []) => [...old, newDog]);
        
        // Update count
        setTotalDogs(prev => prev + 1);
      }
      
      return newDog;
    } catch (error) {
      console.error('[useDogs] Add dog error:', error);
      throw error;
    }
  };

  // Update a dog
  const updateDog = async (id: string, updates: Partial<Dog>): Promise<Dog | null> => {
    if (!user?.id) {
      console.error('[useDogs] Cannot update dog: No user ID');
      return null;
    }
    
    try {
      const updatedDog = await updateDogService(id, updates);
      
      if (updatedDog) {
        // Update local state
        setDogs(prev => prev.map(dog => dog.id === id ? { ...dog, ...updatedDog } : dog));
        
        // Update cache
        queryClient.setQueryData(['dogs', user.id], (old: Dog[] = []) => 
          old.map(dog => dog.id === id ? { ...dog, ...updatedDog } : dog)
        );
      }
      
      return updatedDog;
    } catch (error) {
      console.error('[useDogs] Update dog error:', error);
      throw error;
    }
  };

  // Delete a dog
  const deleteDog = async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('[useDogs] Cannot delete dog: No user ID');
      return false;
    }
    
    try {
      const success = await deleteDogService(id);
      
      if (success) {
        // Update local state
        setDogs(prev => prev.filter(dog => dog.id !== id));
        
        // Update cache
        queryClient.setQueryData(['dogs', user.id], (old: Dog[] = []) => 
          old.filter(dog => dog.id !== id)
        );
        
        // Update count
        setTotalDogs(prev => Math.max(0, prev - 1));
      }
      
      return success;
    } catch (error) {
      console.error('[useDogs] Delete dog error:', error);
      throw error;
    }
  };

  // Automatic data loading
  useEffect(() => {
    // Only load when auth is ready and we have a user
    if (isAuthReady && user?.id) {
      // Fixed: Changed from string to boolean parameter
      fetchDogs(false).catch(err => {
        console.error('[useDogs] Initial fetch error:', err);
      });
    } else if (isAuthReady && !user) {
      // Auth is ready but no user (logged out)
      setDogs([]);
      setIsLoading(false);
      setHasAttemptedLoad(false);
    }
  }, [isAuthReady, user, fetchDogs]);

  // Add visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id && isAuthReady) {
        console.log('[useDogs] Document became visible, refreshing data');
        // Invalidate React Query cache and reload
        queryClient.invalidateQueries({ queryKey: ['dogs', user.id] });
        // Fixed: Changed to pass true to the skipCache parameter
        fetchDogs(true).catch(err => {
          console.error('[useDogs] Visibility refresh error:', err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchDogs, isAuthReady]);

  return {
    dogs,
    isLoading,
    error,
    refreshDogs: async () => {
      if (!user?.id) return;
      await fetchDogs(true);
    },
    totalDogs,
    fetchDogs,
    addDog,
    updateDog,
    deleteDog
  };
}

// Export as named export
export { useDogs as default };
