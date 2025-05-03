
// Network detection and resilience utilities for better mobile experience

/**
 * Detects if the user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detects if the user has a slow connection
 * This uses the Network Information API where available, falling back to a conservative default
 */
export const hasSlowConnection = (): boolean => {
  // @ts-ignore - Navigator connection property not in all TypeScript definitions
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    // Check connection type
    if (connection.type === 'cellular' || connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' || connection.effectiveType === '3g') {
      return true;
    }
    
    // Check downlink speed (Mbps)
    if (connection.downlink < 1) {
      return true;
    }
  } else {
    // If Network Information API is not available, be conservative on mobile
    return isMobileDevice();
  }
  
  return false;
};

/**
 * Returns appropriate timeout based on network conditions
 */
export const getNetworkAwareTimeout = (): number => {
  const BASE_TIMEOUT = 30000; // 30 seconds base timeout
  
  if (hasSlowConnection()) {
    return BASE_TIMEOUT * 2; // Double timeout for slow connections
  }
  
  return BASE_TIMEOUT;
};

/**
 * Creates a network-aware fetch function with proper timeout handling
 */
export const networkAwareFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const timeoutDuration = getNetworkAwareTimeout();
  
  // Create an abort controller for timeout handling
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutDuration);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal,
      // Add mobile optimization headers
      headers: {
        ...options.headers,
        'X-Mobile-Device': isMobileDevice().toString(),
      },
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutDuration}ms`);
    }
    
    throw error;
  }
};

/**
 * Creates a retry wrapper for async functions with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
};

/**
 * Utility sleep function
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Network connectivity observer
 */
class NetworkStatusMonitor {
  private listeners: Array<(isOnline: boolean) => void> = [];
  private isOnline: boolean;
  
  constructor() {
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }
  
  private updateStatus(status: boolean) {
    this.isOnline = status;
    this.notifyListeners();
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }
  
  public addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    // Immediately notify with current status
    listener(this.isOnline);
  }
  
  public removeListener(listener: (isOnline: boolean) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  public getStatus(): boolean {
    return this.isOnline;
  }
}

// Create singleton instance
export const networkStatusMonitor = new NetworkStatusMonitor();
