
import { PostgrestError } from '@supabase/supabase-js';

/**
 * A type guard to check if an object is a PostgrestError
 */
export const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'details' in error &&
    'hint' in error &&
    'message' in error
  );
};

/**
 * Safely extract data from a Supabase query result, handling potential errors.
 * 
 * @param queryResult - The result from a Supabase query
 * @param defaultValue - The default value to return if data is null or there's an error
 * @returns The data or default value
 */
export function safeSqlResult<T>(queryResult: { data: T | null; error: PostgrestError | null }, defaultValue: T): T {
  if (queryResult.error) {
    console.error('Supabase query error:', queryResult.error);
    return defaultValue;
  }
  
  return queryResult.data || defaultValue;
}

/**
 * Safe type casting for Supabase queries where TypeScript might not correctly infer types.
 * Use this as a last resort when TypeScript and Supabase types don't align.
 * 
 * @param value - The value to cast
 * @returns The value cast as the specified type
 */
export function asDbParam<T>(value: unknown): T {
  return value as T;
}

/**
 * Process an array of data returned from Supabase, ensuring type safety
 * 
 * @param queryResult - The result from a Supabase query
 * @param processor - A function to process each item
 * @returns An array of processed items
 */
export function processQueryItems<T, R>(
  queryResult: { data: T[] | null; error: PostgrestError | null },
  processor: (item: T) => R
): R[] {
  if (queryResult.error || !queryResult.data) {
    console.error('Error processing query items:', queryResult.error);
    return [];
  }
  
  return queryResult.data.map(processor);
}
