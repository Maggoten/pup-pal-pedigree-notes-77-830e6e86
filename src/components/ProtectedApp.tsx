import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import SubscriptionBlockingModal from './subscription/SubscriptionBlockingModal';
import { Button } from '@/components/ui/button';

interface ProtectedAppProps {
  children: React.ReactNode;
}

const ProtectedApp: React.FC<ProtectedAppProps> = ({ children }) => {
  const { isLoggedIn, isAuthReady, hasAccess, accessCheckComplete, isAccessChecking, checkSubscription, subscriptionLoading } = useAuth();
  
  // State for timeout protection and UX improvements
  const [accessCheckTimeout, setAccessCheckTimeout] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showSkipButton, setShowSkipButton] = useState(false);

  // Improved modal logic - don't show modal while still checking access
  const shouldShowBlockingModal = isAuthReady && isLoggedIn && hasAccess === false && accessCheckComplete && !accessCheckTimeout;

  // Show loading state when access is being checked OR when auth is ready but access check not complete
  // But hide it if timeout occurred
  const shouldShowLoadingState = isLoggedIn && (isAccessChecking || (isAuthReady && !accessCheckComplete)) && !accessCheckTimeout;

  // Loading step progression for better UX
  useEffect(() => {
    if (shouldShowLoadingState) {
      const steps = [
        'Authenticating...',
        'Checking subscription...',
        'Verifying access...',
        'Almost ready...'
      ];
      
      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        stepIndex = (stepIndex + 1) % steps.length;
        setLoadingStep(stepIndex);
      }, 1500);

      // Show skip button after 10 seconds
      const skipTimer = setTimeout(() => {
        setShowSkipButton(true);
      }, 10000);

      // Timeout protection - auto-complete after 15 seconds
      const timeoutTimer = setTimeout(() => {
        console.warn('[ProtectedApp] Access check timeout - forcing completion');
        setAccessCheckTimeout(true);
        setShowSkipButton(false);
      }, 15000);

      return () => {
        clearInterval(stepInterval);
        clearTimeout(skipTimer);
        clearTimeout(timeoutTimer);
      };
    } else {
      // Reset timeout state when not loading
      setAccessCheckTimeout(false);
      setShowSkipButton(false);
      setLoadingStep(0);
    }
  }, [shouldShowLoadingState]);

  // Development debugging for modal logic
  if (import.meta.env.DEV) {
    console.log('[ProtectedApp] Access Control State:', {
      isAuthReady,
      isLoggedIn,
      hasAccess,
      accessCheckComplete,
      isAccessChecking,
      subscriptionLoading,
      shouldShowBlockingModal,
      shouldShowLoadingState,
      accessCheckTimeout,
      showSkipButton,
      timestamp: new Date().toISOString()
    });
  }

  // Handle skip button click
  const handleSkipCheck = () => {
    console.log('[ProtectedApp] User manually skipped access check');
    setAccessCheckTimeout(true);
    setShowSkipButton(false);
  };

  // Loading messages for better UX
  const loadingMessages = [
    'Authenticating...',
    'Checking subscription...',
    'Verifying access...',
    'Almost ready...'
  ];

  return (
    <>
      {children}
      
      {/* Enhanced access checking loading overlay */}
      {shouldShowLoadingState && (
        <div className="fixed inset-0 bg-warmbeige-50/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 border border-warmbeige-200">
            <div className="text-center space-y-4">
              {/* Progress indicator */}
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-warmgreen-600 border-t-transparent"></div>
                <span className="text-brown-700 font-medium">{loadingMessages[loadingStep]}</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-warmbeige-200 rounded-full h-2">
                <div 
                  className="bg-warmgreen-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                ></div>
              </div>
              
              {/* Skip button after 10 seconds */}
              {showSkipButton && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSkipCheck}
                    className="text-sm"
                  >
                    Skip check and continue
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Taking longer than expected? Skip to continue.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <SubscriptionBlockingModal isOpen={shouldShowBlockingModal} />
      
      {/* Development manual refresh button */}
      {import.meta.env.DEV && isLoggedIn && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              console.log('[ProtectedApp] Manual subscription check triggered');
              checkSubscription();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700"
          >
            🔄 Check Access
          </button>
        </div>
      )}
    </>
  );
};

export default ProtectedApp;