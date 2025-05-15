
import { PostgrestFilterBuilder } from "@supabase/supabase-js";

/**
 * Type-safe wrapper for filter operations in Supabase
 * This helps prevent TypeScript errors when using string filters
 */
export const safeFilter = <T, K extends string = string>(
  query: PostgrestFilterBuilder<T>,
  column: K,
  value: string | string[] | number | number[] | boolean | null
) => {
  // Handle array values
  if (Array.isArray(value)) {
    return query.in(column as any, value as any);
  }
  // Handle single values
  return query.eq(column as any, value as any);
};

/**
 * Utility for determining if an error is a Supabase error
 */
export const isSupabaseError = (error: any): boolean => {
  return error && typeof error === 'object' && 
    'code' in error && 'message' in error && 
    (error.details !== undefined || error.hint !== undefined);
};

/**
 * Type guard to check if a response is an error
 */
export const isError = (data: any): boolean => {
  return data && typeof data === 'object' && 'error' in data && data.error === true;
};
