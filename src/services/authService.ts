
import { User, RegisterData } from '@/types/auth';

// Handle login functionality
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  // Mock login - in a real app, this would call an API
  if (email && password) {
    return { email };
  }
  return null;
};

// Handle registration functionality
export const registerUser = async (userData: RegisterData): Promise<User | null> => {
  try {
    // Mock registration - in a real app, this would call an API
    const userToStore = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.address
    };
    
    return userToStore;
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

// Save user data to local storage
export const saveUserToStorage = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};

// Remove user data from local storage
export const removeUserFromStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
};

// Get user data from local storage
export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

// Check if user is logged in from local storage
export const getLoggedInStateFromStorage = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};
