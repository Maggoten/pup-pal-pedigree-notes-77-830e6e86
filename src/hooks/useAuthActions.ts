
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { AuthError } from '@supabase/supabase-js';
import { isSupabaseError, safeGet } from '@/utils/supabaseErrorHandler';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  address?: string;
}

interface AuthResponse {
  user: User | null;
  error: string | null;
}

interface ProfileData {
  address: string;
  created_at: string;
  email: string;
  first_name: string;
  id: string;
  kennel_name: string;
  last_name: string;
  phone: string;
  subscription_status: string;
  updated_at: string;
}

const PROFILE_DEFAULTS: ProfileData = {
  address: '',
  created_at: '',
  email: '',
  first_name: '',
  id: '',
  kennel_name: '',
  last_name: '',
  phone: '',
  subscription_status: 'active',
  updated_at: ''
};

export const useAuthActions = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Transform user data from Supabase to our app's User type
   */
  const transformUserData = useCallback(async (userData: any): Promise<User> => {
    try {
      if (!userData || !userData.id) {
        throw new Error('Invalid user data');
      }
      
      // Get profile data from our profiles table if available
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      // Set default profile if there's an error
      let profile = PROFILE_DEFAULTS;
      
      // If we have profile data and no error, use it
      if (profileData && !profileError) {
        profile = {
          id: safeGet(profileData, 'id', ''),
          email: safeGet(profileData, 'email', userData.email || ''),
          first_name: safeGet(profileData, 'first_name', ''),
          last_name: safeGet(profileData, 'last_name', ''),
          address: safeGet(profileData, 'address', ''),
          kennel_name: safeGet(profileData, 'kennel_name', ''),
          phone: safeGet(profileData, 'phone', ''),
          subscription_status: safeGet(profileData, 'subscription_status', 'active'),
          created_at: safeGet(profileData, 'created_at', ''),
          updated_at: safeGet(profileData, 'updated_at', '')
        };
      }
      
      // Return our User type with the data we have
      return {
        id: userData.id,
        email: userData.email || profile.email || '',
        firstName: userData.user_metadata?.firstName || profile.first_name || '',
        lastName: userData.user_metadata?.lastName || profile.last_name || '',
        address: userData.user_metadata?.address || profile.address || '',
        profile
      };
    } catch (error) {
      console.error('Error transforming user data:', error);
      throw error;
    }
  }, []);
  
  /**
   * Login with email and password
   */
  const login = useCallback(async ({ email, password }: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      const userData = data.user;
      if (!userData) {
        throw new Error('No user data returned from login');
      }
      
      const user = await transformUserData(userData);
      
      return {
        user,
        error: null
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'An unknown error occurred during login'
      };
    } finally {
      setIsLoading(false);
    }
  }, [transformUserData]);
  
  /**
   * Register a new user
   */
  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const { email, password, firstName, lastName, address } = credentials;
      
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
        throw error;
      }
      
      const userData = data.user;
      if (!userData) {
        throw new Error('No user data returned from registration');
      }
      
      // Create initial profile data (this should also be handled by a trigger on Supabase)
      await supabase.from('profiles').upsert({
        id: userData.id,
        email,
        first_name: firstName,
        last_name: lastName,
        address: address || '',
      });
      
      const user = await transformUserData(userData);
      
      return {
        user,
        error: null
      };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'An unknown error occurred during registration';
      
      if (error instanceof AuthError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        user: null,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [transformUserData]);
  
  /**
   * Logout the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  
  /**
   * Fetch current user profile data
   */
  const fetchUserProfile = useCallback(async (userId: string): Promise<ProfileData> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as any)
        .single();
      
      if (error) throw error;
      
      // Handle the case where we get data but something is wrong
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid profile data returned');
      }
      
      // Map profile data to our ProfileData type safely
      return {
        id: safeGet(data, 'id', ''),
        email: safeGet(data, 'email', ''),
        first_name: safeGet(data, 'first_name', ''),
        last_name: safeGet(data, 'last_name', ''),
        address: safeGet(data, 'address', ''),
        kennel_name: safeGet(data, 'kennel_name', ''),
        phone: safeGet(data, 'phone', ''),
        subscription_status: safeGet(data, 'subscription_status', 'active'),
        created_at: safeGet(data, 'created_at', ''),
        updated_at: safeGet(data, 'updated_at', '')
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return PROFILE_DEFAULTS;
    }
  }, []);
  
  return {
    login,
    register,
    logout,
    fetchUserProfile,
    isLoading
  };
};

export default useAuthActions;
