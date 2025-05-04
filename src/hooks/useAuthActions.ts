
import { useState } from 'react';
import { supabase, Profile, isMobileSafari } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { withRetry } from '@/utils/networkUtils';

// Utility function to detect network issues
const hasNetworkIssue = (error: any): boolean => {
  if (!error?.message) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('network') || 
         msg.includes('offline') || 
         msg.includes('connection') || 
         msg.includes('timeout');
};

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Login function with retry capability and mobile-specific handling
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email, 'on', isMobileSafari() ? 'Mobile Safari' : 'standard browser');
      
      // Use retry wrapper for better mobile resilience
      const { data, error } = await withRetry(
        () => supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: isMobileSafari() ? {
            // Safari-specific options that might help
            redirectTo: window.location.origin,
          } : undefined
        }),
        isMobileSafari() ? 3 : 2  // More retries for Mobile Safari
      );
      
      if (error) {
        console.error('Login error from Supabase:', error);
        
        // Mobile-specific error handling
        if (isMobileSafari()) {
          if (error.message.includes('Failed to fetch')) {
            toast({
              title: "Connection Issue",
              description: "Please check your internet connection and try again",
              variant: "destructive"
            });
          } else if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login Failed",
              description: "Please check your email and password",
              variant: "destructive"
            });
          } else if (error.message.includes('JWT')) {
            toast({
              title: "Session Issue",
              description: "Please enable cookies in your Safari settings and try again",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Login Error",
              description: "Please try again",
              variant: "destructive"
            });
          }
        } else {
          // Non-mobile error handling
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password",
              variant: "destructive"
            });
          } else if (hasNetworkIssue(error)) {
            toast({
              title: "Connection issue",
              description: "Please check your internet connection and try again",
              variant: "destructive"
            });
          }
        }
        return false;
      }
      
      // Verify we got a valid session
      if (!data.session) {
        console.error('Login succeeded but no session returned');
        
        if (isMobileSafari()) {
          toast({
            title: "Session Error",
            description: "Login succeeded but session could not be established. Please ensure cookies are enabled in Safari settings.",
            variant: "destructive"
          });
        }
        return false;
      }
      
      console.log('Login successful, session established:', !!data.session);
      
      // Extra verification for mobile
      if (isMobileSafari()) {
        // Double check the cookie/storage was set correctly
        try {
          // Check if the auth token was persisted correctly
          setTimeout(async () => {
            const { data: sessionCheck } = await supabase.auth.getSession();
            if (!sessionCheck.session) {
              console.warn('Session not persisted correctly on Mobile Safari');
            } else {
              console.log('Session successfully persisted on Mobile Safari');
            }
          }, 500);
        } catch (storageError) {
          console.error('Error checking session persistence:', storageError);
        }
      }
      
      return !!data.session;
    } catch (error) {
      console.error("Login error:", error);
      
      // Provide helpful error for mobile users
      if (isMobileSafari()) {
        toast({
          title: "Login Failed",
          description: "There was a problem logging you in. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login failed",
          description: "Please check your connection and try again",
          variant: "destructive"
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function with improved implementation
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting registration for:', userData.email, 
                 'on', isMobileSafari() ? 'Mobile Safari' : 'standard browser');
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName
          },
          // Add redirectTo for mobile Safari to help with cookie handling
          ...(isMobileSafari() ? { redirectTo: window.location.origin } : {})
        }
      });

      if (error) {
        console.error('Registration error from Supabase:', error);
        // Keep this toast for registration errors as users need to know why registration failed
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('Registration successful but email confirmation required');
        return true;
      } else if (data.session) {
        console.log('Registration successful with immediate session');
        
        // For Mobile Safari: verify session exists
        if (isMobileSafari()) {
          setTimeout(async () => {
            const { data: sessionCheck } = await supabase.auth.getSession();
            if (!sessionCheck.session) {
              console.warn('Mobile Safari: session not found after registration');
            }
          }, 500);
        }
        
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

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Attempting logout');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error from Supabase:', error);
        
        // Mobile-specific logout handling
        if (isMobileSafari()) {
          // Force clear session data to ensure logout even if API fails
          try {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.removeItem('supabase.auth.token');
          } catch (e) {
            console.warn('Error clearing session data during logout:', e);
          }
        }
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user profile from database with improved resilience
  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      if (!userId) {
        console.error('getUserProfile called with no userId');
        return null;
      }

      // Use retry pattern for more resilience on mobile
      // Fix: Convert PostgrestBuilder to a Promise explicitly by using Promise.resolve
      const { data, error } = await withRetry(
        async () => {
          // Create a proper Promise that resolves with the PostgrestBuilder result
          return Promise.resolve(
            supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle()
          );
        },
        isMobileSafari() ? 3 : 2 // More retries for Mobile Safari
      );
      
      if (error) {
        console.error('Error fetching user profile:', error);
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
