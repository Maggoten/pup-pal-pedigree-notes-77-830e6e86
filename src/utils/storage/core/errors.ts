
import { StorageError } from '@supabase/storage-js';
import { 
  StorageErrorDetails, 
  SupabaseStorageError,
  isStorageError, 
  isSupabaseStorageError
} from '../config';

// Type guards for response objects
export const hasError = (obj: unknown): obj is { error: unknown } => {
  return typeof obj === 'object' && 
         obj !== null && 
         'error' in obj;
};

/**
 * Safely extracts a property from a potentially complex error object
 * @param error The error object to extract from
 * @param prop The property name to extract
 * @param defaultValue Default value if property doesn't exist
 * @returns The extracted property value or default
 */
export const safeGetErrorProperty = <T>(error: unknown, prop: string, defaultValue: T): T => {
  if (error && typeof error === 'object' && prop in error) {
    return (error as any)[prop];
  }
  return defaultValue;
};

/**
 * Formats storage errors into user-friendly messages with enhanced platform-specific handling
 * @param error The original error object
 * @param platform Device platform information
 * @returns A user-friendly error message
 */
export const formatStorageError = (error: unknown, fileSize?: number): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (isSupabaseStorageError(error)) {
    return typeof error.error === 'string' ? error.error : error.error.message;
  } else if (isStorageError(error)) {
    return error.message || 'Unknown storage error';
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  } else {
    return 'Unknown error occurred';
  }
};

/**
 * Creates a standardized storage error object
 * @param message The error message
 * @returns Storage error object
 */
export const createStorageError = (message: string): { error: StorageError } => {
  return { 
    error: new StorageError(message) 
  };
};

