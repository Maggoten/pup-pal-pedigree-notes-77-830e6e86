
export interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  subscriptionStatus: string;
  subscriptionTier: string;
  subscriptionEndDate?: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
}
