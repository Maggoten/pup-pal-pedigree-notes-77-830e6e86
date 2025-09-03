import { useState, useEffect } from 'react';

interface UseAccessTimeoutOptions {
  isChecking: boolean;
  timeoutMs?: number;
  onTimeout?: () => void;
}

export const useAccessTimeout = ({
  isChecking,
  timeoutMs = 15000,
  onTimeout
}: UseAccessTimeoutOptions) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (isChecking && !hasTimedOut) {
      const timeoutId = setTimeout(() => {
        console.warn('[useAccessTimeout] Access check timed out');
        setHasTimedOut(true);
        onTimeout?.();
      }, timeoutMs);

      return () => clearTimeout(timeoutId);
    } else if (!isChecking) {
      // Reset timeout state when checking stops
      setHasTimedOut(false);
    }
  }, [isChecking, hasTimedOut, timeoutMs, onTimeout]);

  return { hasTimedOut };
};