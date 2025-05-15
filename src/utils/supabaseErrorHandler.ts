
/**
 * Utility functions for handling Supabase query results and errors
 */

type SupabaseResult<T> = T | { error: true; message: string };

/**
 * Check if a Supabase result is an error
 */
export const isSupabaseError = (result: any): result is { error: true; message: string } => {
  return result && typeof result === 'object' && 'error' in result && result.error === true;
};

/**
 * Safely access properties from Supabase query results
 * Returns the default value if the result is an error or the property doesn't exist
 */
export function safeGet<T, K extends keyof T>(
  result: SupabaseResult<T>,
  property: K,
  defaultValue: T[K]
): T[K] {
  if (isSupabaseError(result) || !result || typeof result !== 'object') {
    return defaultValue;
  }
  return (result as T)[property] ?? defaultValue;
}

/**
 * Safe casting with error checking for Supabase results
 * Only use this when you're certain the result is not an error
 */
export function safeCast<T>(result: SupabaseResult<T>): T {
  if (isSupabaseError(result)) {
    throw new Error(`Attempted to use error result: ${result.message}`);
  }
  return result as T;
}

/**
 * Process array results from Supabase with proper error handling
 */
export function safeArray<T>(result: SupabaseResult<T[]>): T[] {
  if (isSupabaseError(result) || !result) {
    return [];
  }
  return result as T[];
}
