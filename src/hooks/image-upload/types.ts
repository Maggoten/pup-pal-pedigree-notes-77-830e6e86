
import { StorageError } from '@supabase/storage-js';
import { ApiErrorResponse } from '@/utils/storage/config';

export interface UseImageUploadProps {
  user_id: string | undefined;
  onImageChange: (imageUrl: string) => void;
}

export interface UploadResult {
  data?: { path: string };
  error?: unknown;
}

export interface ImageUploadState {
  isUploading: boolean;
  uploadRetryCount: number;
  lastError: string | null;
}

// Type guards for response objects
export const hasErrorProperty = (obj: unknown): obj is { error: unknown } => {
  return typeof obj === 'object' && 
         obj !== null && 
         'error' in obj;
};

// Safely get property from an error object
export const safeGetErrorProperty = <T>(obj: unknown, prop: string, defaultValue: T): T => {
  if (obj && typeof obj === 'object' && prop in obj) {
    return (obj as any)[prop];
  }
  return defaultValue;
};
