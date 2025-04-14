
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session) {
          // Get user data from profile
          const userData = await getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    const checkSession = async () => {
      setIsLoading(true);
      const session = await getCurrentSession();
      
      if (session) {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      
      setIsLoading(false);
    };
    
    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await loginUser(email, password);
    return !!user;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const newUser = await registerUser(userData);
    return !!newUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, register, isLoading }}>
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
