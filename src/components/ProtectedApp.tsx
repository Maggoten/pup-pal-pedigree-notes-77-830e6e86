import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import SubscriptionBlockingModal from './subscription/SubscriptionBlockingModal';

interface ProtectedAppProps {
  children: React.ReactNode;
}

const ProtectedApp: React.FC<ProtectedAppProps> = ({ children }) => {
  const { isLoggedIn, isAuthReady, checkSubscription, subscriptionLoading } = useAuth();
  const { hasAccess } = useSubscriptionAccess();

  // Show blocking modal only if:
  // 1. Auth is ready
  // 2. User is logged in 
  // 3. User doesn't have access
  // 4. Subscription check is not loading (to prevent premature modal display)
  const shouldShowBlockingModal = isAuthReady && isLoggedIn && !hasAccess && !subscriptionLoading;

  // Development debugging for modal logic
  if (import.meta.env.DEV) {
    console.log('[ProtectedApp] Modal decision:', {
      isAuthReady,
      isLoggedIn,
      hasAccess,
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