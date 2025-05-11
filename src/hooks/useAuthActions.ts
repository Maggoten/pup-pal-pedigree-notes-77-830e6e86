
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { clearAuthStorage } from '@/services/auth';
import { 
  loginUserWithEmailPassword, 
  registerUser as registerUserApi, 
  logoutUserFromSupabase,
  getUserProfileById,
  RegisterUserData
} from '@/utils/auth/authActionUtils';

/**
 * Hook that manages authentication actions with loading states
 * Delegates the actual API calls to authActionUtils
 */
export const useAuthActions = () => {
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  /**
   * Log in a user with email and password
   */
  const login = async (email: string, password: string) => {
    setLoginLoading(true);
    
    try {
      const result = await loginUserWithEmailPassword(email, password);
      
      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.'
        });
      } else {
        toast({
          title: 'Login failed',
          description: result.error || 'Please try again.',
          variant: 'destructive'
        });
      }
      
      return result.success;
    } finally {
      setLoginLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData: RegisterUserData) => {
    setRegisterLoading(true);
    
    try {
      const result = await registerUserApi(userData);
      
      if (result.success) {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created. Welcome!'
        });
      } else {
        toast({
          title: 'Registration failed',
          description: result.error || 'Please try again.',
          variant: 'destructive'
        });
      }
      
      return result.success;
    } finally {
      setRegisterLoading(false);
    }
  };

  /**
   * Log out the current user
   * This is a simpler version that delegates to logoutManager 
   * for the full logout with state management
   */
  const logout = async () => {
    setLogoutLoading(true);
    
    try {
      const result = await logoutUserFromSupabase();
      
      if (result.success) {
        // Clear auth storage
        clearAuthStorage();
        
        toast({
          title: 'Goodbye!',
          description: 'You have been logged out successfully.'
        });
      } else {
        toast({
          title: 'Logout problem',
          description: result.error || 'Your session may still be active.',
          variant: 'destructive'
        });
      }
    } finally {
      setLogoutLoading(false);
    }
  };

  /**
   * Get user profile by ID
   */
  const getUserProfile = async (userId: string) => {
    return getUserProfileById(userId);
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
