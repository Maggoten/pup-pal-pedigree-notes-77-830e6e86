import { useAuth } from '@/providers/AuthProvider';
import { useMemo } from 'react';

export interface SubscriptionAccessInfo {
  hasAccess: boolean;
  subscriptionStatus: string | null;
  trialEndDate: string | null;
  currentPeriodEnd: string | null;
  hasPaid: boolean;
  friend: boolean;
  daysRemaining: number | null;
  isTrialActive: boolean;
  isExpired: boolean;
}

export const useSubscriptionAccess = (): SubscriptionAccessInfo => {
  const {
    hasAccess,
    subscriptionStatus,
    trialEndDate,
    currentPeriodEnd,
    hasPaid,
    friend,
    checkSubscription
  } = useAuth();

  const subscriptionInfo = useMemo(() => {
    const now = new Date();
    const trialEnd = trialEndDate ? new Date(trialEndDate) : null;
    
    let daysRemaining: number | null = null;
    let isTrialActive = false;
    let isExpired = false;

    if (trialEnd) {
      const timeDiff = trialEnd.getTime() - now.getTime();
      daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      isTrialActive = subscriptionStatus === 'trial' && daysRemaining > 0;
      isExpired = daysRemaining <= 0 && !hasPaid && !friend;
    }

    // Development logging to debug access issues
    if (import.meta.env.DEV) {
      console.log('[useSubscriptionAccess] Using AuthProvider hasAccess value:', {
        friend,
        hasPaid,
        subscriptionStatus,
        trialEndDate,
        authProviderHasAccess: hasAccess
      });
    }

    return {
      hasAccess, // Use AuthProvider's hasAccess value directly
      subscriptionStatus,
      trialEndDate,
      currentPeriodEnd,
      hasPaid,
      friend,
      daysRemaining,
      isTrialActive,
      isExpired
    };
  }, [hasAccess, subscriptionStatus, trialEndDate, currentPeriodEnd, hasPaid, friend]);

  return subscriptionInfo;
};