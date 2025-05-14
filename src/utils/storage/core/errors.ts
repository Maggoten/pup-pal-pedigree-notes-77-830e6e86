
import { StorageError } from '@supabase/storage-js';

/**
 * Checks if an object has an error property
 */
export const hasError = <T extends object>(obj: T): obj is T & { error: unknown } => {
  return obj !== null && 
         typeof obj === 'object' && 
         'error' in obj;
};

/**
 * Safely gets a property from an error object
 */
export const safeGetErrorProperty = <T>(error: unknown, property: string, defaultValue: T): T => {
  if (error && typeof error === 'object' && property in error) {
    return (error as any)[property];
  }
  return defaultValue;
};

/**
 * Creates a properly formatted storage error response
 */
export const createStorageError = (message: string): { data: null; error: StorageError } => {
  return {
    data: null,
    error: new StorageError(message)
  };
};

/**
 * Formats storage errors into user-friendly messages
 */
export const formatStorageError = (error: unknown): string => {
  if (!error) return 'Unknown storage error';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object') {
    if ('message' in error) {
      return String((error as any).message);
    }
    if ('error' in error && typeof (error as any).error === 'object') {
      const errorObj = (error as any).error;
      if ('message' in errorObj) {
        return String(errorObj.message);
      }
    }
    if ('error' in error && typeof (error as any).error === 'string') {
      return String((error as any).error);
    }
  }
  
  return 'Unexpected storage error occurred';
};
