import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import SubscriptionBlockingModal from './subscription/SubscriptionBlockingModal';

interface ProtectedAppProps {
  children: React.ReactNode;
}

const ProtectedApp: React.FC<ProtectedAppProps> = ({ children }) => {
  const { isLoggedIn, isAuthReady } = useAuth();
  const { hasAccess } = useSubscriptionAccess();

  // Show blocking modal if user is logged in but doesn't have access
  const shouldShowBlockingModal = isAuthReady && isLoggedIn && !hasAccess;

  return (
    <>
      {children}
      <SubscriptionBlockingModal isOpen={shouldShowBlockingModal} />
    </>
  );
};

export default ProtectedApp;