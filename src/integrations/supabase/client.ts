import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yqcgqriecxtppuvcguyj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA';

const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Initialize fetcher options for mobile optimization
const fetchOptions: RequestInit = isMobile 
  ? { 
      // Mobile-specific options to reduce data usage
      // and handle potential connectivity issues
      keepalive: true,
      credentials: 'same-origin',
    }
  : {};

// Extended RequestInit type with timeout
interface ExtendedRequestInit extends RequestInit {
  timeout?: number;
}

// Create base fetch function with timeout capability
const timeoutFetch = (input: RequestInfo | URL, init?: ExtendedRequestInit): Promise<Response> => {
  // Default timeout is 30 seconds, but can be overridden
  const timeout = init?.timeout || 30000;
  
  // Create an AbortController to handle timeout
  const controller = new AbortController();
  const signal = controller.signal;
  
  // Set up a timeout that will abort the fetch if it takes too long
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  
  // Create a Promise that wraps the fetch request
  const promise = fetch(input, {
    ...init,
    ...fetchOptions,
    signal: signal,
  });
  
  // Return a new Promise that will settle when either the fetch completes or aborts
  return new Promise<Response>((resolve, reject) => {
    promise
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

// Override the global fetch for all supabase operations
const globalFetchOverride = (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // Add logic to handle connection timeouts, retries etc.
  return timeoutFetch(url, {
    ...init,
    timeout: 12000, // 12 seconds timeout
  } as ExtendedRequestInit);
};

// Configure the client with optimized settings for mobile or desktop
const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: globalFetchOverride
  },
  // Use realtime with caution on mobile devices
  realtime: {
    params: {
      eventsPerSecond: isMobile ? 1 : 5
    }
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, clientOptions);

// Add custom error logging
supabase.auth.onAuthStateChange((event, session) => {
  console.info('[Auth Debug] Auth state change event:', event);
  console.info('[Auth Debug] Session exists:', !!session);
  if (session) {
    console.info('[Auth Debug] User ID from session:', session.user.id);
    console.info('[Auth Debug] Session expires:', session.expires_at);
  }
});

// Add custom storage capability to detect when storage session might be invalid
export async function checkStorageSession() {
  try {
    // Make a simple call to check if our session is valid
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Auth Error] Session check failed:', error.message);
      return false;
    }
    
    if (!data.session) {
      console.warn('[Auth Warning] No active session found');
      return false;
    }
    
    console.info('[Auth Debug] Session expires:', new Date(data.session.expires_at! * 1000));
    console.info('[Auth Debug] User authenticated:', data.session.user.id);
    return true;
  } catch (err) {
    console.error('[Auth Error] Exception checking session:', err);
    return false;
  }
}

// Add a method to fetch the storage API URL for the current project
export const getStorageUrl = () => {
  return `${supabaseUrl}/storage/v1`;
};

// Add a helper to get the auth user ID
export const getUserId = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id;
};

// Adjusted version without timeout property in RequestInit
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    useBackoff?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, useBackoff = true } = options;
  
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      if (retries > maxRetries) {
        throw error;
      }
      
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (useBackoff) {
        delay = delay * 1.5;
      }
    }
  }
}

// Fix fetch wrapper to not include timeout
const fetchWithHeaders = (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // Create a new init object without timeout property
  const safeInit: RequestInit = { ...init };
  
  // Ensure we always have headers initialized
  if (!safeInit.headers) {
    safeInit.headers = {};
  }
  
  // Add any custom headers here if needed
  
  return fetch(url, safeInit);
};
