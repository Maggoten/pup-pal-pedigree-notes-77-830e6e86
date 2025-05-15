
/**
 * Utility to retry fetch requests with customizable retry options
 */
export interface FetchRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  onRetry?: (attempt: number, error?: Error) => void;
  useBackoff?: boolean;
  shouldRetry?: (error: any) => boolean;
  isMobile?: boolean; // Allow explicitly passing mobile flag
}

export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: FetchRetryOptions = {}
): Promise<T> => {
  const { 
    maxRetries = 3, 
    initialDelay = 500, 
    onRetry, 
    useBackoff = false, 
    shouldRetry,
    isMobile: forceMobile 
  } = options;
  
  // Determine if we're on mobile
  const isMobileEnv = forceMobile !== undefined ? forceMobile : isMobileDevice();
  
  // Adjust retry settings for mobile
  const effectiveMaxRetries = isMobileEnv ? Math.max(maxRetries, 3) : maxRetries;
  const effectiveInitialDelay = isMobileEnv ? Math.max(initialDelay, 1000) : initialDelay;
  
  let lastError: Error;
  let attempt = 0;
  
  while (attempt <= effectiveMaxRetries) {
    try {
      // Try to get cached data for GET requests on mobile
      if (isMobileEnv && typeof fetchFn === 'function') {
        const fetchFnStr = fetchFn.toString();
        if (fetchFnStr.includes('fetch(') && fetchFnStr.includes('method: \'GET\'')) {
          console.log('[Fetch] Mobile GET request, checking cache first');
          // Let fetch handle cache - it's already set up in our function
        }
      }
      
      return await fetchFn();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      if (attempt <= effectiveMaxRetries) {
        // Calculate backoff delay - exponential with jitter if useBackoff is true
        const delayMultiplier = useBackoff ? Math.pow(isMobileEnv ? 2 : 1.5, attempt - 1) : 1;
        // Add more jitter on mobile to prevent request storms
        const jitterRange = isMobileEnv ? 0.5 : 0.2; // 50% jitter on mobile vs 20% on desktop
        const jitterFactor = 1 - jitterRange/2 + Math.random() * jitterRange;
        const delay = effectiveInitialDelay * delayMultiplier * jitterFactor;
        
        // Different logging for mobile vs desktop
        if (isMobileEnv) {
          console.warn(`[Mobile Fetch] Attempt ${attempt}/${effectiveMaxRetries} failed, retrying in ${Math.round(delay)}ms`);
        } else {
          console.error(`Fetch failed (attempt ${attempt}/${effectiveMaxRetries}), retrying in ${Math.round(delay)}ms`, error);
        }
        
        // Check if we should retry this error type
        if (shouldRetry && !shouldRetry(error)) {
          console.log('Not retrying based on shouldRetry callback');
          break;
        }
        
        // Check for specific mobile conditions
        if (isMobileEnv) {
          // Don't retry on quota errors which can be common on mobile
          if (error instanceof Error && error.message.includes('quota')) {
            console.warn('[Mobile Fetch] Storage quota error, not retrying');
            break;
          }
          
          // Check network connection on mobile
          if (!isOnline()) {
            console.warn('[Mobile Fetch] Device appears offline, pausing retries');
            break;
          }
        }
        
        if (onRetry) {
          onRetry(attempt, error);
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

/**
 * Detect if the current device is a mobile device
 */
export const isMobileDevice = (): boolean => {
  // Check if window exists (for SSR)
  if (typeof window === 'undefined') return false;
  
  // Check for mobile detection in localStorage for consistent experience
  const cachedMobileStatus = localStorage.getItem('app_is_mobile_device');
  if (cachedMobileStatus !== null) {
    return cachedMobileStatus === 'true';
  }
  
  // Classic mobile detection regex 
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // 1. Check user agent
  const isMobileUserAgent = mobileRegex.test(navigator.userAgent);
  
  // 2. Check screen size (typical mobile widths)
  const isSmallScreen = window.innerWidth < 768;
  
  // 3. Check for touch capability
  const hasTouch = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    // @ts-ignore - Some browsers use msMaxTouchPoints
    navigator.msMaxTouchPoints > 0;
  
  // For this app, we primarily care about small screen + touch capability
  // or explicit mobile user agent
  const result = (isSmallScreen && hasTouch) || isMobileUserAgent;
  
  // Cache the result to prevent flickering experience
  try {
    localStorage.setItem('app_is_mobile_device', result.toString());
  } catch (e) {
    console.warn('Could not cache mobile detection result:', e);
  }
  
  return result;
};

/**
 * Check if the app is currently in the foreground
 */
export const isAppForeground = (): boolean => {
  return document.visibilityState === 'visible';
};

/**
 * Check if the device is online
 */
export const isOnline = (): boolean => {
  // Always return true if Navigator is not available (SSR)
  if (typeof navigator === 'undefined' || typeof navigator.onLine === 'undefined') {
    return true;
  }
  
  return navigator.onLine;
};

/**
 * Check network quality (when available)
 */
export const getNetworkQuality = (): 'good' | 'fair' | 'poor' | 'unknown' => {
  if (typeof navigator === 'undefined') return 'unknown';
  
  // Use Network Information API if available
  // @ts-ignore - Connection property is not in all browsers
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    // Check connection type
    if (connection.type === 'cellular') {
      // Check effectiveType for more granular info
      if (connection.effectiveType === '4g') return 'good';
      if (connection.effectiveType === '3g') return 'fair';
      return 'poor'; // 2g or slow-2g
    }
    
    // WiFi and ethernet are usually good
    if (connection.type === 'wifi' || connection.type === 'ethernet') {
      return 'good';
    }
  }
  
  return 'unknown';
};

/**
 * Get a device-aware timeout value that's longer for mobile devices
 */
export const getDeviceAwareTimeout = (baseTimeout: number = 30000): number => {
  const isMobile = isMobileDevice();
  const networkQuality = getNetworkQuality();
  
  // Base multiplier for mobile
  let multiplier = isMobile ? 1.5 : 1;
  
  // Adjust based on network quality
  if (networkQuality === 'fair') multiplier *= 1.5;
  if (networkQuality === 'poor') multiplier *= 2.5;
  
  return baseTimeout * multiplier;
};

/**
 * Determines if a request should be retried based on error type
 */
export const shouldRetryRequest = (error: any): boolean => {
  // Don't retry if it's a 4xx client error (except 408 Request Timeout)
  if (error && typeof error === 'object') {
    if ('status' in error) {
      const status = Number(error.status);
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        return false;
      }
    }
    
    // Don't retry if it's an explicit auth error
    if (error.message && typeof error.message === 'string') {
      if (
        error.message.includes('unauthorized') || 
        error.message.includes('not authenticated') ||
        error.message.includes('auth/invalid') ||
        error.message.includes('permission denied')
      ) {
        return false;
      }
    }
    
    // Don't retry storage quota errors
    if (error.message && typeof error.message === 'string' && 
        (error.message.includes('quota') || error.message.includes('storage full'))) {
      return false;
    }
  }
  
  // Don't retry if we're offline
  if (!isOnline()) {
    return false;
  }
  
  // Retry network failures, timeouts, and server errors by default
  return true;
};

/**
 * Returns a debounced version of a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
