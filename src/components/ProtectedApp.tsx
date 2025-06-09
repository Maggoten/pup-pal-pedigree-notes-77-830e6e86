import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import SubscriptionBlockingModal from './subscription/SubscriptionBlockingModal';

interface ProtectedAppProps {
  children: React.ReactNode;
}

const ProtectedApp: React.FC<ProtectedAppProps> = ({ children }) => {
  const { isLoggedIn, isAuthReady, checkSubscription } = useAuth();
  const { hasAccess } = useSubscriptionAccess();

  // Show blocking modal if user is logged in but doesn't have access
  const shouldShowBlockingModal = isAuthReady && isLoggedIn && !hasAccess;

  // Development debugging for modal logic
  if (import.meta.env.DEV) {
    console.log('[ProtectedApp] Modal decision:', {
      isAuthReady,
      isLoggedIn,
      hasAccess,
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