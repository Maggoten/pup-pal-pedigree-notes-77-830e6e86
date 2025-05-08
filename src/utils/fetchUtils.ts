
/**
 * Utility for making fetch requests with automatic retries
 */

// Detect if we're on a mobile device
export const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Options for fetch retry
interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  retryStatusCodes?: number[];
}

// Default retry options
const defaultRetryOptions: RetryOptions = {
  maxRetries: 2,
  initialDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504] // Common retry-able status codes
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
      
      // Wait with exponential backoff before retrying
      const delay = retryOptions.initialDelay * Math.pow(1.5, attempt);
      console.log(`[Fetch] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we got here, all attempts failed
  throw lastError || new Error('All fetch attempts failed');
};
