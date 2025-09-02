import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import SubscriptionBlockingModal from './subscription/SubscriptionBlockingModal';

interface ProtectedAppProps {
  children: React.ReactNode;
}

const ProtectedApp: React.FC<ProtectedAppProps> = ({ children }) => {
  const { isLoggedIn, isAuthReady, hasAccess, accessCheckComplete, isAccessChecking, checkSubscription, subscriptionLoading } = useAuth();

  // Simplified modal display logic - core requirements only
  const shouldShowBlockingModal = isAuthReady && isLoggedIn && hasAccess === false;

  // Show loading state when access is being checked
  const shouldShowLoadingState = isLoggedIn && isAccessChecking && !accessCheckComplete;

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
      timestamp: new Date().toISOString()
    });
  }

  return (
    <>
      {children}
      
      {/* Access checking loading overlay */}
      {shouldShowLoadingState && (
        <div className="fixed inset-0 bg-warmbeige-50/80 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 border border-warmbeige-200">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-warmgreen-600 border-t-transparent"></div>
              <span className="text-brown-700 font-medium">Checking access...</span>
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