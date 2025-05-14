
import { StorageError } from '@supabase/storage-js';
import { getSafeErrorMessage } from '../config';

/**
 * Type guard to check if an object has an error property
 */
export const hasError = (obj: unknown): obj is { error: unknown } => {
  return obj !== null && 
         typeof obj === 'object' && 
         'error' in obj;
};

/**
 * Safely get a property from an error object
 */
export const safeGetErrorProperty = <T>(obj: unknown, prop: string, defaultValue: T): T => {
  if (obj && typeof obj === 'object' && prop in (obj as object)) {
    return (obj as any)[prop];
  }
  return defaultValue;
};

/**
 * Create a standardized error response object
 */
export const createStorageError = (message: string) => {
  return {
    error: {
      message,
      status: 500,
      statusCode: 'ERROR'
    }
  };
};

/**
 * Format a storage error message for display
 */
export const formatStorageError = (error: unknown): string => {
  // If it's a string, return it directly
  if (typeof error === 'string') {
    return error;
  }
  
  // If it's an Error object, use its message
  if (error instanceof Error) {
    return error.message;
  }
  
  // For objects with message property
  if (error && typeof error === 'object') {
    return getSafeErrorMessage(error);
  }
  
  // Default message if we can't extract anything useful
  return 'An unknown error occurred during storage operation';
};
