
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, RegisterData, AuthContextType } from '@/types/auth';
import { 
  loginUser, 
  registerUser, 
  saveUserToStorage, 
  removeUserFromStorage,
  getUserFromStorage,
  getLoggedInStateFromStorage,
  logoutUserFromSupabase
} from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // When user signs in, get their profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: profileData?.first_name || '',
            lastName: profileData?.last_name || '',
            address: profileData?.address || ''
          };
          
          setUser(userData);
          setIsLoggedIn(true);
          saveUserToStorage(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoggedIn(false);
          removeUserFromStorage();
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          firstName: profileData?.first_name || '',
          lastName: profileData?.last_name || '',
          address: profileData?.address || ''
        };
        
        setUser(userData);
        setIsLoggedIn(true);
        saveUserToStorage(userData);
      } else {
        // Check local storage for logged in state as fallback
        const storedLoginState = getLoggedInStateFromStorage();
        const storedUser = getUserFromStorage();
        
        if (storedLoginState && storedUser) {
          setUser(storedUser);
          setIsLoggedIn(true);
        }
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await loginUser(email, password);
    
    if (user) {
      setUser(user);
      setIsLoggedIn(true);
      saveUserToStorage(user);
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const newUser = await registerUser(userData);
    
    if (newUser) {
      setUser(newUser);
      setIsLoggedIn(true);
      saveUserToStorage(newUser);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await logoutUserFromSupabase();
    removeUserFromStorage();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, register }}>
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
