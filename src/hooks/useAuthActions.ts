import { useState } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { clearAuthStorage } from '@/services/auth/storageService';

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('[Auth Action] Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('[Auth Action] Login error from Supabase:', error);
        // Only show toast for user-facing errors, not technical ones
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password",
            variant: "destructive"
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your inbox and confirm your email address",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login failed",
            description: "An error occurred. Please try again later.",
            variant: "destructive"
          });
        }
        return false;
      }
      
      console.log('[Auth Action] Login successful, session established:', !!data.session);
      return !!data.session;
    } catch (error) {
      console.error("[Auth Action] Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function with fixed email handling logic
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('[Auth Action] Attempting registration for:', userData.email);
      
      // Directly attempt to register the user without pre-checking email
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            address: ''
          }
        }
      });

      if (error) {
        console.error('[Auth Action] Registration error from Supabase:', error);
        
        // Specific handling for "User already registered" error
        if (error.message.includes('already registered')) {
          toast({
            title: "Registration failed",
            description: "This email is already registered. Please try to log in instead.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive"
          });
        }
        return false;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('[Auth Action] Registration successful but email confirmation required');
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account.",
        });
        return true;
      } else if (data.session) {
        console.log('[Auth Action] Registration successful with immediate session');
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully.",
        });
        return true;
      } else {
        console.warn('[Auth Action] Registration returned unexpected state');
        return false;
      }
    } catch (error) {
      console.error("[Auth Action] Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced logout function with improved storage cleanup and session termination
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('[Auth Action] Attempting logout');
      
      // First perform thorough storage cleanup before signout (helps with Safari issues)
      clearAuthStorage();
      
      // Use global scope to sign out from all devices
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('[Auth Action] Logout error from Supabase:', error);
        
        // If logout API fails, try directly removing session from all storage locations
        try {
          console.log('[Auth Action] Attempting direct session removal as fallback');
          ['localStorage', 'sessionStorage'].forEach(storageType => {
            try {
              const storage = window[storageType as 'localStorage' | 'sessionStorage'];
              if (storage) {
                // Remove all Supabase related items
                for (let i = 0; i < storage.length; i++) {
                  const key = storage.key(i);
                  if (key && (key.includes('supabase') || key.includes('sb-'))) {
                    storage.removeItem(key);
                  }
                }
              }
            } catch (e) {
              console.log(`[Auth Action] Error clearing ${storageType}:`, e);
            }
          });
        } catch (e) {
          console.error('[Auth Action] Error during fallback storage cleanup:', e);
        }
      } else {
        console.log('[Auth Action] Logout successful via Supabase API');
      }
      
      // Force-clear any remaining auth state from storage
      clearAuthStorage();
      
      // Display success message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Force a manual location redirect to ensure logout is complete
      // This bypasses any potential issues with AuthGuard's state handling
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
      
    } catch (error) {
      console.error("[Auth Action] Logout error:", error);
      // Even if there's an error, try to clear local storage
      clearAuthStorage();
      // In case of critical error, fall back to location redirect
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  // Get user profile from database with improved error handling
  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('[Auth Action] Fetching profile for user:', userId);
      if (!userId) {
        console.error('[Auth Action] getUserProfile called with no userId');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[Auth Action] Error fetching user profile:', error);
        throw error;
      }
      
      console.log('[Auth Action] Profile retrieved:', data ? 'success' : 'not found');
      return data;
    } catch (error) {
      console.error("[Auth Action] Error fetching user profile:", error);
      throw error;
    }
  };

  return {
    login,
    register,
    logout,
    getUserProfile,
    isLoading
  };
};
