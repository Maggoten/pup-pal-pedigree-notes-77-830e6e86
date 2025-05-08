
// Enhanced fetch utilities with better mobile support

// Check if we're on a mobile device
export const isMobileDevice = (): boolean => {
  return /iphone|ipad|ipod|android|blackberry|windows phone/i.test(navigator.userAgent) ||
    // iPad detection on iOS 13+
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
};

// Get device-aware timeout values
export const getDeviceAwareTimeout = (baseTimeout: number): number => {
  if (isMobileDevice()) {
    // Mobile devices get more generous timeouts due to potential network issues
    return baseTimeout * 1.5;
  }
  return baseTimeout;
};

type RetryOptions = {
  maxRetries?: number;
  initialDelay?: number;
  useBackoff?: boolean;
  onRetry?: (attempt: number, error?: any) => void;
  shouldRetry?: (error: any) => boolean;
};

// General retry utility for any async operation
export async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    initialDelay = 1000,
    useBackoff = true,
    onRetry,
    shouldRetry = () => true
  } = options;
  
  let attempt = 0;
  let lastError: any;
  
  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        console.log('Not retrying based on error type:', error);
        break;
      }
      
      if (attempt < maxRetries) {
        // Calculate delay with exponential backoff if enabled
        const delay = useBackoff 
          ? initialDelay * Math.pow(2, attempt)
          : initialDelay;
        
        console.log(`Operation failed, retry ${attempt + 1}/${maxRetries} in ${delay}ms`, error);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      attempt++;
    }
  }
  
  throw lastError;
}

// Determine if a request error should be retried
export const shouldRetryRequest = (error: any): boolean => {
  // Don't retry 4xx errors (client errors)
  if (error && typeof error === 'object') {
    // For Supabase errors with status codes
    if ('statusCode' in error && error.statusCode >= 400 && error.statusCode < 500) {
      // Don't retry client errors except for 408 (timeout)
      if (error.statusCode !== 408) {
        return false;
      }
    }
    
    // For fetch Response objects
    if ('status' in error && error.status >= 400 && error.status < 500) {
      // Don't retry client errors except for 408 (timeout)
      if (error.status !== 408) {
        return false;
      }
    }
  }
  
  return true;
};
