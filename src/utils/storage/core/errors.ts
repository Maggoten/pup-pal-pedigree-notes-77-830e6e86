
// Define error constants for storage operations
export const ERROR_CODES = {
  NO_SESSION: "No active session found",
  BUCKET_NOT_FOUND: (bucket: string) => `Storage bucket "${bucket}" not found`,
  UPLOAD_FAILED: "Failed to upload file",
  DOWNLOAD_FAILED: "Failed to download file",
  REMOVE_FAILED: "Failed to delete file",
  SAFARI_STORAGE_ERROR: "Safari storage error occurred",
  RETRY_EXCEEDED: "Maximum retry attempts exceeded",
  UNSUPPORTED_FILE: "Unsupported file type",
  SIZE_EXCEEDED: "File size exceeds the maximum allowed limit",
  VALIDATION_FAILED: "File validation failed",
  BROWSER_ERROR: "Browser does not support file operations",
  CANVAS_ERROR: "Error processing image in canvas",
  GET_URL_FAILED: "Failed to get public URL for file"
};

// Format storage errors consistently
export const formatStorageError = (error: any, code?: string): Error => {
  const message = typeof error === 'string' ? error : error?.message || 'Unknown storage error';
  const formattedError = new Error(message);
  (formattedError as any).code = code || 'STORAGE_ERROR';
  return formattedError;
};

// Create a standardized storage error
export const createStorageError = (code: keyof typeof ERROR_CODES | string, additionalInfo?: string): Error => {
  let message: string;
  
  if (typeof ERROR_CODES[code as keyof typeof ERROR_CODES] === 'function') {
    message = (ERROR_CODES[code as keyof typeof ERROR_CODES] as any)(additionalInfo);
  } else if (ERROR_CODES[code as keyof typeof ERROR_CODES]) {
    message = ERROR_CODES[code as keyof typeof ERROR_CODES] as string;
    if (additionalInfo) message += `: ${additionalInfo}`;
  } else {
    message = code;
    if (additionalInfo) message += `: ${additionalInfo}`;
  }
  
  const error = new Error(message);
  (error as any).code = code;
  return error;
};

// Check if an object is an error
export const hasError = (obj: any): boolean => {
  return obj instanceof Error || (obj && obj.message && obj.stack);
};

// Safely extract a property from a potential error object
export const safeGetErrorProperty = (error: any, prop: string): any => {
  if (!error) return undefined;
  return error[prop];
};

// Handle storage errors consistently
export const handleStorageError = (error: any, defaultMessage: string): Error => {
  if (hasError(error)) return error;
  return formatStorageError(error || defaultMessage);
};
