
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check local storage for logged in state on component mount
    const storedLoginState = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('user');
    
    if (storedLoginState && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in a real app, this would call an API
    // In this example, any non-empty credentials are accepted
    if (email && password) {
      const user = { email };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      
      setUser(user);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Mock registration - in a real app, this would call an API
    try {
      // Store user data (except password) in localStorage
      const userToStore = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        address: userData.address
      };
      
      localStorage.setItem('user', JSON.stringify(userToStore));
      localStorage.setItem('isLoggedIn', 'true');
      
      setUser(userToStore);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
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
