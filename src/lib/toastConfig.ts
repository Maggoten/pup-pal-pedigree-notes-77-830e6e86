/**
 * Toast configuration for managing when toasts should be shown
 * Reduces toast noise by only showing critical messages
 */

export type ToastLevel = 'minimal' | 'standard' | 'verbose';

export interface ToastConfig {
  level: ToastLevel;
  showSuccessToasts: boolean;
  showErrorToasts: boolean;
  showCriticalOnly: boolean;
}

// Default configuration - minimal toasts for better UX
const defaultConfig: ToastConfig = {
  level: 'minimal',
  showSuccessToasts: false,      // No success toasts for common operations
  showErrorToasts: true,         // Keep error toasts for important failures
  showCriticalOnly: true,        // Only show critical errors (auth, network, data loss)
};

let currentConfig = defaultConfig;

export const toastConfig = {
  get: () => currentConfig,
  
  set: (newConfig: Partial<ToastConfig>) => {
    currentConfig = { ...currentConfig, ...newConfig };
  },
  
  reset: () => {
    currentConfig = defaultConfig;
  }
};

/**
 * Determines if a success toast should be shown
 */
export const shouldShowSuccessToast = (operation?: string): boolean => {
  if (!currentConfig.showSuccessToasts) return false;
  
  // Never show success toasts for common operations
  const commonOperations = ['add', 'update', 'save', 'upload', 'edit'];
  if (operation && commonOperations.some(op => operation.toLowerCase().includes(op))) {
    return false;
  }
  
  return true;
};

/**
 * Determines if an error toast should be shown
 */
export const shouldShowErrorToast = (error: any, context?: string): boolean => {
  if (!currentConfig.showErrorToasts) return false;
  
  // Always show critical errors
  const criticalErrors = [
    'authentication',
    'authorization', 
    'network',
    'connection',
    'timeout',
    'server error',
    'data corruption',
    'permission denied'
  ];
  
  const errorMessage = error?.message?.toLowerCase() || '';
  const isCritical = criticalErrors.some(critical => 
    errorMessage.includes(critical) || context?.toLowerCase().includes(critical)
  );
  
  if (currentConfig.showCriticalOnly) {
    return isCritical;
  }
  
  return true;
};

/**
 * Categories of operations that should use subtle feedback instead of toasts
 */
export const SILENT_OPERATIONS = [
  'add_dog',
  'update_dog', 
  'add_puppy',
  'update_puppy',
  'add_litter',
  'update_litter',
  'image_upload',
  'form_save',
  'auto_save'
] as const;

export type SilentOperation = typeof SILENT_OPERATIONS[number];

export const isSilentOperation = (operation: string): boolean => {
  return SILENT_OPERATIONS.includes(operation as SilentOperation);
};