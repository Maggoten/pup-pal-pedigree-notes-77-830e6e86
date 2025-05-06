import { useState } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { removeUserFromStorage } from '@/services/authService';

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error from Supabase:', error);
        // Only show toast for user-facing errors, not technical ones
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password",
            variant: "destructive"
          });
        }
        return false;
      }
      
      console.log('Login successful, session established:', !!data.session);
      return !!data.session;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function with improved implementation to handle existing user errors
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting registration for:', userData.email);
      
      // Before attempting to register, check if the email exists in the auth system
      const { data: emailCheck, error: emailCheckError } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          shouldCreateUser: false // Just checking if user exists
        }
      });
      
      // If we get an error about the user not existing, that's good!
      // It means we can proceed with registration
      if (emailCheckError && emailCheckError.message.includes('User not found')) {
        console.log('Email is available for registration');
      } else if (!emailCheckError) {
        // If there's no error, that means the email exists in the system
        console.warn('Email may already be registered:', userData.email);
      }
      
      // Proceed with registration
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            // Pass empty string for address since we removed the field
            address: ''
          }
        }
      });

      if (error) {
        console.error('Registration error from Supabase:', error);
        
        // Specific handling for "User already registered" error
        if (error.message.includes('already registered')) {
          toast({
            title: "Registration failed",
            description: "This email is already registered. Please try to log in instead.",
            variant: "destructive"
          });
        } else {
          // Keep this toast for other registration errors
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
        console.log('Registration successful but email confirmation required');
        return true;
      } else if (data.session) {
        console.log('Registration successful with immediate session');
        return true;
      } else {
        console.warn('Registration returned unexpected state');
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function with enhanced error handling and force refresh
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting logout');
      // Use global scope to sign out from all devices
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error from Supabase:', error);
        // If logout fails via API, force cleanup manually
        removeUserFromStorage();
      } else {
        console.log('Logout successful');
      }
      
      // Force-clear any remaining auth state from storage
      removeUserFromStorage();
      
      // Force page reload to ensure clean state
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, try to clear local storage
      removeUserFromStorage();
      // Redirect to login page as a fallback
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  // Get user profile from database with improved error handling
  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      if (!userId) {
        console.error('getUserProfile called with no userId');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        // Removed toast for profile errors - just log to console for debugging
        throw error;
      }
      
      console.log('Profile retrieved:', data ? 'success' : 'not found');
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
