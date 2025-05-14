
/**
 * Utility to retry fetch requests with customizable retry options
 */
export interface FetchRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  onRetry?: (attempt: number, error?: Error) => void;
  useBackoff?: boolean;
  shouldRetry?: (error: any) => boolean;
}

export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: FetchRetryOptions = {}
): Promise<T> => {
  const { maxRetries = 3, initialDelay = 500, onRetry, useBackoff = false, shouldRetry } = options;
  
  let lastError: Error;
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      if (attempt <= maxRetries) {
        // Calculate backoff delay - exponential with jitter if useBackoff is true
        const delayMultiplier = useBackoff ? Math.pow(1.5, attempt - 1) : 1;
        const delay = initialDelay * delayMultiplier * (0.9 + Math.random() * 0.2);
        
        console.error(`Fetch failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay)}ms`, error);
        
        // Check if we should retry this error type
        if (shouldRetry && !shouldRetry(error)) {
          console.log('Not retrying based on shouldRetry callback');
          break;
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
  return (isSmallScreen && hasTouch) || isMobileUserAgent;
};

/**
 * Check if the app is currently in the foreground
 */
export const isAppForeground = (): boolean => {
  return document.visibilityState === 'visible';
};

/**
 * Get a device-aware timeout value that's longer for mobile devices
 */
export const getDeviceAwareTimeout = (baseTimeout: number = 30000): number => {
  return isMobileDevice() ? baseTimeout * 1.5 : baseTimeout;
};

/**
 * Determines if a request should be retried based on error type
 */
export const shouldRetryRequest = (error: any): boolean => {
  // Don't retry if it's a 4xx client error (except 408 Request Timeout)
  if (error && typeof error === 'object') {
    if ('status' in error) {
      const status = Number(error.status);
      if (status >= 400 && status < 500 && status !== 408) {
        return false;
      }
    }
    
    // Don't retry if it's an explicit auth error
    if (error.message && typeof error.message === 'string') {
      if (
        error.message.includes('unauthorized') || 
        error.message.includes('not authenticated') ||
        error.message.includes('auth/invalid')
      ) {
        return false;
      }
    }
  }
  
  // Retry network failures, timeouts, and server errors by default
  return true;
};
