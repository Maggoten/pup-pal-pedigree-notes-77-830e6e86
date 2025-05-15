
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SupabaseClient } from '@supabase/supabase-js';

// Type guard to check if an error is from Supabase
export function isSupabaseError(error: any): boolean {
  return error && typeof error === 'object' && 'code' in error;
}

// Safe filter that avoids TypeScript errors with filter conditions
export function safeFilter<T>(
  query: PostgrestFilterBuilder<any, any, any>,
  column: string,
  value: any
): PostgrestFilterBuilder<any, any, any> {
  return query.eq(column as any, value);
}

// Helper for safely handling Supabase record data
export function safeGet(obj: any, path: string, defaultValue: any = null) {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
}

// Helper for converting any to a specific type safely
export function convertSafely<T, R>(
  data: any,
  defaultValue: T
): T {
  if (!data) return defaultValue;
  try {
    return data as T;
  } catch (e) {
    return defaultValue;
  }
}

// Safely extracts id from a Supabase result that might be an error
export function safeGetId(result: any): string | null {
  return safeGet(result, 'id', null);
}

export default {
  isSupabaseError,
  safeGet,
  safeCast: convertSafely,
  safeGetId
};
