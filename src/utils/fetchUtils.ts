
import { withTimeout, TIMEOUT, isTimeoutError } from '@/utils/timeoutUtils';
import { isSafari } from '@/utils/storage/config';

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
 * Enhanced for Safari compatibility
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
  const isSafariBrowser = isSafari();
  
  // Safari may need more attempts due to connection issues
  const effectiveMaxRetries = isSafariBrowser ? Math.max(maxRetries, 3) : maxRetries;
  
  for (let attempt = 0; attempt <= effectiveMaxRetries; attempt++) {
    try {
      // Apply timeout to the fetch function
      // Increase timeout for Safari and for retries
      const timeoutMultiplier = isSafariBrowser ? 1.5 : 1.0;
      const attemptMultiplier = attempt === 0 ? 1.0 : 1.5;
      const timeoutDuration = TIMEOUT * timeoutMultiplier * attemptMultiplier;
      
      const result = await withTimeout(fetchFn(), timeoutDuration);
      
      // Validate result if validation function is provided
      if (validateResult && !validateResult(result)) {
        throw new Error('Invalid result received');
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry after the last attempt
      if (attempt === effectiveMaxRetries) break;
      
      // Call the onRetry callback if provided
      if (onRetry) onRetry(attempt + 1, error);
      
      // Calculate the delay with exponential backoff if enabled
      let delay = useBackoff ? 
        initialDelay * Math.pow(2, attempt) : 
        initialDelay;
        
      // Add jitter for Safari to prevent connection conflicts
      if (isSafariBrowser) {
        const jitter = Math.random() * 1000;
        delay += jitter;
      }
      
      // Log the retry for debugging
      console.log(`Retry ${attempt + 1}/${effectiveMaxRetries} after ${delay}ms due to:`, 
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
 * Enhanced for Safari compatibility
 * @param error The error that occurred
 * @returns true if the request should be retried, false otherwise
 */
export function shouldRetryRequest(error: unknown): boolean {
  // Retry on network errors, timeouts, and certain HTTP status codes
  if (isTimeoutError(error)) return true;
  
  if (error instanceof Error) {
    // Standard network error patterns
    const networkErrorPatterns = [
      'Failed to fetch',
      'Network request failed',
      'network error',
      'Network error',
      'timeout', 
      'Timeout',
      'aborted',
      'Aborted'
    ];
    
    // Safari-specific error patterns
    const safariErrorPatterns = [
      'load failed',
      'Load failed',
      'cancelled',
      'Cancelled',
      'The Internet connection appears to be offline',
      'resource blocked',
      'Resource blocked'
    ];
    
    const errorMessage = error.message.toLowerCase();
    
    // Check standard patterns
    for (const pattern of networkErrorPatterns) {
      if (errorMessage.includes(pattern.toLowerCase())) {
        return true;
      }
    }
    
    // Check Safari-specific patterns if on Safari
    if (isSafari()) {
      for (const pattern of safariErrorPatterns) {
        if (errorMessage.includes(pattern.toLowerCase())) {
          return true;
        }
      }
      
      // Safari may also throw DOMException
      if (error instanceof DOMException) {
        return true;
      }
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
 * Enhanced for Safari compatibility
 * @param isLongOperation Whether this is a long-running operation
 * @returns Timeout duration in milliseconds
 */
export function getDeviceAwareTimeout(isLongOperation = false): number {
  const isMobile = isMobileDevice();
  const browserIsSafari = isSafari();
  
  // Base timeouts
  let timeout = isLongOperation ? 30000 : 15000;
  
  // Adjust for mobile
  if (isMobile) {
    timeout = isLongOperation ? 20000 : 10000;
  }
  
  // Further adjust for Safari (increase by 50%)
  if (browserIsSafari) {
    timeout = Math.round(timeout * 1.5);
  }
  
  return timeout;
}
