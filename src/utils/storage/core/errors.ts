
import { StorageError } from '@supabase/storage-js';

/**
 * Type guard for response objects that have an error property
 */
export const hasError = (obj: unknown): obj is { error: unknown } => {
  return obj !== null && 
         typeof obj === 'object' && 
         'error' in obj;
};

/**
 * Safely get a property from an error object
 */
export const safeGetErrorProperty = <T>(error: unknown, property: string, defaultValue: T): T => {
  if (error && typeof error === 'object' && property in error) {
    return (error as any)[property];
  }
  return defaultValue;
};

/**
 * Create a standardized storage error object
 */
export const createStorageError = (message: string) => {
  return {
    data: null,
    error: new StorageError(message)
  };
};

/**
 * Format an error into a readable message
 */
export const formatStorageError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
    
    // Check for specific Supabase error patterns
    if ('error' in error && typeof (error as any).error === 'object' && 
        'message' in (error as any).error) {
      return (error as any).error.message;
    }
    
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
    
    return JSON.stringify(error);
  }
  return 'Unknown error occurred';
};
