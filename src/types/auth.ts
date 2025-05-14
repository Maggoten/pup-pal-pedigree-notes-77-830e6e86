
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  firstName?: string;
  lastName?: string;
  address?: string;
  displayName?: string;
  isSubscribed?: boolean;
  subscriptionTier?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthReady: boolean;
  isLoading: boolean;
  error: Error | null;
  registrationSuccess: boolean;
  registrationData: RegisterData | null;
  resetRegistration: () => void;
  login: (data: LoginData) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

export interface UsernameDetails {
  firstName: string;
  lastName: string;
  displayName?: string;
}

export interface UserProfile {
  id: string;
  updated_at?: string;
  username: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  website?: string;
  email?: string;
  address?: string;
}

export interface LoginResponse {
  user: User;
  session: Session;
  error?: string | null;
}

export type LoginErrorCode = 'invalid_credentials' | 'network_error' | 'user_not_found' | 'unknown';
