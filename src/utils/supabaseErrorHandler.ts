
/**
 * Type guard to check if an object is a Supabase error
 */
export const isSupabaseError = (obj: unknown): boolean => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as any).error === 'boolean' &&
    (obj as any).error === true
  );
};

/**
 * Safe function to get properties from potentially error objects
 * @param obj The object to get a property from
 * @param key The key to access
 * @param defaultValue A default value if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeGet<T, K extends string, V>(
  obj: T, 
  key: K, 
  defaultValue: V
): V {
  if (!obj || isSupabaseError(obj)) {
    return defaultValue;
  }

  // TypeScript doesn't know that obj[key] exists, so we use any here
  const value = (obj as any)[key];
  return value !== undefined ? value : defaultValue;
}

/**
 * Helper for safely casting Supabase results
 * @param result The result from a Supabase query that might be an error
 * @param transform Optional transformation function
 * @returns The transformed data or null if it's an error
 */
export function safeCast<T, R>(
  result: any,
  transform?: (data: T) => R
): R | null {
  if (isSupabaseError(result)) {
    return null;
  }

  return transform ? transform(result as T) : (result as unknown as R);
}

/**
 * Safely extracts id from a Supabase result that might be an error
 */
export function safeGetId(result: any): string | null {
  return safeGet(result, 'id', null);
}

export default {
  isSupabaseError,
  safeGet,
  safeCast,
  safeGetId
};
