
import { PostgrestResponse } from '@supabase/supabase-js';
import { isSafari } from '@/utils/storage/config';

// Increase timeout for Safari browsers
const TIMEOUT = isSafari() ? 45000 : 30000; // 45s for Safari, 30s for others

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
  if (error instanceof Error && error.name === 'TimeoutError') {
    return true;
  }
  
  // Safari sometimes handles network timeouts differently
  if (isSafari() && error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    if (
      errorMessage.includes('time') && errorMessage.includes('out') ||
      errorMessage.includes('timed') && errorMessage.includes('out') ||
      errorMessage.includes('timeout')
    ) {
      return true;
    }
  }
  
  return false;
};

export { TIMEOUT };
