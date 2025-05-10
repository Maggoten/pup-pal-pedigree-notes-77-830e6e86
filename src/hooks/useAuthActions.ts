
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { clearAuthStorage } from '@/services/auth';
import { queryClient, resetQueryClient } from '@/utils/reactQueryConfig';

export const useAuthActions = () => {
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  /**
   * Log in a user with email and password
   */
  const login = async (email: string, password: string) => {
    if (!email || !password) return false;
    
    setLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      if (data.session) {
        console.log('User logged in successfully');
        
        // Prefetch common data for the user
        setTimeout(() => {
          queryClient.invalidateQueries();
        }, 0);
        
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.'
        });
        
        return true;
      } else {
        toast({
          title: 'Login failed',
          description: 'No session was created. Please try again.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async ({
    firstName,
    lastName,
    email,
    password,
    address = ''
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address?: string;
  }) => {
    setRegisterLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            address
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Registration successful',
        description: 'Your account has been created. Welcome!'
      });
      
      // Reset query cache for the new user
      resetQueryClient();
      
      return true;
    } catch (err) {
      console.error('Unexpected registration error:', err);
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setRegisterLoading(false);
    }
  };

  /**
   * Log out the current user
   */
  const logout = async () => {
    setLogoutLoading(true);
    try {
      // Clear all query cache before logout
      resetQueryClient();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Logout failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      // Clear auth storage
      clearAuthStorage();
      
      toast({
        title: 'Goodbye!',
        description: 'You have been logged out successfully.'
      });
    } catch (err) {
      console.error('Unexpected logout error:', err);
      toast({
        title: 'Logout problem',
        description: 'An error occurred during logout. Your session may still be active.',
        variant: 'destructive'
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  /**
   * Get user profile by ID
   */
  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  return {
    login,
    register,
    logout,
    getUserProfile,
    loginLoading,
    registerLoading,
    logoutLoading
  };
};
