
import React, { useState, useEffect } from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import { Skeleton } from '@/components/ui/skeleton';
import MyLittersContent from '@/components/litters/MyLittersContent';
import PageLayout from '@/components/PageLayout';
import { PawPrint, AlertCircle, Loader2, RefreshCcw, WifiOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import useLitterQueries from '@/hooks/litters/queries/useLitterQueries';
import { isMobileDevice } from '@/utils/fetchUtils';
import { useConnectionStore } from '@/utils/connectionStatus';
import { trackAuthenticatedPath } from '@/components/AuthGuard';

const MyLittersLoading = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-12 w-64" />
    <Skeleton className="h-6 w-96" />
    <div className="mt-8 space-y-6">
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const MyLitters: React.FC = () => {
  const [contentLoading, setContentLoading] = useState(true);
  const { isAuthReady } = useAuth();
  const { isError, error, refreshLitters, manualRefresh, isOffline, hasCachedData } = useLitterQueries();
  const [showError, setShowError] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = isMobileDevice();
  const { isOnline } = useConnectionStore();
  
  // Track this path for authentication returns
  useEffect(() => {
    trackAuthenticatedPath('/my-litters');
  }, []);
  
  // Effect to simulate the content loading (replacing Suspense behavior)
  useEffect(() => {
    // Shorter timeout for mobile devices to improve perceived performance
    const timeout = isMobile ? 100 : 200;
    
    // Small timeout to simulate dynamic import load time
    const timer = setTimeout(() => {
      setContentLoading(false);
    }, timeout);
    return () => clearTimeout(timer);
  }, [isMobile]);
  
  // Add visibility change handler to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthReady && isOnline) {
        console.log('MyLitters: Document became visible, refreshing data');
        refreshLitters().catch(err => {
          console.error('Error refreshing litters on visibility change:', err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshLitters, isAuthReady, isOnline]);
  
  // Add timeout before showing errors to allow recovery
  useEffect(() => {
    if (isError) {
      const timer = setTimeout(() => {
        setShowError(true);
      }, 2000); // Only show errors after 2 seconds of failure
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [isError]);
  
  // Handle retry with incremental backoff
  const handleRetry = () => {
    setRetryAttempt(prev => prev + 1);
    setShowError(false);
    
    const backoffTime = Math.min(500 * Math.pow(1.5, retryAttempt), 3000);
    setTimeout(() => {
      refreshLitters();
    }, backoffTime);
  };
  
  // Force refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await manualRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle error state display
  const errorMessage = error instanceof Error ? error.message : 'Failed to load litters';
  const isNetworkError = errorMessage.includes('Failed to fetch') || 
                        errorMessage.includes('Network error') ||
                        errorMessage.includes('timeout');

  return (
    <PageLayout 
      title="My Litters" 
      description="Manage your litter records and puppies" 
      icon={<PawPrint className="h-6 w-6" />}
      className="bg-warmbeige-50/50"
    >
      {/* Offline indicator */}
      {isOffline && (
        <Alert variant="warning" className="mb-4 bg-amber-50 border border-amber-200">
          <WifiOff className="h-4 w-4 mr-2 text-amber-500" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>You're currently offline. {hasCachedData ? 'Using cached data.' : 'Some features may be limited.'}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="ml-2 bg-white"
            >
              Check Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error message */}
      {isError && showError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>{isNetworkError ? 
              'Network connection problem. Please check your internet connection.' : 
              errorMessage}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="ml-2 bg-white"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Mobile-specific refresh button */}
      {(isMobile || isOffline) && (
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing || contentLoading || !isAuthReady || !isOnline}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                <span>Refresh</span>
              </>
            )}
          </Button>
        </div>
      )}
      
      <LitterFilterProvider>
        {contentLoading || !isAuthReady ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-muted-foreground">
              {!isAuthReady ? "Preparing connection..." : "Loading litter data..."}
            </p>
          </div>
        ) : (
          <MyLittersContent />
        )}
      </LitterFilterProvider>
    </PageLayout>
  );
};

export default MyLitters;
