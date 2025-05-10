
import { useState, useEffect, useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { fetchDogs, fetchDogsCount } from '@/services/dogs/fetchDogs';
import { queryClient } from '@/utils/reactQueryConfig';

export function useDogs() {
  const { user, isAuthReady } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalDogs, setTotalDogs] = useState(0);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Handle dogs data fetching
  const loadDogs = useCallback(async (userId?: string, forceRefresh = false) => {
    if (!userId) {
      console.log('[useDogs] No user ID provided, skipping fetch');
      setIsLoading(false);
      return;
    }

    // Skip duplicate loading unless forced
    if (hasAttemptedLoad && !forceRefresh) {
      return;
    }

    setHasAttemptedLoad(true);
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useDogs] Loading dogs for user:', userId);
      
      // Use React Query cache if available, otherwise fetch
      const cachedDogs = queryClient.getQueryData<Dog[]>(['dogs', userId]);
      
      if (cachedDogs && !forceRefresh) {
        console.log('[useDogs] Using cached dogs data:', cachedDogs.length);
        setDogs(cachedDogs);
        setIsLoading(false);
        
        // Still fetch count in background for pagination
        fetchDogsCount(userId)
          .then(count => setTotalDogs(count))
          .catch(err => console.error('[useDogs] Error fetching count:', err));
          
        return;
      }
      
      // Get count first for pagination
      const count = await fetchDogsCount(userId);
      setTotalDogs(count);
      
      // Then fetch actual dog data
      const fetchedDogs = await fetchDogs(userId);
      setDogs(fetchedDogs);
      
      // Update the React Query cache
      queryClient.setQueryData(['dogs', userId], fetchedDogs);
      
      console.log('[useDogs] Successfully loaded', fetchedDogs.length, 'dogs');
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
    } finally {
      setIsLoading(false);
    }
  }, [hasAttemptedLoad]);

  // Automatic data loading
  useEffect(() => {
    // Only load when auth is ready and we have a user
    if (isAuthReady && user?.id) {
      loadDogs(user.id);
    } else if (isAuthReady && !user) {
      // Auth is ready but no user (logged out)
      setDogs([]);
      setIsLoading(false);
      setHasAttemptedLoad(false);
    }
  }, [isAuthReady, user, loadDogs]);

  // Add visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id && isAuthReady) {
        console.log('[useDogs] Document became visible, refreshing data');
        // Invalidate React Query cache and reload
        queryClient.invalidateQueries(['dogs', user.id]);
        loadDogs(user.id, true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, loadDogs, isAuthReady]);

  return {
    dogs,
    isLoading,
    error,
    refreshDogs: () => user?.id ? loadDogs(user.id, true) : Promise.resolve(),
    totalDogs
  };
}

// Export as named export
export { useDogs as default };
