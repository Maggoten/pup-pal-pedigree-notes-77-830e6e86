
import { useState, useEffect } from 'react';
import { useDogs } from '@/context/dogs/DogsContext';
import { Dog } from '@/types/dogs';
import { useAuth } from '@/hooks/useAuth';

export interface UseMyDogsOptions {
  genderFilter: 'all' | 'male' | 'female';
  isAuthReady: boolean;
  isLoggedIn: boolean;
}

/**
 * Custom hook to manage MyDogs page data, loading, error states and filters
 */
export const useMyDogs = ({ genderFilter, isAuthReady, isLoggedIn }: UseMyDogsOptions) => {
  console.log('[useMyDogs Debug] Hook initialized with:', { genderFilter, isAuthReady, isLoggedIn });
  
  const { dogs, activeDog, loading, error, fetchDogs } = useDogs();
  console.log('[useMyDogs Debug] Dogs context accessed:', { dogsCount: dogs?.length, loading, hasError: !!error });
  
  const [showAddDogDialog, setShowAddDogDialog] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [showError, setShowError] = useState(false);
  
  // Enhanced delay after auth is ready to avoid premature fetching
  useEffect(() => {
    if (isAuthReady && isLoggedIn) {
      console.log('[useMyDogs Debug] Auth is ready and user is logged in, setting page ready');
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 500); // 500ms delay for stability
      return () => clearTimeout(timer);
    }
  }, [isAuthReady, isLoggedIn]);
  
  // Add visibility change handler to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pageReady) {
        console.log('[useMyDogs Debug] Document became visible, refreshing data');
        fetchDogs(false).catch(err => {
          console.error('[useMyDogs Debug] Error refreshing dogs on visibility change:', err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDogs, pageReady]);
  
  // Add timeout before showing errors to allow recovery
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 2000); // Only show errors after 2 seconds of failure
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [error]);
  
  // Filter dogs based on selected gender, with proper null handling
  const allDogs = dogs ?? [];
  const filteredDogs = genderFilter === 'all' 
    ? allDogs 
    : allDogs.filter(dog => dog.gender === genderFilter);

  console.log('[useMyDogs Debug] Filtered dogs:', filteredDogs.length);

  // Handle retry with incremental backoff
  const retry = () => {
    setRetryAttempts(prev => prev + 1);
    setShowError(false); // Hide error while retrying
    
    const backoffTime = Math.min(500 * Math.pow(1.5, retryAttempts), 3000);
    setTimeout(() => {
      console.log('[useMyDogs Debug] Retrying fetch with skipCache=true');
      fetchDogs(true); // Use skipCache=true to force refresh
    }, backoffTime);
  };

  // Formatting the error message
  const errorMessage = typeof error === 'string' ? error : 'Failed to load dogs';
  const isNetworkError = errorMessage.includes('Failed to fetch') || 
                         errorMessage.includes('Network error') ||
                         errorMessage.includes('timeout');

  return {
    filteredDogs,
    loading: loading || !pageReady || !isAuthReady,
    error: errorMessage,
    showError,
    retry,
    isNetworkError,
    activeDog,
    openAddDialog: showAddDogDialog,
    setOpenAddDialog: setShowAddDogDialog
  };
};

export default useMyDogs;
