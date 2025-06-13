import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import SubscriptionBlockingModal from './subscription/SubscriptionBlockingModal';

interface ProtectedAppProps {
  children: React.ReactNode;
}

const ProtectedApp: React.FC<ProtectedAppProps> = ({ children }) => {
  const { isLoggedIn, isAuthReady, hasAccess, accessCheckComplete, checkSubscription, subscriptionLoading } = useAuth();

  // Show blocking modal only if:
  // 1. Auth is ready
  // 2. User is logged in 
  // 3. Access check is complete (prevents premature modal display)
  // 4. User explicitly doesn't have access (hasAccess === false, not just falsy/null)
  // 5. Subscription check is not loading
  const shouldShowBlockingModal = isAuthReady && isLoggedIn && accessCheckComplete && hasAccess === false && !subscriptionLoading;

  // Development debugging for modal logic
  if (import.meta.env.DEV) {
    console.log('[ProtectedApp] Sequential Access Modal Decision:', {
      isAuthReady,
      isLoggedIn,
      hasAccess,
      accessCheckComplete,
      subscriptionLoading,
      shouldShowBlockingModal,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <>
      {children}
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