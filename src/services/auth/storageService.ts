
// Storage-related functions for authentication

/**
 * Enhanced version to aggressively clean up all auth-related items
 * to prevent stale sessions and improve logout reliability
 */
export const clearAuthStorage = () => {
  try {
    console.log('[Auth Storage] Beginning storage cleanup process');
    
    // Clear supabase-specific storage items
    const supabaseItems = [
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'supabase.auth.user',
      'sb-yqcgqriecxtppuvcguyj-auth-token',
      'sb-yqcgqriecxtppuvcguyj-auth-token-code-verifier',
      'sb-provider-token'
    ];
    
    // Clear all supabase items from localStorage
    supabaseItems.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`[Auth Storage] Removed localStorage item: ${key}`);
      } catch (e) {
        console.warn(`[Auth Storage] Failed to remove localStorage item ${key}:`, e);
      }
    });
    
    // Clear all supabase items from sessionStorage as fallback
    supabaseItems.forEach(key => {
      try {
        sessionStorage.removeItem(key);
        console.log(`[Auth Storage] Removed sessionStorage item: ${key}`);
      } catch (e) {
        console.warn(`[Auth Storage] Failed to remove sessionStorage item ${key}:`, e);
      }
    });
    
    // Clear app-specific storage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('session');
    
    // Scan for any other auth/supabase related items in localStorage
    const itemsToRemove = [];
    const keyPatterns = ['supabase', 'auth', 'sb-', 'token', 'session'];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const shouldRemove = keyPatterns.some(pattern => key.toLowerCase().includes(pattern));
      if (shouldRemove) {
        itemsToRemove.push(key);
      }
    }
    
    // Remove identified items
    itemsToRemove.forEach(key => {
      try {
        console.log(`[Auth Storage] Removing additional storage item: ${key}`);
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`[Auth Storage] Failed to remove additional item ${key}:`, e);
      }
    });
    
    // Clear potentially auth-related cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (!name) return;
      
      const shouldRemove = keyPatterns.some(pattern => name.toLowerCase().includes(pattern));
      if (shouldRemove) {
        console.log(`[Auth Storage] Clearing cookie: ${name}`);
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    console.log('[Auth Storage] All auth-related storage items cleared');
  } catch (e) {
    console.error('[Auth Storage] Error during storage cleanup:', e);
  }
};

// The following functions are maintained for backward compatibility

export const getUserFromStorage = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const getLoggedInStateFromStorage = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const saveUserToStorage = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};
