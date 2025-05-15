
import { ProfileData } from "./settings";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  profile?: ProfileData;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (values: RegisterFormValues) => Promise<{ success: boolean; error?: string }>;
}

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}
