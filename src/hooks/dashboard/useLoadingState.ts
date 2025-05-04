
import { useState, useEffect } from 'react';

interface LoadingStateProps {
  dogsLoading: boolean;
  remindersLoading: boolean;
  calendarLoading: boolean;
  littersLoaded: boolean;
}

export const useLoadingState = ({
  dogsLoading,
  remindersLoading,
  calendarLoading,
  littersLoaded
}: LoadingStateProps) => {
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState<boolean>(false);

  // Controlled data loading with transition delay
  useEffect(() => {
    if (!initialLoadAttempted) {
      // Mark that we have attempted loading initially
      setInitialLoadAttempted(true);
      console.log("Initial load attempted");
    }
    
    // Set data as ready when:
    // 1. Reminders are no longer loading AND calendar is no longer loading
    // 2. OR we've attempted to load at least once and litters are loaded
    const dataIsReady = (!remindersLoading && !calendarLoading) || 
                        (initialLoadAttempted && littersLoaded && !dogsLoading);
                        
    if (dataIsReady && !isDataReady) {
      console.log("Data is ready, transitioning to ready state");
      // Set a moderate delay for stable transition
      const timer = setTimeout(() => {
        setIsDataReady(true);
        console.log("Dashboard data is now ready");
      }, 300);
      
      // Clear timeout on cleanup
      return () => clearTimeout(timer);
    }

    // Force ready state after 3 seconds in case loading states get stuck
    if (!isDataReady && initialLoadAttempted) {
      const forceReadyTimer = setTimeout(() => {
        if (!isDataReady) {
          console.log("Forcing dashboard ready state after timeout");
          setIsDataReady(true);
        }
      }, 3000);

      return () => clearTimeout(forceReadyTimer);
    }
  }, [remindersLoading, calendarLoading, littersLoaded, initialLoadAttempted, isDataReady, dogsLoading]);

  // Log data load state
  useEffect(() => {
    console.log("Dashboard data load state:", {
      dogsLoading,
      remindersLoading,
      calendarLoading,
      littersLoaded,
      initialLoadAttempted,
      isDataReady
    });
  }, [dogsLoading, remindersLoading, calendarLoading, littersLoaded, initialLoadAttempted, isDataReady]);

  return {
    isDataReady,
    initialLoadAttempted
  };
};
