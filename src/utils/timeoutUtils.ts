
import { PostgrestResponse } from '@supabase/supabase-js';

const TIMEOUT = 30000; // Increasing from 15s to 30s for better handling of slow networks

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

export { TIMEOUT };
