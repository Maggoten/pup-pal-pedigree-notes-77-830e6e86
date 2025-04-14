
import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User, RegisterData, AuthContextType } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  loginUser, 
  registerUser,
  getCurrentUser,
  getCurrentSession
} from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session - runs only once on mount
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Get user data but don't block the UI
          getCurrentUser().then(userData => {
            setUser(userData);
            setIsLoggedIn(true);
            setIsLoading(false);
          });
        } else {
          setUser(null);
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      }
    );

    // Initial session check
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        
        if (session) {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Memoize auth functions to prevent unnecessary re-renders
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = await loginUser(email, password);
    return !!user;
  }, []);

  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    const newUser = await registerUser(userData);
    return !!newUser;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    register
  }), [user, isLoggedIn, isLoading, login, logout, register]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
