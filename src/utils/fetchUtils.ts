
/**
 * Utility for making fetch requests with automatic retries
 */

// Detect if we're on a mobile device
export const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Returns an appropriate timeout value based on device type
export const getDeviceAwareTimeout = (): number => {
  return isMobileDevice() ? 15000 : 10000; // 15s for mobile, 10s for desktop
};

// Options for fetch retry
interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  retryStatusCodes?: number[];
  onRetry?: (attempt: number, error?: any) => void;
  useBackoff?: boolean;
}

// Default retry options
const defaultRetryOptions: RetryOptions = {
  maxRetries: 2,
  initialDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504], // Common retry-able status codes
  useBackoff: true
};

/**
 * Determines if a request should be retried based on the error
 * @param error The error from the failed request
 * @param retryStatusCodes Array of status codes that should be retried
 * @returns Boolean indicating if the request should be retried
 */
export const shouldRetryRequest = (error: any, retryStatusCodes: number[] = []): boolean => {
  // If no status code is present, retry (network error)
  if (!error.status && !error.statusCode && !error.response?.status) {
    return true;
  }
  
  // Get the status code from various error formats
  const statusCode = error.status || error.statusCode || error.response?.status;
  
  // Retry if status code is in the retry list
  return retryStatusCodes.includes(statusCode);
};

/**
 * Execute a fetch operation with automatic retries
 * @param fetchFn The fetch function to execute (returns a Promise)
 * @param options Retry options
 * @returns Result of the fetch operation
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> => {
  const retryOptions = { ...defaultRetryOptions, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Fetch] Retry attempt ${attempt}/${retryOptions.maxRetries}`);
        
        // Call onRetry callback if provided
        if (retryOptions.onRetry) {
          retryOptions.onRetry(attempt, lastError);
        }
      }
      
      return await fetchFn();
    } catch (error: any) {
      lastError = error;
      console.error(`[Fetch] Attempt ${attempt + 1} failed:`, error);
      
      // Check if we should retry based on status code
      const statusCode = error.status || error.statusCode || (error.response?.status);
      const shouldRetry = !statusCode || 
        (retryOptions.retryStatusCodes?.includes(statusCode));
      
      // Stop if no more retries or shouldn't retry this type of error
      if (attempt >= retryOptions.maxRetries || !shouldRetry) {
        break;
      }
      
      // Wait with exponential backoff before retrying if useBackoff is enabled
      let delay = retryOptions.initialDelay;
      if (retryOptions.useBackoff) {
        delay = retryOptions.initialDelay * Math.pow(1.5, attempt);
      }
      
      console.log(`[Fetch] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we got here, all attempts failed
  throw lastError || new Error('All fetch attempts failed');
};
