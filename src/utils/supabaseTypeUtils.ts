
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { GenericSchema, GenericTable } from '@supabase/postgrest-js/dist/module/types';

// Type guard to check if an error is from Supabase
export function isSupabaseError(error: any): boolean {
  return error && typeof error === 'object' && 'code' in error;
}

// Safe filter that avoids TypeScript errors with filter conditions
export function safeFilter<
  Schema extends GenericSchema,
  Table extends GenericTable,
  QueryName extends string = '*'
>(
  query: PostgrestFilterBuilder<Schema, Table, QueryName>,
  column: string,
  value: any
): PostgrestFilterBuilder<Schema, Table, QueryName> {
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
export function convertSafely<T>(data: any, defaultValue: T): T {
  if (!data) return defaultValue;
  try {
    return data as T;
  } catch (e) {
    return defaultValue;
  }
}
