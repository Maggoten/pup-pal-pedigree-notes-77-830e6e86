import { useAuth as useAuthProvider } from '@/providers/AuthProvider';

/**
 * This is the main auth hook to be used throughout the application.
 * It provides standardized access to authentication state and functions.
 */
export const useAuth = useAuthProvider;

// We export the AuthProvider component to keep backward compatibility
export { AuthProvider } from '@/providers/AuthProvider';
