
/**
 * Utility to retry fetch requests with customizable retry options
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> => {
  const { maxRetries = 3, initialDelay = 500, onRetry } = options;
  
  let lastError: Error;
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      if (attempt <= maxRetries) {
        // Calculate backoff delay - exponential with jitter
        const delay = initialDelay * Math.pow(1.5, attempt - 1) * (0.9 + Math.random() * 0.2);
        
        console.error(`Fetch failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay)}ms`, error);
        
        if (onRetry) {
          onRetry(attempt);
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
