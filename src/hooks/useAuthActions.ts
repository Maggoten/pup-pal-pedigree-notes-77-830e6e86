
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

  // Logout function with enhanced error handling and standardized redirection approach
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('[Auth Action] Attempting logout');
      
      // Use global scope to sign out from all devices
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('[Auth Action] Logout error from Supabase:', error);
        // If logout fails via API, force cleanup manually
        clearAuthStorage();
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
      
      // Don't use window.location.href - let the auth change event handle navigation
      // This avoids the full page reload and potential loss of React state
      console.log('[Auth Action] Logout complete - relying on AuthGuard for navigation');
      
    } catch (error) {
      console.error("[Auth Action] Logout error:", error);
      // Even if there's an error, try to clear local storage
      clearAuthStorage();
      // In case of critical error only, fall back to location redirect
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
