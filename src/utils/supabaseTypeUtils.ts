
import { PostgrestFilterBuilder } from "@supabase/supabase-js";

// Helper to safely cast parameters for Supabase queries
export const castParam = <T>(param: T): T => {
  return param as T;
};

// Helper to handle Supabase errors
export const handleSupabaseError = (error: any, defaultMessage: string = "An error occurred"): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message as string;
  }
  return defaultMessage;
};

// Type-safe way to check if a result is a Supabase error
export const isSupabaseError = (result: any): boolean => {
  return result && typeof result === 'object' && 'error' in result && result.error === true;
};

// Type-safe wrapper for Supabase filter operations
export function safeFilter<T, U>(
  query: PostgrestFilterBuilder<T, U>,
  column: string,
  value: any
): PostgrestFilterBuilder<T, U> {
  return query.eq(column as any, value as any);
}
