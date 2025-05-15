import { ProfileData } from "./settings";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  profile?: ProfileData;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  address?: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
}

// Alias for backward compatibility
export type RegisterData = RegisterFormValues;

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (values: RegisterFormValues) => Promise<{ success: boolean; error?: string }>;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
