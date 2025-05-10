
import { verifySession } from './auth/sessionManager';

// Utility to check if running on mobile device
export const isMobileDevice = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  useBackoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
  verifySession?: boolean;
  authRequired?: boolean;
}

// Advanced fetch with retry capabilities
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    initialDelay = 2000,
    useBackoff = true,
    onRetry,
    verifySession: shouldVerifySession = true,
    authRequired = true
  } = options;

  let lastError: any;
  
  // Verify session if required
  if (shouldVerifySession && authRequired) {
    try {
      const isSessionValid = await verifySession({ skipThrow: true });
      if (!isSessionValid) {
        console.warn('[fetchWithRetry] No valid session for authenticated request');
        throw new Error('Authentication required');
      }
    } catch (error) {
      console.error('[fetchWithRetry] Session verification failed:', error);
      throw error;
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0 && onRetry) {
        onRetry(attempt, lastError);
      }
      
      // Attempt to perform the fetch operation
      return await fetchFn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry or not
      if (attempt >= maxRetries) {
        console.error(`[fetchWithRetry] All ${maxRetries} retries failed:`, error);
        throw error;
      }
      
      // Check for auth errors - don't retry these
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isAuthError = ['401', 'JWT', 'auth', 'unauthorized', 'token'].some(code => 
        errorMsg.toLowerCase().includes(code.toLowerCase()));
      
      if (isAuthError) {
        console.log('[fetchWithRetry] Auth error detected, not retrying:', errorMsg);
        throw error;
      }
      
      // Calculate delay with exponential backoff if enabled
      const delay = useBackoff 
        ? initialDelay * Math.pow(1.5, attempt)
        : initialDelay;
        
      console.log(`[fetchWithRetry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw lastError;
}

// Parse error messages from Supabase or generic errors
export function parseErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  // Handle Supabase specific errors
  if (error.code && error.message) {
    return `${error.message} (${error.code})`;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle unexpected error formats
  return JSON.stringify(error);
}

// Track loading states for multiple fetches
export class LoadingTracker {
  private loadingStates: Map<string, boolean> = new Map();
  private callbacks: Set<() => void> = new Set();
  
  setLoading(key: string, isLoading: boolean) {
    this.loadingStates.set(key, isLoading);
    this.notifyListeners();
  }
  
  isLoading(key?: string): boolean {
    if (key) {
      return !!this.loadingStates.get(key);
    }
    
    // If any key is loading, return true
    for (const [_, isLoading] of this.loadingStates.entries()) {
      if (isLoading) return true;
    }
    
    return false;
  }
  
  subscribe(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
  
  private notifyListeners() {
    this.callbacks.forEach(callback => callback());
  }
}
