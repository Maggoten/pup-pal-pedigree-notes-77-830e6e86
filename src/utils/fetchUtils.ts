
/**
 * Utility to retry a fetch operation with exponential backoff
 * 
 * @param fetchFn The function to execute that returns a Promise
 * @param options Configuration options for the retry behavior
 * @returns The result of the fetchFn if successful
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error?: any) => void;
    useBackoff?: boolean;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 500,
    backoffFactor = 1.5,
    onRetry = () => {},
    useBackoff = true,
    shouldRetry = () => true
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1}/${maxRetries} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Calculate backoff delay with exponential increase if useBackoff is true
        const delay = useBackoff 
          ? initialDelay * Math.pow(backoffFactor, attempt)
          : initialDelay;

        // Check if we should retry this specific error
        if (!shouldRetry(error)) {
          console.log(`Not retrying after error: ${error}`);
          break;
        }
        
        console.log(`Retrying in ${delay}ms...`);
        
        // Notify about retry
        onRetry(attempt + 1, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

/**
 * Detect if the current device is mobile
 * @returns boolean indicating if the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768);
};

/**
 * Get a timeout value that's appropriate for the current device
 * @param defaultTimeout The default timeout in milliseconds
 * @param mobileTimeout The timeout for mobile devices in milliseconds
 * @returns Appropriate timeout value
 */
export const getDeviceAwareTimeout = (defaultTimeout = 30000, mobileTimeout = 45000): number => {
  return isMobileDevice() ? mobileTimeout : defaultTimeout;
};

/**
 * Check if a request should be retried based on the error
 * @param error The error that occurred
 * @returns boolean indicating if the request should be retried
 */
export const shouldRetryRequest = (error: any): boolean => {
  // Network errors should be retried
  if (error instanceof TypeError && error.message.includes('network')) {
    return true;
  }
  
  // Retry on timeout errors
  if (error.message && error.message.includes('timeout')) {
    return true;
  }
  
  // Retry on certain status codes
  if (error.status) {
    // Retry on server errors and some specific client errors
    return error.status >= 500 || [408, 429].includes(error.status);
  }
  
  // Default to retry
  return true;
};

/**
 * Check if an error is a timeout error
 * @param error The error to check
 * @returns boolean indicating if the error is a timeout
 */
export const isTimeoutError = (error: any): boolean => {
  return error instanceof Error && 
    (error.name === 'TimeoutError' || 
     error.message.toLowerCase().includes('timeout') ||
     error.message.toLowerCase().includes('timed out'));
};

/**
 * Default timeout value in milliseconds
 */
export const TIMEOUT = 30000;
