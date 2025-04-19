
import { PostgrestResponse } from '@supabase/supabase-js';

const TIMEOUT = 30000; // 30 second timeout

export async function withTimeout<T>(promise: Promise<T> | { then(onfulfilled: (value: T) => any): any }, timeoutMs: number): Promise<T> {
  // For Supabase query builders, we need to convert them to promises first
  const actualPromise = (promise instanceof Promise) ? promise : Promise.resolve(promise);
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  
  return Promise.race([actualPromise, timeoutPromise]);
}

export { TIMEOUT };
