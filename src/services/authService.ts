
import { supabase, Profile } from '@/integrations/supabase/client';
import { User, RegisterData } from '@/types/auth';

// Handle login functionality
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error || !data.user) {
    console.error("Login error:", error);
    return null;
  }
  
  // Get user profile from database
  // Use type assertion to fix the TypeScript error
  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('*')
    .eq('id', data.user.id)
    .single() as { data: Profile | null };
  
  if (profile) {
    return {
      id: data.user.id,
      email: data.user.email || '',
      firstName: profile.first_name,
      lastName: profile.last_name,
      address: profile.address
    };
  }
  
  return null;
};

// Handle registration functionality
export const registerUser = async (userData: RegisterData): Promise<User | null> => {
  try {
    // Register the user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    });
    
    if (error || !data.user) {
      console.error("Registration error:", error);
      return null;
    }
    
    // Insert the user's profile information
    // Use type assertion to fix the TypeScript error
    const { error: profileError } = await (supabase
      .from('profiles') as any)
      .insert({
        id: data.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        address: userData.address,
        subscription_status: 'active', // Default value for new users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Profile);
    
    if (profileError) {
      console.error("Profile creation error:", profileError);
      return null;
    }
    
    return {
      id: data.user.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.address
    };
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
};

// Save user data to local storage - not needed with Supabase but kept for compatibility
export const saveUserToStorage = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
};

// Remove user data from local storage - not needed with Supabase but kept for compatibility
export const removeUserFromStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
};

// Get user data from local storage - not needed with Supabase but kept for compatibility
export const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

// Check if user is logged in from local storage - not needed with Supabase but kept for compatibility
export const getLoggedInStateFromStorage = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};
