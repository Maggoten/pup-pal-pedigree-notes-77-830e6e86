
import { useState, useEffect } from 'react';
import { verifySession } from '@/utils/auth/sessionManager';
import { getPlatformInfo } from '@/utils/storage/mobileUpload';

export const useImageSessionCheck = () => {
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  // Get platform info
  const platform = getPlatformInfo();
  
  const checkSession = async () => {
    setIsCheckingSession(true);
    try {
      const valid = await verifySession({ 
        skipThrow: platform.mobile || platform.safari 
      });
      setIsSessionValid(valid);
      return valid;
    } catch (error) {
      console.error('Error checking session:', error);
      setIsSessionValid(false);
      return false;
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return {
    isSessionValid,
    isCheckingSession,
    checkSession
  };
};
