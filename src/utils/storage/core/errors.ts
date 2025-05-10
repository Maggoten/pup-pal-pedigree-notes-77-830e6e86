
import { STORAGE_ERRORS } from '../config';

/**
 * Formats a storage error for display
 */
export const formatStorageError = (error: unknown): string => {
  if (!error) return 'Unknown storage error';
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
    if ('error' in error && typeof (error as any).error === 'object' && (error as any).error !== null) {
      const errorObj = (error as any).error;
      if ('message' in errorObj && typeof errorObj.message === 'string') {
        return errorObj.message;
      }
    }
  }
  
  return String(error);
};

/**
 * Creates a standardized storage error object
 */
export const createStorageError = (message: string) => {
  return { data: null, error: { message } };
};

/**
 * Checks if an object has an error property
 */
export const hasError = (result: unknown): result is { error: unknown } => {
  return typeof result === 'object' && 
         result !== null && 
         'error' in result && 
         result.error !== null && 
         result.error !== undefined;
};

/**
 * Safely gets a property from an error object, with a default value if not found
 */
export const safeGetErrorProperty = <T>(obj: unknown, prop: string, defaultValue: T): T => {
  if (obj && typeof obj === 'object' && prop in obj) {
    return (obj as any)[prop];
  }
  return defaultValue;
};

/**
 * Generic handler for storage errors
 */
export const handleStorageError = (error: unknown): never => {
  const message = formatStorageError(error);
  console.error('Storage error:', message);
  throw new Error(message);
};
