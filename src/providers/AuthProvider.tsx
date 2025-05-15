
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { ProfileData } from '@/types/settings';
import { useAuthActions } from '@/hooks/useAuthActions';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authActions = useAuthActions();
  
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      setSession(initialSession);
      setUser(initialSession?.user || null);
      
      if (initialSession?.user) {
        // Fetch profile immediately after session is loaded
        await fetchProfile(initialSession.user.id);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
    };
    
    loadSession();
    
    // Set up listener for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        // Fetch profile on every auth state change
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    }
  };
  
  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      await authActions.login({ email, password: '' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    try {
      await authActions.logout();
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProfile = async (data: ProfileData) => {
    setIsLoading(true);
    try {
      // Fetch user profile using the authActions if available
      if (user) {
        // Update logic here
        // This is a placeholder since we don't have access to the complete authActions implementation
        console.log("Updating profile", data);
        setProfile(data); // Optimistically update the profile
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
