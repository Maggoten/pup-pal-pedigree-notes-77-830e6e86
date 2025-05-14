
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userMetadata?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthReady: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  kennel_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
