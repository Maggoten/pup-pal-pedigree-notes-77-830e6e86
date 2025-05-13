
interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  onRetry?: (attempt: number, error?: unknown) => void;
}

/**
 * Utility function to retry a fetch operation with exponential backoff
 * 
 * @param fetchFn The async function to retry
 * @param options Retry options (maxRetries, initialDelay, onRetry callback)
 * @returns The result of the successful fetch
 * @throws The last error encountered after all retries fail
 */
export async function fetchWithRetry<TInput, TOutput = TInput>(
  fetchFn: () => Promise<TInput>, 
  options: RetryOptions
): Promise<TOutput> {
  const { maxRetries, initialDelay, onRetry } = options;
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // First attempt (attempt = 0) doesn't count as a retry
      if (attempt > 0 && onRetry) {
        onRetry(attempt, lastError);
      }
      
      // Add delay before retries (not before the first attempt)
      if (attempt > 0) {
        // Exponential backoff with initial delay
        const delay = initialDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Attempt the fetch
      return await fetchFn() as unknown as TOutput;
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      lastError = error;
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
  
  // This shouldn't be reached due to the throw in the loop,
  // but TypeScript needs it for type safety
  throw lastError;
}

/**
 * Simple timeout promise that rejects after the specified time
 * 
 * @param ms Timeout duration in milliseconds
 * @param message Optional error message
 */
export function timeout<T>(ms: number, message = 'Operation timed out'): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Wraps a promise with a timeout
 * 
 * @param promise The promise to wrap
 * @param ms Timeout duration in milliseconds
 * @param message Optional error message
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  ms: number, 
  message = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    timeout<T>(ms, message)
  ]);
}

/**
 * Utility to detect if the current device is a mobile device
 * @returns true if the current device is a mobile device
 */
export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
