
// Storage-related functions for authentication

// Enhanced version to ensure thorough cleanup of all auth-related items
export const clearAuthStorage = async () => {
  try {
    console.log('[Auth Storage] Beginning storage cleanup process');
    
    // Clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Clear all Supabase-related storage items
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    localStorage.removeItem('supabase.auth.user');
    localStorage.removeItem('sb-yqcgqriecxtppuvcguyj-auth-token');
    
    // Clear any session/local storage items that contain these keys
    const itemsToRemove = [];
    
    // Identify items to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('sb-') ||
        key.includes('token')
      )) {
        itemsToRemove.push(key);
      }
    }
    
    // Remove items separately to avoid index shifting issues
    itemsToRemove.forEach(key => {
      console.log(`[Auth Storage] Removing storage item: ${key}`);
      localStorage.removeItem(key);
    });
    
    // Also try sessionStorage
    try {
      sessionStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('sb-yqcgqriecxtppuvcguyj-auth-token');
    } catch (e) {
      console.warn('[Auth Storage] Session storage cleanup failed:', e);
    }
    
    // Also clear cookies that might be related to authentication
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name && (
        name.includes('supabase') || 
        name.includes('auth') || 
        name.includes('sb-')
      )) {
        console.log(`[Auth Storage] Clearing cookie: ${name}`);
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    // Explicitly clear the most important items again to be extra sure
    localStorage.removeItem('sb-yqcgqriecxtppuvcguyj-auth-token');
    localStorage.removeItem('supabase.auth.token');
    
    console.log('[Auth Storage] All auth-related storage items cleared');
    return true;
  } catch (e) {
    console.error('[Auth Storage] Error during storage cleanup:', e);
    return false;
  }
};

// Get user data from local storage - not needed with Supabase but kept for compatibility
export const getUserFromStorage = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

// Check if user is logged in from local storage - not needed with Supabase but kept for compatibility
export const getLoggedInStateFromStorage = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// Save user data to local storage - not needed with Supabase but kept for compatibility
export const saveUserToStorage = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};

// Verify storage cleanup was complete
export const verifyAuthStorageClear = (): boolean => {
  try {
    // Check for any remaining auth items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('sb-') ||
        key.includes('token')
      )) {
        console.warn(`[Auth Storage] Found remaining auth item after cleanup: ${key}`);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error('[Auth Storage] Error verifying storage cleanup:', e);
    return false;
  }
};
