
import { PostgrestResponse } from '@supabase/supabase-js';
import { isMobileDevice, hasSlowConnection } from '@/utils/networkUtils'; 

// Base timeout value - we'll adjust dynamically based on device and network
const BASE_TIMEOUT = 30000; // 30 seconds base

/**
 * Gets appropriate timeout duration based on device and network conditions
 */
const getTimeoutDuration = (): number => {
  let timeout = BASE_TIMEOUT;
  
  // Extend timeout for mobile devices
  if (isMobileDevice()) {
    timeout = timeout * 1.5; // 45 seconds for mobile
    
    // Further extend for slow connections
    if (hasSlowConnection()) {
      timeout = timeout * 1.5; // ~67.5 seconds for slow mobile connections
    }
  }
  
  return timeout;
};

export const TIMEOUT = getTimeoutDuration();

export async function withTimeout<T>(promise: Promise<T> | { then(onfulfilled: (value: T) => any): any }, timeoutMs: number): Promise<T> {
  // For Supabase query builders, we need to convert them to promises first
  const actualPromise = (promise instanceof Promise) ? promise : Promise.resolve(promise);
  
  // Create a timeout error with a specific name for better error identification
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      const error = new Error('Request timed out. The server took too long to respond.');
      error.name = 'TimeoutError';
      reject(error);
    }, timeoutMs);
  });
  
  return Promise.race([actualPromise, timeoutPromise]);
}

// Export a function to check if an error is a timeout error
export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof Error && error.name === 'TimeoutError';
};

// Utility function for retry with backoff
export async function withRetryAndTimeout<T>(
  promiseFactory: () => Promise<T> | { then(onfulfilled: (value: T) => any): any },
  maxRetries: number = 2,
  timeoutMs: number = TIMEOUT
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If not first attempt, add delay with exponential backoff
      if (attempt > 0) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${backoffMs}ms backoff`);
      }
      
      return await withTimeout(promiseFactory(), timeoutMs);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error as Error;
      
      // Don't retry certain errors
      if (error instanceof Error) {
        // Don't retry auth errors or validation errors
        if (error.message.includes('auth') || 
            error.message.includes('validation') || 
            error.message.includes('permission')) {
          throw error;
        }
      }
    }
  }
  
  // If we got here, all attempts failed
  throw lastError || new Error('Operation failed after multiple attempts');
}
