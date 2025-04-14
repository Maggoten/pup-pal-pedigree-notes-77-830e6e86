
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, RegisterData, AuthContextType } from '@/types/auth';
import { 
  loginUser, 
  registerUser, 
  saveUserToStorage, 
  removeUserFromStorage,
  getUserFromStorage,
  getLoggedInStateFromStorage
} from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check local storage for logged in state on component mount
    const storedLoginState = getLoggedInStateFromStorage();
    const storedUser = getUserFromStorage();
    
    if (storedLoginState && storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await loginUser(email, password);
    
    if (user) {
      saveUserToStorage(user);
      setUser(user);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const newUser = await registerUser(userData);
    
    if (newUser) {
      saveUserToStorage(newUser);
      setUser(newUser);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
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
