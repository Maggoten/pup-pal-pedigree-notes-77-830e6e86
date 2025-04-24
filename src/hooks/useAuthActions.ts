import { useState } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

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
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
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

  // Register function with improved implementation
  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting registration for:', userData.email);
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            address: userData.address
          }
        }
      });

      if (error) {
        console.error('Registration error from Supabase:', error);
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
        toast({
          title: "Almost done!",
          description: "Please check your email to confirm your account before logging in.",
          variant: "default"
        });
        return true;
      } else if (data.session) {
        console.log('Registration successful with immediate session');
        toast({
          title: "Registration successful!",
          description: "Your account has been created and you are now logged in.",
          variant: "default"
        });
        return true;
      } else {
        console.warn('Registration returned unexpected state');
        toast({
          title: "Registration status unclear",
          description: "Your account may have been created. Please try logging in.",
          variant: "default"
        });
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
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user profile from database
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
