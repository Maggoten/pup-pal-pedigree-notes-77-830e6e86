
import { withTimeout, TIMEOUT, isTimeoutError } from '@/utils/timeoutUtils';

/**
 * Retry configuration options
 */
interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay between retries in ms (will increase with backoff) */
  initialDelay?: number;
  /** Whether to use exponential backoff for retry delays */
  useBackoff?: boolean;
  /** Optional validation function to determine if a successful result is valid */
  validateResult?: (result: any) => boolean;
  /** Optional callback for when a retry occurs */
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Fetches data with retry logic, timeout handling, and error handling
 * @param fetchFn The async function to execute and potentially retry
 * @param options Retry configuration options
 * @returns Promise resolving to the fetch result
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    useBackoff = true,
    validateResult,
    onRetry
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Apply timeout to the fetch function
      const timeoutDuration = attempt === 0 ? TIMEOUT : TIMEOUT * 1.5; // Increase timeout for retries
      const result = await withTimeout(fetchFn(), timeoutDuration);
      
      // Validate result if validation function is provided
      if (validateResult && !validateResult(result)) {
        throw new Error('Invalid result received');
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry after the last attempt
      if (attempt === maxRetries) break;
      
      // Call the onRetry callback if provided
      if (onRetry) onRetry(attempt + 1, error);
      
      // Calculate the delay with exponential backoff if enabled
      const delay = useBackoff ? 
        initialDelay * Math.pow(2, attempt) : 
        initialDelay;
      
      // Log the retry for debugging
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms due to:`, 
        error instanceof Error ? error.message : 'Unknown error');
      
      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If all retries fail, throw the last error
  throw lastError;
}

/**
 * Determines if a failed request should be retried based on the error
 * @param error The error that occurred
 * @returns true if the request should be retried, false otherwise
 */
export function shouldRetryRequest(error: unknown): boolean {
  // Retry on network errors, timeouts, and certain HTTP status codes
  if (isTimeoutError(error)) return true;
  
  if (error instanceof Error) {
    // Retry on connection errors
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network request failed') ||
        error.message.includes('network error') ||
        error.message.includes('Network error')) {
      return true;
    }
  }
  
  // Don't retry on authentication errors, missing resources, etc.
  return false;
}

/**
 * Checks if the device is a mobile device
 * @returns true if the device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Gets an appropriate timeout value based on the device type and operation
 * @param isLongOperation Whether this is a long-running operation
 * @returns Timeout duration in milliseconds
 */
export function getDeviceAwareTimeout(isLongOperation = false): number {
  const isMobile = isMobileDevice();
  
  if (isMobile) {
    return isLongOperation ? 20000 : 10000; // 20s for long ops, 10s for regular on mobile
  } else {
    return isLongOperation ? 30000 : 15000; // 30s for long ops, 15s for regular on desktop
  }
}
