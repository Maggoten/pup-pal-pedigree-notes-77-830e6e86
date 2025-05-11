
import { useCallback, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { refreshSession, verifySession } from '@/utils/auth/sessionManager';

/**
 * Hook to manage session check intervals and activity tracking
 */
export function useSessionManager(session: Session | null, isAuthReady: boolean) {
  // Track focus & visibility state
  const [isActive, setIsActive] = useState(true);
  const lastActiveTime = useRef(Date.now());
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Helper to check if a session is expired or near expiry
   */
  const isSessionExpiredOrNearExpiry = useCallback((
    currentSession: Session | null, 
    options?: { ignoreAuthReady?: boolean }
  ): boolean => {
    // Do not perform expiry checks until auth is ready, unless explicitly overridden
    if (!options?.ignoreAuthReady && !isAuthReady) {
      console.log('[Auth Debug] Skipping expiry check as auth is not ready yet');
      return false;
    }
    
    if (!currentSession || !currentSession.expires_at) return true;
    
    // Convert expires_at to milliseconds
    const expiryTime = currentSession.expires_at * 1000;
    const now = Date.now();
    
    // Check if expired or within 5 minutes of expiry
    const fiveMinutesMs = 5 * 60 * 1000;
    const isExpiring = now >= expiryTime - fiveMinutesMs;
    
    if (isExpiring) {
      console.log('[Auth Debug] Session is expired or near expiry', {
        now: new Date(now).toISOString(),
        expiry: new Date(expiryTime).toISOString(),
        timeLeft: (expiryTime - now) / 1000 / 60 + ' minutes'
      });
    }
    
    return isExpiring;
  }, [isAuthReady]);
  
  /**
   * Clear any active session check intervals
   */
  const clearSessionIntervals = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
      console.log('[Auth Debug] Cleared session check interval');
    }
  }, []);
  
  return {
    isActive,
    setIsActive,
    lastActiveTime,
    sessionCheckInterval,
    isSessionExpiredOrNearExpiry,
    clearSessionIntervals
  };
}
