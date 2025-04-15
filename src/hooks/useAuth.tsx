
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, RegisterData, AuthContextType } from '@/types/auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, Profile } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSupabaseUser(session.user);
        
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const typedProfile = profile as unknown as Profile;
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: typedProfile.first_name,
            lastName: typedProfile.last_name,
            address: typedProfile.address
          });
          setIsLoggedIn(true);
        }
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSupabaseUser(session.user);
        
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const typedProfile = profile as unknown as Profile;
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: typedProfile.first_name,
            lastName: typedProfile.last_name,
            address: typedProfile.address
          });
          setIsLoggedIn(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        setIsLoggedIn(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (data && data.user) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profile) {
          const typedProfile = profile as unknown as Profile;
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            firstName: typedProfile.first_name,
            lastName: typedProfile.last_name,
            address: typedProfile.address
          });
          setIsLoggedIn(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Register the user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName, 
            address: userData.address
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      if (data && data.user) {
        // Insert the user's profile information
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            address: userData.address,
            subscription_status: 'active', // Default value for new users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as unknown as Record<string, any>);
        
        if (profileError) {
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive"
          });
          return false;
        }
        
        // Set the user in our state
        setUser({
          id: data.user.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          address: userData.address
        });
        
        setIsLoggedIn(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSupabaseUser(null);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, isLoggedIn, login, logout, register }}>
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
