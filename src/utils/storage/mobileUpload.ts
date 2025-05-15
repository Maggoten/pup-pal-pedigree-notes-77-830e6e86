
/**
 * Utility functions for mobile upload detection and handling
 */

interface PlatformInfo {
  mobile: boolean;
  safari: boolean;
  ios: boolean;
  android: boolean;
  device: string;
}

/**
 * Detects platform information to provide optimized experiences
 */
export const getPlatformInfo = (): PlatformInfo => {
  // Default values for server-side rendering
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      mobile: false,
      safari: false,
      ios: false,
      android: false,
      device: 'unknown'
    };
  }

  const ua = navigator.userAgent;
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  // Check for Safari (but not Chrome on iOS which also includes Safari in UA)
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  
  // Check for iOS devices
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  
  // Check for Android devices
  const isAndroid = /Android/.test(ua);
  
  // Determine device type string
  let deviceType = 'desktop';
  if (isIOS) deviceType = 'iOS';
  else if (isAndroid) deviceType = 'Android';
  else if (isMobile) deviceType = 'mobile';
  
  return {
    mobile: isMobile,
    safari: isSafari,
    ios: isIOS,
    android: isAndroid,
    device: deviceType
  };
};

/**
 * Check if the current session is likely to have storage access issues
 * (Safari private mode, some mobile browsers, etc.)
 */
export const hasStorageAccessIssues = (): boolean => {
  try {
    // Test localStorage
    localStorage.setItem('storage_test', 'test');
    localStorage.removeItem('storage_test');
    
    // If we can access localStorage, usually sessionStorage works too
    return false;
  } catch (e) {
    console.warn('Storage access issue detected:', e);
    return true;
  }
};

/**
 * Gets the maximum recommended file size for upload based on platform
 */
export const getMaxRecommendedFileSize = (): number => {
  const { mobile, safari, ios } = getPlatformInfo();
  
  // Smaller file size limits for mobile and Safari due to common memory constraints
  if (mobile) return 3 * 1024 * 1024; // 3MB for mobile
  if (safari || ios) return 5 * 1024 * 1024; // 5MB for Safari/iOS
  return 10 * 1024 * 1024; // 10MB default
};

/**
 * Gets an appropriate upload timeout based on platform
 */
export const getUploadTimeout = (): number => {
  const { mobile, safari } = getPlatformInfo();
  
  // Longer timeouts for mobile and Safari
  if (mobile) return 60000; // 60s for mobile
  if (safari) return 45000; // 45s for Safari
  return 30000; // 30s default
};
